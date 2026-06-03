import { loginAdmin } from "./actions";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-sm">
        <div className="mb-8">
          <p className="text-sm text-neutral-500">
            AroundCities Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            Sign in
          </h1>
        </div>

        <form
          action={loginAdmin}
          className="space-y-5 rounded-lg border border-neutral-900 p-5"
        >
          <label className="block">
            <span className="text-sm text-neutral-400">
              Admin password
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
              Invalid password.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-950 hover:bg-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
