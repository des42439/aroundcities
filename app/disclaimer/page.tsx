import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl sm:text-6xl font-bold">
            Disclaimer
          </h1>

          <Link
            href="/"
            className="border border-zinc-700 bg-zinc-900 px-5 py-3 rounded-2xl"
          >
            ← Home
          </Link>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Informational Purpose
            </h2>

            <p>
              AroundCities is a community-focused
              local discovery platform that shares
              information about events, activities,
              local happenings, food discoveries,
              and community-related content.
            </p>

            <p className="mt-4">
              Information displayed on this platform
              is collected from publicly available
              sources and community submissions.
            </p>
          </section>

          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Accuracy of Information
            </h2>

            <p>
              Event schedules, operating hours,
              venues, pricing, and other details
              may change without prior notice.
            </p>

            <p className="mt-4">
              Users are encouraged to verify
              important information directly with
              organizers, official pages, or venue
              operators before attending.
            </p>
          </section>

          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Images & Media
            </h2>

            <p>
              Images, posters, screenshots, logos,
              and promotional materials displayed on
              AroundCities remain the property of
              their respective owners.
            </p>

            <p className="mt-4">
              Media is used for informational and
              discovery purposes only.
            </p>

            <p className="mt-4">
              If you are the owner of any content
              and would like it updated, credited,
              or removed, please contact us through
              the contact page.
            </p>
          </section>

          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              External Sources
            </h2>

            <p>
              AroundCities may reference or link to
              external websites, social media pages,
              videos, or third-party content.
            </p>

            <p className="mt-4">
              We are not responsible for the
              accuracy, availability, or practices
              of third-party platforms.
            </p>
          </section>

          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Contact & Removal Requests
            </h2>

            <p>
              For corrections, feedback, copyright
              concerns, or removal requests, please
              contact us through the contact page.
            </p>

            <div className="mt-6">
              <Link
                href="/contact"
                className="bg-white text-black px-5 py-3 rounded-2xl inline-block font-semibold"
              >
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}