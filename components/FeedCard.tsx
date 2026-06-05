import Link from "next/link";
import { FeedWithPlaceAndPhotos } from "@/types/database";
import {
  formatDate,
  getContentPreview,
  getFeaturedPhoto,
  isPlaceholderPhoto,
  isVisualFirstFeed,
} from "@/lib/format";

type Props = {
  feed: FeedWithPlaceAndPhotos;
};

export default function FeedCard({ feed }: Props) {
  const featuredPhoto = getFeaturedPhoto(feed.photos);
  const preview = getContentPreview(feed.description ?? feed.content);
  const visualFirst = isVisualFirstFeed(feed);
  const hasRealPhoto = Boolean(featuredPhoto && !isPlaceholderPhoto(featuredPhoto));

  return (
    <article className="border-b border-neutral-900 py-5 sm:py-7">
      <div
        className={
          visualFirst && hasRealPhoto
            ? "space-y-3"
            : "grid gap-4 sm:grid-cols-[1fr_168px] sm:items-start"
        }
      >
        {visualFirst && hasRealPhoto && featuredPhoto && (
          <FeedImage
            feed={feed}
            photo={featuredPhoto}
            size="large"
          />
        )}

        <div className="min-w-0 space-y-2">
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

          {feed.operating_hours && !visualFirst && (
            <p className="text-sm leading-6 text-neutral-500">
              {feed.operating_hours}
            </p>
          )}

          <Link
            href={`/feed/${feed.slug}`}
            className="inline-flex text-sm text-neutral-500 hover:text-neutral-200"
          >
            See more
          </Link>
        </div>

        {(!visualFirst || !hasRealPhoto) && featuredPhoto && (
          <FeedImage
            feed={feed}
            photo={featuredPhoto}
            size={hasRealPhoto ? "small" : "poster"}
          />
        )}
      </div>
    </article>
  );
}

function FeedImage({
  feed,
  photo,
  size,
}: {
  feed: FeedWithPlaceAndPhotos;
  photo: NonNullable<ReturnType<typeof getFeaturedPhoto>>;
  size: "large" | "small" | "poster";
}) {
  const imageClass =
    size === "large"
      ? "aspect-[4/3] max-h-[520px] w-full"
      : size === "small"
        ? "aspect-[4/3] w-full"
        : "aspect-[4/3] w-28 sm:w-full";

  return (
    <Link
      href={`/feed/${feed.slug}`}
      className={`block overflow-hidden rounded-md bg-neutral-900 ${size === "poster" ? "justify-self-start sm:justify-self-auto" : ""}`}
    >
      <img
        src={photo.photo_url}
        alt={photo.title ?? feed.title}
        className={`${imageClass} object-cover`}
        loading="lazy"
      />
    </Link>
  );
}
