import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { VENDOR_AUTH_COOKIE } from "@/lib/auth-cookies";

const VENDOR_SESSION_TTL_SECONDS = 60 * 60 * 8;

type VendorSessionPayload = {
  sub: string;
  mobile: string;
  exp: number;
};

function getVendorAuthSecret(): string {
  const secret = process.env.VENDOR_AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing VENDOR_AUTH_SECRET in environment variables.");
  }
  return secret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payloadEncoded: string): string {
  return createHmac("sha256", getVendorAuthSecret()).update(payloadEncoded).digest("base64url");
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const computedHash = scryptSync(password, salt, 64).toString("hex");
  const storedBuffer = Buffer.from(storedHash, "hex");
  const computedBuffer = Buffer.from(computedHash, "hex");

  if (storedBuffer.length !== computedBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, computedBuffer);
}

export function createVendorSessionToken(vendorId: string, mobile: string): string {
  const payload: VendorSessionPayload = {
    sub: vendorId,
    mobile,
    exp: Math.floor(Date.now() / 1000) + VENDOR_SESSION_TTL_SECONDS,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyVendorSessionToken(token: string): VendorSessionPayload | null {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadEncoded);
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as VendorSessionPayload;
    if (!payload?.sub || !payload?.mobile || !payload?.exp) {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function normalizeMobile(input: string): string {
  return input.replace(/\D/g, "");
}

export function isValidMobile(input: string): boolean {
  return /^\d{10,15}$/.test(input);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}

export { VENDOR_AUTH_COOKIE, VENDOR_SESSION_TTL_SECONDS };
