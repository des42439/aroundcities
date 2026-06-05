import FeedCard from "@/components/FeedCard";
import PhotoFeedCard from "@/components/PhotoFeedCard";
import PublicShell from "@/components/PublicShell";
import { getDiscoveryFeedItems } from "@/lib/feeds";

export const dynamic = "force-dynamic";

export default async function KuchingPage() {
  const items = await getDiscoveryFeedItems();

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4">
        {items.length === 0 ? (
          <div className="mt-10 rounded-lg border border-neutral-900 bg-neutral-950 py-12 text-neutral-400">
            <p>No published feeds yet.</p>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              item.kind === "feed" ? (
                <FeedCard key={item.id} feed={item.feed} />
              ) : (
                <PhotoFeedCard
                  key={item.id}
                  feed={item.feed}
                  photo={item.photo}
                />
              )
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
