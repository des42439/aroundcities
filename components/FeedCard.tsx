import Link from "next/link";
import { FeedWithPlaceAndPhotos } from "@/types/database";
import {
  formatDate,
  getContentPreview,
  isPlaceholderPhoto,
} from "@/lib/format";

type Props = {
  feed: FeedWithPlaceAndPhotos;
};

type FeedPhoto = FeedWithPlaceAndPhotos["photos"][number];

export default function FeedCard({ feed }: Props) {
  const photos = getDisplayPhotos(feed.photos);
  const preview = getContentPreview(feed.description ?? feed.content);
  const realPhotos = photos.filter((photo) => !isPlaceholderPhoto(photo));
  const placeholderPhotos = photos.filter(isPlaceholderPhoto);

  return (
    <article className="border-b border-neutral-900 py-5 sm:py-6">
      <div className="space-y-3">
        <div className="min-w-0 space-y-2">
          <FeedMeta feed={feed} />

          <h2 className="text-xl font-semibold leading-snug sm:text-2xl">
            <Link
              href={`/feed/${feed.slug}`}
              className="hover:text-neutral-300"
            >
              {feed.title}
            </Link>
          </h2>

          {preview && (
            <p className="text-[15px] leading-6 text-neutral-300 sm:text-base">
              {preview}
            </p>
          )}

          <Link
            href={`/feed/${feed.slug}`}
            className="inline-flex text-sm text-neutral-500 hover:text-neutral-200"
          >
            See more
          </Link>
        </div>

        {realPhotos.length > 0 ? (
          <FeedPhotoGrid feed={feed} photos={realPhotos} />
        ) : (
          placeholderPhotos.length > 0 && (
            <SubtlePlaceholderPhoto
              feed={feed}
              photo={placeholderPhotos[0]}
            />
          )
        )}
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
        className="aspect-[4/3] w-full"
      />
    );
  }

  if (photos.length === 2) {
    return (
      <div className="grid aspect-[4/3] grid-cols-2 gap-1">
        {visiblePhotos.map((photo) => (
          <FeedImageLink
            key={photo.photo_id}
            feed={feed}
            photo={photo}
            className="h-full w-full"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 3) {
    return (
      <div className="grid aspect-[4/3] grid-cols-[2fr_1fr] gap-1">
        <FeedImageLink
          feed={feed}
          photo={visiblePhotos[0]}
          className="h-full w-full"
        />
        <div className="grid grid-rows-2 gap-1">
          {visiblePhotos.slice(1).map((photo) => (
            <FeedImageLink
              key={photo.photo_id}
              feed={feed}
              photo={photo}
              className="h-full w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-1">
      {visiblePhotos.map((photo, index) => (
        <FeedImageLink
          key={photo.photo_id}
          feed={feed}
          photo={photo}
          className="h-full w-full"
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
      className={`relative block overflow-hidden rounded-md bg-neutral-900 ${className}`}
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

function SubtlePlaceholderPhoto({
  feed,
  photo,
}: {
  feed: FeedWithPlaceAndPhotos;
  photo: FeedPhoto;
}) {
  return (
    <Link
      href={`/feed/${feed.slug}`}
      className="block w-36 overflow-hidden rounded-md bg-neutral-900 opacity-70 sm:w-44"
    >
      <img
        src={photo.photo_url}
        alt={photo.title ?? feed.title}
        className="aspect-[4/3] w-full object-cover"
        loading="lazy"
      />
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
