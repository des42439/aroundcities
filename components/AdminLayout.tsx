import Link from "next/link";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function AdminLayout({
  title,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              className="text-2xl font-bold"
            >
              AroundCities
            </Link>

            <nav className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
              <Link
                href="/admin"
                className="rounded-lg border border-neutral-800 px-3 py-2 text-center hover:bg-neutral-900"
              >
                Admin
              </Link>

              <Link
                href="/admin/import-events"
                className="rounded-lg border border-neutral-800 px-3 py-2 text-center hover:bg-neutral-900"
              >
                Import
              </Link>

              <Link
                href="/admin/content"
                className="rounded-lg border border-neutral-800 px-3 py-2 text-center hover:bg-neutral-900"
              >
                Content
              </Link>

              <Link
                href="/admin/photos"
                className="rounded-lg border border-neutral-800 px-3 py-2 text-center hover:bg-neutral-900"
              >
                Photos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <h1 className="mb-8 text-3xl font-bold">
          {title}
        </h1>

        {children}
      </main>
    </div>
  );
}