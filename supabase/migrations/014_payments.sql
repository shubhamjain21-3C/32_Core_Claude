-- ============================================================
-- Migration 014: Payments
-- Star schema FACT table — user_id FK → profiles.id (USER PK)
-- ============================================================

create table if not exists public.payments (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references public.profiles(id),   -- USER PK (star centre)
  service_type              text not null check (service_type in (
                              'inventory_diy','inventory_professional',
                              'midterm_inspection','dispute_resolution',
                              'maintenance','deposit_negotiation',
                              'letting_service','subscription','other'
                            )),
  booking_id                uuid,       -- FK per service type (future)
  amount_pence              integer not null,   -- GBP pence
  currency                  text not null default 'gbp',
  status                    text not null default 'pending'
                              check (status in (
                                'pending','processing','succeeded',
                                'failed','refunded','disputed'
                              )),
  stripe_payment_intent_id  text unique,
  stripe_customer_id        text,
  stripe_payment_method     text,
  payment_method_type       text check (payment_method_type in (
                              'card','apple_pay','google_pay','bank_transfer','other'
                            )),
  receipt_url               text,
  failure_reason            text,
  refund_amount_pence       integer,
  refunded_at               timestamptz,
  metadata                  jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_payments_user   on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_stripe on public.payments(stripe_payment_intent_id);
