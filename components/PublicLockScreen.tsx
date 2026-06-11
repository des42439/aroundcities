import { unlockPublicPage } from "@/app/kch/actions";

type Props = {
  hasError: boolean;
};

export default function PublicLockScreen({
  hasError,
}: Props) {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16 text-neutral-100">
      <div className="mx-auto max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            AroundCities
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            AroundCities is currently being prepared with more
            local content.
          </p>
        </div>

        <form
          action={unlockPublicPage}
          className="space-y-5 rounded-lg border border-neutral-900 p-5"
        >
          <label className="block">
            <span className="text-sm text-neutral-400">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
            />
          </label>

          {hasError && (
            <p className="text-sm text-red-400">
              Incorrect password.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-950 hover:bg-white"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
