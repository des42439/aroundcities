import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            AroundCities Admin
          </h1>

          <p className="text-zinc-400 mt-3">
            Event operations and moderation dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Link
            href="/admin/draft-events"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
          >
            <div className="text-4xl mb-4">📝</div>

            <h2 className="text-2xl font-semibold">
              Draft Events
            </h2>

            <p className="text-zinc-400 mt-3">
              Review AI-detected event candidates
            </p>
          </Link>

          <Link
            href="/admin/draft-events/import"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
          >
            <div className="text-4xl mb-4">📥</div>

            <h2 className="text-2xl font-semibold">
              Import JSON
            </h2>

            <p className="text-zinc-400 mt-3">
              Batch import AI-generated draft events
            </p>
          </Link>

          <Link
            href="/admin/events"
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition"
          >
            <div className="text-4xl mb-4">🎉</div>

            <h2 className="text-2xl font-semibold">
              Public Events
            </h2>

            <p className="text-zinc-400 mt-3">
              Manage published public events
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}