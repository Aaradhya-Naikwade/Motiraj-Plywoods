
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findVendorById, setVendorStatus } from "@/lib/vendor-repo";
import { getLikeCountsByProductIds } from "@/lib/vendor-product-likes";
import { findVendorProductsByVendorId } from "@/lib/vendor-product-repo";
import { getVendorProductCategoryLabel, VENDOR_PRODUCT_CATEGORIES } from "@/lib/vendor-product-categories";
import { isVendorRenewalExpired } from "@/lib/vendor-renewal";
import { VENDOR_AUTH_COOKIE, verifyVendorSessionToken } from "@/lib/vendor-auth";
import {
  vendorCreateCategorizedProductsAction,
  vendorDeleteProductAction,
  vendorLogoutAction,
  vendorTrackCatalogueShareAction,
  vendorUpdateProfileAction,
} from "../actions";
import DashboardAlerts from "./DashboardAlerts";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Eye,
  Heart,
  MapPin,
  Phone,
  Store,
  User,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import ProductCategoryManager from "./ProductCategoryManager";
import VendorCatalogueTools from "./VendorCatalogueTools";
import VendorDashboardShell from "./VendorDashboardShell";

type VendorDashboardPageProps = {
  searchParams: Promise<{ status?: string; error?: string; tab?: string; mode?: string }>;
};

type VendorDashboardTab = "analytics" | "profile" | "add-products" | "manage-products";

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

