import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import { FeedWithPlaceAndPhotos, Photo } from "@/types/database";

type Props = {
  feed: FeedWithPlaceAndPhotos;
  photo: Photo;
};

export default function PhotoFeedCard({ feed, photo }: Props) {
  const feedHref = `/feed/${feed.slug}`;
  const title = photo.title?.trim() || feed.title;
  const description =
    photo.description?.trim() ||
    `From ${feed.title}`;
  const timestamp = photo.captured_at ?? feed.created_at;

  return (
    <article className="border-b-2 border-neutral-800 pb-6 pt-4 sm:pb-7 sm:pt-5">
      <div className="space-y-2.5">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Photo feed
          </p>
          <h2 className="text-lg font-semibold leading-snug sm:text-xl">
            <Link
              href={feedHref}
              className="hover:text-neutral-300"
            >
              {title}
            </Link>
          </h2>

          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
            <span>AroundCities</span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={timestamp}>
              {formatRelativeTime(timestamp)}
            </time>
          </div>
        </div>

        <p className="text-sm leading-6 text-neutral-300">
          {description}
        </p>

        <Link
          href={feedHref}
          className="relative block aspect-[4/3] min-w-0 overflow-hidden rounded-md bg-neutral-900"
        >
          <Image
            src={photo.photo_url}
            alt={photo.title ?? feed.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            unoptimized
          />
        </Link>
      </div>
    </article>
  );
}
