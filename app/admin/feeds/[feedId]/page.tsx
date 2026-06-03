import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import FeedForm from "@/components/FeedForm";
import PhotoManager from "@/components/PhotoManager";
import { updateFeedAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getFeedPlaces } from "@/lib/feed-places";
import { getFeedById } from "@/lib/feeds";
import { getPhotosByFeedId } from "@/lib/photos";
import { getPlaces } from "@/lib/places";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    feedId: string;
  }>;
};

export default async function EditFeedPage({
  params,
}: Props) {
  await requireAdmin();
  const { feedId } = await params;

  const [feed, places, photos, feedPlaces] = await Promise.all([
    getFeedById(feedId),
    getPlaces(),
    getPhotosByFeedId(feedId),
    getFeedPlaces(feedId),
  ]);

  if (!feed) {
    return (
      <AdminShell title="Feed Not Found">
        <p className="text-neutral-500">
          This feed does not exist.
        </p>
        <Link
          href="/admin/feeds"
          className="mt-6 inline-flex text-sm text-neutral-300 hover:text-white"
        >
          Back to feeds
        </Link>
      </AdminShell>
    );
  }

  const action = updateFeedAction.bind(null, feed.feed_id);

  return (
    <AdminShell title="Edit Feed">
      <div className="space-y-12">
        <FeedForm
          feed={feed}
          feedPlaces={feedPlaces}
          places={places}
          action={action}
        />

        <PhotoManager
          feedId={feed.feed_id}
          photos={photos}
          places={places}
        />
      </div>
    </AdminShell>
  );
}
