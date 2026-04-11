create table public.site_metric_events (
  id bigint generated always as identity primary key,
  metric_key text not null check (metric_key in ('prompt', 'new_user')),
  user_id uuid null references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index site_metric_events_metric_key_created_at_idx
  on public.site_metric_events (metric_key, created_at desc);

create unique index site_metric_events_new_user_unique_idx
  on public.site_metric_events (metric_key, user_id)
  where metric_key = 'new_user' and user_id is not null;

insert into public.site_metric_events (metric_key, user_id, metadata, created_at)
select
  'new_user',
  user_settings.user_id,
  jsonb_build_object('source', 'backfill', 'table', 'user_settings'),
  user_settings.created_at
from public.user_settings
on conflict (metric_key, user_id) where metric_key = 'new_user' and user_id is not null
do nothing;

insert into public.site_metric_events (metric_key, metadata, created_at)
select
  'prompt',
  jsonb_build_object(
    'source', 'backfill',
    'table', 'course_templates',
    'template_id', course_templates.id,
    'sequence', generation.sequence
  ),
  course_templates.created_at
from public.course_templates
cross join lateral generate_series(1, greatest(course_templates.sections_generated, 0))
  as generation(sequence);

alter table public.site_metric_events enable row level security;
