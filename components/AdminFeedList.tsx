import Image from "next/image";
import Link from "next/link";
import {
  formatRelativeTime,
  getFeaturedPhoto,
} from "@/lib/format";
import { FeedWithPlaceAndPhotos } from "@/types/database";

type Props = {
  feeds: FeedWithPlaceAndPhotos[];
  emptyText: string;
  timeField: "updated_at" | "published_at";
  statusLabel: string;
};

export default function AdminFeedList({
  feeds,
  emptyText,
  timeField,
  statusLabel,
}: Props) {
  if (feeds.length === 0) {
    return (
      <p className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {feeds.map((feed) => {
        const thumbnail = getFeaturedPhoto(feed.photos);

        return (
          <Link
            key={feed.feed_id}
            href={`/admin/feeds/${feed.feed_id}`}
            className="flex min-h-24 gap-3 rounded-lg border border-neutral-900 p-3 hover:border-neutral-700"
          >
            {thumbnail ? (
              <Image
                src={thumbnail.photo_url}
                alt={thumbnail.title ?? feed.title}
                width={72}
                height={72}
                unoptimized
                className="h-[72px] w-[72px] shrink-0 rounded-md bg-neutral-900 object-cover"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-md border border-neutral-900 bg-neutral-950 text-xs text-neutral-600">
                No photo
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 font-semibold text-neutral-100">
                {feed.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>
                  {formatRelativeTime(feed[timeField])}
                </span>
                <span className="rounded-full border border-neutral-800 px-2 py-1 text-neutral-300">
                  {statusLabel}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
