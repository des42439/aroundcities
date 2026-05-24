import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl sm:text-6xl font-bold">
            Contact
          </h1>

          <Link
            href="/"
            className="border border-zinc-700 bg-zinc-900 px-5 py-3 rounded-2xl"
          >
            ← Home
          </Link>
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Contact AroundCities
            </h2>

            <p className="text-zinc-300 leading-relaxed mb-6">
              For feedback, corrections, organizer
              inquiries, content removal requests,
              or general questions, please contact
              us through email.
            </p>

            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
              <div className="text-zinc-400 text-sm mb-2">
                Email
              </div>

              <div className="text-lg font-semibold break-all">
                hello@aroundcities.my
              </div>
            </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Suggested Topics
            </h2>

            <ul className="space-y-3 text-zinc-300">
              <li>
                • Incorrect event information
              </li>

              <li>
                • Content removal requests
              </li>

              <li>
                • Copyright concerns
              </li>

              <li>
                • Organizer collaboration
              </li>

              <li>
                • General feedback
              </li>

              <li>
                • Local discovery suggestions
              </li>
            </ul>
          </section>

          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Response Time
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              We will do our best to review and
              respond to messages as soon as
              possible.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}