import FeedCard from "@/components/FeedCard";
import PublicShell from "@/components/PublicShell";
import { getDiscoveryPublishedFeeds } from "@/lib/feeds";

export const dynamic = "force-dynamic";

export default async function KuchingPage() {
  const feeds = await getDiscoveryPublishedFeeds();

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4">
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
