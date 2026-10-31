-- =============================================================================
-- MONEYVERSE Analytics Metrics & Reporting Queries
-- =============================================================================
-- Read-only SQL queries designed to run directly in the Supabase SQL Editor.
-- These analyze telemetry stored in public.events (see supabase/analytics.sql).
--
-- Note: Event names and documented property payloads come from src/lib/README.md:
--   - chat_opened, chat_message_sent, chip_used, quiz_started, quiz_completed,
--     scenario_summary_viewed, fallback_shown, entered_world, mission_completed,
--     trade_executed, scenario_run, client_error.
-- =============================================================================

-- 1. Unique visitors (distinct client devices/browsers) and distinct logged-in registered users.
select
  count(distinct anon_id) filter (where anon_id is not null) as unique_visitors,
  count(distinct user_id) filter (where user_id is not null) as distinct_logged_in_users
from public.events;

-- 2. Count of unique users/visitors who passed the entry sequence and entered the world.
select
  count(distinct coalesce(user_id::text, anon_id)) as users_entered_world
from public.events
where name = 'entered_world';

-- 3. Count of users completing at least one mission and conversion rate relative to world entrants.
with entrants as (
  select distinct coalesce(user_id::text, anon_id) as user_identifier
  from public.events
  where name = 'entered_world'
),
completers as (
  select distinct coalesce(user_id::text, anon_id) as user_identifier
  from public.events
  where name = 'mission_completed'
)
select
  count(completers.user_identifier) as users_with_completed_mission,
  count(entrants.user_identifier) as users_entered_world,
  round(
    100.0 * count(completers.user_identifier) / nullif(count(entrants.user_identifier), 0),
    2
  ) as mission_completion_pct
from entrants
left join completers on entrants.user_identifier = completers.user_identifier;

-- 4. Total simulation engagements (trades executed & scenarios run) alongside distinct users per event.
select
  name as event_name,
  count(*) as total_events,
  count(distinct coalesce(user_id::text, anon_id)) as distinct_users
from public.events
where name in ('trade_executed', 'scenario_run')
group by name;

-- 5. AI Chat adoption rate: percentage of unique visitors who engaged the guide with a message.
with visitors as (
  select count(distinct anon_id) as total_visitors
  from public.events
  where anon_id is not null
),
chatters as (
  select count(distinct anon_id) as chat_visitors
  from public.events
  where name = 'chat_message_sent' and anon_id is not null
)
select
  chatters.chat_visitors as users_sent_chat_message,
  visitors.total_visitors,
  round(100.0 * chatters.chat_visitors / nullif(visitors.total_visitors, 0), 2) as chat_adoption_pct
from visitors, chatters;

-- 6. Total completed educational quizzes and the average score achieved across all attempts.
select
  count(*) as quiz_completed_count,
  round(avg((props->>'score')::numeric), 2) as average_quiz_score
from public.events
where name = 'quiz_completed'
  and props->>'score' is not null;

-- 7. AI Guide reliability: count of fallbacks shown versus chat messages sent and resulting fallback rate.
with metrics as (
  select
    count(*) filter (where name = 'chat_message_sent') as chat_messages_sent,
    count(*) filter (where name = 'fallback_shown') as fallbacks_shown
  from public.events
)
select
  chat_messages_sent,
  fallbacks_shown,
  round(100.0 * fallbacks_shown / nullif(chat_messages_sent, 0), 2) as fallback_rate_pct
from metrics;

-- 8. Activity trend: total event volume grouped by 1-hour intervals for the past 12 hours.
select
  date_trunc('hour', created_at) as event_hour,
  count(*) as event_count
from public.events
where created_at >= now() - interval '12 hours'
group by event_hour
order by event_hour desc;

