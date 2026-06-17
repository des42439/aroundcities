import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { primaryButtonClassName } from "@/components/AdminForm";
import PhotoAlbumList from "@/components/PhotoAlbumList";
import { requireAdmin } from "@/lib/admin-auth";
import { getPhotoAlbums } from "@/lib/photo-albums";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  await requireAdmin();
  const albums = await getPhotoAlbums();

  return (
    <AdminShell title="Photos">
      <div className="mb-6">
        <Link href="/admin/photos/new" className={primaryButtonClassName}>
          Create New Album
        </Link>
      </div>

      <PhotoAlbumList albums={albums} />
    </AdminShell>
  );
}
