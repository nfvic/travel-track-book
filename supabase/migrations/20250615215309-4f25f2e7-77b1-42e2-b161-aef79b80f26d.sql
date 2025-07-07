
-- Create the audit_logs table for tracking payment verifications and business events
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  status text not null,
  user_id uuid,
  reference text,
  booking_id uuid,
  order_id uuid,
  payload jsonb,
  inserted_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.audit_logs enable row level security;

-- Allow authenticated users to insert their own logs
create policy "Users can insert audit logs" on public.audit_logs
  for insert with check (auth.uid() = user_id);

-- Allow admins to select logs (adjust as needed for your needs)
create policy "Admins can read audit logs" on public.audit_logs
  for select using (public.get_current_user_role() = 'admin');
