import Link from "next/link";
import { notFound } from "next/navigation";

import AdminLayout from "@/components/AdminLayout";
import { getPhoto } from "@/lib/photos";
import {
  updatePhoto,
  deletePhoto,
} from "@/lib/photo-admin";

type Props = {
  params: Promise<{
    photoId: string;
  }>;
};

export default async function EditPhotoPage({
  params,
}: Props) {
  const { photoId } = await params;

  const photo = await getPhoto(photoId);

  if (!photo) {
    notFound();
  }

  return (
    <AdminLayout title="Edit Photo">
      <form
        action={updatePhoto}
        className="space-y-6"
      >
        <input
          type="hidden"
          name="photo_id"
          defaultValue={photo.photo_id}
        />

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="mb-6">
            <img
              src={photo.photo_url}
              alt=""
              className="max-h-[400px] rounded-xl"
            />
          </div>

          <div className="grid gap-4">

            <input
              name="title"
              defaultValue={photo.title ?? ""}
              placeholder="Title"
              className="rounded-lg border border-neutral-700 bg-black p-3"
            />

            <textarea
              name="description"
              defaultValue={
                photo.description ?? ""
              }
              rows={5}
              placeholder="Description"
              className="rounded-lg border border-neutral-700 bg-black p-3"
            />

            <input
              name="location"
              defaultValue={
                photo.location ?? ""
              }
              placeholder="Location"
              className="rounded-lg border border-neutral-700 bg-black p-3"
            />

            <input
              name="latitude"
              defaultValue={
                photo.latitude ?? ""
              }
              placeholder="Latitude"
              className="rounded-lg border border-neutral-700 bg-black p-3"
            />

            <input
              name="longitude"
              defaultValue={
                photo.longitude ?? ""
              }
              placeholder="Longitude"
              className="rounded-lg border border-neutral-700 bg-black p-3"
            />

            <input
              type="datetime-local"
              name="captured_date"
              defaultValue={
                photo.captured_date
                  ? photo.captured_date
                      .substring(0, 16)
                  : ""
              }
              className="rounded-lg border border-neutral-700 bg-black p-3"
            />

            <input
              name="captured_by"
              defaultValue={
                photo.captured_by ?? ""
              }
              placeholder="Captured By"
              className="rounded-lg border border-neutral-700 bg-black p-3"
            />

            <select
              name="status"
              defaultValue={photo.status}
              className="rounded-lg border border-neutral-700 bg-black p-3"
            >
              <option value="active">
                active
              </option>

              <option value="inactive">
                inactive
              </option>

              <option value="obsoleted">
                obsoleted
              </option>
            </select>

            <select
              name="photo_type"
              defaultValue={
                photo.photo_type
              }
              className="rounded-lg border border-neutral-700 bg-black p-3"
            >
              <option value="photo">
                photo
              </option>

              <option value="screenshot">
                screenshot
              </option>
            </select>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2"
            >
              Save Changes
            </button>

            {photo.latitude !== null &&
              photo.longitude !== null && (
                <a
                  href={`https://www.google.com/maps?q=${photo.latitude},${photo.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-700 px-4 py-2"
                >
                  Open Map
                </a>
              )}

            <form
              action={async () => {
                "use server";
                await deletePhoto(
                  photo.photo_id
                );
              }}
            >
              <button
                className="rounded-lg bg-red-700 px-4 py-2"
              >
                Delete Photo
              </button>
            </form>

            <Link
              href="/admin/photos"
              className="rounded-lg border border-neutral-700 px-4 py-2"
            >
              Back
            </Link>

          </div>
        </div>
      </form>
    </AdminLayout>
  );
}