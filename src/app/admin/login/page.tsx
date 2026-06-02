import { redirect } from "next/navigation";
import { signIn } from "@/app/admin/actions";
import { getCurrentAdmin } from "@/lib/auth";

const errorMessages: Record<string, string> = {
  missing: "Enter your email and password.",
  credentials: "Those credentials did not match a Supabase user.",
  unauthorized: "Your account is not on the admin allowlist.",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { user, isAdmin } = await getCurrentAdmin();
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

  if (user && isAdmin) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-5 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-orange-700">BMCNY Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use a Supabase Auth account that is listed in the admin allowlist.
        </p>

        {error && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={signIn} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-zinc-700">
            Email
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block text-sm font-medium text-zinc-700">
            Password
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            className="flex min-h-10 w-full items-center justify-center rounded-md bg-orange-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-800"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
