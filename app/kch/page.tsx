import FeedCard from "@/components/FeedCard";
import PhotoFeedCard from "@/components/PhotoFeedCard";
import PublicLockScreen from "@/components/PublicLockScreen";
import PublicShell from "@/components/PublicShell";
import TodayInKuchingCard from "@/components/TodayInKuchingCard";
import { getKuchingPageData } from "@/lib/feeds";
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

  const { items, todayInKuching } = await getKuchingPageData();
  const hasTodayInKuching =
    todayInKuching.today.length > 0 ||
    todayInKuching.tomorrow.length > 0 ||
    todayInKuching.comingSoon.length > 0;

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4">
        {!hasTodayInKuching && items.length === 0 ? (
          <div className="mt-10 rounded-lg border border-neutral-900 bg-neutral-950 py-12 text-neutral-400">
            <p>No published feeds yet.</p>
          </div>
        ) : (
          <div>
            {hasTodayInKuching ? (
              <TodayInKuchingCard summary={todayInKuching} />
            ) : null}
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
