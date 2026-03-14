"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MongoServerError } from "mongodb";
import { createHash } from "crypto";
import { VENDOR_AUTH_COOKIE, VENDOR_SESSION_TTL_SECONDS, createVendorSessionToken, hashPassword, isStrongPassword, isValidMobile, normalizeMobile, verifyPassword, verifyVendorSessionToken } from "@/lib/vendor-auth";
import { createVendor, findVendorById, findVendorByMobile, setVendorStatus, updateVendorLastLogin, updateVendorProfile } from "@/lib/vendor-repo";
import { incrementVendorCatalogueShareClick } from "@/lib/vendor-repo";
import { createVendorProducts, deleteVendorProduct, getVendorProductImageUrls } from "@/lib/vendor-product-repo";
import { removeUploadedImages } from "@/lib/vendor-product-images";
import { isVendorRenewalExpired } from "@/lib/vendor-renewal";
import {
  VENDOR_PRODUCT_ALLOWED_MIME_TYPES,
  VENDOR_PRODUCT_BATCH_MAX_FILES,
  VENDOR_PRODUCT_IMAGE_MAX_SIZE_BYTES,
  VENDOR_PRODUCT_CATEGORY_KEYS,
  isVendorProductCategoryKey,
  type VendorProductCategoryKey,
} from "@/lib/vendor-product-categories";
import { sendNewProductsAlert, sendNewVendorAlert } from "@/lib/admin-alerts";

function buildRedirect(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

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

async function setVendorAuthCookie(vendorId: string, mobile: string) {
  const token = createVendorSessionToken(vendorId, mobile);
  const cookieStore = await cookies();
  cookieStore.set(VENDOR_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VENDOR_SESSION_TTL_SECONDS,
  });
}

async function clearVendorAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(VENDOR_AUTH_COOKIE);
}

async function getAuthenticatedVendorOrRedirect() {
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
    await clearVendorAuthCookie();
    redirect("/vendor/auth?tab=login&error=renewal_required");
  }

  if (vendor.status === "pending") {
    redirect("/vendor/dashboard?error=account_pending");
  }

  if (vendor.status !== "active") {
    await clearVendorAuthCookie();
    redirect("/vendor/auth?tab=login&error=account_inactive");
  }

  if (isVendorRenewalExpired(vendor)) {
    await setVendorStatus(vendor._id.toString(), "locked");
    await clearVendorAuthCookie();
    redirect("/vendor/auth?tab=login&error=renewal_required");
  }

  return vendor;
}

async function storeProductImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing.");
  }

  const folder = "vendor-products";
  const allowedMime = new Set(VENDOR_PRODUCT_ALLOWED_MIME_TYPES);
  const urls: string[] = [];

  for (const file of files) {
    if (!allowedMime.has(file.type as (typeof VENDOR_PRODUCT_ALLOWED_MIME_TYPES)[number])) {
      throw new Error("Unsupported image format. Use JPG, PNG, or WEBP.");
    }
    if (file.size > VENDOR_PRODUCT_IMAGE_MAX_SIZE_BYTES) {
      throw new Error("Image file too large.");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
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

    urls.push(data.secure_url);
  }

  return urls;
}

function parseProductAssignments(input: string): Map<number, string> | null {
  try {
    const parsed = JSON.parse(input) as Array<{ index?: number; categoryKey?: string }>;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const map = new Map<number, string>();
    for (const entry of parsed) {
      if (typeof entry?.index !== "number" || !Number.isInteger(entry.index) || entry.index < 0) {
        return null;
      }
      if (typeof entry.categoryKey !== "string" || !isVendorProductCategoryKey(entry.categoryKey)) {
        return null;
      }
      map.set(entry.index, entry.categoryKey);
    }

    return map;
  } catch {
    return null;
  }
}

