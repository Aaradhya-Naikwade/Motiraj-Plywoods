import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findVendorById } from "@/lib/vendor-repo";
import { findVendorProductsByVendorId } from "@/lib/vendor-product-repo";
import { VENDOR_AUTH_COOKIE, verifyVendorSessionToken } from "@/lib/vendor-auth";
import {
  vendorCreateProductAction,
  vendorDeleteProductAction,
  vendorLogoutAction,
  vendorUpdateProductAction,
  vendorUpdateProfileAction,
} from "../actions";
import DashboardAlerts from "./DashboardAlerts";

type VendorDashboardPageProps = {
  searchParams: Promise<{ status?: string; error?: string; tab?: string }>;
};

function fmtDate(date: Date | null) {
  return date ? date.toLocaleString() : "-";
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

  const products = await findVendorProductsByVendorId(vendor._id.toString());
  const params = await searchParams;
  const activeTab = params.tab === "products" ? "products" : "profile";

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
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Email</p>
                <p className="mt-1 break-all text-sm font-semibold text-[var(--black)]">{vendor.email}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/95 p-5 shadow-xl">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">WhatsApp</p>
                <p className="mt-1 text-sm font-semibold text-[var(--black)]">{vendor.whatsapp_number || "Not set"}</p>
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
                <div className="space-y-4">
                  {products.map((product) => (
                    <details
                      key={product._id.toString()}
                      className="group rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl open:ring-2 open:ring-[var(--primary)]/20"
                    >
                      <summary className="list-none cursor-pointer">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Image
                              src={product.image_urls[0] || "/image/plywood.png"}
                              alt={product.title}
                              width={96}
                              height={96}
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                            <div>
                              <p className="text-base font-semibold text-[var(--black)]">{product.title}</p>
                              <p className="text-sm text-[var(--darkgray)]">{product.city}</p>
                              <p className="text-xs text-[var(--darkgray)]">{product.image_urls.length} image(s)</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--black)]">
                              {product.price !== null ? `Rs ${product.price.toLocaleString("en-IN")}` : "Price NA"}
                            </span>
                            <span className="rounded-full border border-[var(--lightgray)] px-3 py-1 text-xs font-medium text-[var(--darkgray)]">
                              Edit
                            </span>
                          </div>
                        </div>
                      </summary>

                      <div className="mt-5 border-t border-[var(--lightgray)] pt-5">
                        <div className="mb-4 flex justify-end">
                          <form action={vendorDeleteProductAction}>
                            <input type="hidden" name="productId" value={product._id.toString()} />
                            <button
                              type="submit"
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Delete Product
                            </button>
                          </form>
                        </div>

                        <form action={vendorUpdateProductAction} className="grid gap-4 md:grid-cols-2">
                          <input type="hidden" name="productId" value={product._id.toString()} />

                          <label className="block">
                            <span className="mb-1 block text-sm font-medium text-[var(--black)]">Product Title *</span>
                            <input
                              name="title"
                              type="text"
                              required
                              defaultValue={product.title}
                              className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-1 block text-sm font-medium text-[var(--black)]">City *</span>
                            <input
                              name="city"
                              type="text"
                              required
                              defaultValue={product.city}
                              className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-1 block text-sm font-medium text-[var(--black)]">Price</span>
                            <input
                              name="price"
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={product.price ?? ""}
                              className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-1 block text-sm font-medium text-[var(--black)]">Discount %</span>
                            <input
                              name="discountPercent"
                              type="number"
                              min="0"
                              max="99"
                              defaultValue={product.discount_percent ?? ""}
                              className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                            />
                          </label>

                          <label className="block md:col-span-2">
                            <span className="mb-1 block text-sm font-medium text-[var(--black)]">Description *</span>
                            <textarea
                              name="description"
                              rows={3}
                              required
                              defaultValue={product.description}
                              className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                            />
                          </label>

                          <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-medium text-[var(--black)]">Current Images</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {product.image_urls.map((imageUrl) => (
                                <label key={imageUrl} className="rounded-xl border border-[var(--lightgray)] p-2">
                                  <Image
                                    src={imageUrl}
                                    alt={product.title}
                                    width={240}
                                    height={160}
                                    className="h-28 w-full rounded-lg object-cover"
                                  />
                                  <span className="mt-2 flex items-center gap-2 text-xs text-[var(--darkgray)]">
                                    <input type="checkbox" name="removeImage" value={imageUrl} /> Remove
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <label className="block md:col-span-2">
                            <span className="mb-1 block text-sm font-medium text-[var(--black)]">Add More Images</span>
                            <input
                              name="images"
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              multiple
                              className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm"
                            />
                          </label>

                          <div className="md:col-span-2">
                            <button
                              type="submit"
                              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 md:w-auto md:px-8"
                            >
                              Save Product Changes
                            </button>
                          </div>
                        </form>
                      </div>
                    </details>
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
