"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminError } from "./admin-error-log";
import { requireAdmin } from "./admin-auth";
import {
  archiveLead,
  createLead,
  createLeads,
  deleteLead,
  updateLead,
} from "./leads";
import type { LeadStatus, NewLead } from "@/types/database";

export type LeadActionState = {
  error?: string | null;
  errorId?: string | null;
};

export type LeadImportResult = {
  createdCount: number;
};

type ParsedLeadImportItem = Omit<
  NewLead,
  "lead_id" | "created_at" | "updated_at"
>;

async function actionError(
  area: string,
  error: unknown,
  context: Record<string, unknown> = {}
): Promise<LeadActionState> {
  const loggedError = await logAdminError(
    area,
    error,
    context
  );

  return {
    error: `${loggedError.message} (Error ID: ${loggedError.errorId})`,
    errorId: loggedError.errorId,
  };
}

function nullableString(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  return text.length ? text : null;
}

function requiredString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

function parseTags(value: FormDataEntryValue | null) {
  const text = value?.toString() ?? "";

  return text
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function parseDate(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  return text || null;
}

function parseLeadStatus(value: unknown): LeadStatus {
  return value === "archived" ? "archived" : "active";
}

function leadFromForm(
  formData: FormData,
  status: LeadStatus
): ParsedLeadImportItem {
  return {
    title: requiredString(formData, "title"),
    lead_content: nullableString(formData.get("lead_content")),
    why_interesting: nullableString(formData.get("why_interesting")),
    source_name: nullableString(formData.get("source_name")),
    source_type: nullableString(formData.get("source_type")),
    source_url: nullableString(formData.get("source_url")),
    source_page: nullableString(formData.get("source_page")),
    source_section: nullableString(formData.get("source_section")),
    source_note: nullableString(formData.get("source_note")),
    lead_type: nullableString(formData.get("lead_type")),
    place_name: nullableString(formData.get("place_name")),
    relevant_date: parseDate(formData.get("relevant_date")),
    tags: parseTags(formData.get("tags")),
    status,
  };
}

function objectFromUnknown(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textFromUnknown(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function parseImportDate(value: unknown, index: number) {
  const text = textFromUnknown(value);

  if (!text) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(
      `Lead ${index + 1} relevant_date must use YYYY-MM-DD.`
    );
  }

  return text;
}

function parseImportTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((tag) =>
      typeof tag === "string" ? tag.trim().toLowerCase() : ""
    )
    .filter(Boolean);
}

function parseLeadsImportJson(jsonText: string): NewLead[] {
  let payload: unknown;

  try {
    payload = JSON.parse(jsonText);
  } catch {
    throw new Error("JSON could not be parsed.");
  }

  const importObject = objectFromUnknown(payload);

  if (!importObject) {
    throw new Error("JSON must be an object.");
  }

  if (importObject.version !== "aroundcities_leads_import_v1") {
    throw new Error(
      "Import version must be aroundcities_leads_import_v1."
    );
  }

  if (!Array.isArray(importObject.items)) {
    throw new Error("JSON must include an items array.");
  }

  return importObject.items.map((item, index) => {
    const lead = objectFromUnknown(item);
    const title = textFromUnknown(lead?.title);

    if (!title) {
      throw new Error(`Lead ${index + 1} is missing title.`);
    }

    return {
      title,
      lead_content: textFromUnknown(lead?.lead_content),
      why_interesting: textFromUnknown(lead?.why_interesting),
      source_name: textFromUnknown(lead?.source_name),
      source_type: textFromUnknown(lead?.source_type),
      source_url: textFromUnknown(lead?.source_url),
      source_page: textFromUnknown(lead?.source_page),
      source_section: textFromUnknown(lead?.source_section),
      source_note: textFromUnknown(lead?.source_note),
      lead_type: textFromUnknown(lead?.lead_type),
      place_name: textFromUnknown(lead?.place_name),
      relevant_date: parseImportDate(lead?.relevant_date, index),
      tags: parseImportTags(lead?.tags),
      status: "active",
    };
  });
}

export async function createLeadAction(
  _state: LeadActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await createLead(leadFromForm(formData, "active"));

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
  } catch (error) {
    return await actionError("create_lead", error);
  }

  redirect("/admin/leads");
}

export async function updateLeadAction(
  leadId: string,
  _state: LeadActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateLead(
      leadId,
      leadFromForm(
        formData,
        parseLeadStatus(formData.get("status")?.toString())
      )
    );

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
  } catch (error) {
    return await actionError("update_lead", error, {
      leadId,
    });
  }

  redirect(`/admin/leads/${leadId}`);
}

export async function archiveLeadAction(
  leadId: string,
  _state?: LeadActionState
) {
  await requireAdmin();
  void _state;

  try {
    await archiveLead(leadId);

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/leads/reading");

    return {
      error: null,
    };
  } catch (error) {
    return await actionError("archive_lead", error, {
      leadId,
    });
  }
}

export async function archiveLeadAndRedirectAction(
  leadId: string,
  _state: LeadActionState
) {
  await requireAdmin();
  void _state;

  try {
    await archiveLead(leadId);

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads/reading");
  } catch (error) {
    return await actionError("archive_lead_redirect", error, {
      leadId,
    });
  }

  redirect("/admin/leads");
}

export async function deleteLeadAction(
  leadId: string,
  _state: LeadActionState
) {
  await requireAdmin();
  void _state;

  try {
    await deleteLead(leadId);

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/leads/reading");
  } catch (error) {
    return await actionError("delete_lead", error, {
      leadId,
    });
  }

  redirect("/admin/leads");
}

export async function importLeadsAction(input: {
  jsonText: string;
}): Promise<LeadImportResult | LeadActionState> {
  await requireAdmin();

  let leads: NewLead[];

  try {
    leads = parseLeadsImportJson(input.jsonText);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Import JSON is invalid.",
    };
  }

  try {
    await createLeads(leads);

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/leads/import");
    revalidatePath("/admin/leads/reading");

    return {
      createdCount: leads.length,
    };
  } catch (error) {
    return await actionError("import_leads", error);
  }
}
