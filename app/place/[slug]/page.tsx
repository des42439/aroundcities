import Link from "next/link";
import FeedCard from "@/components/FeedCard";
import PublicShell from "@/components/PublicShell";
import { getPlaceBySlug } from "@/lib/places";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PlacePage({ params }: Props) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <p className="mb-3 text-sm uppercase tracking-wide text-neutral-500">
            Place Not Found
          </p>
          <h1 className="text-3xl font-semibold">
            This place is not available.
          </h1>
          <Link
            href="/kch"
            className="mt-8 inline-flex text-sm text-neutral-300 hover:text-white"
          >
            Back to Latest Around Kuching
          </Link>
        </div>
      </PublicShell>
    );
  }

  const hasCoordinates =
    place.latitude !== null &&
    place.longitude !== null;

  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <section className="border-b border-neutral-900 pb-8">
          <p className="mb-3 text-sm uppercase tracking-wide text-neutral-500">
            Place
          </p>

          <h1 className="text-4xl font-semibold leading-tight">
            {place.name}
          </h1>

          {place.description && (
            <p className="mt-5 text-lg leading-8 text-neutral-300">
              {place.description}
            </p>
          )}

          {hasCoordinates && (
            <p className="mt-5 text-sm text-neutral-500">
              Coordinates: {place.latitude}, {place.longitude}
            </p>
          )}
        </section>

        <section className="pt-8">
          <h2 className="text-xl font-semibold">
            Related Feeds
          </h2>

          {place.feeds.length === 0 ? (
            <p className="mt-6 text-neutral-400">
              No published feeds for this place yet.
            </p>
          ) : (
            <div className="mt-2">
              {place.feeds.map((feed) => (
                <FeedCard key={feed.feed_id} feed={feed} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
