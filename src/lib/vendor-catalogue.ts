export function slugifyVendorCatalogue(input: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "vendor";
}

export function buildVendorCatalogueSlug(companyName: string, mobile: string): string {
  const base = slugifyVendorCatalogue(companyName);
  const suffix = mobile.replace(/\D/g, "") || "shop";
  return `${base}-${suffix}`;
}
