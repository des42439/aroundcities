import Image from "next/image";
import Link from "next/link";
import AdminActionForm from "@/components/AdminActionForm";
import AdminShell from "@/components/AdminShell";
import PhotoTagsInput from "@/components/PhotoTagsInput";
import {
  Field,
  inputClassName,
  secondaryButtonClassName,
  selectClassName,
  textareaClassName,
} from "@/components/AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "@/components/AdminSubmitButton";
import {
  archiveAlbumPhotoAction,
  updateAlbumPhotoAction,
} from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { toDateTimeInputValue } from "@/lib/format";
import {
  getAlbumPhotoById,
  getPhotoTagSuggestions,
} from "@/lib/photo-albums";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    photoId: string;
  }>;
};

export default async function EditAlbumPhotoPage({ params }: Props) {
  await requireAdmin();
  const { photoId } = await params;
  const [photo, tagSuggestions] = await Promise.all([
    getAlbumPhotoById(photoId),
    getPhotoTagSuggestions(),
  ]);

  if (!photo?.album_id) {
    return (
      <AdminShell title="Photo Not Found">
        <p className="text-neutral-500">This album photo does not exist.</p>
        <Link
          href="/admin/photos"
          className="mt-6 inline-flex text-sm text-neutral-300 hover:text-white"
        >
          Back to Photos
        </Link>
      </AdminShell>
    );
  }

  const hasCoordinates =
    photo.latitude !== null && photo.longitude !== null;
  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${photo.latitude},${photo.longitude}`
    : null;

  return (
    <AdminShell title="Edit Photo">
      <div className="space-y-8">
        <Link
          href={`/admin/photos/${photo.album_id}`}
          className={secondaryButtonClassName}
        >
          Back to Album
        </Link>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <a
            href={photo.photo_url}
            target="_blank"
            rel="noreferrer"
            className="relative block aspect-[4/5] overflow-hidden rounded-md bg-neutral-900 outline-none transition hover:ring-1 hover:ring-neutral-600 focus:ring-1 focus:ring-neutral-500"
          >
            <Image
              src={photo.photo_url}
              alt={photo.title ?? "Album photo"}
              fill
              sizes="(min-width: 1024px) 340px, 100vw"
              className="object-cover"
              unoptimized
            />
          </a>

          <AdminActionForm
            action={updateAlbumPhotoAction.bind(null, photo.photo_id)}
            className="space-y-5"
          >
            <AdminFormProgress />

            <Field label="Title">
              <input
                name="title"
                defaultValue={photo.title ?? ""}
                className={inputClassName}
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                defaultValue={photo.description ?? ""}
                className={textareaClassName}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Order / priority">
                <input
                  name="sequence"
                  type="number"
                  min={1}
                  step={1}
                  defaultValue={photo.sequence > 0 ? photo.sequence : 1}
                  className={inputClassName}
                />
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  defaultValue={photo.status}
                  className={selectClassName}
                >
                  <option value="drafted">Drafted</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            </div>

            <label className="flex items-center gap-3 text-sm text-neutral-300">
              <input
                type="checkbox"
                name="is_album_cover"
                defaultChecked={photo.is_album_cover}
                className="h-4 w-4"
              />
              Set as album cover
            </label>

            <Field label="Tags">
              <PhotoTagsInput
                name="tags"
                initialTags={photo.tags ?? []}
                suggestions={tagSuggestions}
              />
            </Field>

            <Field label="Date taken">
              <input
                name="captured_at"
                type="datetime-local"
                defaultValue={toDateTimeInputValue(photo.captured_at)}
                className={inputClassName}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Longitude">
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  defaultValue={photo.longitude ?? ""}
                  className={inputClassName}
                />
              </Field>

              <Field label="Latitude">
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  defaultValue={photo.latitude ?? ""}
                  className={inputClassName}
                />
              </Field>
            </div>

            {mapUrl ? (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-md border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-600 hover:text-neutral-100"
              >
                Open Map
              </a>
            ) : null}

            <Field label="Location name">
              <input
                name="location_name"
                defaultValue={photo.location_name ?? ""}
                className={inputClassName}
              />
            </Field>

            <Field label="Location note">
              <textarea
                name="location_note"
                defaultValue={photo.location_note ?? ""}
                className={textareaClassName}
              />
            </Field>

            <div className="flex flex-col gap-3 sm:flex-row">
              <AdminSubmitButton
                variant="secondary"
                pendingLabel="Saving..."
              >
                Save Photo
              </AdminSubmitButton>
              {photo.status !== "published" ? (
                <AdminSubmitButton
                  name="publish"
                  value="1"
                  pendingLabel="Publishing..."
                >
                  Publish
                </AdminSubmitButton>
              ) : null}
            </div>
          </AdminActionForm>
        </div>

        <section className="border-t border-neutral-900 pt-8">
          <AdminActionForm
            action={archiveAlbumPhotoAction.bind(null, photo.photo_id)}
          >
            <AdminFormProgress />
            <AdminSubmitButton
              variant="danger"
              pendingLabel="Archiving..."
              confirmMessage="Archive this photo?"
            >
              Archive Photo
            </AdminSubmitButton>
          </AdminActionForm>
        </section>
      </div>
    </AdminShell>
  );
}
