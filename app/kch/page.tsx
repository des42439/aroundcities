import FeedCard from "@/components/FeedCard";
import PublicShell from "@/components/PublicShell";
import { getLatestPublishedFeeds } from "@/lib/feeds";

export const dynamic = "force-dynamic";

export default async function KuchingPage() {
  const feeds = await getLatestPublishedFeeds();

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <section className="mb-4">
          <p className="mb-3 text-sm uppercase tracking-wide text-neutral-500">
            Latest Around Kuching
          </p>

          <h1 className="max-w-2xl text-4xl font-semibold leading-tight">
            What is happening around Kuching?
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
            Local observations, photo walks, food visits, and discoveries
            shared from around the city.
          </p>
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
