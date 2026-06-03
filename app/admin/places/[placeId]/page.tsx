import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import PlaceForm from "@/components/PlaceForm";
import { updatePlaceAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getPlaceById } from "@/lib/places";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    placeId: string;
  }>;
};

export default async function EditPlacePage({
  params,
}: Props) {
  await requireAdmin();
  const { placeId } = await params;
  const place = await getPlaceById(placeId);

  if (!place) {
    return (
      <AdminShell title="Place Not Found">
        <p className="text-neutral-500">
          This place does not exist.
        </p>
        <Link
          href="/admin/places"
          className="mt-6 inline-flex text-sm text-neutral-300 hover:text-white"
        >
          Back to places
        </Link>
      </AdminShell>
    );
  }

  const action = updatePlaceAction.bind(
    null,
    place.place_id
  );

  return (
    <AdminShell title="Edit Place">
      <PlaceForm
        place={place}
        action={action}
        submitLabel="Save place"
      />
    </AdminShell>
  );
}
