import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminDeleteProductAction,
  adminDeleteLeadAction,
  adminUpdateIndustryLeadersAction,
  adminDeleteVendorAction,
  adminLogoutAction,
  adminToggleProductVisibilityAction,
  adminUpdateLeadAction,
  adminUpdateVendorAction,
} from "../actions";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import { getIndustryLeadersForAdmin } from "@/lib/industry-leaders-repo";
import { findAllLeads } from "@/lib/lead-repo";
import { getVendorProductCategoryLabel } from "@/lib/vendor-product-categories";
import { getLikeCountsByProductIds, getTotalLikesByVendorIds } from "@/lib/vendor-product-likes";
import { findAllVendors, setVendorStatus } from "@/lib/vendor-repo";
import { findAllVendorProducts } from "@/lib/vendor-product-repo";
import { getVendorRenewalDate, isVendorRenewalExpired } from "@/lib/vendor-renewal";
import AdminDashboardClient, { IndustryLeaderRow, LeadRow, ProductRow, VendorRow } from "./AdminDashboardClient";

type AdminDashboardPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateInput(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

function toAdminVendorStatus(status: "active" | "inactive" | "pending" | "blocked" | "locked"): VendorRow["status"] {
  if (status === "active") {
    return "Active";
  }
  if (status === "locked") {
    return "Locked";
  }
  if (status === "pending") {
    return "Pending";
  }
  return "Inactive";
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_AUTH_COOKIE)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const [vendors, products, leads, industryLeaders] = await Promise.all([
    findAllVendors(),
    findAllVendorProducts(),
    findAllLeads(),
    getIndustryLeadersForAdmin(),
  ]);

  await Promise.all(
    vendors.map(async (vendor) => {
      if (vendor.status === "active" && isVendorRenewalExpired(vendor)) {
        await setVendorStatus(vendor._id.toString(), "locked");
        vendor.status = "locked";
      }
    })
  );

  const productCountByVendorId = new Map<string, number>();
  for (const product of products) {
    const key = product.vendor_id.toString();
    productCountByVendorId.set(key, (productCountByVendorId.get(key) ?? 0) + 1);
  }

  const vendorNameById = new Map(vendors.map((vendor) => [vendor._id.toString(), vendor.company_name]));
  const [productLikeCounts, vendorLikeTotals] = await Promise.all([
    getLikeCountsByProductIds(products.map((product) => product._id.toString())),
    getTotalLikesByVendorIds(vendors.map((vendor) => vendor._id.toString())),
  ]);

  const initialVendors: VendorRow[] = vendors.map((vendor) => {
    const renewedOn =
      vendor.renewal_started_at &&
      vendor.renewal_started_at.getTime() !== vendor.created_at.getTime()
        ? formatDate(vendor.renewal_started_at)
        : "-";

    return {
      id: vendor._id.toString(),
      name: vendor.company_name,
      owner: vendor.name,
      catalogueSlug: vendor.catalogue_slug,
      address: vendor.address ?? "-",
      products: productCountByVendorId.get(vendor._id.toString()) ?? 0,
      joined: formatDate(vendor.created_at),
      renewalDue: formatDate(getVendorRenewalDate(vendor)),
      renewedOn,
      catalogueShares: vendor.catalogue_share_click_count ?? 0,
      catalogueViews: vendor.catalogue_view_count ?? 0,
      lastSharedAt: formatDate(vendor.last_shared_at),
      lastViewedAt: formatDate(vendor.last_viewed_at),
      totalLikes: vendorLikeTotals.get(vendor._id.toString()) ?? 0,
      status: toAdminVendorStatus(vendor.status),
      mobile: vendor.mobile,
      email: vendor.email,
      dob: formatDateInput(vendor.dob),
      whatsapp: vendor.whatsapp_number ?? "",
    };
  });

  const initialProducts: ProductRow[] = products.map((product) => ({
    id: product._id.toString(),
    category: getVendorProductCategoryLabel(product.category_key),
    imageName: product.image_name,
    vendor: vendorNameById.get(product.vendor_id.toString()) ?? "Unknown Vendor",
    image: product.image_url || "/image/plywood.png",
    likes: productLikeCounts.get(product._id.toString()) ?? 0,
    hidden: product.hidden ?? false,
  }));

  const initialLeads: LeadRow[] = leads.map((lead) => ({
    id: lead._id.toString(),
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    date: formatDate(lead.created_at),
    source: lead.source,
    status: lead.status,
    notes: lead.notes ?? "",
  }));

  const initialIndustryLeaders: IndustryLeaderRow[] = industryLeaders.map((leader) => ({
    role: leader.role,
    name: leader.name,
    designation: leader.designation,
    message: leader.message,
    imageUrl: leader.image_url,
  }));

  return (
    <AdminDashboardClient
      activeTab={params.tab}
      onLogoutAction={adminLogoutAction}
      onUpdateVendorAction={adminUpdateVendorAction}
      onDeleteVendorAction={adminDeleteVendorAction}
      onToggleProductVisibilityAction={adminToggleProductVisibilityAction}
      onDeleteProductAction={adminDeleteProductAction}
      onUpdateLeadAction={adminUpdateLeadAction}
      onDeleteLeadAction={adminDeleteLeadAction}
      onUpdateIndustryLeadersAction={adminUpdateIndustryLeadersAction}
      initialVendors={initialVendors}
      initialProducts={initialProducts}
      initialLeads={initialLeads}
      initialIndustryLeaders={initialIndustryLeaders}
    />
  );
}
