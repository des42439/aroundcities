import AdminShell from "@/components/AdminShell";
import PlaceForm from "@/components/PlaceForm";
import { createPlaceAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewPlacePage() {
  await requireAdmin();

  return (
    <AdminShell title="New Place">
      <PlaceForm
        action={createPlaceAction}
        submitLabel="Save place"
      />
    </AdminShell>
  );
}
