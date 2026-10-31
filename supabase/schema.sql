-- 새벽 쉼터 · Supabase 데이터베이스 설정
-- Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여 넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- 먼저 Authentication → Sign In / Providers 에서 "Allow anonymous sign-ins" 를 켜 주세요.

-- ────────────────────────────────────────────────
-- 1. 테이블
-- ────────────────────────────────────────────────
create table if not exists public.lanterns (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 80),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 100),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id bigint generated always as identity primary key,
  story_id bigint not null references public.stories(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 200),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.hugs (
  story_id bigint not null references public.stories(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  target_table text not null check (target_table in ('lanterns','guestbook','stories','replies')),
  target_id bigint not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (target_table, target_id, user_id)
);

-- 관리자: 화면의 [안내] 아래 "관리자 등록용 번호"를 여기에 넣으면 그 브라우저에서 모든 글을 가릴 수 있어요.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create index if not exists lanterns_created_idx on public.lanterns (created_at desc);
create index if not exists guestbook_created_idx on public.guestbook (created_at desc);
create index if not exists stories_created_idx on public.stories (created_at desc);
create index if not exists replies_story_idx on public.replies (story_id);
create index if not exists hugs_story_idx on public.hugs (story_id);

-- ────────────────────────────────────────────────
-- 2. 함수와 트리거
-- ────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 도배 방지: 10분 안에 같은 사람이 남길 수 있는 개수
create or replace function public.limit_rate()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  n int;
  cap int := case tg_table_name when 'stories' then 3 when 'replies' then 10 else 5 end;
begin
  execute format('select count(*) from public.%I where user_id = $1 and created_at > now() - interval ''10 minutes''', tg_table_name)
    into n using new.user_id;
  if n >= cap then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['lanterns','guestbook','stories','replies'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_rate', t);
    execute format('create trigger %I before insert on public.%I for each row execute function public.limit_rate()', t || '_rate', t);
  end loop;
end $$;

-- 서로 다른 세 사람이 신고하면 자동으로 가리기
create or replace function public.auto_hide()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(distinct user_id) into n from public.reports
   where target_table = new.target_table and target_id = new.target_id;
  if n >= 3 then
    execute format('update public.%I set hidden = true where id = $1', new.target_table) using new.target_id;
  end if;
  return new;
end;
$$;

drop trigger if exists reports_auto_hide on public.reports;
create trigger reports_auto_hide after insert on public.reports
  for each row execute function public.auto_hide();

-- ────────────────────────────────────────────────
-- 3. 행 단위 보안 (RLS)
-- ────────────────────────────────────────────────
alter table public.lanterns  enable row level security;
alter table public.guestbook enable row level security;
alter table public.stories   enable row level security;
alter table public.replies   enable row level security;
alter table public.hugs      enable row level security;
alter table public.reports   enable row level security;
alter table public.admins    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['lanterns','guestbook','stories','replies'] loop
    execute format('drop policy if exists "read visible" on public.%I', t);
    execute format('create policy "read visible" on public.%I for select to anon, authenticated using (not hidden or user_id = auth.uid() or public.is_admin())', t);
    execute format('drop policy if exists "write own" on public.%I', t);
    execute format('create policy "write own" on public.%I for insert to authenticated with check (user_id = auth.uid() and hidden = false)', t);
    execute format('drop policy if exists "delete own or admin" on public.%I', t);
    execute format('create policy "delete own or admin" on public.%I for delete to authenticated using (user_id = auth.uid() or public.is_admin())', t);
    execute format('drop policy if exists "admin hide" on public.%I', t);
    execute format('create policy "admin hide" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "read hugs" on public.hugs;
create policy "read hugs" on public.hugs for select to anon, authenticated using (true);
drop policy if exists "hug own" on public.hugs;
create policy "hug own" on public.hugs for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "unhug own" on public.hugs;
create policy "unhug own" on public.hugs for delete to authenticated using (user_id = auth.uid());

drop policy if exists "report own" on public.reports;
create policy "report own" on public.reports for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "admin reads reports" on public.reports;
create policy "admin reads reports" on public.reports for select to authenticated using (public.is_admin());

drop policy if exists "see self admin" on public.admins;
create policy "see self admin" on public.admins for select to authenticated using (user_id = auth.uid());

-- ────────────────────────────────────────────────
-- 4. 권한과 실시간
-- ────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select on public.lanterns, public.guestbook, public.stories, public.replies, public.hugs to anon, authenticated;
grant insert, delete, update on public.lanterns, public.guestbook, public.stories, public.replies to authenticated;
grant insert, delete on public.hugs to authenticated;
grant insert, select on public.reports to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['lanterns','guestbook','stories','replies','hugs'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
