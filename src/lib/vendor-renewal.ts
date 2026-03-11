import type { VendorDocument } from "@/lib/vendor-repo";

function getRenewalStartDate(vendor: Pick<VendorDocument, "created_at" | "renewal_started_at">): Date {
  return vendor.renewal_started_at ?? vendor.created_at;
}

export function getVendorRenewalDate(vendor: Pick<VendorDocument, "created_at" | "renewal_started_at">): Date {
  const renewalDate = new Date(getRenewalStartDate(vendor));
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  return renewalDate;
}

export function isVendorRenewalExpired(
  vendor: Pick<VendorDocument, "created_at" | "renewal_started_at">,
  now = new Date()
): boolean {
  return now >= getVendorRenewalDate(vendor);
}

