-- ============================================================
-- Strawberries & Notes — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text unique not null,
  nickname    text not null default 'Pom',
  avatar_url  text,
  theme       text not null default 'strawberry',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Notes ───────────────────────────────────────────────────
create table if not exists notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,
  title       text not null default 'Untitled',
  content     text not null default '',
  is_public   boolean not null default false,
  color       text not null default 'pink',
  tags        text[] not null default '{}',
  word_count  integer not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists notes_user_id_idx on notes(user_id);
create index if not exists notes_is_public_idx on notes(is_public);

-- ── Todos ────────────────────────────────────────────────────
create table if not exists todos (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,
  title       text not null,
  description text,
  completed   boolean not null default false,
  priority    text not null default 'medium' check (priority in ('high','medium','low')),
  due_date    date,
  category    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists todos_user_id_idx on todos(user_id);

-- ── Timetable ────────────────────────────────────────────────
create table if not exists timetable_entries (
  id           uuid primary key default uuid_generate_v4(),
  user_id      text not null,
  course_name  text not null,
  room         text,
  day_of_week  smallint not null check (day_of_week between 1 and 5),
  start_time   time not null,
  end_time     time not null,
  color        text not null default 'pink',
  created_at   timestamptz default now()
);

create index if not exists tt_user_id_idx on timetable_entries(user_id);

-- ── Row Level Security ───────────────────────────────────────
alter table profiles          enable row level security;
alter table notes             enable row level security;
alter table todos             enable row level security;
alter table timetable_entries enable row level security;

-- Profiles: owner only
create policy "profiles_select" on profiles for select using (user_id = current_setting('app.user_id', true));
create policy "profiles_insert" on profiles for insert with check (user_id = current_setting('app.user_id', true));
create policy "profiles_update" on profiles for update using (user_id = current_setting('app.user_id', true));

-- Notes: owner full access; public notes readable by anyone
create policy "notes_owner"  on notes for all    using (user_id = current_setting('app.user_id', true));
create policy "notes_public" on notes for select using (is_public = true);

-- Todos: owner only
create policy "todos_owner" on todos for all using (user_id = current_setting('app.user_id', true));

-- Timetable: owner only
create policy "tt_owner" on timetable_entries for all using (user_id = current_setting('app.user_id', true));

-- ── updated_at trigger ───────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger notes_updated_at    before update on notes    for each row execute function set_updated_at();
create trigger todos_updated_at    before update on todos    for each row execute function set_updated_at();
create trigger profiles_updated_at before update on profiles for each row execute function set_updated_at();

-- ── Blog Posts ───────────────────────────────────────────────
create table if not exists blog_posts (
  id           uuid primary key default uuid_generate_v4(),
  author_id    text not null,
  title        text not null,
  slug         text unique not null,
  content      text not null default '',
  excerpt      text,
  tags         text[] not null default '{}',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  cover_image  text,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists blog_posts_slug_idx   on blog_posts(slug);
create index if not exists blog_posts_status_idx on blog_posts(status);

alter table blog_posts enable row level security;

-- Published posts are publicly readable; all operations allowed via service role
create policy "blog_public_read" on blog_posts for select using (status = 'published');

create trigger blog_posts_updated_at before update on blog_posts for each row execute function set_updated_at();
