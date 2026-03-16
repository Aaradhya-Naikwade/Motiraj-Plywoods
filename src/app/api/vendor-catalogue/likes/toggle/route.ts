import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findVendorProductById } from "@/lib/vendor-product-repo";
import { findVendorById, setVendorStatus } from "@/lib/vendor-repo";
import { toggleVendorProductLike, VENDOR_CATALOGUE_VISITOR_COOKIE } from "@/lib/vendor-product-likes";
import { isVendorRenewalExpired } from "@/lib/vendor-renewal";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { productId?: string };
    const productId = String(body.productId ?? "");
    const product = await findVendorProductById(productId);

    if (!product || product.hidden) {
      return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
    }

    const vendor = await findVendorById(product.vendor_id.toString());
    if (!vendor || vendor.status !== "active") {
      return NextResponse.json({ ok: false, error: "Vendor not available." }, { status: 404 });
    }

    if (isVendorRenewalExpired(vendor)) {
      await setVendorStatus(vendor._id.toString(), "locked");
      return NextResponse.json({ ok: false, error: "Vendor not available." }, { status: 404 });
    }
    
    const cookieStore = await cookies();
    let visitorId = cookieStore.get(VENDOR_CATALOGUE_VISITOR_COOKIE)?.value ?? "";
    const shouldSetCookie = !visitorId;
    if (!visitorId) {
      visitorId = randomUUID();
    }

    const result = await toggleVendorProductLike({
      productId: product._id.toString(),
      vendorId: product.vendor_id.toString(),
      visitorId,
    });

    const response = NextResponse.json({ ok: true, ...result });
    if (shouldSetCookie) {
      response.cookies.set(VENDOR_CATALOGUE_VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to update like." }, { status: 500 });
  }
}
