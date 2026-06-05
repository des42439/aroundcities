import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import MobileFeedEditor from "@/components/MobileFeedEditor";
import { updateFeedAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getFeedPlaces } from "@/lib/feed-places";
import { getFeedSchedules } from "@/lib/feed-schedules";
import {
  getChannels,
  getFeedSources,
} from "@/lib/feed-sources";
import {
  getFeedById,
  getParentFeedCandidates,
} from "@/lib/feeds";
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

  const [
    feed,
    places,
    photos,
    feedPlaces,
    feedSources,
    channels,
    schedules,
    parentCandidates,
  ] = await Promise.all([
    getFeedById(feedId),
    getPlaces(),
    getPhotosByFeedId(feedId),
    getFeedPlaces(feedId),
    getFeedSources(feedId),
    getChannels(),
    getFeedSchedules(feedId),
    getParentFeedCandidates(feedId),
  ]);

  if (!feed) {
    return (
      <AdminShell title="Feed Not Found">
        <p className="text-neutral-500">
          This feed does not exist.
        </p>
        <Link
          href="/admin/feeds/drafts"
          className="mt-6 inline-flex text-sm text-neutral-300 hover:text-white"
        >
          Back to drafts
        </Link>
      </AdminShell>
    );
  }

  const action = updateFeedAction.bind(null, feed.feed_id);

  return (
    <AdminShell
      title={
        feed.status === "published"
          ? "Edit Published Feed"
          : "Edit Draft Feed"
      }
    >
      <MobileFeedEditor
        feed={feed}
        photos={photos}
        places={places}
        feedPlaces={feedPlaces}
        feedSources={feedSources}
        channels={channels}
        schedules={schedules}
        parentCandidates={parentCandidates}
        action={action}
      />
    </AdminShell>
  );
}
