import Link from "next/link";
import AdminActionForm from "@/components/AdminActionForm";
import AdminShell from "@/components/AdminShell";
import LeadForm from "@/components/LeadForm";
import { secondaryButtonClassName } from "@/components/AdminForm";
import { AdminSubmitButton } from "@/components/AdminSubmitButton";
import { requireAdmin } from "@/lib/admin-auth";
import { getLeadById } from "@/lib/leads";
import {
  archiveLeadAndRedirectAction,
  deleteLeadAction,
  updateLeadAction,
} from "@/lib/leads-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    leadId: string;
  }>;
};

export default async function EditLeadPage({ params }: Props) {
  await requireAdmin();
  const { leadId } = await params;
  const lead = await getLeadById(leadId);

  if (!lead) {
    return (
      <AdminShell title="Lead Not Found">
        <p className="text-neutral-500">
          This lead does not exist.
        </p>
        <Link
          href="/admin/leads"
          className="mt-6 inline-flex text-sm text-neutral-300 hover:text-white"
        >
          Back to leads
        </Link>
      </AdminShell>
    );
  }

  const updateAction = updateLeadAction.bind(null, lead.lead_id);
  const archiveAction = archiveLeadAndRedirectAction.bind(
    null,
    lead.lead_id
  );
  const deleteAction = deleteLeadAction.bind(null, lead.lead_id);

  return (
    <AdminShell title="Edit Lead">
      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/leads" className={secondaryButtonClassName}>
            Back to Leads
          </Link>
          {lead.source_url ? (
            <a
              href={lead.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryButtonClassName}
            >
              Open Source
            </a>
          ) : null}
        </div>

        <LeadForm
          lead={lead}
          action={updateAction}
          submitLabel="Save"
          showStatus
        />

        {lead.status !== "archived" ? (
          <AdminActionForm action={archiveAction}>
            <AdminSubmitButton
              pendingLabel="Archiving..."
              variant="secondary"
            >
              Archive
            </AdminSubmitButton>
          </AdminActionForm>
        ) : null}

        <section className="border-t border-neutral-900 pt-8">
          <AdminActionForm action={deleteAction}>
            <AdminSubmitButton
              pendingLabel="Deleting..."
              variant="danger"
              confirmMessage={`Delete ${lead.title}?`}
            >
              Delete Lead
            </AdminSubmitButton>
          </AdminActionForm>
        </section>
      </div>
    </AdminShell>
  );
}
