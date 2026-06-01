import Link from "next/link";

import AdminLayout from "@/components/AdminLayout";
import { getPhotos } from "@/lib/photos";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    filter?: string;
  }>;
};

export default async function PhotosPage({
  searchParams,
}: Props) {
  const photos = await getPhotos();

  const params = await searchParams;

  const saved =
    params.saved === "1";

  const deleted =
    params.deleted === "1";

  const filter =
    params.filter ?? "inactive";

  const filteredPhotos =
    filter === "all"
      ? photos
      : photos.filter(
          (photo) =>
            photo.status ===
            "inactive"
        );

  return (
    <AdminLayout title="Photo Management">
      {saved && (
        <div className="mb-6 rounded-lg border border-green-800 bg-green-950 p-4 text-green-300">
          Photo saved successfully.
        </div>
      )}

      {deleted && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-950 p-4 text-red-300">
          Photo deleted successfully.
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-neutral-400">
            Showing{" "}
            {filteredPhotos.length} of{" "}
            {photos.length} photos
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={
              filter === "all"
                ? "/admin/photos"
                : "/admin/photos?filter=all"
            }
            className="rounded-lg bg-neutral-700 px-4 py-2 font-medium hover:bg-neutral-600"
          >
            {filter === "all"
              ? "Show Inactive"
              : "Show All"}
          </Link>

          <Link
            href="/admin/photos/batch"
            className="rounded-lg bg-green-600 px-4 py-2 font-medium hover:bg-green-500"
          >
            Batch Upload
          </Link>

          <Link
            href="/admin/photos/new"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
          >
            Upload Photo
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPhotos.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            No photos found.
          </div>
        ) : (
          filteredPhotos.map(
            (photo) => (
              <div
                key={
                  photo.photo_id
                }
                className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
              >
                <div className="grid md:grid-cols-[320px_1fr]">
                  <div className="aspect-video bg-neutral-800">
                    <img
                      src={
                        photo.photo_url
                      }
                      alt={
                        photo.title ??
                        "Photo"
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          photo.status ===
                          "active"
                            ? "bg-green-900 text-green-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {photo.status}
                      </span>

                      <span className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
                        {
                          photo.photo_type
                        }
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold">
                        {photo.title ||
                          "Untitled Photo"}
                      </h2>

                      <div className="flex gap-2">
                        <Link
                          href={`/admin/photos/${photo.photo_id}`}
                          className="rounded-lg border border-blue-700 px-3 py-1 text-sm text-blue-400 hover:bg-blue-950"
                        >
                          Edit
                        </Link>

                        {photo.latitude !==
                          null &&
                          photo.longitude !==
                            null && (
                            <a
                              href={`https://www.google.com/maps?q=${photo.latitude},${photo.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-green-700 px-3 py-1 text-sm text-green-400 hover:bg-green-950"
                            >
                              Map
                            </a>
                          )}
                      </div>
                    </div>

                    {photo.description && (
                      <p className="mt-2 text-neutral-400">
                        {
                          photo.description
                        }
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
            )
          )
        )}
      </div>
    </AdminLayout>
  );
}