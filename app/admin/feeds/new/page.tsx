import AdminShell from "@/components/AdminShell";
import FeedForm from "@/components/FeedForm";
import { createFeedAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getPlaces } from "@/lib/places";

export const dynamic = "force-dynamic";

export default async function NewFeedPage() {
  await requireAdmin();
  const places = await getPlaces();

  return (
    <AdminShell title="New Feed">
      <FeedForm
        places={places}
        action={createFeedAction}
        submitLabel="Save feed"
      />
    </AdminShell>
  );
}
