import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getPlaces } from "@/lib/places";

export const dynamic = "force-dynamic";

export default async function AdminPlacesPage() {
  await requireAdmin();
  const places = await getPlaces();

  return (
    <AdminShell title="Places">
      <div className="mb-6">
        <Link
          href="/admin/places/new"
          className={primaryButtonClassName}
        >
          New place
        </Link>
      </div>

      {places.length === 0 ? (
        <p className="text-neutral-500">
          No places yet.
        </p>
      ) : (
        <div className="space-y-3">
          {places.map((place) => (
            <div
              key={place.place_id}
              className="rounded-lg border border-neutral-900 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {place.name}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {place.slug}
                  </p>
                </div>

                <Link
                  href={`/admin/places/${place.place_id}`}
                  className={secondaryButtonClassName}
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
