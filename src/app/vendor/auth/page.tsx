import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VENDOR_AUTH_COOKIE, normalizeMobile } from "@/lib/vendor-auth";
import { vendorLoginAction, vendorRegisterAction } from "../actions";
import PasswordField from "@/components/PasswordField";

type VendorAuthPageProps = {
  searchParams: Promise<{ tab?: string; error?: string; mobile?: string; email?: string }>;
};

function getVendorErrorMessage(error?: string): string | null {
  switch (error) {
    case "invalid_mobile_login":
      return "Please enter a valid mobile number.";
    case "invalid_mobile_register":
      return "Enter a valid mobile number (10 to 15 digits).";
    case "invalid_credentials":
      return "Invalid mobile number or password.";
    case "user_not_found":
      return "User does not exist. Please register first.";
    case "account_blocked":
      return "Your vendor account is blocked. Please contact support.";
    case "account_inactive":
      return "Your vendor account is inactive. Please contact support.";
    case "account_pending":
      return "Your vendor account is pending approval.";
    case "missing_fields":
      return "Please fill in all required fields and accept terms.";
    case "invalid_email":
      return "Please enter a valid email address.";
    case "weak_password":
      return "Password must be at least 8 characters long.";
    case "password_mismatch":
      return "Password and confirm password do not match.";
    case "mobile_exists":
      return "Mobile number is already registered. Please login.";
    case "email_exists":
      return "Email address is already registered. Please login.";
    default:
      return null;
  }
}

export default async function VendorAuthPage({ searchParams }: VendorAuthPageProps) {
  const cookieStore = await cookies();
  if (cookieStore.get(VENDOR_AUTH_COOKIE)) {
    redirect("/vendor/dashboard");
  }

  const params = await searchParams;
  const activeTab = params.tab === "register" ? "register" : "login";
  const error = getVendorErrorMessage(params.error);
  const mobileValue = params.mobile ? normalizeMobile(params.mobile) : "";
  const emailValue = params.email ?? "";

  return (
    <section className="min-h-screen bg-[var(--secondary)] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--darkgray)]">Vendor Portal</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--black)]">Vendor Authentication</h1>
        <p className="mt-2 text-sm text-[var(--darkgray)]">
          Access your vendor dashboard by logging in, or create your vendor account in seconds.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-6 flex rounded-xl bg-[var(--secondary)] p-1">
          <a
            href="/vendor/auth?tab=login"
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition ${
              activeTab === "login"
                ? "bg-white text-[var(--black)] shadow-sm"
                : "text-[var(--darkgray)] hover:text-[var(--black)]"
            }`}
          >
            Login
          </a>
          <a
            href="/vendor/auth?tab=register"
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition ${
              activeTab === "register"
                ? "bg-white text-[var(--black)] shadow-sm"
                : "text-[var(--darkgray)] hover:text-[var(--black)]"
            }`}
          >
            Register
          </a>
        </div>

        {activeTab === "login" ? (
          <form action={vendorLoginAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Mobile Number</span>
              <input
                name="mobile"
                type="tel"
                inputMode="numeric"
                required
                defaultValue={mobileValue}
                placeholder="e.g. 9876543210"
                className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Password</span>
              <PasswordField
                name="password"
                required
                placeholder="Enter your password"
              />
            </label>

            <div className="flex justify-end">
              <a
                href="/vendor/forgot-password"
                className="text-xs font-medium text-[var(--primary)]"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Login
            </button>
          </form>
        ) : (
          <form action={vendorRegisterAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Full Name *</span>
              <input
                name="name"
                type="text"
                required
                placeholder="Your full name"
                className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">
                Company / Business Name *
              </span>
              <input
                name="companyName"
                type="text"
                required
                placeholder="Business name"
                className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Mobile Number *</span>
              <input
                name="mobile"
                type="tel"
                inputMode="numeric"
                required
                defaultValue={mobileValue}
                placeholder="e.g. 9876543210"
                className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Email Address *</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={emailValue}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Business Address</span>
              <textarea
                name="address"
                rows={2}
                placeholder="Full shop/office address"
                className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Password *</span>
              <PasswordField
                name="password"
                required
                placeholder="Minimum 8 characters"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--black)]">
                Confirm Password *
              </span>
              <PasswordField
                name="confirmPassword"
                required
                placeholder="Retype password"
              />
            </label>

            <label className="flex items-start gap-2 md:col-span-2">
              <input
                name="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--darkgray)]">
                I agree to the Terms & Conditions and privacy policy.
              </span>
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 md:col-span-2"
            >
              Create Vendor Account
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