export async function vendorLoginAction(formData: FormData) {
  const mobile = normalizeMobile(String(formData.get("mobile") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidMobile(mobile)) {
    redirect(buildRedirect("/vendor/auth", { tab: "login", error: "invalid_mobile_login", mobile }));
  }

  const existingVendor = await findVendorByMobile(mobile);

  if (!existingVendor) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "user_not_found", mobile }));
  }
  
  if (existingVendor.status === "inactive") {
    redirect(buildRedirect("/vendor/auth", { tab: "login", error: "account_inactive", mobile }));
  }

  if (existingVendor.status === "blocked") {
    redirect(buildRedirect("/vendor/auth", { tab: "login", error: "account_blocked", mobile }));
  }

  if (existingVendor.status === "pending") {
    await setVendorAuthCookie(existingVendor._id.toString(), existingVendor.mobile);
    redirect("/vendor/dashboard?error=account_pending");
  }

  if (existingVendor.status === "locked") {
    redirect(buildRedirect("/vendor/auth", { tab: "login", error: "renewal_required", mobile }));
  }

  if (isVendorRenewalExpired(existingVendor)) {
    await setVendorStatus(existingVendor._id.toString(), "locked");
    await clearVendorAuthCookie();
    redirect(buildRedirect("/vendor/auth", { tab: "login", error: "renewal_required", mobile }));
  }

  const isValidPassword = verifyPassword(
    password,
    existingVendor.password_hash,
    existingVendor.password_salt
  );

  if (!isValidPassword) {
    redirect(buildRedirect("/vendor/auth", { tab: "login", error: "invalid_credentials", mobile }));
  }

  await updateVendorLastLogin(existingVendor._id.toString());
  await setVendorAuthCookie(existingVendor._id.toString(), existingVendor.mobile);
  redirect("/vendor/dashboard");
}

export async function vendorRegisterAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const mobile = normalizeMobile(String(formData.get("mobile") ?? ""));
  const dobInput = String(formData.get("dob") ?? "");
  const dob = parseDobInput(dobInput);
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const termsAccepted = String(formData.get("terms") ?? "") === "on";

  if (!isValidMobile(mobile)) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "invalid_mobile_register", mobile }));
  }

  if (!name || !companyName || !termsAccepted || !dob) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "missing_fields", mobile }));
  }

  if (!isAtLeast18YearsOld(dob)) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "underage", mobile }));
  }

  if (!isStrongPassword(password)) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "weak_password" }));
  }

  if (password !== confirmPassword) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "password_mismatch", mobile }));
  }

  const mobileExists = await findVendorByMobile(mobile);
  if (mobileExists) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "mobile_exists", mobile }));
  }

  const { hash, salt } = hashPassword(password);
  const generatedEmail = `${mobile}@vendor.ratlamiinterio.local`;

  try {
    const vendor = await createVendor({
      name,
      company_name: companyName,
      address: address || null,
      mobile,
      email: generatedEmail,
      dob,
      password_hash: hash,
      password_salt: salt,
      status: "pending",
    });

    await updateVendorLastLogin(vendor._id.toString());
    await setVendorAuthCookie(vendor._id.toString(), vendor.mobile);
    try {
      await sendNewVendorAlert({
        name: vendor.name,
        companyName: vendor.company_name,
        mobile: vendor.mobile,
        address: vendor.address ?? null,
        registeredAt: vendor.created_at,
        status: vendor.status,
      });
    } catch (error) {
      console.error("[alerts] New vendor email failed:", error);
      // Email failures shouldn't block registration.
    }
    redirect("/vendor/dashboard");
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern ?? {})[0];
      if (duplicateField === "email") {
        redirect(buildRedirect("/vendor/auth", { tab: "register", error: "email_exists", mobile }));
      }
      redirect(buildRedirect("/vendor/auth", { tab: "register", error: "mobile_exists", mobile }));
    }
    throw error;
  }
}

export async function vendorLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(VENDOR_AUTH_COOKIE);
  redirect("/");
}

export async function vendorUpdateProfileAction(formData: FormData) {
  const vendor = await getAuthenticatedVendorOrRedirect();

  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const dobInput = String(formData.get("dob") ?? "");
  const dob = parseDobInput(dobInput);
  const whatsappRaw = String(formData.get("whatsappNumber") ?? "").trim();
  const whatsappNumber = whatsappRaw ? normalizeMobile(whatsappRaw) : "";

  if (!name || !companyName || !dob) {
    redirect("/vendor/dashboard?tab=profile&mode=edit&error=missing_fields");
  }

  if (!isAtLeast18YearsOld(dob)) {
    redirect("/vendor/dashboard?tab=profile&mode=edit&error=underage");
  }

  if (whatsappNumber && !isValidMobile(whatsappNumber)) {
    redirect("/vendor/dashboard?tab=profile&mode=edit&error=invalid_whatsapp");
  }

  await updateVendorProfile(vendor._id.toString(), {
    name,
    company_name: companyName,
    address: address || null,
    whatsapp_number: whatsappNumber || null,
    email: vendor.email,
    dob,
  });

  redirect("/vendor/dashboard?tab=profile&status=profile_updated");
}

