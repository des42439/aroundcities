type Event = {
  id: string;
  title: string;
  venue: string;
  start_time: string;
  image_url?: string;
};

export default function EventCard({
  event,
}: {
  event: Event;
}) {
  return (
    <div className="border rounded-2xl overflow-hidden shadow-sm bg-white">

      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-56 object-cover"
        />
      )}

      <div className="p-5">

        <h2 className="text-2xl font-bold mb-2">
          {event.title}
        </h2>

        <p className="text-gray-600 mb-2">
          {event.venue}
        </p>

        <p className="text-sm text-gray-500">
          {new Date(event.start_time).toLocaleString()}
        </p>

      </div>
    </div>
  );
}