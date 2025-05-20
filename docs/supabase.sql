-- Table progression utilisateur : épisodes vus
create table if not exists watched_episodes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  series_id uuid not null references series(id) on delete cascade,
  episode_id uuid not null references episodes(id) on delete cascade,
  watched_at timestamptz not null default now(),
  unique (user_id, series_id, episode_id)
);

-- Table favoris séries (pour useFavoriteSeries)
create table if not exists favorites_series (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  series_id uuid not null references series(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, series_id)
);