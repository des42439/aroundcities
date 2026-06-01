import Link from "next/link";
import { Event } from "@/types/database";

type Props = {
  event: Event;
  href?: string;
};

export default function EventCard({
  event,
  href,
}: Props) {
  const content = (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-neutral-700">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            event.status === "active"
              ? "bg-green-900 text-green-300"
              : "bg-neutral-800 text-neutral-400"
          }`}
        >
          {event.status}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-semibold">
        {event.title}
      </h3>

      {event.location && (
        <p className="mb-2 text-sm text-neutral-400">
          📍 {event.location}
        </p>
      )}

      {event.description && (
        <p className="line-clamp-3 text-sm text-neutral-300">
          {event.description}
        </p>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}