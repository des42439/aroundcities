import { Holiday } from "@/types/database";
import { supabase } from "./supabase";

export async function getHolidays(): Promise<Holiday[]> {
  const { data, error } = await supabase
    .from("holidays")
    .select("*")
    .order("holiday_date");

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Holiday[];
}

export async function getHoliday(
  holidayId: string
): Promise<Holiday | null> {
  const { data, error } = await supabase
    .from("holidays")
    .select("*")
    .eq("holiday_id", holidayId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Holiday;
}

export async function getTodayHoliday(): Promise<Holiday | null> {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("holidays")
    .select("*")
    .eq("status", "active")
    .eq("holiday_date", today)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Holiday | null;
}