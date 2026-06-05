import Link from "next/link";
import AdminFeedList from "@/components/AdminFeedList";
import AdminShell from "@/components/AdminShell";
import { primaryButtonClassName } from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getFeedsByStatus } from "@/lib/feeds";

export const dynamic = "force-dynamic";

export default async function DraftedFeedsPage() {
  await requireAdmin();
  const feeds = await getFeedsByStatus("draft");

  return (
    <AdminShell title="Drafted Feeds">
      <div className="mb-5">
        <Link
          href="/admin/feeds/new"
          className={primaryButtonClassName}
        >
          New Feed
        </Link>
      </div>

      <AdminFeedList
        feeds={feeds}
        emptyText="No drafted feeds yet."
        timeField="updated_at"
        statusLabel="Draft"
      />
    </AdminShell>
  );
}
