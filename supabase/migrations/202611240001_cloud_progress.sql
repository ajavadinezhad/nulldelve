-- One private save per authenticated account. No client controls the owner ID.
create table if not exists public.cloud_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision integer not null check (revision > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 8388608),
  updated_at timestamptz not null default now()
);
alter table public.cloud_saves enable row level security;
revoke all on table public.cloud_saves from anon, authenticated;
grant select on table public.cloud_saves to authenticated;
create policy "Read own cloud progress" on public.cloud_saves for select to authenticated
using ((select auth.uid()) = user_id);

-- Compare-and-swap is a single statement under the row lock. A stale device
-- cannot overwrite another device's progress, even with concurrent requests.
create or replace function public.write_cloud_save(p_expected_revision integer, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := auth.uid(); saved public.cloud_saves%rowtype;
begin
  if owner_id is null or not exists (select 1 from auth.users where id = owner_id) then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 or p_expected_revision >= 2147483647
     or p_payload is null or jsonb_typeof(p_payload) <> 'object'
     or p_payload->>'format' is distinct from 'nulldelve-backup'
     or p_payload->>'version' is distinct from '1'
     or octet_length(p_payload::text) > 8388608 then
    raise exception 'Invalid cloud save' using errcode = '22023';
  end if;
  if p_expected_revision = 0 then
    insert into public.cloud_saves(user_id, revision, payload) values (owner_id, 1, p_payload)
    on conflict (user_id) do nothing returning * into saved;
  else
    update public.cloud_saves set revision = revision + 1, payload = p_payload, updated_at = now()
    where user_id = owner_id and revision = p_expected_revision returning * into saved;
  end if;
  if saved.user_id is null then return jsonb_build_object('ok', false, 'conflict', true); end if;
  return jsonb_build_object('revision', saved.revision, 'payload', saved.payload, 'updated_at', saved.updated_at);
end;
$$;
revoke all on function public.write_cloud_save(integer, jsonb) from public, anon;
grant execute on function public.write_cloud_save(integer, jsonb) to authenticated;
