import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminDeleteProductAction,
  adminDeleteLeadAction,
  adminDeleteVendorAction,
  adminLogoutAction,
  adminToggleProductVisibilityAction,
  adminUpdateLeadAction,
  adminUpdateVendorAction,
} from "../actions";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin-auth";
import { findAllLeads } from "@/lib/lead-repo";
import { findAllVendors } from "@/lib/vendor-repo";
import { findAllVendorProducts } from "@/lib/vendor-product-repo";
import AdminDashboardClient, { LeadRow, ProductRow, VendorRow } from "./AdminDashboardClient";

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

function formatPrice(price: number | null) {
  if (price === null) {
    return "Price NA";
  }

  return `Rs ${price.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_AUTH_COOKIE)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const [vendors, products, leads] = await Promise.all([
    findAllVendors(),
    findAllVendorProducts(),
    findAllLeads(),
  ]);

  const productCountByVendorId = new Map<string, number>();
  for (const product of products) {
    const key = product.vendor_id.toString();
    productCountByVendorId.set(key, (productCountByVendorId.get(key) ?? 0) + 1);
  }

  const vendorNameById = new Map(vendors.map((vendor) => [vendor._id.toString(), vendor.company_name]));

  const initialVendors: VendorRow[] = vendors.map((vendor) => ({
    id: vendor._id.toString(),
    name: vendor.company_name,
    owner: vendor.name,
    address: vendor.address ?? "-",
    products: productCountByVendorId.get(vendor._id.toString()) ?? 0,
    joined: formatDate(vendor.created_at),
    status: vendor.status === "active" ? "Active" : "Inactive",
    mobile: vendor.mobile,
    email: vendor.email,
    whatsapp: vendor.whatsapp_number ?? "",
  }));

  const initialProducts: ProductRow[] = products.map((product) => ({
    id: product._id.toString(),
    name: product.title,
    vendor: vendorNameById.get(product.vendor_id.toString()) ?? "Unknown Vendor",
    city: product.city,
    price: formatPrice(product.price),
    image: product.image_urls[0] || "/image/plywood.png",
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
      initialVendors={initialVendors}
      initialProducts={initialProducts}
      initialLeads={initialLeads}
    />
  );
}
