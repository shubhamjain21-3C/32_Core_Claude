-- Add "Others" portal role
insert into public.ref_portal_roles (code, label, sort_order)
values ('others', 'Others', 6)
on conflict (code) do nothing;
