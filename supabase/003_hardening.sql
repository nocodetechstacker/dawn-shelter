-- 새벽 쉼터 · 보안 보강 (2026-11-01 점검 결과)
-- SQL Editor 에 이 파일 전체를 붙여 넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- (schema.sql 을 처음부터 실행하는 경우에는 그 안에 이미 포함되어 있어요.)
--
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
