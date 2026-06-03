-- AroundCities V2: storage bucket for feed photos.
-- Admin uploads use the service role client. Public pages read from this
-- public bucket through generated public URLs.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'photos',
  'photos',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read photos" on storage.objects;

create policy "Public read photos"
on storage.objects
for select
using (bucket_id = 'photos');
