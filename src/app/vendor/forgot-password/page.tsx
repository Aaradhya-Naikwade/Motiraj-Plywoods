export default function VendorForgotPasswordPage() {
  return (
    <section className="min-h-screen bg-[var(--secondary)] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--darkgray)]">Vendor Portal</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--black)]">Forgot Password</h1>
        <p className="mt-3 text-sm text-[var(--darkgray)]">
          Password reset flow is not configured yet. Please contact support to reset your vendor
          password.
        </p>
        <a
          href="/vendor/auth?tab=login"
          className="mt-6 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to Login
        </a>
      </div>
    </section>
  );
}
