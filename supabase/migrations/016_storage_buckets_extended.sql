-- ============================================================
-- Migration 016: Storage Buckets
-- inventory-media: long-term (lease + 6 years) — NO auto-delete
-- inventory-reports: PDF outputs — long-term
-- portal-media: general uploads — auto-delete 30 days via cron
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inventory-media',
  'inventory-media',
  false,
  104857600,
  array[
    'image/jpeg','image/jpg','image/png','image/webp','image/heic',
    'video/mp4','video/quicktime','video/webm',
    'application/pdf'
  ]
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inventory-reports',
  'inventory-reports',
  false,
  52428800,
  array['application/pdf']
) on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-media',
  'portal-media',
  false,
  52428800,
  array[
    'image/jpeg','image/jpg','image/png','image/webp',
    'video/mp4','video/quicktime','video/webm'
  ]
) on conflict (id) do nothing;
