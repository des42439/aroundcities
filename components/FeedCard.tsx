import Link from "next/link";
import { FeedWithPlaceAndPhotos } from "@/types/database";
import {
  formatDate,
  formatFeedType,
  getContentPreview,
  getFeaturedPhoto,
} from "@/lib/format";

type Props = {
  feed: FeedWithPlaceAndPhotos;
};

export default function FeedCard({ feed }: Props) {
  const featuredPhoto = getFeaturedPhoto(feed.photos);
  const preview = getContentPreview(feed.content);

  return (
    <article className="border-b border-neutral-900 py-8">
      {featuredPhoto && (
        <Link
          href={`/feed/${feed.slug}`}
          className="mb-5 block overflow-hidden rounded-lg bg-neutral-900"
        >
          <img
            src={featuredPhoto.photo_url}
            alt={featuredPhoto.title ?? feed.title}
            className="max-h-[560px] w-full object-cover"
          />
        </Link>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          <span>{formatFeedType(feed.feed_type)}</span>
          <span aria-hidden="true">/</span>
          <time dateTime={feed.published_at ?? undefined}>
            {formatDate(feed.published_at)}
          </time>
        </div>

        <h2 className="text-2xl font-semibold leading-tight">
          <Link
            href={`/feed/${feed.slug}`}
            className="hover:text-neutral-300"
          >
            {feed.title}
          </Link>
        </h2>

        {preview && (
          <p className="text-base leading-7 text-neutral-300">
            {preview}
          </p>
        )}

        {feed.place && (
          <Link
            href={`/place/${feed.place.slug}`}
            className="inline-flex text-sm text-neutral-500 hover:text-neutral-300"
          >
            {feed.place.name}
          </Link>
        )}
      </div>
    </article>
  );
}
