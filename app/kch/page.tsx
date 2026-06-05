import FeedCard from "@/components/FeedCard";
import PublicShell from "@/components/PublicShell";
import { getLatestPublishedFeeds } from "@/lib/feeds";

export const dynamic = "force-dynamic";

export default async function KuchingPage() {
  const feeds = await getLatestPublishedFeeds();

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-4 sm:py-6">
        <section className="border-b border-neutral-900 pb-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">
                Around Kuching
              </p>
              <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">
                Latest local notes
              </h1>
            </div>

            <p className="hidden max-w-56 text-right text-sm leading-5 text-neutral-500 sm:block">
              Photos, food, small events, and things worth noticing.
            </p>
          </div>
        </section>

        {feeds.length === 0 ? (
          <div className="mt-10 rounded-lg border border-neutral-900 bg-neutral-950 py-12 text-neutral-400">
            <p>No published feeds yet.</p>
          </div>
        ) : (
          <div>
            {feeds.map((feed) => (
              <FeedCard key={feed.feed_id} feed={feed} />
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
