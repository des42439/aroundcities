import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";

export default function AdminPage() {
  return (
    <AdminLayout title="Admin">
      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/admin/import-events"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 hover:border-neutral-700"
        >
          <h2 className="mb-2 text-xl font-semibold">
            Import Events
          </h2>

          <p className="text-neutral-400">
            Import event JSON into the database.
          </p>
        </Link>

        <Link
          href="/admin/content"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 hover:border-neutral-700"
        >
          <h2 className="mb-2 text-xl font-semibold">
            Manage Content
          </h2>

          <p className="text-neutral-400">
            View and manage events.
          </p>
        </Link>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-2 text-xl font-semibold">
            Coming Soon
          </h2>

          <p className="text-neutral-400">
            Photos, Holidays and Positive Messages.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}