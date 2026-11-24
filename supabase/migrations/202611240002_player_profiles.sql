begin;
create table if not exists public.player_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[a-z][a-z0-9_]{2,19}$'),
 display_name text not null check (char_length(display_name) between 1 and 24 and display_name !~ '[[:cntrl:]<>]'),
 avatar text not null check (avatar in ('sentinel','specter','vanguard','raven','cipher','ember','warden','nomad')),
 updated_at timestamptz not null default now()
);
alter table public.player_profiles enable row level security;
revoke all on table public.player_profiles from anon, authenticated;
grant select on table public.player_profiles to authenticated;
drop policy if exists "Read own player identity" on public.player_profiles;
create policy "Read own player identity" on public.player_profiles for select to authenticated using ((select auth.uid())=user_id);
create or replace function public.save_player_profile(p_username text,p_display_name text,p_avatar text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := auth.uid(); clean_username text := lower(trim(p_username)); clean_name text := trim(p_display_name);
begin
 if owner_id is null or not exists (select 1 from auth.users where id=owner_id) then raise exception 'Sign in required' using errcode='42501'; end if;
 if clean_username is null or clean_username !~ '^[a-z][a-z0-9_]{2,19}$' or clean_name is null or char_length(clean_name) not between 1 and 24 or clean_name ~ '[[:cntrl:]<>]' or p_avatar is null or p_avatar not in ('sentinel','specter','vanguard','raven','cipher','ember','warden','nomad') then raise exception 'Invalid player identity' using errcode='22023'; end if;
 begin
  insert into public.player_profiles(user_id,username,display_name,avatar) values(owner_id,clean_username,clean_name,p_avatar)
  on conflict(user_id) do update set username=excluded.username,display_name=excluded.display_name,avatar=excluded.avatar,updated_at=now();
 exception when unique_violation then return jsonb_build_object('error','USERNAME_TAKEN');
 end;
 return jsonb_build_object('username',clean_username,'display_name',clean_name,'avatar',p_avatar);
end $$;
revoke all on function public.save_player_profile(text,text,text) from public,anon;
grant execute on function public.save_player_profile(text,text,text) to authenticated;
commit;
