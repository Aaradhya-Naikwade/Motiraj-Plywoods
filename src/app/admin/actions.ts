"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_AUTH_COOKIE, isValidAdminCredentials } from "@/lib/admin-auth";
import { deleteLead, updateLead } from "@/lib/lead-repo";
import { adminUpdateVendor, deleteVendorById, findVendorById } from "@/lib/vendor-repo";
import {
  adminDeleteVendorProduct,
  adminSetVendorProductHidden,
  deleteVendorProductsByVendorId,
} from "@/lib/vendor-product-repo";
import { removeUploadedImages } from "@/lib/vendor-product-images";

function parseDobInput(input: string): Date | null {
  const value = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));
  const isSameDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  if (!isSameDate) {
    return null;
  }

  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (date > todayUtc) {
    return null;
  }

  return date;
}

function isAtLeast18YearsOld(dob: Date): boolean {
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - dob.getUTCMonth();
  const dayDelta = today.getUTCDate() - dob.getUTCDate();

  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) {
    age -= 1;
  }

  return age >= 18;
}

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
  dob: string;
  status: "Active" | "Inactive" | "Locked" | "Pending";
}) {
  await requireAdminSession();
  const dob = parseDobInput(input.dob);

  if (!dob) {
    return { ok: false, error: "Please enter a valid date of birth." };
  }

  if (!isAtLeast18YearsOld(dob)) {
    return { ok: false, error: "Vendor age must be 18 years or older." };
  }

  const existingVendor = await findVendorById(input.vendorId);
  if (!existingVendor) {
    return { ok: false, error: "Vendor not found." };
  }

  let updated = false;
  updated = await adminUpdateVendor(input.vendorId, {
    name: input.name.trim(),
    company_name: input.companyName.trim(),
    address: input.address.trim() || null,
    whatsapp_number: input.whatsapp.trim() || null,
    email: existingVendor.email,
    dob,
    status:
      input.status === "Active"
        ? "active"
        : input.status === "Locked"
          ? "locked"
          : input.status === "Pending"
            ? "pending"
            : "inactive",
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
