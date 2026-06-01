type Props = {
  greeting: string;
  holidayMessage?: string | null;
  positiveMessage?: string | null;

  heroPhotoUrl?: string | null;
  heroPhotoTitle?: string | null;
  heroPhotoDescription?: string | null;
};

export default function GreetingBanner({
  greeting,
  holidayMessage,
  positiveMessage,
  heroPhotoUrl,
  heroPhotoTitle,
  heroPhotoDescription,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <div className="p-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">
            {greeting}
          </h1>

          {holidayMessage && (
            <p className="text-neutral-300">
              {holidayMessage}
            </p>
          )}

          {positiveMessage && (
            <p className="text-neutral-400">
              {positiveMessage}
            </p>
          )}
        </div>
      </div>

      {heroPhotoUrl && (
        <div>
          <div className="bg-black">
            <img
              src={heroPhotoUrl}
              alt={heroPhotoTitle ?? "Featured Photo"}
              className="w-full object-contain"
            />
          </div>

          {(heroPhotoTitle || heroPhotoDescription) && (
            <div className="border-t border-neutral-800 p-4">
              {heroPhotoTitle && (
                <h2 className="text-lg font-semibold">
                  {heroPhotoTitle}
                </h2>
              )}

              {heroPhotoDescription && (
                <p className="mt-2 text-sm text-neutral-400">
                  {heroPhotoDescription}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}