export async function vendorCreateCategorizedProductsAction(formData: FormData) {
  const vendor = await getAuthenticatedVendorOrRedirect();

  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (imageFiles.length === 0) {
    redirect("/vendor/dashboard?tab=products&error=images_required");
  }
 
  if (imageFiles.length > VENDOR_PRODUCT_BATCH_MAX_FILES) {
    redirect("/vendor/dashboard?tab=products&error=too_many_images");
  }

  if (imageFiles.some((file) => file.size > VENDOR_PRODUCT_IMAGE_MAX_SIZE_BYTES)) {
    redirect("/vendor/dashboard?tab=products&error=image_too_large");
  }

  const assignmentMap = parseProductAssignments(String(formData.get("assignments") ?? ""));
  if (!assignmentMap) {
    redirect("/vendor/dashboard?tab=products&error=invalid_category_assignment");
  }

  if (imageFiles.some((_, index) => !assignmentMap.has(index))) {
    redirect("/vendor/dashboard?tab=products&error=images_unassigned");
  }

  let imageUrls: string[] = [];
  try {
    imageUrls = await storeProductImages(imageFiles);
  } catch {
    redirect("/vendor/dashboard?tab=products&error=image_upload_failed");
  }

  try {
    await createVendorProducts({
      vendor_id: vendor._id.toString(),
      items: imageFiles.map((file, index) => ({
        category_key: assignmentMap.get(index)! as VendorProductCategoryKey,
        image_name: file.name,
        image_url: imageUrls[index],
      })),
    });
  } catch {
    await removeUploadedImages(imageUrls);
    redirect("/vendor/dashboard?tab=products&error=image_upload_failed");
  }

  try {
    const counts = new Map<VendorProductCategoryKey, number>();
    for (const key of VENDOR_PRODUCT_CATEGORY_KEYS) {
      counts.set(key, 0);
    }
    for (const [index, categoryKey] of assignmentMap.entries()) {
      if (index < imageFiles.length && isVendorProductCategoryKey(categoryKey)) {
        counts.set(categoryKey, (counts.get(categoryKey) ?? 0) + 1);
      }
    }
    await sendNewProductsAlert({
      vendorName: vendor.name,
      companyName: vendor.company_name,
      mobile: vendor.mobile,
      totalImages: imageFiles.length,
      categoryCounts: Array.from(counts.entries()).map(([key, count]) => ({ key, count })),
      createdAt: new Date(),
    });
  } catch {
    // Email failures shouldn't block uploads.
  }

  revalidatePath("/vendor");
  revalidatePath("/admin/dashboard");
  redirect("/vendor/dashboard?tab=analytics&status=product_created");
}

export async function vendorDeleteProductAction(formData: FormData) {
  const vendor = await getAuthenticatedVendorOrRedirect();
  const productId = String(formData.get("productId") ?? "");
  const returnTab = String(formData.get("returnTab") ?? "manage-products");
  const nextTab = returnTab === "add-products" || returnTab === "profile" ? returnTab : "manage-products";

  const deletedProduct = await deleteVendorProduct(productId, vendor._id.toString());
  if (!deletedProduct) {
    redirect(`/vendor/dashboard?tab=${nextTab}&error=product_not_found`);
  }

  await removeUploadedImages(getVendorProductImageUrls(deletedProduct));
  revalidatePath("/vendor");
  revalidatePath("/admin/dashboard");
  redirect(`/vendor/dashboard?tab=${nextTab}&status=product_deleted`);
}

export async function vendorTrackCatalogueShareAction() {
  const vendor = await getAuthenticatedVendorOrRedirect();
  await incrementVendorCatalogueShareClick(vendor._id.toString());
  return { ok: true };
}
