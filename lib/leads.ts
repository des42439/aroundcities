import { getSupabaseAdmin } from "./supabase-admin";
import type {
  Lead,
  LeadStatus,
  LeadUpdate,
  NewLead,
} from "@/types/database";

export type LeadListView = LeadStatus | "all";

function normalizeLead(lead: {
  status: string;
} & Omit<Lead, "status">): Lead {
  return {
    ...lead,
    status: lead.status === "archived" ? "archived" : "active",
  };
}

export async function getLeads(
  view: LeadListView = "active"
): Promise<Lead[]> {
  const query = getSupabaseAdmin()
    .from("leads")
    .select("*")
    .order("updated_at", { ascending: false });

  if (view !== "all") {
    query.eq("status", view);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(normalizeLead);
}

export async function getLeadCount(
  view: LeadListView = "active"
): Promise<number> {
  const query = getSupabaseAdmin()
    .from("leads")
    .select("lead_id", {
      count: "exact",
      head: true,
    });

  if (view !== "all") {
    query.eq("status", view);
  }

  const { count, error } = await query;

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}

export async function getLeadById(
  leadId: string
): Promise<Lead | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .select("*")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data ? normalizeLead(data) : null;
}

export async function createLead(input: NewLead): Promise<Lead> {
  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Lead create failed: ${error.message}`);
  }

  return normalizeLead(data);
}

export async function createLeads(
  inputs: NewLead[]
): Promise<Lead[]> {
  if (!inputs.length) {
    return [];
  }

  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .insert(inputs)
    .select("*");

  if (error) {
    throw new Error(`Leads import failed: ${error.message}`);
  }

  return (data ?? []).map(normalizeLead);
}

export async function updateLead(
  leadId: string,
  input: LeadUpdate
): Promise<Lead> {
  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("lead_id", leadId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Lead update failed: ${error.message}`);
  }

  return normalizeLead(data);
}

export async function archiveLead(leadId: string): Promise<Lead> {
  return updateLead(leadId, {
    status: "archived",
  });
}

export async function deleteLead(leadId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("leads")
    .delete()
    .eq("lead_id", leadId);

  if (error) {
    throw new Error(`Lead delete failed: ${error.message}`);
  }
}
