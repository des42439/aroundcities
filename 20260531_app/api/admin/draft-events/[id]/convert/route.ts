import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: draftEvent, error: fetchError } = await supabase
      .from("draft_events")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !draftEvent) {
      return NextResponse.json(
        { error: "Draft event not found" },
        { status: 404 }
      );
    }

    const { data: createdEvent, error: insertError } = await supabase
      .from("events")
      .insert({
        title: draftEvent.title,
        description: draftEvent.description,

        category: draftEvent.category,

        venue: draftEvent.venue,

        organizer: draftEvent.organizer,

        start_time: draftEvent.start_time,
        end_time: draftEvent.end_time,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("draft_events")
      .update({
        status: "converted",
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event: createdEvent,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}