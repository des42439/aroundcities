import CityPageLayout from "@/components/CityPageLayout";
import EventCard from "@/components/EventCard";
import GreetingBanner from "@/components/GreetingBanner";
import { getActiveEvents } from "@/lib/events";
import { getHomepageData } from "@/lib/homepage";

export const dynamic = "force-dynamic";

export default async function KuchingPage() {
  const [
    homepage,
    events,
  ] = await Promise.all([
    getHomepageData(),
    getActiveEvents(),
  ]);

  const holidayMessage =
    homepage.holiday?.greeting_message_1 ??
    homepage.holiday?.greeting_message_2 ??
    homepage.holiday?.greeting_message_3 ??
    null;

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
          />

          <section>
            <h2 className="mb-4 text-2xl font-bold">
              Latest Photos
            </h2>

            {homepage.latestPhotos?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {homepage.latestPhotos.map(
                  (photo) => (
                    <div
                      key={photo.photo_id}
                      className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
                    >
                      <div className="aspect-[4/3] bg-neutral-800">
                        <img
                          src={photo.photo_url}
                          alt={
                            photo.title ??
                            "Kuching"
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold">
                          {photo.title ??
                            "Untitled"}
                        </h3>

                        {(photo.location ||
                          photo.description) && (
                          <p className="mt-2 text-sm text-neutral-400">
                            {photo.location ??
                              photo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
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