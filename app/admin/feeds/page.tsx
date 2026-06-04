import Link from "next/link";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/AdminForm";
import {
  formatDate,
  formatFeedType,
  getFeaturedPhoto,
} from "@/lib/format";
import { getFeeds } from "@/lib/feeds";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminFeedsPage() {
  await requireAdmin();
  const feeds = await getFeeds();

  return (
    <AdminShell title="Feeds">
      <div className="mb-6">
        <Link
          href="/admin/feeds/new"
          className={primaryButtonClassName}
        >
          New feed
        </Link>
      </div>

      {feeds.length === 0 ? (
        <p className="text-neutral-500">
          No feeds yet.
        </p>
      ) : (
        <div className="space-y-3">
          {feeds.map((feed) => {
            const thumbnail = getFeaturedPhoto(feed.photos);

            return (
              <div
                key={feed.feed_id}
                className="rounded-lg border border-neutral-900 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    {thumbnail ? (
                      <Image
                        src={thumbnail.photo_url}
                        alt={thumbnail.title ?? feed.title}
                        width={80}
                        height={80}
                        unoptimized
                        className="h-20 w-20 shrink-0 rounded-md bg-neutral-900 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-neutral-900 bg-neutral-950 text-xs text-neutral-600">
                        No photo
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-semibold">
                        {feed.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-500">
                        <span>{formatFeedType(feed.feed_type)}</span>
                        <span>{feed.status}</span>
                        <span>{formatDate(feed.published_at)}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/admin/feeds/${feed.feed_id}`}
                    className={secondaryButtonClassName}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
