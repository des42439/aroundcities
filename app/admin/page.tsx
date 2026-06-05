import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";
import { getFeedCountByStatus } from "@/lib/feeds";
import { getSourceCount } from "@/lib/sources";

export default async function AdminPage() {
  await requireAdmin();
  const [draftCount, publishedCount, sourceCount] =
    await Promise.all([
      getFeedCountByStatus("draft"),
      getFeedCountByStatus("published"),
      getSourceCount(),
    ]);

  return (
    <AdminShell title="Admin">
      <div className="space-y-3">
        <Link
          href="/admin/feeds/new"
          className="block rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            New Feed
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Capture photos, title, and description.
          </p>
        </Link>

        <Link
          href="/admin/feeds/drafts"
          className="block rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Drafted Feeds ({draftCount})
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Refine drafts before publishing.
          </p>
        </Link>

        <Link
          href="/admin/feeds/published"
          className="block rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Published Feeds ({publishedCount})
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Update or archive live posts.
          </p>
        </Link>

        <Link
          href="/admin/sources"
          className="block rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Sources ({sourceCount})
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Manually check useful pages and websites.
          </p>
        </Link>
      </div>
    </AdminShell>
  );
}
