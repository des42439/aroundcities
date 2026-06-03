import Link from "next/link";
import { logoutAdmin } from "@/app/admin/login/actions";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function AdminShell({
  title,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <Link href="/admin" className="block">
            <div className="text-sm text-neutral-500">
              AroundCities
            </div>
            <div className="text-2xl font-semibold">
              Admin
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/admin/feeds"
              className="rounded-md border border-neutral-800 px-3 py-2 text-neutral-300 hover:border-neutral-600"
            >
              Feeds
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-md border border-neutral-800 px-3 py-2 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-semibold">
          {title}
        </h1>
        {children}
      </main>
    </div>
  );
}
