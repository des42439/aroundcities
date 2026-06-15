create table if not exists public.photo_albums (
  album_id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'drafted'
    check (status in ('drafted', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.photos
  alter column feed_id drop not null,
  add column if not exists album_id uuid references public.photo_albums(album_id) on delete set null,
  add column if not exists is_album_cover boolean not null default false,
  add column if not exists status text not null default 'drafted',
  add column if not exists tags text[] not null default '{}',
  add column if not exists location_note text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'photos_status_check'
      and conrelid = 'public.photos'::regclass
  ) then
    alter table public.photos
      add constraint photos_status_check
      check (status in ('drafted', 'published', 'archived'));
  end if;
end;
$$;

create index if not exists photo_albums_status_updated_idx
  on public.photo_albums(status, updated_at desc);

create index if not exists photos_album_id_sequence_idx
  on public.photos(album_id, sequence, created_at);

create index if not exists photos_album_cover_idx
  on public.photos(album_id, is_album_cover)
  where is_album_cover = true;

create index if not exists photos_status_idx
  on public.photos(status);

create index if not exists photos_tags_idx
  on public.photos using gin(tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_photo_albums_updated_at on public.photo_albums;

create trigger set_photo_albums_updated_at
  before update on public.photo_albums
  for each row
  execute function public.set_updated_at();

alter table public.photo_albums enable row level security;

create policy "Allow service role full access to photo albums"
  on public.photo_albums
  for all
  to service_role
  using (true)
  with check (true);
