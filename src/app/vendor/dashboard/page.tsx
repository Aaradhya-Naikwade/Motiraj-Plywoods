import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findVendorById, setVendorStatus } from "@/lib/vendor-repo";
import { findVendorProductsByVendorId } from "@/lib/vendor-product-repo";
import { isVendorRenewalExpired } from "@/lib/vendor-renewal";
import { VENDOR_AUTH_COOKIE, verifyVendorSessionToken } from "@/lib/vendor-auth";
import {
  vendorCreateProductAction,
  vendorDeleteProductAction,
  vendorLogoutAction,
  vendorUpdateProductAction,
  vendorUpdateProfileAction,
} from "../actions";
import DashboardAlerts from "./DashboardAlerts";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

type VendorDashboardPageProps = {
  searchParams: Promise<{ status?: string; error?: string; tab?: string; page?: string; edit?: string }>;
};

const PRODUCTS_PER_PAGE = 6;

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
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const requestedPage = Number(params.page ?? "1");
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, Math.floor(requestedPage)), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = products.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);
  const selectedProduct = products.find((product) => product._id.toString() === params.edit) ?? null;
  const buildProductsUrl = (page: number, editId?: string) =>
    `/vendor/dashboard?tab=products&page=${page}${editId ? `&edit=${editId}` : ""}`;
  const vendorDobValue = vendor.dob ? vendor.dob.toISOString().slice(0, 10) : "";
  const dobMaxDate = new Date();
  dobMaxDate.setFullYear(dobMaxDate.getFullYear() - 18);
  const maxDobValue = dobMaxDate.toISOString().slice(0, 10);

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
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-xl lg:col-span-3">
              <h2 className="text-xl font-semibold text-[var(--black)]">Business Profile</h2>
              <p className="mt-1 text-sm text-[var(--darkgray)]">Keep your contact details updated for buyers.</p>

              <form action={vendorUpdateProfileAction} className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">Name</span>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={vendor.name}
                    className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">Company Name</span>
                  <input
                    name="companyName"
                    type="text"
                    required
                    defaultValue={vendor.company_name}
                    className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">Business Address</span>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue={vendor.address ?? ""}
                    placeholder="Full shop/office address"
                    className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">WhatsApp Number</span>
                  <input
                    name="whatsappNumber"
                    type="tel"
                    inputMode="numeric"
                    defaultValue={vendor.whatsapp_number ?? ""}
                    placeholder="e.g. 919876543210"
                    className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">Date of Birth</span>
                  <input
                    name="dob"
                    type="date"
                    required
                    defaultValue={vendorDobValue}
                    max={maxDobValue}
                    className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                </label>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 md:w-auto md:px-8"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>

            <aside className="space-y-4 lg:col-span-2">
              <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Mobile</p>
                <p className="mt-1 text-sm font-semibold text-[var(--black)]">{vendor.mobile}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Address</p>
                <p className="mt-1 text-sm font-semibold text-[var(--black)]">{vendor.address || "Not set"}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">WhatsApp</p>
                <p className="mt-1 text-sm font-semibold text-[var(--black)]">{vendor.whatsapp_number || "Not set"}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Date of Birth</p>
                <p className="mt-1 text-sm font-semibold text-[var(--black)]">
                  {vendor.dob ? fmtDateOnly(vendor.dob) : "Not set"}
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-5">
            <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-xl xl:col-span-2">
              <h2 className="text-xl font-semibold text-[var(--black)]">Add Product</h2>
              <p className="mt-1 text-sm text-[var(--darkgray)]">
                Fill the details and upload up to 8 images (JPG/PNG/WEBP).
              </p>

              <form action={vendorCreateProductAction} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">Product Title *</span>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Premium Plywood Sheet"
                    className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">Description *</span>
                  <textarea
                    name="description"
                    rows={3}
                    required
                    placeholder="Key features, dimensions, quality etc."
                    className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-[var(--black)]">City *</span>
                    <input
                      name="city"
                      type="text"
                      required
                      placeholder="Indore"
                      className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-[var(--black)]">Price</span>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="2500"
                      className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">Discount %</span>
                  <input
                    name="discountPercent"
                    type="number"
                    min="0"
                    max="99"
                    placeholder="10"
                    className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[var(--black)]">Product Images *</span>
                  <input
                    name="images"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    required
                    className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                >
                  Add Product
                </button>
              </form>
            </div>

            <div className="space-y-4 xl:col-span-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[var(--black)]">Your Products</h3>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[var(--darkgray)] shadow">
                  {products.length} total
                </span>
              </div>

              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#c8b79f] bg-white/80 p-8 text-center text-[var(--darkgray)]">
                  No products yet. Add your first product using the form.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    {visibleProducts.map((product) => (
                    <div
                      key={product._id.toString()}
                      className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <Image
                            src={product.image_urls[0] || "/image/plywood.png"}
                            alt={product.title}
                            width={96}
                            height={96}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-[var(--black)]">{product.title}</p>
                            <p className="text-sm text-[var(--darkgray)]">{product.city}</p>
                            <p className="text-xs text-[var(--darkgray)]">{product.image_urls.length} image(s)</p>
                            <p className="mt-1 text-xs text-[var(--darkgray)]">
                              {product.discount_percent !== null ? `${product.discount_percent}% off` : "No discount"}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--black)]">
                          {product.price !== null
                            ? `Rs ${product.price.toLocaleString("en-IN", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })}`
                            : "Price NA"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-[var(--lightgray)] pt-3">
                        <a
                          href={buildProductsUrl(currentPage, product._id.toString())}
                          className="rounded-lg border border-[var(--lightgray)] px-3 py-1.5 text-xs font-semibold text-[var(--black)] transition hover:bg-[var(--secondary)]"
                        >
                          Edit Product
                        </a>
                        <form action={vendorDeleteProductAction}>
                          <input type="hidden" name="productId" value={product._id.toString()} />
                          <ConfirmSubmitButton
                            confirmMessage="Are you sure you want to delete this product?"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Delete Product
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>
                    ))}
                  </div>

                  {totalPages > 1 ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <a
                        href={buildProductsUrl(Math.max(1, currentPage - 1))}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                          currentPage === 1
                            ? "pointer-events-none border-[var(--lightgray)] text-[var(--darkgray)]/60"
                            : "border-[var(--lightgray)] text-[var(--black)] hover:bg-[var(--secondary)]"
                        }`}
                      >
                        Prev
                      </a>

                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
                        <a
                          key={pageNumber}
                          href={buildProductsUrl(pageNumber)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                            pageNumber === currentPage
                              ? "bg-[var(--black)] text-white"
                              : "border border-[var(--lightgray)] text-[var(--black)] hover:bg-[var(--secondary)]"
                          }`}
                        >
                          {pageNumber}
                        </a>
                      ))}

                      <a
                        href={buildProductsUrl(Math.min(totalPages, currentPage + 1))}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                          currentPage === totalPages
                            ? "pointer-events-none border-[var(--lightgray)] text-[var(--darkgray)]/60"
                            : "border-[var(--lightgray)] text-[var(--black)] hover:bg-[var(--secondary)]"
                        }`}
                      >
                        Next
                      </a>
                    </div>
                  ) : null}

                  {selectedProduct ? (
                    <div className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-[2px] md:items-center md:p-4">
                      <div className="my-2 w-full max-w-5xl rounded-2xl border border-white/80 bg-white shadow-2xl md:my-0 md:rounded-3xl">
                        <div className="flex items-center justify-between gap-4 rounded-t-2xl border-b border-[var(--lightgray)] bg-[linear-gradient(135deg,#f8efe3_0%,#f4e7d8_100%)] px-4 py-3 md:rounded-t-3xl md:px-5 md:py-4">
                          <div>
                            <h4 className="text-lg font-semibold text-[var(--black)]">Edit Product</h4>
                            <p className="text-xs text-[var(--darkgray)]">{selectedProduct.title}</p>
                          </div>
                          <a
                            href={buildProductsUrl(currentPage)}
                            aria-label="Close edit modal"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--lightgray)] bg-white text-base font-semibold leading-none text-[var(--black)] transition hover:bg-[var(--secondary)]"
                          >x</a>
                        </div>

                        <form action={vendorUpdateProductAction} className="grid gap-3 p-4 md:grid-cols-3 md:gap-4 md:p-5">
                          <input type="hidden" name="productId" value={selectedProduct._id.toString()} />

                          <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
                            <label className="block">
                              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Product Title *</span>
                              <input
                                name="title"
                                type="text"
                                required
                                defaultValue={selectedProduct.title}
                                className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-sm font-medium text-[var(--black)]">City *</span>
                              <input
                                name="city"
                                type="text"
                                required
                                defaultValue={selectedProduct.city}
                                className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Price</span>
                              <input
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={selectedProduct.price ?? ""}
                                className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Discount %</span>
                              <input
                                name="discountPercent"
                                type="number"
                                min="0"
                                max="99"
                                step="1"
                                defaultValue={selectedProduct.discount_percent ?? ""}
                                className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                              />
                            </label>

                            <label className="block sm:col-span-2">
                              <span className="mb-1 block text-sm font-medium text-[var(--black)]">Description *</span>
                              <textarea
                                name="description"
                                rows={2}
                                required
                                defaultValue={selectedProduct.description}
                                className="text-[var(--black)] w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                              />
                            </label>
                          </div>

                          <aside className="rounded-xl border border-[var(--lightgray)] bg-[var(--secondary)]/40 p-3 md:rounded-2xl">
                            <p className="mb-2 text-sm font-semibold text-[var(--black)]">Current Images</p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {selectedProduct.image_urls.map((imageUrl) => (
                                <label key={imageUrl} className="rounded-lg border border-[var(--lightgray)] bg-white p-1.5">
                                  <Image
                                    src={imageUrl}
                                    alt={selectedProduct.title}
                                    width={120}
                                    height={80}
                                    className="h-20 w-full rounded-md object-cover sm:h-16"
                                  />
                                  <span className="mt-1 flex items-center gap-1 text-[11px] text-[var(--darkgray)]">
                                    <input type="checkbox" name="removeImage" value={imageUrl} /> Remove
                                  </span>
                                </label>
                              ))}
                            </div>

                            <label className="mt-3 block">
                              <span className="mb-1 block text-xs font-medium text-[var(--black)]">Add More Images</span>
                              <input
                                name="images"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                multiple
                                className="text-[var(--black)] w-full rounded-lg border border-[var(--lightgray)] bg-white px-2 py-2 text-xs"
                              />
                            </label>
                          </aside>

                          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--lightgray)] pt-3 md:col-span-3">
                            <a
                              href={buildProductsUrl(currentPage)}
                              className="w-full rounded-xl border border-[var(--lightgray)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--black)] transition hover:bg-[var(--secondary)] sm:w-auto"
                            >
                              Cancel
                            </a>
                            <button
                              type="submit"
                              className="w-full rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 sm:w-auto"
                            >
                              Save Product Changes
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
