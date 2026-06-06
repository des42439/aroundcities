import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { secondaryButtonClassName } from "@/components/AdminForm";
import NewFeedDraftForm from "@/components/NewFeedDraftForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewFeedPage() {
  await requireAdmin();

  return (
    <AdminShell title="New Feed">
      <NewFeedDraftForm />
      <div className="mt-8 border-t border-neutral-900 pt-6">
        <Link
          href="/admin/feeds/import-events"
          className={secondaryButtonClassName}
        >
          Import Events
        </Link>
      </div>
    </AdminShell>
  );
}
