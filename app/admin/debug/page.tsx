import { getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  try {
    const photos = await getPhotos();

    return (
      <pre>
        {JSON.stringify(
          {
            count: photos.length,
            photos,
          },
          null,
          2
        )}
      </pre>
    );
  } catch (error) {
    return (
      <pre>
        {JSON.stringify(
          {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
          null,
          2
        )}
      </pre>
    );
  }
}