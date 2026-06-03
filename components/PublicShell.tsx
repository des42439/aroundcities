import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function PublicShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
          <Link href="/kch" className="block">
            <div className="text-sm text-neutral-500">
              AroundCities
            </div>
            <div className="text-2xl font-semibold">
              Kuching
            </div>
          </Link>

          <div className="rounded-full border border-neutral-800 px-3 py-1 text-xs uppercase tracking-wide text-neutral-500">
            Local Feed
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-14 border-t border-neutral-900">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-neutral-600">
          AroundCities © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
