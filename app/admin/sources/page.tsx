import Link from "next/link";
import AdminActionForm from "@/components/AdminActionForm";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/AdminForm";
import AdminShell from "@/components/AdminShell";
import { AdminSubmitButton } from "@/components/AdminSubmitButton";
import {
  deleteSourceAction,
  markSourceCheckedAction,
} from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getSources, type SourceListView } from "@/lib/sources";

export const dynamic = "force-dynamic";

type AdminSourcesPageProps = {
  searchParams?: Promise<{
    view?: string | string[];
  }>;
};

function formatLastChecked(value?: string | null) {
  if (!value) {
    return "Never checked";
  }

  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kuching",
  }).format(new Date(value));
}

function getViewParam(value?: string | string[]): SourceListView {
  const view = Array.isArray(value) ? value[0] : value;

  return view === "all" ? "all" : "pending";
}

function filterLinkClassName(active: boolean) {
  return [
    "rounded-md border px-3 py-2 text-sm",
    active
      ? "border-white bg-white text-black"
      : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white",
  ].join(" ");
}

export default async function AdminSourcesPage({
  searchParams,
}: AdminSourcesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const view = getViewParam(params?.view);
  const sources = await getSources(view);

  return (
    <AdminShell title="Sources">
      <div className="space-y-6">
        <div className="space-y-4">
          <Link
            href="/admin/sources/new"
            className={primaryButtonClassName}
          >
            New source
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/sources"
              className={filterLinkClassName(view === "pending")}
            >
              Pending
            </Link>
            <Link
              href="/admin/sources?view=all"
              className={filterLinkClassName(view === "all")}
            >
              Show all
            </Link>
          </div>
        </div>

        {sources.length === 0 ? (
          <p className="text-neutral-500">
            {view === "pending"
              ? "No pending sources. Everything has been checked in the past 3 days."
              : "No sources yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => {
              const markAction =
                markSourceCheckedAction.bind(
                  null,
                  source.source_id
                );
              const deleteAction =
                deleteSourceAction.bind(
                  null,
                  source.source_id
                );

              return (
                <div
                  key={source.source_id}
                  className="rounded-lg border border-neutral-900 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold">
                        {source.name}
                      </h2>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-sm text-neutral-400 hover:text-white"
                      >
                        {source.url}
                      </a>
                      {source.notes ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-300">
                          {source.notes}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm text-neutral-500">
                        {formatLastChecked(
                          source.last_checked_at
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className={secondaryButtonClassName}
                      >
                        Open
                      </a>
                      <AdminActionForm action={markAction}>
                        <AdminSubmitButton
                          pendingLabel="Marking..."
                          variant="secondary"
                        >
                          Mark Checked
                        </AdminSubmitButton>
                      </AdminActionForm>
                      <Link
                        href={`/admin/sources/${source.source_id}`}
                        className={secondaryButtonClassName}
                      >
                        Edit
                      </Link>
                      <AdminActionForm action={deleteAction}>
                        <AdminSubmitButton
                          pendingLabel="Deleting..."
                          variant="danger"
                          confirmMessage={`Delete ${source.name}?`}
                        >
                          Delete
                        </AdminSubmitButton>
                      </AdminActionForm>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
