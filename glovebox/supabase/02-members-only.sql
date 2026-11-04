-- Glovebox is for real email/password accounts only. The groundbreaking project allows
-- anonymous sign-ins (for the game), so keep anonymous sessions out of Glovebox tables and photos.
-- Run after schema.sql (Supabase dashboard > SQL Editor), or ask Claude to apply it.
create or replace function public.glovebox_is_member() returns boolean
language sql stable set search_path = '' as $$
  select (select auth.uid()) is not null
     and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
$$;
revoke all on function public.glovebox_is_member() from public, anon;
grant execute on function public.glovebox_is_member() to authenticated;

drop policy if exists "glovebox_vehicles: owner reads" on public.glovebox_vehicles;
drop policy if exists "glovebox_vehicles: owner inserts" on public.glovebox_vehicles;
drop policy if exists "glovebox_vehicles: owner updates" on public.glovebox_vehicles;
drop policy if exists "glovebox_vehicles: owner deletes" on public.glovebox_vehicles;
drop policy if exists "glovebox_records: owner reads" on public.glovebox_records;
drop policy if exists "glovebox_records: owner inserts" on public.glovebox_records;
drop policy if exists "glovebox_records: owner updates" on public.glovebox_records;
drop policy if exists "glovebox_records: owner deletes" on public.glovebox_records;
drop policy if exists "glovebox-receipts: owner reads" on storage.objects;
drop policy if exists "glovebox-receipts: owner uploads" on storage.objects;
drop policy if exists "glovebox-receipts: owner replaces" on storage.objects;
drop policy if exists "glovebox-receipts: owner deletes" on storage.objects;

create policy "glovebox_vehicles: owner reads" on public.glovebox_vehicles
  for select to authenticated using ((select auth.uid()) = user_id and (select public.glovebox_is_member()));
create policy "glovebox_vehicles: owner inserts" on public.glovebox_vehicles
  for insert to authenticated with check ((select auth.uid()) = user_id and (select public.glovebox_is_member()));
create policy "glovebox_vehicles: owner updates" on public.glovebox_vehicles
  for update to authenticated using ((select auth.uid()) = user_id and (select public.glovebox_is_member()))
  with check ((select auth.uid()) = user_id and (select public.glovebox_is_member()));
create policy "glovebox_vehicles: owner deletes" on public.glovebox_vehicles
  for delete to authenticated using ((select auth.uid()) = user_id and (select public.glovebox_is_member()));

create policy "glovebox_records: owner reads" on public.glovebox_records
  for select to authenticated using ((select auth.uid()) = user_id and (select public.glovebox_is_member()));
create policy "glovebox_records: owner inserts" on public.glovebox_records
  for insert to authenticated with check ((select auth.uid()) = user_id and (select public.glovebox_is_member()));
create policy "glovebox_records: owner updates" on public.glovebox_records
  for update to authenticated using ((select auth.uid()) = user_id and (select public.glovebox_is_member()))
  with check ((select auth.uid()) = user_id and (select public.glovebox_is_member()));
create policy "glovebox_records: owner deletes" on public.glovebox_records
  for delete to authenticated using ((select auth.uid()) = user_id and (select public.glovebox_is_member()));

create policy "glovebox-receipts: owner reads" on storage.objects
  for select to authenticated
  using (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.glovebox_is_member()));
create policy "glovebox-receipts: owner uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.glovebox_is_member()));
create policy "glovebox-receipts: owner replaces" on storage.objects
  for update to authenticated
  using (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.glovebox_is_member()))
  with check (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.glovebox_is_member()));
create policy "glovebox-receipts: owner deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'glovebox-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.glovebox_is_member()));
