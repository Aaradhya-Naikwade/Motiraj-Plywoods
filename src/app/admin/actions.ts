"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_AUTH_COOKIE, isValidAdminCredentials } from "@/lib/admin-auth";
import { deleteLead, updateLead } from "@/lib/lead-repo";
import { adminUpdateVendor, deleteVendorById } from "@/lib/vendor-repo";
import {
  adminDeleteVendorProduct,
  adminSetVendorProductHidden,
  deleteVendorProductsByVendorId,
} from "@/lib/vendor-product-repo";
import { removeUploadedImages } from "@/lib/vendor-product-images";

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isValidAdminCredentials(email, password)) {
    redirect("/admin?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin/dashboard");
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE);
  redirect("/admin");
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_AUTH_COOKIE)) {
    redirect("/admin");
  }
}

export async function adminUpdateVendorAction(input: {
  vendorId: string;
  name: string;
  companyName: string;
  address: string;
  whatsapp: string;
  status: "Active" | "Inactive";
}) {
  await requireAdminSession();

  const updated = await adminUpdateVendor(input.vendorId, {
    name: input.name.trim(),
    company_name: input.companyName.trim(),
    address: input.address.trim() || null,
    whatsapp_number: input.whatsapp.trim() || null,
    status: input.status === "Active" ? "active" : "inactive",
  });

  if (!updated) {
    return { ok: false, error: "Vendor not found." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/vendor");
  return { ok: true };
}

export async function adminDeleteVendorAction(vendorId: string) {
  await requireAdminSession();

  const deletedProducts = await deleteVendorProductsByVendorId(vendorId);
  await Promise.all(deletedProducts.map((product) => removeUploadedImages(product.image_urls)));

  const deletedVendor = await deleteVendorById(vendorId);
  if (!deletedVendor) {
    return { ok: false, error: "Vendor not found." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/vendor");
  return { ok: true };
}

export async function adminToggleProductVisibilityAction(input: {
  productId: string;
  hidden: boolean;
}) {
  await requireAdminSession();

  const updated = await adminSetVendorProductHidden(input.productId, input.hidden);
  if (!updated) {
    return { ok: false, error: "Product not found." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/vendor");
  return { ok: true };
}

export async function adminDeleteProductAction(productId: string) {
  await requireAdminSession();

  const deletedProduct = await adminDeleteVendorProduct(productId);
  if (!deletedProduct) {
    return { ok: false, error: "Product not found." };
  }

  await removeUploadedImages(deletedProduct.image_urls);
  revalidatePath("/admin/dashboard");
  revalidatePath("/vendor");
  return { ok: true };
}

export async function adminUpdateLeadAction(input: {
  leadId: string;
  status: "new" | "in_progress" | "contacted" | "closed";
  notes: string;
}) {
  await requireAdminSession();

  const updated = await updateLead(input.leadId, {
    status: input.status,
    notes: input.notes.trim() || null,
  });

  if (!updated) {
    return { ok: false, error: "Lead not found." };
  }

  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function adminDeleteLeadAction(leadId: string) {
  await requireAdminSession();

  const deleted = await deleteLead(leadId);
  if (!deleted) {
    return { ok: false, error: "Lead not found." };
  }

  revalidatePath("/admin/dashboard");
  return { ok: true };
}
