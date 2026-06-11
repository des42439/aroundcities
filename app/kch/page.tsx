import FeedCard from "@/components/FeedCard";
import PhotoFeedCard from "@/components/PhotoFeedCard";
import PublicLockScreen from "@/components/PublicLockScreen";
import PublicShell from "@/components/PublicShell";
import { getDiscoveryFeedItems } from "@/lib/feeds";
import { hasPublicPageAccess } from "@/lib/public-lock";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    publicLockError?: string;
  }>;
};

export default async function KuchingPage({
  searchParams,
}: Props) {
  const hasAccess = await hasPublicPageAccess();

  if (!hasAccess) {
    const params = await searchParams;

    return (
      <PublicLockScreen
        hasError={params.publicLockError === "1"}
      />
    );
  }

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
