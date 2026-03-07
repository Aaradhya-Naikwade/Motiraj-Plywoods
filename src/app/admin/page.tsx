import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminLoginAction } from "./actions";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_AUTH_COOKIE)) {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const hasError = params?.error === "invalid";

  return (
    <section className="flex min-h-screen items-center justify-center bg-[var(--secondary)] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--darkgray)]">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--black)]">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--darkgray)]">
          Use your admin email and password to continue.
        </p>

        {hasError ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid email or password.
          </p>
        ) : null}

        <form action={adminLoginAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--black)]">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--black)]">Password</span>
            <input
              name="password"
              type="password"
              required
              placeholder="Enter password"
              className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Login
          </button>
        </form>
      </div>
    </section>
  );
}
