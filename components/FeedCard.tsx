import Link from "next/link";
import FeedDescriptionPreview from "@/components/FeedDescriptionPreview";
import { FeedWithPlaceAndPhotos } from "@/types/database";
import { formatDate } from "@/lib/format";

type Props = {
  feed: FeedWithPlaceAndPhotos;
};

type FeedPhoto = FeedWithPlaceAndPhotos["photos"][number];

export default function FeedCard({ feed }: Props) {
  const photos = getDisplayPhotos(feed.photos);
  const preview = (feed.description ?? feed.content ?? "").trim();
  const feedHref = `/feed/${feed.slug}`;

  return (
    <article className="border-b border-neutral-900 py-5 sm:py-6">
      <div className="space-y-3">
        <div className="min-w-0 space-y-2">
          <FeedMeta feed={feed} />

          <h2 className="text-lg font-semibold leading-snug sm:text-xl">
            <Link
              href={feedHref}
              className="hover:text-neutral-300"
            >
              {feed.title}
            </Link>
          </h2>
        </div>

        {preview && <FeedDescriptionPreview href={feedHref} text={preview} />}

        {photos.length > 0 && <FeedPhotoGrid feed={feed} photos={photos} />}
      </div>
    </article>
  );
}

function FeedMeta({ feed }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
      {feed.place && (
        <>
          <Link
            href={`/place/${feed.place.slug}`}
            className="hover:text-neutral-300"
          >
            {feed.place.name}
          </Link>
          <span aria-hidden="true">·</span>
        </>
      )}
      <time dateTime={feed.published_at ?? undefined}>
        {formatDate(feed.published_at)}
      </time>
    </div>
  );
}

function FeedPhotoGrid({
  feed,
  photos,
}: {
  feed: FeedWithPlaceAndPhotos;
  photos: FeedPhoto[];
}) {
  const visiblePhotos = photos.slice(0, 4);
  const extraCount = photos.length - visiblePhotos.length;

  if (photos.length === 1) {
    return (
      <FeedImageLink
        feed={feed}
        photo={photos[0]}
        className="aspect-[4/3] w-full rounded-lg"
      />
    );
  }

  if (photos.length === 2) {
    return (
      <div className="grid aspect-[4/3] w-full grid-cols-2 gap-1 overflow-hidden rounded-lg bg-neutral-900">
        {visiblePhotos.map((photo) => (
          <FeedImageLink
            key={photo.photo_id}
            feed={feed}
            photo={photo}
            className="h-full w-full rounded-none"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 3) {
    return (
      <div className="grid aspect-[4/3] w-full grid-cols-[2fr_1fr] gap-1 overflow-hidden rounded-lg bg-neutral-900">
        <FeedImageLink
          feed={feed}
          photo={visiblePhotos[0]}
          className="h-full w-full rounded-none"
        />
        <div className="grid grid-rows-2 gap-1">
          {visiblePhotos.slice(1).map((photo) => (
            <FeedImageLink
              key={photo.photo_id}
              feed={feed}
              photo={photo}
              className="h-full w-full rounded-none"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid aspect-[4/3] w-full grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-lg bg-neutral-900">
      {visiblePhotos.map((photo, index) => (
        <FeedImageLink
          key={photo.photo_id}
          feed={feed}
          photo={photo}
          className="h-full w-full rounded-none"
          overlay={
            index === 3 && extraCount > 0 ? `+${extraCount}` : undefined
          }
        />
      ))}
    </div>
  );
}

function FeedImageLink({
  feed,
  photo,
  className,
  overlay,
}: {
  feed: FeedWithPlaceAndPhotos;
  photo: FeedPhoto;
  className: string;
  overlay?: string;
}) {
  return (
    <Link
      href={`/feed/${feed.slug}`}
      className={`relative block min-w-0 overflow-hidden bg-neutral-900 ${className}`}
    >
      <img
        src={photo.photo_url}
        alt={photo.title ?? feed.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {overlay && (
        <span className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-semibold text-white">
          {overlay}
        </span>
      )}
    </Link>
  );
}

function getDisplayPhotos(
  photos?: FeedWithPlaceAndPhotos["photos"] | null
): FeedPhoto[] {
  if (!photos?.length) {
    return [];
  }

  return [...photos].sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }

    return a.sequence - b.sequence;
  });
}
