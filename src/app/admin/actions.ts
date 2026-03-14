"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_AUTH_COOKIE, isValidAdminCredentials } from "@/lib/admin-auth";
import { INDUSTRY_LEADER_ROLE_ORDER, updateIndustryLeaders } from "@/lib/industry-leaders-repo";
import { deleteLead, updateLead } from "@/lib/lead-repo";
import { adminUpdateVendor, deleteVendorById, findVendorById } from "@/lib/vendor-repo";
import {
  adminDeleteVendorProduct,
  adminSetVendorProductCategory,
  adminSetVendorProductHidden,
  deleteVendorProductsByVendorId,
  getVendorProductImageUrls,
} from "@/lib/vendor-product-repo";
import { removeUploadedImages } from "@/lib/vendor-product-images";
import { VENDOR_PRODUCT_CATEGORY_KEYS, type VendorProductCategoryKey } from "@/lib/vendor-product-categories";

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
  await Promise.all(deletedProducts.map((product) => removeUploadedImages(getVendorProductImageUrls(product))));

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

export async function adminUpdateProductCategoryAction(input: {
  productId: string;
  categoryKey: VendorProductCategoryKey;
}) {
  await requireAdminSession();

  if (!VENDOR_PRODUCT_CATEGORY_KEYS.includes(input.categoryKey)) {
    return { ok: false, error: "Invalid category selected." };
  }

  const updated = await adminSetVendorProductCategory(input.productId, input.categoryKey);
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

  await removeUploadedImages(getVendorProductImageUrls(deletedProduct));
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

export async function adminUpdateIndustryLeadersAction(input: {
  formData: FormData;
}) {
  await requireAdminSession();

  const leaders = INDUSTRY_LEADER_ROLE_ORDER.map((role) => {
    const name = String(input.formData.get(`name_${role}`) ?? "").trim();
    const designation = String(input.formData.get(`designation_${role}`) ?? "").trim();
    const message = String(input.formData.get(`message_${role}`) ?? "").trim();
    const existingImageUrl = String(input.formData.get(`imageUrl_${role}`) ?? "").trim();
    const imageFile = input.formData.get(`imageFile_${role}`);

    return {
      role,
      name,
      designation,
      message,
      existingImageUrl,
      imageFile: imageFile instanceof File && imageFile.size > 0 ? imageFile : null,
    };
  });

  async function uploadLeaderImage(file: File): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials are missing.");
    }

    const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedMime.has(file.type)) {
      throw new Error("Unsupported image format. Use JPG, PNG, or WEBP.");
    }

    const { createHash } = await import("crypto");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "industry-leaders";
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash("sha1").update(`${paramsToSign}${apiSecret}`).digest("hex");

    const payload = new FormData();
    payload.set("file", file);
    payload.set("folder", folder);
    payload.set("timestamp", timestamp);
    payload.set("api_key", apiKey);
    payload.set("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: payload,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Cloudinary upload failed.");
    }

    const data = (await response.json()) as { secure_url?: string };
    if (!data.secure_url) {
      throw new Error("Cloudinary upload returned no URL.");
    }

    return data.secure_url;
  }

  const leadersWithImage = [];
  for (const leader of leaders) {
    let imageUrl = leader.existingImageUrl;
    if (leader.imageFile) {
      try {
        imageUrl = await uploadLeaderImage(leader.imageFile);
      } catch {
        return { ok: false, error: `Image upload failed for ${leader.role}. Use JPG, PNG, or WEBP.` };
      }
    }

    if (!leader.name || !leader.designation || !leader.message || !imageUrl) {
      return { ok: false, error: "All fields are required for each leader card." };
    }

    leadersWithImage.push({
      role: leader.role,
      name: leader.name,
      designation: leader.designation,
      message: leader.message,
      image_url: imageUrl,
    });
  }

  await updateIndustryLeaders(leadersWithImage);

  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}
