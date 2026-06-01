import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { getPhotos } from "@/lib/photos";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  const photos = await getPhotos();

  return (
    <AdminLayout title="Photo Management">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-neutral-400">
            Total Photos: {photos.length}
          </p>
        </div>

        <Link
          href="/admin/photos/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
        >
          Upload Photo
        </Link>
      </div>

      <div className="space-y-4">
        {photos.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            No photos found.
          </div>
        ) : (
          photos.map((photo) => (
            <div
              key={photo.photo_id}
              className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
            >
              <div className="grid md:grid-cols-[320px_1fr]">
                <div className="aspect-video bg-neutral-800">
                  <img
                    src={photo.photo_url}
                    alt={photo.title ?? "Photo"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        photo.status === "active"
                          ? "bg-green-900 text-green-300"
                          : "bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      {photo.status}
                    </span>

                    <span className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
                      {photo.photo_type}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold">
                    {photo.title ||
                      "Untitled Photo"}
                  </h2>

                  {photo.description && (
                    <p className="mt-2 text-neutral-400">
                      {photo.description}
                    </p>
                  )}

                  <div className="mt-4 grid gap-2 text-sm text-neutral-500">
                    <div>
                      Location:{" "}
                      {photo.location ||
                        "-"}
                    </div>

                    <div>
                      Captured Date:{" "}
                      {formatDate(
                        photo.captured_date
                      )}
                    </div>

                    <div>
                      Captured By:{" "}
                      {photo.captured_by ||
                        "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}