import Link from "next/link";
import CityPageLayout from "@/components/CityPageLayout";
import EventCard from "@/components/EventCard";
import GreetingBanner from "@/components/GreetingBanner";
import { getActiveEvents } from "@/lib/events";
import { getHomepageData } from "@/lib/homepage";

export const dynamic = "force-dynamic";

const MAX_PHOTOS = 20;

export default async function KuchingPage() {
  const [homepage, events] = await Promise.all([
    getHomepageData(),
    getActiveEvents(),
  ]);

  const holidayMessage =
    homepage.holiday?.greeting_message_1 ??
    homepage.holiday?.greeting_message_2 ??
    homepage.holiday?.greeting_message_3 ??
    null;

  const shuffledPhotos = homepage.latestPhotos?.length
    ? [...homepage.latestPhotos]
        .sort(() => Math.random() - 0.5)
        .slice(0, MAX_PHOTOS)
    : [];

  return (
    <CityPageLayout
      cityCode="kch"
      cityName="Kuching"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <GreetingBanner
            greeting={homepage.greeting}
            holidayMessage={holidayMessage}
            positiveMessage={
              homepage.positiveMessage?.description
            }
            heroPhotoUrl={
              homepage.photo?.photo_url
            }
            heroPhotoTitle={
              homepage.photo?.title
            }
            heroPhotoDescription={
              homepage.photo?.description
            }
          />

          <section>
            <h2 className="mb-4 text-2xl font-bold">
              Latest Photos
            </h2>

            {shuffledPhotos.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shuffledPhotos.map((photo) => (
                  <Link
                    key={photo.photo_id}
                    href={`/photo/${photo.photo_id}`}
                    className="block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-600 hover:shadow-lg"
                  >
                    <div className="bg-black">
					  <img
						src={photo.photo_url}
						alt={photo.title ?? "Kuching"}
						className="w-full object-contain"
						loading="lazy"
					  />
					</div>

                    <div className="p-4">
                      <h3 className="font-semibold">
                        {photo.title ?? "Untitled"}
                      </h3>

                      {photo.description && (
                        <p className="mt-2 text-sm text-neutral-300">
                          {photo.description}
                        </p>
                      )}

                      {photo.location && (
                        <div className="mt-3 text-sm text-neutral-400">
                          📍 {photo.location}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                No photos found.
              </div>
            )}
          </section>

          {homepage.featuredEvent && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">
                Featured Event
              </h2>

              <EventCard
                event={homepage.featuredEvent}
              />
            </section>
          )}

          <section>
            <h2 className="mb-4 text-2xl font-bold">
              Active Events
            </h2>

            {events.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                No active events found.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {events.map((event) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </CityPageLayout>
  );
}