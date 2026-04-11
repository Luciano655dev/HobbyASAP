create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'pt')),
  active_session_id text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.course_templates (
  id uuid primary key default gen_random_uuid(),
  hobby text not null,
  normalized_hobby text not null,
  level text not null,
  language text not null default 'en' check (language in ('en', 'pt')),
  icon text null,
  plan jsonb not null,
  sections_generated integer not null default 1,
  section_module_counts integer[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (normalized_hobby, level, language)
);

create table if not exists public.user_course_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.course_templates(id) on delete cascade,
  completed_task_ids text[] not null default '{}',
  streak jsonb not null default '{"current":0,"longest":0,"lastActiveDate":null}'::jsonb,
  lessons jsonb not null default '[]'::jsonb,
  chat_threads jsonb not null default '[]'::jsonb,
  active_chat_id text null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, template_id)
);

create table if not exists public.lesson_templates (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  hobby text not null,
  level text not null,
  language text not null default 'en' check (language in ('en', 'pt')),
  kind text not null,
  topic text not null,
  module_context jsonb null,
  lesson jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists course_templates_lookup_idx
  on public.course_templates (normalized_hobby, level, language);

create index if not exists user_course_sessions_user_id_idx
  on public.user_course_sessions (user_id, created_at desc);

create index if not exists lesson_templates_cache_key_idx
  on public.lesson_templates (cache_key);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

drop trigger if exists course_templates_set_updated_at on public.course_templates;
create trigger course_templates_set_updated_at
before update on public.course_templates
for each row
execute function public.set_updated_at();

drop trigger if exists user_course_sessions_set_updated_at on public.user_course_sessions;
create trigger user_course_sessions_set_updated_at
before update on public.user_course_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists lesson_templates_set_updated_at on public.lesson_templates;
create trigger lesson_templates_set_updated_at
before update on public.lesson_templates
for each row
execute function public.set_updated_at();

alter table public.user_settings enable row level security;
alter table public.course_templates enable row level security;
alter table public.user_course_sessions enable row level security;
alter table public.lesson_templates enable row level security;

drop policy if exists "Users can read own settings" on public.user_settings;
create policy "Users can read own settings"
on public.user_settings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
on public.user_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
on public.user_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own settings" on public.user_settings;
create policy "Users can delete own settings"
on public.user_settings
for delete
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can read shared course templates" on public.course_templates;
create policy "Authenticated users can read shared course templates"
on public.course_templates
for select
using (auth.uid() is not null);

drop policy if exists "Users can read own course sessions" on public.user_course_sessions;
create policy "Users can read own course sessions"
on public.user_course_sessions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own course sessions" on public.user_course_sessions;
create policy "Users can insert own course sessions"
on public.user_course_sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own course sessions" on public.user_course_sessions;
create policy "Users can update own course sessions"
on public.user_course_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own course sessions" on public.user_course_sessions;
create policy "Users can delete own course sessions"
on public.user_course_sessions
for delete
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can read shared lesson templates" on public.lesson_templates;
create policy "Authenticated users can read shared lesson templates"
on public.lesson_templates
for select
using (auth.uid() is not null);
