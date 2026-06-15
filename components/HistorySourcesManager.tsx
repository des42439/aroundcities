import AdminActionForm from "./AdminActionForm";
import {
  Field,
  inputClassName,
  secondaryButtonClassName,
  selectClassName,
  textareaClassName,
} from "./AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "./AdminSubmitButton";
import {
  createHistorySourceAction,
  deleteHistorySourceAction,
  setHistorySourceStatusAction,
  updateHistorySourceAction,
} from "@/lib/admin-actions";
import type {
  HistorySource,
  HistorySourceStatus,
} from "@/types/database";

type Props = {
  historyId: string;
  sources: HistorySource[];
};

export default function HistorySourcesManager({
  historyId,
  sources,
}: Props) {
  return (
    <div className="space-y-5">
      {sources.length ? (
        <div className="space-y-4">
          {sources.map((source) => (
            <article
              key={source.history_source_id}
              className="space-y-4 rounded-md border border-neutral-900 p-4"
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-neutral-100">
                  {source.source_title || source.source_url}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <StatusBadge label={source.source_status} />
                  <StatusBadge label={`screenshot: ${source.screenshot_status}`} />
                </div>
              </div>

              <a
                href={source.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${secondaryButtonClassName} inline-flex w-full justify-center sm:w-auto`}
              >
                Open URL
              </a>

              {source.source_note ? (
                <p className="whitespace-pre-wrap text-sm text-neutral-400">
                  {source.source_note}
                </p>
              ) : null}

              {source.source_screenshot_url ? (
                <a
                  href={source.source_screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={source.source_screenshot_url}
                    alt="Source screenshot preview"
                    className="max-h-72 w-full rounded-md border border-neutral-800 object-contain"
                  />
                </a>
              ) : null}

              {source.screenshot_error ? (
                <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
                  {source.screenshot_error}
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <SourceStatusButton
                  historyId={historyId}
                  historySourceId={source.history_source_id}
                  status="pending"
                  label="Mark Pending"
                />
                <SourceStatusButton
                  historyId={historyId}
                  historySourceId={source.history_source_id}
                  status="reviewed"
                  label="Mark Reviewed"
                />
                <SourceStatusButton
                  historyId={historyId}
                  historySourceId={source.history_source_id}
                  status="rejected"
                  label="Mark Rejected"
                />
              </div>

              <AdminActionForm
                action={updateHistorySourceAction.bind(
                  null,
                  historyId,
                  source.history_source_id
                )}
                className="space-y-4 border-t border-neutral-900 pt-4"
              >
                <AdminFormProgress />
                <SourceFields source={source} />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <AdminSubmitButton
                    variant="secondary"
                    pendingLabel="Saving source..."
                  >
                    Save Source
                  </AdminSubmitButton>
                </div>
              </AdminActionForm>

              <AdminActionForm
                action={deleteHistorySourceAction.bind(
                  null,
                  historyId,
                  source.history_source_id
                )}
              >
                <AdminFormProgress />
                <AdminSubmitButton
                  variant="danger"
                  pendingLabel="Deleting source..."
                  confirmMessage="Delete this source?"
                >
                  Delete Source
                </AdminSubmitButton>
              </AdminActionForm>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-neutral-900 p-4 text-sm text-neutral-500">
          No sources linked yet.
        </p>
      )}

      <AdminActionForm
        action={createHistorySourceAction.bind(null, historyId)}
        className="space-y-4 rounded-md border border-neutral-900 p-4"
      >
        <AdminFormProgress />
        <h3 className="font-semibold text-neutral-100">Add Source</h3>
        <SourceFields />
        <AdminSubmitButton pendingLabel="Adding source...">
          Add Source
        </AdminSubmitButton>
      </AdminActionForm>
    </div>
  );
}

function SourceFields({ source }: { source?: HistorySource }) {
  return (
    <div className="space-y-4">
      <Field label="URL">
        <input
          name="source_url"
          type="url"
          required
          defaultValue={source?.source_url ?? ""}
          className={inputClassName}
        />
      </Field>
      <Field label="Title">
        <input
          name="source_title"
          defaultValue={source?.source_title ?? ""}
          className={inputClassName}
        />
      </Field>
      <Field label="Note">
        <textarea
          name="source_note"
          defaultValue={source?.source_note ?? ""}
          className={textareaClassName}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Sequence">
          <input
            name="sequence"
            type="number"
            min={0}
            defaultValue={source?.sequence ?? 0}
            className={inputClassName}
          />
        </Field>
        <Field label="Source status">
          <select
            name="source_status"
            defaultValue={source?.source_status ?? "pending"}
            className={selectClassName}
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="rejected">Rejected</option>
          </select>
        </Field>
        <Field label="Screenshot status">
          <select
            name="screenshot_status"
            defaultValue={source?.screenshot_status ?? "pending"}
            className={selectClassName}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </Field>
      </div>
      <Field label="Screenshot URL">
        <input
          name="source_screenshot_url"
          type="url"
          defaultValue={source?.source_screenshot_url ?? ""}
          className={inputClassName}
        />
      </Field>
      <Field label="Screenshot error">
        <textarea
          name="screenshot_error"
          defaultValue={source?.screenshot_error ?? ""}
          className={textareaClassName}
        />
      </Field>
    </div>
  );
}

function SourceStatusButton({
  historyId,
  historySourceId,
  status,
  label,
}: {
  historyId: string;
  historySourceId: string;
  status: HistorySourceStatus;
  label: string;
}) {
  return (
    <AdminActionForm
      action={setHistorySourceStatusAction.bind(
        null,
        historyId,
        historySourceId,
        status
      )}
    >
      <AdminFormProgress />
      <AdminSubmitButton
        variant="secondary"
        pendingLabel="Updating source..."
      >
        {label}
      </AdminSubmitButton>
    </AdminActionForm>
  );
}

function StatusBadge({ label }: { label: string }) {
  const className = label.includes("reviewed")
    ? "border-emerald-900 bg-emerald-950/40 text-emerald-200"
    : label.includes("rejected") || label.includes("failed")
      ? "border-red-950 bg-red-950/30 text-red-100"
      : "border-amber-950 bg-amber-950/30 text-amber-100";

  return (
    <span className={`rounded-full border px-2 py-1 ${className}`}>
      {label}
    </span>
  );
}
