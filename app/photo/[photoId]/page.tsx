import Link from "next/link";
import CityPageLayout from "@/components/CityPageLayout";
import ShareButton from "@/components/ShareButton";

import {
  getPhoto,
  getPhotoNavigation,
} from "@/lib/photos";

type Props = {
  params: Promise<{
    photoId: string;
  }>;
};

export default async function PhotoPage({
  params,
}: Props) {
  const { photoId } = await params;

  const photo = await getPhoto(photoId);

  if (
    !photo ||
    photo.status !== "active"
  ) {
    return (
      <CityPageLayout
        cityCode="kch"
        cityName="Kuching"
      >
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h1 className="text-2xl font-bold">
              Photo Not Found
            </h1>

            <p className="mt-3 text-neutral-400">
              The requested photo does not exist.
            </p>

            <Link
              href="/kch"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2"
            >
              Back to Kuching
            </Link>
          </div>
        </div>
      </CityPageLayout>
    );
  }

  const {
    previousPhoto,
    nextPhoto,
  } = await getPhotoNavigation(
    photoId
  );

  return (
    <CityPageLayout
      cityCode="kch"
      cityName="Kuching"
    >
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <img
            src={photo.photo_url}
            alt={
              photo.title ?? "Photo"
            }
            className="w-full"
          />

          <div className="space-y-4 p-6">
            <h1 className="text-3xl font-bold">
              {photo.title ??
                "Untitled"}
            </h1>

            {photo.description && (
              <p className="text-neutral-300">
                {
                  photo.description
                }
              </p>
            )}

            {photo.location && (
              <div className="text-neutral-400">
                📍 {photo.location}
              </div>
            )}

            {photo.captured_date && (
              <div className="text-neutral-400">
                📅{" "}
                {
                  photo.captured_date
                }
              </div>
            )}

            {photo.captured_by && (
              <div className="text-neutral-400">
                👤{" "}
                {
                  photo.captured_by
                }
              </div>
            )}

            {photo.latitude &&
              photo.longitude && (
                <div className="text-sm text-neutral-500">
                  GPS:{" "}
                  {photo.latitude},{" "}
                  {
                    photo.longitude
                  }
                </div>
              )}

            <div className="border-t border-neutral-800 pt-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  {previousPhoto && (
                    <Link
                      href={`/photo/${previousPhoto.photo_id}`}
                      className="inline-block rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-800"
                    >
                      ← Previous
                      Photo
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/kch"
                    className="inline-block rounded-lg bg-blue-600 px-4 py-2"
                  >
                    Back to
                    Kuching
                  </Link>

                  <ShareButton
                    title={
                      photo.title ??
                      "AroundCities Photo"
                    }
                  />
                </div>

                <div className="text-right">
                  {nextPhoto && (
                    <Link
                      href={`/photo/${nextPhoto.photo_id}`}
                      className="inline-block rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-800"
                    >
                      Next Photo →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CityPageLayout>
  );
}