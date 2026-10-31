-- 새벽 쉼터 · Supabase 데이터베이스 설정
-- Supabase 대시보드 → SQL Editor 에 이 파일 전체를 붙여 넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- 쉼터 데이터는 블로그와 섞이지 않도록 별도 스키마 shelter 에 만듭니다. public 의 기존 테이블은 건드리지 않아요.
-- 실행 후 Project Settings → Data API → Exposed schemas 에 shelter 를 추가해 주세요.
-- 익명 로그인(Allow anonymous sign-ins)은 기존 테이블 보안 점검을 마친 뒤에 켜 주세요.

-- ────────────────────────────────────────────────
-- 1. 테이블
-- ────────────────────────────────────────────────
create schema if not exists shelter;

create table if not exists shelter.lanterns (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 80),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists shelter.guestbook (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 100),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists shelter.stories (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists shelter.replies (
  id bigint generated always as identity primary key,
  story_id bigint not null references shelter.stories(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 200),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists shelter.hugs (
  story_id bigint not null references shelter.stories(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create table if not exists shelter.reports (
  id bigint generated always as identity primary key,
  target_table text not null check (target_table in ('lanterns','guestbook','stories','replies')),
  target_id bigint not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (target_table, target_id, user_id)
);

-- 관리자: 화면의 [안내] 아래 "관리자 등록용 번호"를 여기에 넣으면 그 브라우저에서 모든 글을 가릴 수 있어요.
create table if not exists shelter.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create index if not exists lanterns_created_idx on shelter.lanterns (created_at desc);
create index if not exists guestbook_created_idx on shelter.guestbook (created_at desc);
create index if not exists stories_created_idx on shelter.stories (created_at desc);
create index if not exists replies_story_idx on shelter.replies (story_id);
create index if not exists hugs_story_idx on shelter.hugs (story_id);

-- ────────────────────────────────────────────────
-- 2. 함수와 트리거
-- ────────────────────────────────────────────────
create or replace function shelter.is_admin()
returns boolean language sql stable security definer set search_path = shelter as $$
  select exists (select 1 from shelter.admins where user_id = auth.uid());
$$;

-- 도배 방지: 10분 안에 같은 사람이 남길 수 있는 개수
create or replace function shelter.limit_rate()
returns trigger language plpgsql security definer set search_path = shelter as $$
declare
  n int;
  cap int := case tg_table_name when 'stories' then 3 when 'replies' then 10 else 5 end;
begin
  execute format('select count(*) from shelter.%I where user_id = $1 and created_at > now() - interval ''10 minutes''', tg_table_name)
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
    execute format('drop trigger if exists %I on shelter.%I', t || '_rate', t);
    execute format('create trigger %I before insert on shelter.%I for each row execute function shelter.limit_rate()', t || '_rate', t);
  end loop;
end $$;

-- 서로 다른 세 사람이 신고하면 자동으로 가리기
create or replace function shelter.auto_hide()
returns trigger language plpgsql security definer set search_path = shelter as $$
declare n int;
begin
  select count(distinct user_id) into n from shelter.reports
   where target_table = new.target_table and target_id = new.target_id;
  if n >= 3 then
    execute format('update shelter.%I set hidden = true where id = $1', new.target_table) using new.target_id;
  end if;
  return new;
end;
$$;

drop trigger if exists reports_auto_hide on shelter.reports;
create trigger reports_auto_hide after insert on shelter.reports
  for each row execute function shelter.auto_hide();

-- ────────────────────────────────────────────────
-- 3. 행 단위 보안 (RLS)
-- ────────────────────────────────────────────────
alter table shelter.lanterns  enable row level security;
alter table shelter.guestbook enable row level security;
alter table shelter.stories   enable row level security;
alter table shelter.replies   enable row level security;
alter table shelter.hugs      enable row level security;
alter table shelter.reports   enable row level security;
alter table shelter.admins    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['lanterns','guestbook','stories','replies'] loop
    execute format('drop policy if exists "read visible" on shelter.%I', t);
    execute format('create policy "read visible" on shelter.%I for select to anon, authenticated using (not hidden or user_id = auth.uid() or shelter.is_admin())', t);
    execute format('drop policy if exists "write own" on shelter.%I', t);
    execute format('create policy "write own" on shelter.%I for insert to authenticated with check (user_id = auth.uid() and hidden = false)', t);
    execute format('drop policy if exists "delete own or admin" on shelter.%I', t);
    execute format('create policy "delete own or admin" on shelter.%I for delete to authenticated using (user_id = auth.uid() or shelter.is_admin())', t);
    execute format('drop policy if exists "admin hide" on shelter.%I', t);
    execute format('create policy "admin hide" on shelter.%I for update to authenticated using (shelter.is_admin()) with check (shelter.is_admin())', t);
  end loop;
end $$;

drop policy if exists "read hugs" on shelter.hugs;
create policy "read hugs" on shelter.hugs for select to anon, authenticated using (true);
drop policy if exists "hug own" on shelter.hugs;
create policy "hug own" on shelter.hugs for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "unhug own" on shelter.hugs;
create policy "unhug own" on shelter.hugs for delete to authenticated using (user_id = auth.uid());

drop policy if exists "report own" on shelter.reports;
create policy "report own" on shelter.reports for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "admin reads reports" on shelter.reports;
create policy "admin reads reports" on shelter.reports for select to authenticated using (shelter.is_admin());

drop policy if exists "see self admin" on shelter.admins;
create policy "see self admin" on shelter.admins for select to authenticated using (user_id = auth.uid());

-- ────────────────────────────────────────────────
-- 4. 권한과 실시간
-- ────────────────────────────────────────────────
grant usage on schema shelter to anon, authenticated;
grant select on shelter.lanterns, shelter.guestbook, shelter.stories, shelter.replies, shelter.hugs to anon, authenticated;
grant insert, delete, update on shelter.lanterns, shelter.guestbook, shelter.stories, shelter.replies to authenticated;
grant insert, delete on shelter.hugs to authenticated;
grant insert, select on shelter.reports to authenticated;
grant select on shelter.admins to authenticated;
grant execute on function shelter.is_admin() to anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['lanterns','guestbook','stories','replies','hugs'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'shelter' and tablename = t) then
      execute format('alter publication supabase_realtime add table shelter.%I', t);
    end if;
  end loop;
end $$;
