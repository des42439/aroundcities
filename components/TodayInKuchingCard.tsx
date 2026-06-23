import { TrackedFeedLink } from "@/components/TrackedLinks";
import type {
  TodayInKuchingEvent,
  TodayInKuchingSummary,
} from "@/types/database";

type Props = {
  summary: TodayInKuchingSummary;
};

export default function TodayInKuchingCard({ summary }: Props) {
  const groups = [
    { key: "today", title: "Today", events: summary.today },
    {
      key: "tomorrow",
      title: "Tomorrow",
      events: summary.tomorrow,
    },
    {
      key: "comingSoon",
      title: "Coming Soon",
      events: summary.comingSoon,
    },
  ] as const;

  return (
    <article className="border-b-2 border-neutral-800 pb-6 pt-4 sm:pb-7 sm:pt-5">
      <h2 className="text-lg font-semibold leading-snug sm:text-xl">
        Today in Kuching
      </h2>
      <p className="mt-1.5 text-xs italic leading-5 text-neutral-500 sm:text-sm">
        Event information is collected from various sources. Please refer to
        the organizer&apos;s page for the latest updates.
      </p>

      <div className="mt-4 space-y-4">
        {groups.map((group) =>
          group.events.length ? (
            <section key={group.key}>
              <h3 className="text-sm font-semibold text-neutral-200">
                {group.title}
              </h3>
              <ul className="mt-1.5 space-y-1 text-sm leading-5 text-neutral-300">
                {group.events.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </ul>
            </section>
          ) : null
        )}
      </div>
    </article>
  );
}

function EventRow({ event }: { event: TodayInKuchingEvent }) {
  const prefix = formatEventPrefix(event);

  return (
    <li className="flex items-start gap-2">
      <span aria-hidden="true" className="text-neutral-600">
        &bull;
      </span>
      <span className="min-w-0">
        {prefix ? <span>{prefix}: </span> : null}
        <TrackedFeedLink
          href={`/feed/${event.slug}`}
          feedId={event.feed_id}
          className="text-neutral-200 hover:text-white"
        >
          {event.title}
        </TrackedFeedLink>
        {event.location ? ` at ${event.location}` : ""}
        {event.source_url ? (
          <>
            {" "}
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap text-neutral-500 hover:text-neutral-300"
              aria-label={`Open source for ${event.title}`}
            >
              ({sourceLabel(event.source_title)})
            </a>
          </>
        ) : null}
      </span>
    </li>
  );
}

function formatEventPrefix(event: TodayInKuchingEvent) {
  const time = formatTime(event.start_time);

  if (event.group !== "comingSoon") {
    return time;
  }

  const weekday = new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuching",
    weekday: "short",
  }).format(new Date(`${event.schedule_date}T12:00:00+08:00`));

  return time ? `${weekday} ${time}` : weekday;
}

function formatTime(value: string | null) {
  if (!value) {
    return "";
  }

  const [hours = "0", minutes = "0"] = value.split(":");
  const hour = Number(hours);
  const minute = Number(minutes);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return minute
    ? `${displayHour}:${String(minute).padStart(2, "0")}${period}`
    : `${displayHour}${period}`;
}

function sourceLabel(sourceTitle: string | null) {
  return sourceTitle?.toLowerCase().includes("organizer")
    ? "Organizer"
    : "Source";
}
