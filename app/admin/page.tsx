import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <AdminShell title="Admin">
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/feeds"
          className="rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Feeds
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Write, draft, publish, and attach photos.
          </p>
        </Link>

        <Link
          href="/admin/places"
          className="rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Places
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Manage the locations used by feeds and photos.
          </p>
        </Link>
      </div>
    </AdminShell>
  );
}
