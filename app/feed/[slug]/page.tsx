import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { getFeedBySlug } from "@/lib/feeds";
import { getPhotosByFeedId } from "@/lib/photos";
import {
  formatDate,
  formatFeedType,
} from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function FeedDetailPage({
  params,
}: Props) {
  const { slug } = await params;
  const feed = await getFeedBySlug(slug);

  if (!feed) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <p className="mb-3 text-sm uppercase tracking-wide text-neutral-500">
            Feed Not Found
          </p>
          <h1 className="text-3xl font-semibold">
            This feed is not available.
          </h1>
          <p className="mt-4 text-neutral-400">
            It may have been removed, archived, or not published yet.
          </p>
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

  const photos = await getPhotosByFeedId(feed.feed_id);

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <span>{formatFeedType(feed.feed_type)}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={feed.published_at ?? undefined}>
              {formatDate(feed.published_at)}
            </time>
          </div>

          <h1 className="text-4xl font-semibold leading-tight">
            {feed.title}
          </h1>

          {feed.place && (
            <Link
              href={`/place/${feed.place.slug}`}
              className="inline-flex text-sm text-neutral-500 hover:text-neutral-300"
            >
              {feed.place.name}
            </Link>
          )}
        </div>

        {feed.content && (
          <div className="whitespace-pre-wrap text-lg leading-8 text-neutral-200">
            {feed.content}
          </div>
        )}

        {photos.length > 0 && (
          <div className="mt-10 space-y-8">
            {photos.map((photo) => (
              <figure key={photo.photo_id}>
                <img
                  src={photo.photo_url}
                  alt={photo.title ?? feed.title}
                  className="w-full rounded-lg bg-neutral-900 object-cover"
                />

                {(photo.title || photo.description) && (
                  <figcaption className="mt-3 text-sm leading-6 text-neutral-500">
                    {photo.title && (
                      <span className="font-medium text-neutral-400">
                        {photo.title}
                      </span>
                    )}
                    {photo.title && photo.description && " - "}
                    {photo.description}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {feed.source_url && (
          <div className="mt-10 border-t border-neutral-900 pt-6">
            <a
              href={feed.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-300 hover:text-white"
            >
              Source
            </a>
          </div>
        )}
      </article>
    </PublicShell>
  );
}
