import { ADMIN_AUTH_COOKIE } from "@/lib/auth-cookies";

export function isValidAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return false;
  }

  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && password === adminPassword;
}

export { ADMIN_AUTH_COOKIE };
