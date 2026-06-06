import Image from "next/image";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import { getClickStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  await requireAdmin();
  const {
    feedStats,
    photoStats,
    totalFeedClicks,
    totalPhotoClicks,
  } = await getClickStats();

  return (
    <AdminShell title="Stats">
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-900 p-5">
            <div className="text-sm text-neutral-500">
              Feed clicks
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {totalFeedClicks}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-900 p-5">
            <div className="text-sm text-neutral-500">
              Photo clicks
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {totalPhotoClicks}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            Feeds
          </h2>
          {feedStats.length ? (
            <div className="space-y-3">
              {feedStats.map((feed) => (
                <Link
                  key={feed.feed_id}
                  href={`/admin/feeds/${feed.feed_id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-neutral-900 p-4 hover:border-neutral-700"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">
                      {feed.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      {feed.status} ·{" "}
                      {formatDate(
                        feed.published_at ?? feed.updated_at
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-semibold">
                      {feed.click_count}
                    </div>
                    <div className="text-xs text-neutral-500">
                      clicks
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-neutral-900 p-4 text-neutral-500">
              No feed click data yet.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            Photos
          </h2>
          {photoStats.length ? (
            <div className="space-y-3">
              {photoStats.map((photo) => (
                <Link
                  key={photo.photo_id}
                  href={`/admin/feeds/${photo.feed_id}`}
                  className="flex items-center gap-4 rounded-lg border border-neutral-900 p-3 hover:border-neutral-700"
                >
                  <Image
                    src={photo.photo_url}
                    alt={photo.title ?? photo.feed?.title ?? "Photo"}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-16 w-16 shrink-0 rounded-md bg-neutral-900 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">
                      {photo.title?.trim() ||
                        photo.feed?.title ||
                        "Untitled photo"}
                    </h3>
                    <p className="mt-1 truncate text-sm text-neutral-500">
                      {photo.feed?.title ?? "Missing feed"} ·{" "}
                      {formatDate(
                        photo.captured_at ?? photo.created_at
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-semibold">
                      {photo.click_count}
                    </div>
                    <div className="text-xs text-neutral-500">
                      clicks
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-neutral-900 p-4 text-neutral-500">
              No photo click data yet.
            </p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
