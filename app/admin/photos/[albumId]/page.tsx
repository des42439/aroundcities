import Image from "next/image";
import Link from "next/link";
import AdminActionForm from "@/components/AdminActionForm";
import AdminShell from "@/components/AdminShell";
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
  archivePhotoAlbumAction,
  updatePhotoAlbumAction,
} from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getPhotoAlbumById } from "@/lib/photo-albums";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    albumId: string;
  }>;
};

export default async function EditPhotoAlbumPage({ params }: Props) {
  await requireAdmin();
  const { albumId } = await params;
  const album = await getPhotoAlbumById(albumId);

  if (!album) {
    return (
      <AdminShell title="Album Not Found">
        <p className="text-neutral-500">This album does not exist.</p>
        <Link
          href="/admin/photos"
          className="mt-6 inline-flex text-sm text-neutral-300 hover:text-white"
        >
          Back to Photos
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Edit Photo Album">
      <div className="space-y-8">
        <Link href="/admin/photos" className={secondaryButtonClassName}>
          Back to Photos
        </Link>

        <AdminActionForm
          action={updatePhotoAlbumAction.bind(null, album.album_id)}
          className="space-y-5"
        >
          <AdminFormProgress />
          <input type="hidden" name="status" value={album.status} />

          <Field label="Title">
            <input
              name="title"
              required
              defaultValue={album.title}
              className={inputClassName}
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              defaultValue={album.description ?? ""}
              className={textareaClassName}
            />
          </Field>

          <Field label="Status">
            <select
              name="status"
              defaultValue={album.status}
              className={selectClassName}
            >
              <option value="drafted">Drafted</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>

          <div className="flex flex-col gap-3 sm:flex-row">
            <AdminSubmitButton
              variant="secondary"
              pendingLabel="Saving..."
            >
              Save
            </AdminSubmitButton>
            <AdminSubmitButton
              name="publish"
              value="1"
              pendingLabel="Publishing..."
            >
              Publish
            </AdminSubmitButton>
            <AdminSubmitButton
              name="status"
              value="archived"
              variant="secondary"
              pendingLabel="Archiving..."
              confirmMessage="Archive this album?"
            >
              Archive
            </AdminSubmitButton>
          </div>
        </AdminActionForm>

        <section className="space-y-4 border-t border-neutral-900 pt-8">
          <h2 className="text-xl font-semibold">Photos</h2>
          {album.photos.length === 0 ? (
            <p className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
              No photos in this album yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {album.photos.map((photo, index) => (
                <article
                  key={photo.photo_id}
                  className="overflow-hidden rounded-md border border-neutral-900 bg-neutral-950"
                >
                  <Link
                    href={`/admin/photos/photo/${photo.photo_id}`}
                    className="group block"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={photo.photo_url}
                        alt={photo.title ?? `Album photo ${index + 1}`}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition group-hover:scale-105"
                        unoptimized
                      />
                      {photo.is_album_cover ? (
                        <span className="absolute left-2 top-2 rounded-full border border-emerald-900 bg-emerald-950/80 px-2 py-1 text-xs text-emerald-100">
                          Cover
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="truncate text-sm text-neutral-200">
                        {photo.title || `Photo ${index + 1}`}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Order {photo.sequence > 0 ? photo.sequence : index + 1}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {photo.status}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-neutral-900 pt-8">
          <AdminActionForm
            action={archivePhotoAlbumAction.bind(null, album.album_id)}
          >
            <AdminFormProgress />
            <AdminSubmitButton
              variant="danger"
              pendingLabel="Archiving..."
              confirmMessage="Archive this album?"
            >
              Archive Album
            </AdminSubmitButton>
          </AdminActionForm>
        </section>
      </div>
    </AdminShell>
  );
}
