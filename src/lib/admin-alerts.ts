import { Resend } from "resend";
import { getVendorProductCategoryLabel, type VendorProductCategoryKey } from "@/lib/vendor-product-categories";

const DEFAULT_ADMIN_ALERT_EMAIL = "aaradhyanaikwade2520@gmail.com";

function getAdminAlertEmail() {
  return process.env.ADMIN_ALERT_EMAIL ?? DEFAULT_ADMIN_ALERT_EMAIL;
}

function getFromEmail() {
  return process.env.RESEND_FROM ?? "onboarding@resend.dev";
}

function getAdminDashboardUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  return siteUrl ? `${siteUrl}/admin/dashboard` : "/admin/dashboard";
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendNewVendorAlert(input: {
  name: string;
  companyName: string;
  mobile: string;
  address: string | null;
  registeredAt: Date;
  status: string;
}) {
  const client = getResendClient();
  if (!client) {
    console.warn("[alerts] RESEND_API_KEY missing; skipping new vendor email.");
    return false;
  }

  const adminEmail = getAdminAlertEmail();
  const dashboardUrl = getAdminDashboardUrl();
  const subject = `New vendor registered: ${input.companyName}`;

  const addressLine = input.address ? input.address : "-";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f1c19;">
      <h2 style="margin: 0 0 12px;">New Vendor Registered</h2>
      <p style="margin: 0 0 8px;"><strong>Company:</strong> ${input.companyName}</p>
      <p style="margin: 0 0 8px;"><strong>Owner:</strong> ${input.name}</p>
      <p style="margin: 0 0 8px;"><strong>Mobile:</strong> ${input.mobile}</p>
      <p style="margin: 0 0 8px;"><strong>Address:</strong> ${addressLine}</p>
      <p style="margin: 0 0 8px;"><strong>Status:</strong> ${input.status}</p>
      <p style="margin: 0 0 16px;"><strong>Registered:</strong> ${input.registeredAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      <a href="${dashboardUrl}" style="display: inline-block; padding: 10px 16px; background: #1f1c19; color: #ffffff; text-decoration: none; border-radius: 999px;">
        Open Admin Dashboard
      </a>
    </div>
  `;

  const text = `New Vendor Registered
Company: ${input.companyName}
Owner: ${input.name}
Mobile: ${input.mobile}
Address: ${addressLine}
Status: ${input.status}
Registered: ${input.registeredAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
Admin: ${dashboardUrl}`;

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: adminEmail,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("[alerts] Failed to send new vendor email:", error);
    return false;
  }

  return true;
}

export async function sendNewProductsAlert(input: {
  vendorName: string;
  companyName: string;
  mobile: string;
  totalImages: number;
  categoryCounts: Array<{ key: VendorProductCategoryKey; count: number }>;
  createdAt: Date;
}) {
  const client = getResendClient();
  if (!client) {
    console.warn("[alerts] RESEND_API_KEY missing; skipping new products email.");
    return false;
  }

  const adminEmail = getAdminAlertEmail();
  const dashboardUrl = getAdminDashboardUrl();
  const subject = `New products added: ${input.companyName} (${input.totalImages} images)`;

  const categoryLines = input.categoryCounts
    .filter((entry) => entry.count > 0)
    .map((entry) => `${getVendorProductCategoryLabel(entry.key)}: ${entry.count}`)
    .join(", ");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f1c19;">
      <h2 style="margin: 0 0 12px;">New Products Added</h2>
      <p style="margin: 0 0 8px;"><strong>Company:</strong> ${input.companyName}</p>
      <p style="margin: 0 0 8px;"><strong>Owner:</strong> ${input.vendorName}</p>
      <p style="margin: 0 0 8px;"><strong>Mobile:</strong> ${input.mobile}</p>
      <p style="margin: 0 0 8px;"><strong>Total Images:</strong> ${input.totalImages}</p>
      <p style="margin: 0 0 8px;"><strong>Categories:</strong> ${categoryLines || "-"}</p>
      <p style="margin: 0 0 16px;"><strong>Uploaded:</strong> ${input.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      <a href="${dashboardUrl}" style="display: inline-block; padding: 10px 16px; background: #1f1c19; color: #ffffff; text-decoration: none; border-radius: 999px;">
        Review in Admin Dashboard
      </a>
    </div>
  `;

  const text = `New Products Added
Company: ${input.companyName}
Owner: ${input.vendorName}
Mobile: ${input.mobile}
Total Images: ${input.totalImages}
Categories: ${categoryLines || "-"}
Uploaded: ${input.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
Admin: ${dashboardUrl}`;

  try {
    await client.emails.send({
      from: getFromEmail(),
      to: adminEmail,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("[alerts] Failed to send new products email:", error);
    return false;
  }

  return true;
}
