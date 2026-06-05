import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { formatDate } from "@/lib/format";
import { getPublishedPhotoById } from "@/lib/photos";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    photoId: string;
  }>;
};

export default async function PhotoDetailPage({
  params,
}: Props) {
  const { photoId } = await params;
  const photo = await getPublishedPhotoById(photoId);

  if (!photo) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <p className="mb-3 text-sm uppercase tracking-wide text-neutral-500">
            Photo Not Found
          </p>
          <h1 className="text-3xl font-semibold">
            This photo is not available.
          </h1>
          <p className="mt-4 text-neutral-400">
            It may have been removed, archived, or not published yet.
          </p>
          <Link
            href="/kch"
            className="mt-8 inline-flex text-sm text-neutral-300 hover:text-white"
          >
            Back to Kuching
          </Link>
        </div>
      </PublicShell>
    );
  }

  const title = photo.title?.trim() || photo.feed.title;

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <span>Photo feed</span>
            <span aria-hidden="true">/</span>
            <time dateTime={photo.captured_at ?? photo.created_at}>
              {formatDate(photo.captured_at ?? photo.created_at)}
            </time>
          </div>

          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            {title}
          </h1>

          <Link
            href={`/feed/${photo.feed.slug}`}
            className="inline-flex text-sm text-neutral-500 hover:text-neutral-300"
          >
            From {photo.feed.title}
          </Link>
        </div>

        <img
          src={photo.photo_url}
          alt={title}
          className="w-full rounded-lg bg-neutral-900 object-cover"
        />

        {photo.description ? (
          <p className="mt-5 whitespace-pre-wrap text-base leading-7 text-neutral-300">
            {photo.description}
          </p>
        ) : null}
      </article>
    </PublicShell>
  );
}
