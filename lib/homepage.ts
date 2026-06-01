import { Event, PositiveMessage } from "@/types/database";
import { supabase } from "./supabase";
import { getTodayHoliday } from "./holidays";
import { getRandomAtmospherePhoto } from "./photos";

export async function getHomepageData() {
  const [
    holiday,
    positiveMessage,
    featuredEvent,
    photo,
  ] = await Promise.all([
    getTodayHoliday(),
    getRandomPositiveMessage(),
    getFeaturedEvent(),
    getRandomAtmospherePhoto(),
  ]);

  return {
    holiday,
    positiveMessage,
    featuredEvent,
    photo,
    greeting: getTimeGreeting(),
  };
}

export async function getRandomPositiveMessage(): Promise<PositiveMessage | null> {
  const { data, error } = await supabase
    .from("positive_messages")
    .select("*")
    .eq("status", "active");

  if (error || !data?.length) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * data.length
  );

  return data[randomIndex] as PositiveMessage;
}

export async function getFeaturedEvent(): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "active");

  if (error || !data?.length) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * data.length
  );

  return data[randomIndex] as Event;
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 18) {
    return "Good Afternoon";
  }

  return "Good Evening";
}