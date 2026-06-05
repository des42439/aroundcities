import {
  incrementPhotoClickCount,
  isUuid,
} from "@/lib/click-counts";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isUuid(body.photoId)) {
      return Response.json(
        { error: "Invalid photo ID." },
        { status: 400 }
      );
    }

    await incrementPhotoClickCount(body.photoId);

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Click count update failed." },
      { status: 500 }
    );
  }
}
