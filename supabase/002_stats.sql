-- 새벽 쉼터 · 방문자 수와 함께 머문 시간
-- SQL Editor 에 이 파일 전체를 붙여 넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- (schema.sql 을 처음부터 실행하는 경우에는 그 안에 이미 포함되어 있어요.)

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
