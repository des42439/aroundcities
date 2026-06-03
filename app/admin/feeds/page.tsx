import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/AdminForm";
import { formatDate, formatFeedType } from "@/lib/format";
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
          {feeds.map((feed) => (
            <div
              key={feed.feed_id}
              className="rounded-lg border border-neutral-900 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

                <Link
                  href={`/admin/feeds/${feed.feed_id}`}
                  className={secondaryButtonClassName}
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
