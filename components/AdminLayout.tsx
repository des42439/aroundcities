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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold"
          >
            AroundCities
          </Link>

          <nav className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-neutral-800 px-3 py-2 hover:bg-neutral-900"
            >
              Admin
            </Link>

            <Link
              href="/admin/import-events"
              className="rounded-lg border border-neutral-800 px-3 py-2 hover:bg-neutral-900"
            >
              Import Events
            </Link>

            <Link
              href="/admin/content"
              className="rounded-lg border border-neutral-800 px-3 py-2 hover:bg-neutral-900"
            >
              Manage Content
            </Link>
			
			<Link
			  href="/admin/photos"
			  className="rounded-lg border border-neutral-800 px-3 py-2 hover:bg-neutral-900"
			>
			  Photos
			</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold">
          {title}
        </h1>

        {children}
      </main>
    </div>
  );
}