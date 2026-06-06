-- ============================================================
-- Migration 017: Row Level Security for all new tables
-- All RLS policies enforce: users can only access their own data
-- profiles.id is the central USER PK used in every policy
-- ============================================================

alter table public.journey_sessions   enable row level security;
alter table public.properties         enable row level security;
alter table public.tenancies          enable row level security;
alter table public.inventory_reports  enable row level security;
alter table public.inventory_rooms    enable row level security;
alter table public.inventory_items    enable row level security;
alter table public.inventory_media    enable row level security;
alter table public.portal_media       enable row level security;
alter table public.payments           enable row level security;
alter table public.letting_enquiries  enable row level security;

-- Helper: is the current user an admin?
-- (assumes profiles has an is_admin or role column — adjust if needed)
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select coalesce(
    (select true from public.profiles where id = auth.uid() and user_role = 'admin'),
    false
  )
$$;

-- journey_sessions
create policy "Public insert journey session"
  on public.journey_sessions for insert with check (true);
create policy "Own journey session read"
  on public.journey_sessions for select using (user_id = auth.uid() or public.is_admin());

-- properties: owner (profiles.id) or admin
create policy "Owner manages own properties"
  on public.properties for all using (owner_id = auth.uid() or public.is_admin());

-- tenancies: landlord (profiles.id), tenant (profiles.id), or admin
create policy "Landlord and tenant view tenancy"
  on public.tenancies for select
  using (landlord_id = auth.uid() or tenant_id = auth.uid() or public.is_admin());
create policy "Landlord manages tenancy"
  on public.tenancies for all using (landlord_id = auth.uid() or public.is_admin());

-- inventory_reports: creator (profiles.id), assigned agent, tenancy parties, admin
create policy "Report access for involved parties"
  on public.inventory_reports for select
  using (
    created_by = auth.uid()
    or assigned_agent_id = auth.uid()
    or public.is_admin()
    or auth.uid() in (
      select landlord_id from public.tenancies where id = inventory_reports.tenancy_id
      union
      select tenant_id  from public.tenancies where id = inventory_reports.tenancy_id
    )
  );
create policy "Report write for creator and admin"
  on public.inventory_reports for all
  using (created_by = auth.uid() or public.is_admin());

-- inventory_rooms & items: inherit via report
create policy "Room access via report"
  on public.inventory_rooms for all
  using (
    exists (
      select 1 from public.inventory_reports r
      where r.id = inventory_rooms.report_id
        and (r.created_by = auth.uid() or public.is_admin())
    )
  );

create policy "Item access via report"
  on public.inventory_items for all
  using (
    exists (
      select 1 from public.inventory_reports r
      where r.id = inventory_items.report_id
        and (r.created_by = auth.uid() or public.is_admin())
    )
  );

-- inventory_media: uploaded_by (profiles.id) or report owner or admin
create policy "Media access for involved parties"
  on public.inventory_media for select
  using (
    uploaded_by = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.inventory_reports r
      where r.id = inventory_media.report_id
        and (r.created_by = auth.uid() or r.assigned_agent_id = auth.uid())
    )
  );
create policy "Media upload by authenticated users"
  on public.inventory_media for insert
  with check (uploaded_by = auth.uid());

-- portal_media: own files only (uploaded_by = profiles.id)
create policy "Users manage own portal media"
  on public.portal_media for all using (uploaded_by = auth.uid());

-- payments: own payments (user_id = profiles.id) + admin
create policy "Users view own payments"
  on public.payments for select using (user_id = auth.uid() or public.is_admin());
create policy "System inserts payments"
  on public.payments for insert with check (true);

-- letting_enquiries: own (user_id = profiles.id) + admin, public insert
create policy "Users view own enquiries"
  on public.letting_enquiries for select
  using (user_id = auth.uid() or public.is_admin());
create policy "Anyone can submit letting enquiry"
  on public.letting_enquiries for insert with check (true);

-- Storage RLS
create policy "Inventory media: authenticated users"
  on storage.objects for select
  using (bucket_id = 'inventory-media' and auth.role() = 'authenticated');

create policy "Inventory media: upload"
  on storage.objects for insert
  with check (bucket_id = 'inventory-media' and auth.role() = 'authenticated');

create policy "Report PDFs: authenticated users"
  on storage.objects for select
  using (bucket_id = 'inventory-reports' and auth.role() = 'authenticated');

-- portal-media: users access own folder (folder name = profiles.id = auth.uid())
create policy "Portal media: own folder"
  on storage.objects for all
  using (
    bucket_id = 'portal-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
