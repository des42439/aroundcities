import Link from "next/link";
import AdminFeedList from "@/components/AdminFeedList";
import AdminShell from "@/components/AdminShell";
import EventStatusFilter from "@/components/EventStatusFilter";
import { primaryButtonClassName } from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { compareEventFeedsBySchedule } from "@/lib/event-display";
import { getEventFeedsByStatus } from "@/lib/feeds";
import type { FeedStatus } from "@/types/database";

export const dynamic = "force-dynamic";

type AdminEventsPageProps = {
  searchParams?: Promise<{
    status?: string | string[];
  }>;
};

function getStatusParam(value?: string | string[]): FeedStatus {
  const status = Array.isArray(value) ? value[0] : value;

  return status === "published" || status === "archived"
    ? status
    : "draft";
}

function statusLabel(status: FeedStatus) {
  const labels: Record<FeedStatus, string> = {
    draft: "Draft",
    published: "Published",
    archived: "Archived",
  };

  return labels[status];
}

function emptyText(status: FeedStatus) {
  const labels: Record<FeedStatus, string> = {
    draft: "No drafted events yet.",
    published: "No published events yet.",
    archived: "No archived events yet.",
  };

  return labels[status];
}

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const status = getStatusParam(params?.status);
  const events = (await getEventFeedsByStatus(status)).sort(
    compareEventFeedsBySchedule
  );

  return (
    <AdminShell title="Events">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-neutral-900 pb-5">
          <Link
            href="/admin/feeds/import-events"
            className={`${primaryButtonClassName} w-fit`}
          >
            Import Events
          </Link>

          <EventStatusFilter status={status} />
        </div>

        <AdminFeedList
          feeds={events}
          emptyText={emptyText(status)}
          timeField={status === "published" ? "published_at" : "updated_at"}
          statusLabel={statusLabel(status)}
          searchPlaceholder="Search events"
          titleMode="eventDatePrefix"
        />
      </div>
    </AdminShell>
  );
}
