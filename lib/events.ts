import { supabase } from "./supabase";
import {
  Event,
  EventProgram,
  EventRegistration,
  EventSchedule,
} from "@/types/database";

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Event[];
}

export async function getActiveEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "active")
    .order("start_date", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Event[];
}

export async function getEvent(
  eventId: string
): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_id", eventId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Event;
}

export async function getEventSchedules(
  eventId: string
): Promise<EventSchedule[]> {
  const { data, error } = await supabase
    .from("event_schedules")
    .select("*")
    .eq("event_id", eventId)
    .order("event_date")
    .order("start_time");

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as EventSchedule[];
}

export async function getEventRegistrations(
  eventId: string
): Promise<EventRegistration[]> {
  const { data, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("start_date");

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as EventRegistration[];
}

export async function getEventPrograms(
  eventId: string
): Promise<EventProgram[]> {
  const { data: schedules, error: scheduleError } =
    await supabase
      .from("event_schedules")
      .select("event_schedule_id")
      .eq("event_id", eventId);

  if (scheduleError) {
    console.error(scheduleError);
    return [];
  }

  if (!schedules?.length) {
    return [];
  }

  const scheduleIds = schedules.map(
    (x) => x.event_schedule_id
  );

  const { data, error } = await supabase
    .from("event_programs")
    .select("*")
    .in("event_schedule_id", scheduleIds)
    .order("start_time");

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as EventProgram[];
}