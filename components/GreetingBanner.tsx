type Props = {
  greeting: string;
  holidayMessage?: string | null;
  positiveMessage?: string | null;
};

export default function GreetingBanner({
  greeting,
  holidayMessage,
  positiveMessage,
}: Props) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
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
    </section>
  );
}