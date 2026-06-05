import {
  incrementFeedClickCount,
  isUuid,
} from "@/lib/click-counts";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isUuid(body.feedId)) {
      return Response.json(
        { error: "Invalid feed ID." },
        { status: 400 }
      );
    }

    await incrementFeedClickCount(body.feedId);

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Click count update failed." },
      { status: 500 }
    );
  }
}
