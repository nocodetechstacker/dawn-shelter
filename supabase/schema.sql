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

-- ────────────────────────────────────────────────
-- 5. 방문자 수와 함께 머문 시간 (supabase/002_stats.sql 과 같은 내용)
-- ────────────────────────────────────────────────
create table if not exists shelter.visits (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day date not null default ((now() at time zone 'Asia/Seoul')::date),
  seconds int not null default 0,
  first_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (user_id, day)
);
create index if not exists visits_day_idx on shelter.visits (day);

-- 직접 읽고 쓰는 길은 막고, 아래 두 함수로만 다룹니다.
alter table shelter.visits enable row level security;
revoke all on shelter.visits from anon, authenticated;

-- 전체 통계: 누적 방문자, 오늘 방문자, 함께 머문 시간(초), 오늘 내가 머문 시간(초)
create or replace function shelter.stats()
returns json language sql stable security definer set search_path = shelter as $$
  select json_build_object(
    'visitors', count(distinct user_id),
    'today', count(distinct user_id) filter (where day = (now() at time zone 'Asia/Seoul')::date),
    'seconds', coalesce(sum(seconds), 0),
    'mine_today', coalesce(sum(seconds) filter (where user_id = auth.uid() and day = (now() at time zone 'Asia/Seoul')::date), 0)
  ) from shelter.visits;
$$;

-- 머무는 동안 1분마다 부르는 함수. 시간은 서버가 직접 재서 부풀릴 수 없어요.
-- 직전 기록에서 20초~2분 사이가 지났을 때만 그 시간을 더하고, 2분 넘게 끊겼으면 새로 시작해요.
create or replace function shelter.heartbeat()
returns json language plpgsql security definer set search_path = shelter as $$
declare
  d date := (now() at time zone 'Asia/Seoul')::date;
  gap int;
begin
  if auth.uid() is null then return shelter.stats(); end if;
  insert into shelter.visits (user_id, day) values (auth.uid(), d)
    on conflict (user_id, day) do nothing;
  select floor(extract(epoch from now() - last_seen))::int into gap
    from shelter.visits where user_id = auth.uid() and day = d for update;
  if gap between 20 and 120 then
    update shelter.visits set seconds = seconds + gap, last_seen = now() where user_id = auth.uid() and day = d;
  elsif gap > 120 then
    update shelter.visits set last_seen = now() where user_id = auth.uid() and day = d;
  end if;
  return shelter.stats();
end;
$$;

revoke all on function shelter.stats() from public;
revoke all on function shelter.heartbeat() from public;
grant execute on function shelter.stats() to anon, authenticated;
grant execute on function shelter.heartbeat() to authenticated;

-- ────────────────────────────────────────────────
-- 6. 보안 보강 (supabase/003_hardening.sql 과 같은 내용)
-- ────────────────────────────────────────────────
-- 1) 작성자 익명 번호(user_id)를 다른 사람이 읽지 못하게 해요.
--    지금은 누구나 user_id 를 읽을 수 있어서, 같은 사람이 쓴 글들을 서로 이어 볼 수 있었어요.
--    화면은 user_id 대신 "내 글인지(mine)"만 알려 주는 보기(view)를 읽어요.
-- 2) 신고는 10분에 10건까지, 실제로 있는 글에만 할 수 있어요.
-- 3) 자동 숨김은 만든 지 10분 넘은 익명 계정의 신고만 세어요. (새 창을 여러 개 열어 남의 글을 가리는 것을 어렵게)
-- 4) 가려진 사연에 달린 답장과 안아 주기도 함께 보이지 않게 해요.

-- ────────────────────────────────────────────────
-- 1. user_id 읽기 막기 (열 단위 권한)
-- ────────────────────────────────────────────────
revoke select on shelter.lanterns, shelter.guestbook, shelter.stories, shelter.replies, shelter.hugs from anon, authenticated;
grant select (id, body, hidden, created_at) on shelter.lanterns, shelter.guestbook, shelter.stories to anon, authenticated;
grant select (id, story_id, body, hidden, created_at) on shelter.replies to anon, authenticated;
grant select (story_id, created_at) on shelter.hugs to anon, authenticated;

-- 화면이 읽는 보기. 소유자 권한으로 돌기 때문에 보이는 조건을 아래에 직접 적었어요.
-- (보이는 글 + 내 글 + 관리자는 전부, 기존 RLS 규칙과 같아요)
create or replace view shelter.lanterns_pub as
  select id, body, hidden, created_at, (user_id = auth.uid()) as mine
  from shelter.lanterns
  where not hidden or user_id = auth.uid() or shelter.is_admin();

create or replace view shelter.guestbook_pub as
  select id, body, hidden, created_at, (user_id = auth.uid()) as mine
  from shelter.guestbook
  where not hidden or user_id = auth.uid() or shelter.is_admin();

create or replace view shelter.stories_pub as
  select id, body, hidden, created_at, (user_id = auth.uid()) as mine
  from shelter.stories
  where not hidden or user_id = auth.uid() or shelter.is_admin();

create or replace view shelter.replies_pub as
  select r.id, r.story_id, r.body, r.hidden, r.created_at, (r.user_id = auth.uid()) as mine
  from shelter.replies r join shelter.stories s on s.id = r.story_id
  where (not r.hidden or r.user_id = auth.uid() or shelter.is_admin())
    and (not s.hidden or s.user_id = auth.uid() or shelter.is_admin());

create or replace view shelter.hugs_pub as
  select h.story_id, (h.user_id = auth.uid()) as mine
  from shelter.hugs h join shelter.stories s on s.id = h.story_id
  where not s.hidden or s.user_id = auth.uid() or shelter.is_admin();

revoke all on shelter.lanterns_pub, shelter.guestbook_pub, shelter.stories_pub, shelter.replies_pub, shelter.hugs_pub from public, anon, authenticated;
grant select on shelter.lanterns_pub, shelter.guestbook_pub, shelter.stories_pub, shelter.replies_pub, shelter.hugs_pub to anon, authenticated;

-- ────────────────────────────────────────────────
-- 2. 신고 도배 막기, 없는 글 신고 막기
-- ────────────────────────────────────────────────
create or replace function shelter.check_report()
returns trigger language plpgsql security definer set search_path = shelter as $$
declare n int; ok boolean;
begin
  select count(*) into n from shelter.reports
   where user_id = new.user_id and created_at > now() - interval '10 minutes';
  if n >= 10 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  execute format('select exists (select 1 from shelter.%I where id = $1)', new.target_table)
    into ok using new.target_id;
  if not ok then
    raise exception 'no_such_post' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reports_check on shelter.reports;
create trigger reports_check before insert on shelter.reports
  for each row execute function shelter.check_report();

-- ────────────────────────────────────────────────
-- 3. 자동 숨김: 만든 지 10분 넘은 계정의 신고만 세기
-- ────────────────────────────────────────────────
create or replace function shelter.auto_hide()
returns trigger language plpgsql security definer set search_path = shelter, auth as $$
declare n int;
begin
  select count(distinct r.user_id) into n
    from shelter.reports r join auth.users u on u.id = r.user_id
   where r.target_table = new.target_table and r.target_id = new.target_id
     and u.created_at < now() - interval '10 minutes';
  if n >= 3 then
    execute format('update shelter.%I set hidden = true where id = $1', new.target_table) using new.target_id;
  end if;
  return new;
end;
$$;
