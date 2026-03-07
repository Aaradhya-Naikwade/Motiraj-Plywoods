"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MongoServerError } from "mongodb";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { VENDOR_AUTH_COOKIE, VENDOR_SESSION_TTL_SECONDS, createVendorSessionToken, hashPassword, isStrongPassword, isValidMobile, normalizeMobile, verifyPassword, verifyVendorSessionToken } from "@/lib/vendor-auth";
import { createVendor, findVendorById, findVendorByMobile, updateVendorLastLogin, updateVendorProfile } from "@/lib/vendor-repo";
import { createVendorProduct, deleteVendorProduct, findVendorProductById, updateVendorProduct } from "@/lib/vendor-product-repo";

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  return vendor;
}

function parseOptionalNumber(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateProductInput(input: {
  title: string;
  description: string;
  city: string;
  price: number | null;
  discountPercent: number | null;
}) {
  if (!input.title || !input.description || !input.city) {
    return "missing_fields";
  }

  if (input.price !== null && input.price < 0) {
    return "invalid_price";
  }

  if (
    input.discountPercent !== null &&
    (input.discountPercent < 0 || input.discountPercent > 99)
  ) {
    return "invalid_discount";
  }

  return null;
}

async function storeProductImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "vendor-products");
  await mkdir(uploadDir, { recursive: true });

  const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"]);
  const urls: string[] = [];

  for (const file of files) {
    if (!allowedMime.has(file.type)) {
      throw new Error("Unsupported image format. Use JPG, PNG, or WEBP.");
    }

    const extFromType =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${Date.now()}-${randomUUID()}.${extFromType}`;
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    urls.push(`/uploads/vendor-products/${filename}`);
  }

  return urls;
}

async function removeLocalImages(imageUrls: string[]) {
  for (const imageUrl of imageUrls) {
    if (!imageUrl.startsWith("/uploads/vendor-products/")) {
      continue;
    }
    const filename = imageUrl.replace("/uploads/vendor-products/", "");
    const filePath = path.join(process.cwd(), "public", "uploads", "vendor-products", filename);
    await unlink(filePath).catch(() => undefined);
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
  
  if (existingVendor.status === "blocked") {
    redirect(buildRedirect("/vendor/auth", { tab: "login", error: "account_blocked", mobile }));
  }

  if (existingVendor.status === "pending") {
    redirect(buildRedirect("/vendor/auth", { tab: "login", error: "account_pending", mobile }));
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
  const mobile = normalizeMobile(String(formData.get("mobile") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const termsAccepted = String(formData.get("terms") ?? "") === "on";

  if (!isValidMobile(mobile)) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "invalid_mobile_register", mobile }));
  }

  if (!name || !companyName || !email || !termsAccepted) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "missing_fields", mobile, email }));
  }

  if (!isValidEmail(email)) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "invalid_email", mobile, email }));
  }

  if (!isStrongPassword(password)) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "weak_password" }));
  }

  if (password !== confirmPassword) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "password_mismatch", mobile, email }));
  }

  const mobileExists = await findVendorByMobile(mobile);
  if (mobileExists) {
    redirect(buildRedirect("/vendor/auth", { tab: "register", error: "mobile_exists", mobile, email }));
  }

  const { hash, salt } = hashPassword(password);

  try {
    const vendor = await createVendor({
      name,
      company_name: companyName,
      mobile,
      email,
      password_hash: hash,
      password_salt: salt,
      status: "active",
    });

    await updateVendorLastLogin(vendor._id.toString());
    await setVendorAuthCookie(vendor._id.toString(), vendor.mobile);
    redirect("/vendor/dashboard");
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern ?? {})[0];
      if (duplicateField === "email") {
        redirect(buildRedirect("/vendor/auth", { tab: "register", error: "email_exists", mobile, email }));
      }
      redirect(buildRedirect("/vendor/auth", { tab: "register", error: "mobile_exists", mobile, email }));
    }
    throw error;
  }
}

export async function vendorLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(VENDOR_AUTH_COOKIE);
  redirect("/vendor/auth");
}

export async function vendorUpdateProfileAction(formData: FormData) {
  const vendor = await getAuthenticatedVendorOrRedirect();

  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const whatsappRaw = String(formData.get("whatsappNumber") ?? "").trim();
  const whatsappNumber = whatsappRaw ? normalizeMobile(whatsappRaw) : "";

  if (!name || !companyName) {
    redirect("/vendor/dashboard?error=missing_fields");
  }

  if (whatsappNumber && !isValidMobile(whatsappNumber)) {
    redirect("/vendor/dashboard?error=invalid_whatsapp");
  }

  await updateVendorProfile(vendor._id.toString(), {
    name,
    company_name: companyName,
    whatsapp_number: whatsappNumber || null,
  });

  redirect("/vendor/dashboard?status=profile_updated");
}

export async function vendorCreateProductAction(formData: FormData) {
  const vendor = await getAuthenticatedVendorOrRedirect();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const price = parseOptionalNumber(String(formData.get("price") ?? ""));
  const discountPercent = parseOptionalNumber(String(formData.get("discountPercent") ?? ""));

  const validationError = validateProductInput({
    title,
    description,
    city,
    price,
    discountPercent,
  });

  if (validationError) {
    redirect(`/vendor/dashboard?tab=products&error=${validationError}`);
  }

  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (imageFiles.length === 0) {
    redirect("/vendor/dashboard?tab=products&error=images_required");
  }

  if (imageFiles.length > 8) {
    redirect("/vendor/dashboard?tab=products&error=too_many_images");
  }

  try {
    const imageUrls = await storeProductImages(imageFiles);

    await createVendorProduct({
      vendor_id: vendor._id.toString(),
      title,
      description,
      city,
      price,
      discount_percent: discountPercent,
      image_urls: imageUrls,
    });

    redirect("/vendor/dashboard?tab=products&status=product_created");
  } catch {
    redirect("/vendor/dashboard?tab=products&error=image_upload_failed");
  }
}

export async function vendorUpdateProductAction(formData: FormData) {
  const vendor = await getAuthenticatedVendorOrRedirect();

  const productId = String(formData.get("productId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const price = parseOptionalNumber(String(formData.get("price") ?? ""));
  const discountPercent = parseOptionalNumber(String(formData.get("discountPercent") ?? ""));

  const validationError = validateProductInput({
    title,
    description,
    city,
    price,
    discountPercent,
  });

  if (validationError) {
    redirect(`/vendor/dashboard?tab=products&error=${validationError}`);
  }

  const product = await findVendorProductById(productId);
  if (!product || product.vendor_id.toString() !== vendor._id.toString()) {
    redirect("/vendor/dashboard?tab=products&error=product_not_found");
  }

  const removedImages = formData
    .getAll("removeImage")
    .map((value) => String(value))
    .filter(Boolean);

  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const keptImages = product.image_urls.filter((url) => !removedImages.includes(url));

  let newImageUrls: string[] = [];
  try {
    newImageUrls = await storeProductImages(imageFiles);
  } catch {
    redirect("/vendor/dashboard?tab=products&error=image_upload_failed");
  }

  const nextImageUrls = [...keptImages, ...newImageUrls];

  if (nextImageUrls.length === 0) {
    await removeLocalImages(newImageUrls);
    redirect("/vendor/dashboard?tab=products&error=images_required");
  }

  if (nextImageUrls.length > 8) {
    await removeLocalImages(newImageUrls);
    redirect("/vendor/dashboard?tab=products&error=too_many_images");
  }

  const updated = await updateVendorProduct(productId, vendor._id.toString(), {
    title,
    description,
    city,
    price,
    discount_percent: discountPercent,
    image_urls: nextImageUrls,
  });

  if (!updated) {
    await removeLocalImages(newImageUrls);
    redirect("/vendor/dashboard?tab=products&error=product_not_found");
  }

  await removeLocalImages(removedImages);
  redirect("/vendor/dashboard?tab=products&status=product_updated");
}

export async function vendorDeleteProductAction(formData: FormData) {
  const vendor = await getAuthenticatedVendorOrRedirect();
  const productId = String(formData.get("productId") ?? "");

  const deletedProduct = await deleteVendorProduct(productId, vendor._id.toString());
  if (!deletedProduct) {
    redirect("/vendor/dashboard?tab=products&error=product_not_found");
  }

  await removeLocalImages(deletedProduct.image_urls);
  redirect("/vendor/dashboard?tab=products&status=product_deleted");
}
