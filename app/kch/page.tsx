import CityPageLayout from "@/components/CityPageLayout";
import EventCard from "@/components/EventCard";
import GreetingBanner from "@/components/GreetingBanner";
import { getActiveEvents } from "@/lib/events";
import { getHomepageData } from "@/lib/homepage";

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
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-8">
          <GreetingBanner
            greeting={homepage.greeting}
            holidayMessage={holidayMessage}
            positiveMessage={
              homepage.positiveMessage?.description
            }
          />

          {homepage.photo && (
            <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
              <div className="aspect-[16/9] bg-neutral-800">
                <img
                  src={homepage.photo.photo_url}
                  alt={
                    homepage.photo.title ??
                    "Kuching"
                  }
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-5">
                <h2 className="text-xl font-semibold">
                  {homepage.photo.title ??
                    "Kuching Today"}
                </h2>

                {homepage.photo.description && (
                  <p className="mt-2 text-neutral-400">
                    {homepage.photo.description}
                  </p>
                )}
              </div>
            </section>
          )}

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