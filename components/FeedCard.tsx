import FeedDescriptionPreview from "@/components/FeedDescriptionPreview";
import { TrackedFeedLink } from "@/components/TrackedLinks";
import { FeedWithPlaceAndPhotos } from "@/types/database";
import {
  formatRelativeTime,
  getOrderedPhotos,
} from "@/lib/format";

type Props = {
  feed: FeedWithPlaceAndPhotos;
};

type FeedPhoto = FeedWithPlaceAndPhotos["photos"][number];

export default function FeedCard({ feed }: Props) {
  const photos = getDisplayPhotos(feed.photos);
  const preview = (feed.description ?? feed.content ?? "").trim();
  const feedHref = `/feed/${feed.slug}`;

  return (
    <article className="border-b-2 border-neutral-800 pb-6 pt-4 sm:pb-7 sm:pt-5">
      <div className="space-y-2.5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-snug sm:text-xl">
            <TrackedFeedLink
              href={feedHref}
              feedId={feed.feed_id}
              className="hover:text-neutral-300"
            >
              {feed.title}
            </TrackedFeedLink>
          </h2>

          <FeedMeta feed={feed} />
        </div>

        {preview && (
          <FeedDescriptionPreview
            feedId={feed.feed_id}
            href={feedHref}
            text={preview}
          />
        )}

        {photos.length > 0 && <FeedPhotoGrid feed={feed} photos={photos} />}
      </div>
    </article>
  );
}

function FeedMeta({ feed }: Props) {
  const authorName = getFeedAuthorName(feed);

  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
      <span>{authorName}</span>
      <span aria-hidden="true">&middot;</span>
      <time dateTime={feed.created_at}>
        {formatRelativeTime(feed.created_at)}
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
        className="aspect-[4/3] w-full rounded-md"
      />
    );
  }

  if (photos.length === 2) {
    return (
      <div className="grid aspect-[4/3] w-full grid-cols-2 gap-1 overflow-hidden rounded-md bg-neutral-900">
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
      <div className="grid aspect-[4/3] w-full grid-cols-[2fr_1fr] gap-1 overflow-hidden rounded-md bg-neutral-900">
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
    <div className="grid aspect-[4/3] w-full grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-md bg-neutral-900">
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
    <TrackedFeedLink
      href={`/feed/${feed.slug}`}
      feedId={feed.feed_id}
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
    </TrackedFeedLink>
  );
}

function getFeedAuthorName(feed: FeedWithPlaceAndPhotos): string {
  const createdBy = feed.created_by?.trim();

  if (!createdBy || createdBy.toLowerCase() === "seed") {
    return "AroundCities";
  }

  return createdBy;
}

function getDisplayPhotos(
  photos?: FeedWithPlaceAndPhotos["photos"] | null
): FeedPhoto[] {
  return getOrderedPhotos(photos);
}
