type Props = {
  cityCode: string;
  cityName: string;
  children: React.ReactNode;
};

export default function CityPageLayout({
  cityCode,
  cityName,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-sm text-neutral-500">
              AroundCities
            </div>

            <div className="text-xl font-bold">
              {cityName}
            </div>
          </div>

          <div className="rounded-full border border-neutral-800 px-3 py-1 text-sm text-neutral-400">
            {cityCode.toUpperCase()}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-12 border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-neutral-500">
          AroundCities © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}