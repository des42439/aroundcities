import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { requireAdmin } from "@/lib/admin-auth";
import { getHistoryRecordCount } from "@/lib/history";
import { getPhotoAlbums } from "@/lib/photo-albums";
import { getSourceCount } from "@/lib/sources";

export default async function AdminPage() {
  await requireAdmin();
  const [albums, sourceCount, historyCount] =
    await Promise.all([
      getPhotoAlbums(),
      getSourceCount(),
      getHistoryRecordCount(),
    ]);

  return (
    <AdminShell title="Admin">
      <div className="space-y-3">
        <Link
          href="/admin/photos"
          className="block rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Photos ({albums.length})
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Manage photo albums and reusable photo library assets.
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

        <Link
          href="/admin/history"
          className="block rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            History ({historyCount})
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Manage local history records and source notes.
          </p>
        </Link>

        <Link
          href="/admin/stats"
          className="block rounded-lg border border-neutral-900 p-5 hover:border-neutral-700"
        >
          <h2 className="text-xl font-semibold">
            Stats
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Review feed and photo click counts.
          </p>
        </Link>
      </div>
    </AdminShell>
  );
}
