import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "Invalid events array" },
        { status: 400 }
      );
    }

    const insertPayload = events.map((event: any) => ({
      title: event.title || null,
      description: event.description || null,

      category: event.category || null,
      city: event.city || "Kuching",
      region: event.region || null,

      venue: event.venue || null,
      organizer: event.organizer || null,

      start_time: event.start_time || null,
      end_time: event.end_time || null,

      confidence: event.confidence || "medium",

      status: "pending_verification",

      raw_json: event,
    }));

    const { data, error } = await supabase
      .from("draft_events")
      .insert(insertPayload)
      .select();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inserted: data.length,
      data,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}