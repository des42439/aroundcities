import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <AdminShell title="Admin">
      <div className="space-y-3">
        <Link
          href="/admin/feeds/new"
          className="rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
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
          className="rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Drafted Feeds
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Refine drafts before publishing.
          </p>
        </Link>

        <Link
          href="/admin/feeds/published"
          className="rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Published Feeds
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Update or archive live posts.
          </p>
        </Link>

        <Link
          href="/admin/sources"
          className="rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Sources
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Manually check useful pages and websites.
          </p>
        </Link>
      </div>
    </AdminShell>
  );
}
