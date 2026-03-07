import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminLogoutAction } from "../actions";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_AUTH_COOKIE)) {
    redirect("/admin");
  }

  return (
    <section className="min-h-screen bg-[var(--secondary)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-lg md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--darkgray)]">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--black)]">Dashboard</h1>
            <p className="mt-2 text-sm text-[var(--darkgray)]">
              You are successfully logged in as admin.
            </p>
          </div>

          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--lightgray)] px-4 py-2 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
