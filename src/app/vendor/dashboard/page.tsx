import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findVendorById, setVendorStatus } from "@/lib/vendor-repo";
import { findVendorProductsByVendorId } from "@/lib/vendor-product-repo";
import { getVendorProductCategoryLabel, VENDOR_PRODUCT_CATEGORIES } from "@/lib/vendor-product-categories";
import { isVendorRenewalExpired } from "@/lib/vendor-renewal";
import { VENDOR_AUTH_COOKIE, verifyVendorSessionToken } from "@/lib/vendor-auth";
import {
  vendorCreateCategorizedProductsAction,
  vendorDeleteProductAction,
  vendorLogoutAction,
  vendorUpdateProfileAction,
} from "../actions";
import DashboardAlerts from "./DashboardAlerts";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { Building2, CalendarDays, MapPin, Phone, User } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import ProductCategoryManager from "./ProductCategoryManager";

type VendorDashboardPageProps = {
  searchParams: Promise<{ status?: string; error?: string; tab?: string; mode?: string }>;
};

function fmtDate(date: Date | null) {
  return date
    ? date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";
}

function fmtDateOnly(date: Date | null) {
  return date
    ? date.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
      })
    : "-";
}

export default async function VendorDashboardPage({ searchParams }: VendorDashboardPageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(VENDOR_AUTH_COOKIE)?.value;

  if (!sessionCookie) {
    redirect("/vendor/auth");
  }

  const session = verifyVendorSessionToken(sessionCookie);
  if (!session) {
    redirect("/vendor/auth");
  }

  const vendor = await findVendorById(session.sub);
  if (!vendor) {
    redirect("/vendor/auth");
  }

  if (vendor.status === "locked") {
    redirect("/vendor/auth?tab=login&error=renewal_required");
  }

  if (vendor.status === "pending") {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f7f2eb_0%,_#efe6dc_42%,_#e6dacc_100%)] px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--darkgray)]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold text-[var(--black)] md:text-4xl">Approval Pending</h1>
                <p className="mt-2 text-sm text-[var(--darkgray)]">
                  Your account is registered successfully. Please wait for admin approval to start using dashboard features.
                </p>
              </div>

              <form action={vendorLogoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--lightgray)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]"
                >
                  Logout
                </button>
              </form>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your account is currently in <span className="font-semibold">Pending</span> status. You cannot edit profile or manage products until admin sets it to <span className="font-semibold">Active</span>.
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--lightgray)] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Company</p>
                <p className="mt-1 text-sm font-semibold text-[var(--black)]">{vendor.company_name}</p>
              </div>
              <div className="rounded-2xl border border-[var(--lightgray)] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Status</p>
                <p className="mt-1 text-sm font-semibold text-[var(--black)] capitalize">{vendor.status}</p>
              </div>
              <div className="rounded-2xl border border-[var(--lightgray)] bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Mobile</p>
                <p className="mt-1 text-sm font-semibold text-[var(--black)]">{vendor.mobile}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (vendor.status !== "active") {
    redirect("/vendor/auth?tab=login&error=account_inactive");
  }

  if (isVendorRenewalExpired(vendor)) {
    await setVendorStatus(vendor._id.toString(), "locked");
    redirect("/vendor/auth?tab=login&error=renewal_required");
  }

  const products = await findVendorProductsByVendorId(vendor._id.toString());
  const params = await searchParams;
  const activeTab = params.tab === "products" ? "products" : "profile";
  const isProfileEditMode = activeTab === "profile" && params.mode === "edit";
  const profileViewUrl = "/vendor/dashboard?tab=profile";
  const profileEditUrl = "/vendor/dashboard?tab=profile&mode=edit";
  const vendorDobValue = vendor.dob ? vendor.dob.toISOString().slice(0, 10) : "";
  const dobMaxDate = new Date();
  dobMaxDate.setFullYear(dobMaxDate.getFullYear() - 18);
  const maxDobValue = dobMaxDate.toISOString().slice(0, 10);
  const groupedProducts = VENDOR_PRODUCT_CATEGORIES.map((category) => ({
    ...category,
    items: products.filter((product) => product.category_key === category.key),
  })).filter((category) => category.items.length > 0);

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f7f2eb_0%,_#efe6dc_42%,_#e6dacc_100%)] px-4 py-8 md:px-8 md:py-10">
      <DashboardAlerts status={params.status} error={params.error} />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--darkgray)]">Vendor Portal</p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--black)] md:text-4xl">Vendor Dashboard</h1>
              <p className="mt-2 text-sm text-[var(--darkgray)]">
                Manage your profile and products from one place.
              </p>
            </div>

            <form action={vendorLogoutAction}>
              <button
                type="submit"
                className="rounded-full border border-[var(--lightgray)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--lightgray)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Company</p>
              <p className="mt-1 text-sm font-semibold text-[var(--black)]">{vendor.company_name}</p>
            </div>
            <div className="rounded-2xl border border-[var(--lightgray)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Products</p>
              <p className="mt-1 text-sm font-semibold text-[var(--black)]">{products.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--lightgray)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Status</p>
              <p className="mt-1 text-sm font-semibold capitalize text-[var(--black)]">{vendor.status}</p>
            </div>
            <div className="rounded-2xl border border-[var(--lightgray)] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Last Login</p>
              <p className="mt-1 text-sm font-semibold text-[var(--black)]">{fmtDate(vendor.last_login)}</p>
            </div>
          </div>

          <div className="mt-6 inline-flex rounded-xl bg-[var(--secondary)] p-1">
            <a
              href="/vendor/dashboard?tab=profile"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "profile"
                  ? "bg-white text-[var(--black)] shadow-sm"
                  : "text-[var(--darkgray)] hover:text-[var(--black)]"
              }`}
            >
              Profile
            </a>
            <a
              href="/vendor/dashboard?tab=products"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "products"
                  ? "bg-white text-[var(--black)] shadow-sm"
                  : "text-[var(--darkgray)] hover:text-[var(--black)]"
              }`}
            >
              Products
            </a>
          </div>
        </div>

        {activeTab === "profile" ? (
          <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[var(--black)]">Business Profile</h2>
                <p className="mt-1 text-sm text-[var(--darkgray)]">Keep your contact details updated for buyers.</p>
              </div>
            </div>

            <form action={vendorUpdateProfileAction} className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--black)]">
                  <User size={15} />
                  Name
                </span>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={vendor.name}
                  disabled={!isProfileEditMode}
                  className={`w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition ${
                    isProfileEditMode
                      ? "bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      : "bg-[var(--secondary)]/60 text-[var(--darkgray)]"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--black)]">
                  <Building2 size={15} />
                  Company Name
                </span>
                <input
                  name="companyName"
                  type="text"
                  required
                  defaultValue={vendor.company_name}
                  disabled={!isProfileEditMode}
                  className={`w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition ${
                    isProfileEditMode
                      ? "bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      : "bg-[var(--secondary)]/60 text-[var(--darkgray)]"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--black)]">
                  <Phone size={15} />
                  Mobile (Read-only)
                </span>
                <input
                  type="text"
                  value={vendor.mobile}
                  disabled
                  className="w-full rounded-xl border border-[var(--lightgray)] bg-[var(--secondary)]/60 px-3 py-2.5 text-sm text-[var(--darkgray)]"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--black)]">
                  <CalendarDays size={15} />
                  Date of Birth
                </span>
                <input
                  name="dob"
                  type="date"
                  required
                  defaultValue={vendorDobValue}
                  disabled={!isProfileEditMode}
                  max={maxDobValue}
                  className={`w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition ${
                    isProfileEditMode
                      ? "bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      : "bg-[var(--secondary)]/60 text-[var(--darkgray)]"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--black)]">
                  <MapPin size={15} />
                  Business Address
                </span>
                <textarea
                  name="address"
                  rows={3}
                  defaultValue={vendor.address ?? ""}
                  disabled={!isProfileEditMode}
                  placeholder="Full shop/office address"
                  className={`w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition ${
                    isProfileEditMode
                      ? "bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      : "bg-[var(--secondary)]/60 text-[var(--darkgray)]"
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--black)]">
                  <FaWhatsapp size={15} />
                  WhatsApp Number
                </span>
                <input
                  name="whatsappNumber"
                  type="tel"
                  inputMode="numeric"
                  defaultValue={vendor.whatsapp_number ?? ""}
                  disabled={!isProfileEditMode}
                  placeholder="e.g. 919876543210"
                  className={`w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition ${
                    isProfileEditMode
                      ? "bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      : "bg-[var(--secondary)]/60 text-[var(--darkgray)]"
                  }`}
                />
              </label>

              <div className="md:col-span-2">
                {isProfileEditMode ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 md:w-auto md:px-8"
                    >
                      Save Profile
                    </button>
                    <a
                      href={profileViewUrl}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--lightgray)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--black)] transition hover:bg-[var(--secondary)] md:w-auto"
                    >
                      Cancel
                    </a>
                  </div>
                ) : (
                  <a
                    href={profileEditUrl}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 md:w-auto md:px-8"
                  >
                    Edit Profile
                  </a>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <ProductCategoryManager saveAction={vendorCreateCategorizedProductsAction} />

            <div className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--black)]">Saved Category Images</h3>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">
                    These images are already live in your vendor gallery. Delete and re-upload if you need a different category.
                  </p>
                </div>
                <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--black)]">
                  {products.length} live images
                </span>
              </div>

              {groupedProducts.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#c8b79f] bg-white/80 p-8 text-center text-[var(--darkgray)]">
                  No categorized images yet. Upload a batch above and drag them into the right category boxes.
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {groupedProducts.map((group) => (
                    <div key={group.key} className="rounded-[24px] border border-[#e6d7c4] bg-[var(--secondary)]/45 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-semibold text-[var(--black)]">
                            {getVendorProductCategoryLabel(group.key)}
                          </h4>
                          <p className="mt-1 text-xs text-[var(--darkgray)]">
                            {group.items.length} image{group.items.length === 1 ? "" : "s"} in this category
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {group.items.map((product) => (
                          <div key={product._id.toString()} className="rounded-2xl border border-white/80 bg-white p-3 shadow-sm">
                            <Image
                              src={product.image_url || "/image/plywood.png"}
                              alt={product.image_name}
                              width={420}
                              height={280}
                              className="h-44 w-full rounded-xl object-cover"
                            />
                            <p className="mt-3 truncate text-sm font-semibold text-[var(--black)]">{product.image_name}</p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-[11px] font-medium text-[var(--black)]">
                                {getVendorProductCategoryLabel(product.category_key)}
                              </span>
                              <form action={vendorDeleteProductAction}>
                                <input type="hidden" name="productId" value={product._id.toString()} />
                                <ConfirmSubmitButton
                                  confirmMessage="Are you sure you want to delete this image?"
                                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                >
                                  Delete
                                </ConfirmSubmitButton>
                              </form>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
