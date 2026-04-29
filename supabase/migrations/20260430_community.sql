-- TradeWind Community: social foundation tables.
-- Activity feed posts, comments, likes, and follows. Demo posts render from
-- a static array client-side; these tables back the production feed once
-- the surface is opened to writes.

-- Posts
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  post_type text not null default 'lifestyle'
    check (post_type in ('inventory_update', 'lifestyle', 'market_insight', 'dealer_spotlight', 'tip')),
  media_urls text[] not null default '{}',
  listing_id uuid references public.listings(id) on delete set null,
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists community_posts_user_idx
  on public.community_posts (user_id);
create index if not exists community_posts_created_idx
  on public.community_posts (created_at desc);
create index if not exists community_posts_type_idx
  on public.community_posts (post_type);

-- Comments
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists community_comments_post_idx
  on public.community_comments (post_id, created_at);

-- Likes (one per user per post)
create table if not exists public.community_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists community_likes_post_idx
  on public.community_likes (post_id);

-- Follows
create table if not exists public.community_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists community_follows_following_idx
  on public.community_follows (following_id);

-- RLS
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;
alter table public.community_follows enable row level security;

-- Posts: anyone signed in can read; users write/edit/delete their own.
create policy "community_posts_read"
  on public.community_posts for select
  using (true);

create policy "community_posts_insert"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "community_posts_update"
  on public.community_posts for update
  using (auth.uid() = user_id);

create policy "community_posts_delete"
  on public.community_posts for delete
  using (auth.uid() = user_id);

-- Comments
create policy "community_comments_read"
  on public.community_comments for select
  using (true);

create policy "community_comments_insert"
  on public.community_comments for insert
  with check (auth.uid() = user_id);

create policy "community_comments_delete"
  on public.community_comments for delete
  using (auth.uid() = user_id);

-- Likes
create policy "community_likes_read"
  on public.community_likes for select
  using (true);

create policy "community_likes_insert"
  on public.community_likes for insert
  with check (auth.uid() = user_id);

create policy "community_likes_delete"
  on public.community_likes for delete
  using (auth.uid() = user_id);

-- Follows
create policy "community_follows_read"
  on public.community_follows for select
  using (true);

create policy "community_follows_insert"
  on public.community_follows for insert
  with check (auth.uid() = follower_id);

create policy "community_follows_delete"
  on public.community_follows for delete
  using (auth.uid() = follower_id);
