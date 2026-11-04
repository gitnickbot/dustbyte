-- Glovebox: per-user vehicle and repair records plus private receipt photos.
-- Lives in the "groundbreaking" Supabase project, separate from the game tables (glovebox_ prefix).
-- Every row and photo belongs to one signed-in user; nobody else can read or change it.

create table if not exists public.glovebox_vehicles (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.glovebox_records (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists glovebox_vehicles_user_id_idx on public.glovebox_vehicles (user_id);
create index if not exists glovebox_records_user_id_idx on public.glovebox_records (user_id);

alter table public.glovebox_vehicles enable row level security;
alter table public.glovebox_records enable row level security;

create policy "glovebox_vehicles: owner reads" on public.glovebox_vehicles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "glovebox_vehicles: owner inserts" on public.glovebox_vehicles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "glovebox_vehicles: owner updates" on public.glovebox_vehicles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "glovebox_vehicles: owner deletes" on public.glovebox_vehicles
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "glovebox_records: owner reads" on public.glovebox_records
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "glovebox_records: owner inserts" on public.glovebox_records
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "glovebox_records: owner updates" on public.glovebox_records
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "glovebox_records: owner deletes" on public.glovebox_records
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Receipt photos: private bucket, one folder per user (<user id>/<photo id>.jpg).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('glovebox-receipts', 'glovebox-receipts', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "glovebox-receipts: owner reads" on storage.objects
  for select to authenticated
  using (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "glovebox-receipts: owner uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "glovebox-receipts: owner replaces" on storage.objects
  for update to authenticated
  using (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "glovebox-receipts: owner deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text);