function getCompletionPercentage(vendor: {
  name: string;
  company_name: string;
  mobile: string;
  whatsapp_number: string | null;
  dob: Date | null;
  address: string | null;
}) {
  const fields = [vendor.name, vendor.company_name, vendor.mobile, vendor.whatsapp_number, vendor.dob, vendor.address];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default async function VendorDashboardPage({ searchParams }: VendorDashboardPageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(VENDOR_AUTH_COOKIE)?.value;

  if (!sessionCookie) redirect("/vendor/auth");

  const session = verifyVendorSessionToken(sessionCookie);
  if (!session) redirect("/vendor/auth");

  const vendor = await findVendorById(session.sub);
  if (!vendor) redirect("/vendor/auth");
  if (vendor.status === "locked") redirect("/vendor/auth?tab=login&error=renewal_required");

  if (vendor.status === "pending") {
    return (
      <section className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f7f2eb_0%,_#efe6dc_42%,_#e6dacc_100%)] px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--darkgray)]">Vendor Portal</p>
                <h1 className="mt-2 text-3xl font-semibold text-[var(--black)] md:text-4xl">Approval Pending</h1>
                <p className="mt-2 text-sm text-[var(--darkgray)]">Your account is registered successfully. Please wait for admin approval to start using dashboard features.</p>
              </div>
              <form action={vendorLogoutAction}>
                <button type="submit" className="rounded-full border border-[var(--lightgray)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]">Logout</button>
              </form>
            </div>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your account is currently in <span className="font-semibold">Pending</span> status. You cannot edit profile or manage products until admin sets it to <span className="font-semibold">Active</span>.
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (vendor.status !== "active") redirect("/vendor/auth?tab=login&error=account_inactive");
  if (isVendorRenewalExpired(vendor)) {
    await setVendorStatus(vendor._id.toString(), "locked");
    redirect("/vendor/auth?tab=login&error=renewal_required");
  }

  const products = await findVendorProductsByVendorId(vendor._id.toString());
  const likeCounts = await getLikeCountsByProductIds(products.map((product) => product._id.toString()));
  const params = await searchParams;
  const activeTab: VendorDashboardTab =
    params.tab === "manage-products"
      ? "manage-products"
      : params.tab === "add-products" || params.tab === "products"
        ? "add-products"
        : params.tab === "profile"
          ? "profile"
          : "analytics";
  const isProfileEditMode = activeTab === "profile" && params.mode === "edit";
  const vendorDobValue = vendor.dob ? vendor.dob.toISOString().slice(0, 10) : "";
  const dobMaxDate = new Date();
  dobMaxDate.setFullYear(dobMaxDate.getFullYear() - 18);
  const maxDobValue = dobMaxDate.toISOString().slice(0, 10);
  const groupedProducts = VENDOR_PRODUCT_CATEGORIES.map((category) => ({
    ...category,
    items: products.filter((product) => product.category_key === category.key),
  })).filter((category) => category.items.length > 0);
  const categoriesUsedCount = groupedProducts.length;
  const totalLikesCount = products.reduce((sum, product) => sum + (likeCounts.get(product._id.toString()) ?? 0), 0);
  const totalCatalogueVisits = vendor.catalogue_view_count ?? 0;
  const profileCompletion = getCompletionPercentage(vendor);
  const analyticsCards = [
    { label: "Products", value: products.length.toString(), helper: "Live catalogue images", icon: Store },
    { label: "Status", value: vendor.status, helper: "Current account state", icon: BadgeCheck },
    { label: "Last Login", value: fmtDate(vendor.last_login), helper: "Most recent vendor access", icon: CalendarDays },
    { label: "Catalogue Visits", value: totalCatalogueVisits.toString(), helper: "Total customer visits on your catalogue", icon: Eye },
  ];

  return (
    <>
      <DashboardAlerts status={params.status} error={params.error} />
      <VendorDashboardShell activeTab={activeTab} companyName={vendor.company_name} status={vendor.status} onLogoutAction={vendorLogoutAction}>
        {activeTab !== "add-products" ? (
          <VendorCatalogueTools
            cataloguePath={`/vendor/catalogue/${vendor.catalogue_slug}`}
            companyName={vendor.company_name}
            hasProducts={products.length > 0}
            onTrackShareAction={vendorTrackCatalogueShareAction}
          />
        ) : null}
        {activeTab === "analytics" ? (
          <div className="space-y-4 md:space-y-5">
            <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_60px_-42px_rgba(73,36,10,0.45)] md:p-6">
              <div className="relative flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--black)] md:text-3xl">{vendor.company_name}</h2>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {analyticsCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.label} className="rounded-[24px] border border-[#eee3d7] bg-[#fcfaf7] p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--darkgray)]">{card.label}</p>
                            <p className={`mt-2 font-semibold capitalize text-[var(--black)] ${card.label === "Last Login" ? "text-sm md:text-base" : "text-lg"}`}>{card.value}</p>
                            <p className="mt-1 text-xs text-[var(--darkgray)]">{card.helper}</p>
                          </div>
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm"><Icon size={18} /></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-[26px] border border-[#f0d8df] bg-[#fff4f7] p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b4234d]">Total Likes On Your Profile</p>
                      <p className="mt-2 text-3xl font-semibold text-[#2b1420]">{totalLikesCount}</p>
                      <p className="mt-1 text-xs text-[#8e3a55]">People liked your products.</p>
                    </div>
                    <span title="People liked your products" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#b4234d] shadow-sm">
                      <Heart size={18} className="fill-current" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "profile" ? (
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_60px_-42px_rgba(73,36,10,0.45)] md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--black)]">{vendor.company_name}</h2>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">Your business profile details for customer contact and trust.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#fcfaf7] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">Profile Completion</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--black)]">{profileCompletion}%</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eadfd2]">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${profileCompletion}%` }} />
                  </div>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">Vendor Since</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--black)]">{fmtDateOnly(vendor.created_at)}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">Last Login</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--black)]">{fmtDate(vendor.last_login)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_60px_-42px_rgba(73,36,10,0.45)] md:p-6">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-[#eee3d7] bg-[#fcfaf7] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm"><User size={18} /></span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">Name</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--black)]">{vendor.name}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#eee3d7] bg-[#fcfaf7] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm"><Building2 size={18} /></span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">Company Name</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--black)]">{vendor.company_name}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#eee3d7] bg-[#fcfaf7] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm"><Phone size={18} /></span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">Mobile</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--black)]">{vendor.mobile}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#eee3d7] bg-[#fcfaf7] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm"><FaWhatsapp size={18} /></span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">WhatsApp</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--black)]">{vendor.whatsapp_number || "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#eee3d7] bg-[#fcfaf7] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm"><CalendarDays size={18} /></span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">Date of Birth</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--black)]">{fmtDateOnly(vendor.dob)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#eee3d7] bg-[#fcfaf7] p-4 md:col-span-2 xl:col-span-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm"><MapPin size={18} /></span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--darkgray)]">Address</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--black)]">{vendor.address || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <a
                  href="/vendor/dashboard?tab=profile&mode=edit"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                >
                  Edit Profile
                </a>
              </div>
            </div>

            {isProfileEditMode ? (
              <div className="fixed inset-0 z-50 bg-black/45 p-3 md:p-4">
                <a href="/vendor/dashboard?tab=profile" className="absolute inset-0" aria-label="Close edit profile modal" />
                <div className="relative z-10 mx-auto flex h-full max-w-lg items-center justify-center">
                  <div className="w-full rounded-[24px] border border-white/80 bg-white p-3 shadow-[0_30px_80px_-36px_rgba(0,0,0,0.45)] md:rounded-[28px] md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--black)] md:text-xl">Edit Profile</h3>
                      <p className="mt-0.5 text-[11px] text-[var(--darkgray)] md:mt-1 md:text-sm">Update your business details.</p>
                    </div>
                  </div>

                  <form action={vendorUpdateProfileAction} className="mt-3 grid grid-cols-2 gap-2.5 md:mt-5 md:gap-4">
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--black)] md:gap-2 md:text-sm"><User size={14} />Name</span>
                      <input name="name" type="text" required defaultValue={vendor.name} className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-xs text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 md:rounded-2xl md:px-3.5 md:py-2.5 md:text-sm" />
                    </label>
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--black)] md:gap-2 md:text-sm"><Building2 size={14} />Company</span>
                      <input name="companyName" type="text" required defaultValue={vendor.company_name} className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-xs text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 md:rounded-2xl md:px-3.5 md:py-2.5 md:text-sm" />
                    </label>
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--black)] md:gap-2 md:text-sm"><Phone size={14} />Mobile</span>
                      <input type="text" value={vendor.mobile} disabled className="w-full rounded-xl border border-[var(--lightgray)] bg-[#fcfaf7] px-3 py-2 text-xs text-[var(--darkgray)] md:rounded-2xl md:px-3.5 md:py-2.5 md:text-sm" />
                    </label>
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--black)] md:gap-2 md:text-sm"><FaWhatsapp size={14} />WhatsApp</span>
                      <input name="whatsappNumber" type="tel" inputMode="numeric" defaultValue={vendor.whatsapp_number ?? ""} placeholder="e.g. 919876543210" className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-xs text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 md:rounded-2xl md:px-3.5 md:py-2.5 md:text-sm" />
                    </label>
                    <label className="col-span-2 block">
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--black)] md:gap-2 md:text-sm"><CalendarDays size={14} />Date of Birth</span>
                      <input name="dob" type="date" required defaultValue={vendorDobValue} max={maxDobValue} className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-xs text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 md:rounded-2xl md:px-3.5 md:py-2.5 md:text-sm" />
                    </label>
                    <label className="col-span-2 block">
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--black)] md:gap-2 md:text-sm"><MapPin size={14} />Address</span>
                      <textarea name="address" rows={2} defaultValue={vendor.address ?? ""} placeholder="Full shop or office address" className="w-full rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-xs text-[var(--black)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 md:rounded-2xl md:px-3.5 md:py-2.5 md:text-sm" />
                    </label>
                    <div className="col-span-2 flex gap-2">
                      <button type="submit" className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 md:rounded-2xl md:py-3 md:flex-none md:min-w-[150px]">
                        Save
                      </button>
                      <a href="/vendor/dashboard?tab=profile" className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--lightgray)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--black)] transition hover:bg-[var(--secondary)] md:rounded-2xl md:py-3 md:flex-none">
                        Cancel
                      </a>
                    </div>
                  </form>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : activeTab === "add-products" ? (
          <div className="space-y-6">
            <ProductCategoryManager saveAction={vendorCreateCategorizedProductsAction} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--black)]">Saved Category Images</h3>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">These images are already live in your vendor gallery. Delete and re-upload if you need a different category.</p>
                </div>
                <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--black)]">{products.length} live images</span>
              </div>

              {groupedProducts.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {groupedProducts.map((group) => (
                    <span key={group.key} className="rounded-full border border-[var(--lightgray)] bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--black)]">
                      {getVendorProductCategoryLabel(group.key)}: {group.items.length}
                    </span>
                  ))}
                </div>
              ) : null}

              {groupedProducts.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#c8b79f] bg-white/80 p-8 text-center text-[var(--darkgray)]">No categorized images yet. Upload a batch above and drag them into the right category boxes.</div>
              ) : (
                <div className="mt-6 space-y-6">
                  {groupedProducts.map((group) => (
                    <div key={group.key} className="rounded-[24px] border border-[#e6d7c4] bg-[var(--secondary)]/45 p-4">
                      <div>
                        <h4 className="text-lg font-semibold text-[var(--black)]">{getVendorProductCategoryLabel(group.key)}</h4>
                        <p className="mt-1 text-xs text-[var(--darkgray)]">{group.items.length} image{group.items.length === 1 ? "" : "s"} in this category</p>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {group.items.map((product) => (
                          <div key={product._id.toString()} className="rounded-2xl border border-white/80 bg-white p-3 shadow-sm">
                            <Image src={product.image_url || "/image/plywood.png"} alt={getVendorProductCategoryLabel(product.category_key)} width={420} height={280} className="h-44 w-full rounded-xl object-cover" />
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[var(--secondary)] px-3 py-1 text-[11px] font-medium text-[var(--black)]">{getVendorProductCategoryLabel(product.category_key)}</span>
                                <span className="rounded-full border border-[#f2c9d3] bg-[#fff1f5] px-3 py-1 text-[11px] font-medium text-[#b4234d]">{likeCounts.get(product._id.toString()) ?? 0} likes</span>
                              </div>
                              <form action={vendorDeleteProductAction}>
                                <input type="hidden" name="productId" value={product._id.toString()} />
                                <input type="hidden" name="returnTab" value="manage-products" />
                                <ConfirmSubmitButton confirmMessage="Are you sure you want to delete this image?" className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100">Delete</ConfirmSubmitButton>
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
      </VendorDashboardShell>
    </>
  );
}
