import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import NewPhotoAlbumForm from "@/components/NewPhotoAlbumForm";
import { secondaryButtonClassName } from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewPhotoAlbumPage() {
  await requireAdmin();

  return (
    <AdminShell title="New Photo Album">
      <div className="space-y-6">
        <Link href="/admin/photos" className={secondaryButtonClassName}>
          Back to Photos
        </Link>
        <NewPhotoAlbumForm />
      </div>
    </AdminShell>
  );
}
