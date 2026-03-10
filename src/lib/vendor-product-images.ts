import { createHash } from "crypto";
import { unlink } from "fs/promises";
import path from "path";

function getCloudinaryPublicIdFromUrl(imageUrl: string): string | null {
  try {
    const parsed = new URL(imageUrl);
    if (!parsed.hostname.includes("res.cloudinary.com")) {
      return null;
    }

    const marker = "/upload/";
    const uploadIndex = parsed.pathname.indexOf(marker);
    if (uploadIndex === -1) {
      return null;
    }

    const afterUpload = parsed.pathname.slice(uploadIndex + marker.length);
    const parts = afterUpload.split("/").filter(Boolean);
    if (parts.length === 0) {
      return null;
    }

    const versionStart = parts[0].startsWith("v") ? 1 : 0;
    if (versionStart >= parts.length) {
      return null;
    }

    const pathWithExt = parts.slice(versionStart).join("/");
    const lastDot = pathWithExt.lastIndexOf(".");
    return lastDot > 0 ? pathWithExt.slice(0, lastDot) : pathWithExt;
  } catch {
    return null;
  }
}

export async function removeUploadedImages(imageUrls: string[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  for (const imageUrl of imageUrls) {
    const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
    if (publicId && cloudName && apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
      const signature = createHash("sha1").update(`${paramsToSign}${apiSecret}`).digest("hex");

      const payload = new FormData();
      payload.set("public_id", publicId);
      payload.set("timestamp", timestamp);
      payload.set("api_key", apiKey);
      payload.set("signature", signature);

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: "POST",
        body: payload,
        cache: "no-store",
      }).catch(() => undefined);
      continue;
    }

    if (!imageUrl.startsWith("/uploads/vendor-products/")) {
      continue;
    }

    const filename = imageUrl.replace("/uploads/vendor-products/", "");
    const filePath = path.join(process.cwd(), "public", "uploads", "vendor-products", filename);
    await unlink(filePath).catch(() => undefined);
  }
}
