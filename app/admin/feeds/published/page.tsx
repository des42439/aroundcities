import Link from "next/link";
import AdminFeedList from "@/components/AdminFeedList";
import AdminShell from "@/components/AdminShell";
import { primaryButtonClassName } from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getFeedsByStatus } from "@/lib/feeds";

export const dynamic = "force-dynamic";

export default async function PublishedFeedsPage() {
  await requireAdmin();
  const feeds = await getFeedsByStatus("published");

  return (
    <AdminShell title="Published Feeds">
      <div className="mb-5">
        <Link
          href="/admin/feeds/new"
          className={primaryButtonClassName}
        >
          Create New Feed
        </Link>
      </div>

      <AdminFeedList
        feeds={feeds}
        emptyText="No published feeds yet."
        timeField="published_at"
        statusLabel="Published"
      />
    </AdminShell>
  );
}
