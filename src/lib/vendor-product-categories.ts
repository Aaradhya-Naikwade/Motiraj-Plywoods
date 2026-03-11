export const VENDOR_PRODUCT_CATEGORIES = [
  { key: "bed_n_cabinets", label: "Bed n Cabinets" },
  { key: "decoratives_n_temple", label: "Decoratives n Temple" },
  { key: "door", label: "Door" },
  { key: "exteriors", label: "Exteriors" },
  { key: "furnishing", label: "Furnishing" },
  { key: "kitchen", label: "Kitchen" },
  { key: "led", label: "LED" },
  { key: "partition_in_panels", label: "Partition In Panels" },
  { key: "shop_n_office", label: "Shop n Office" },
  { key: "sofa", label: "Sofa" },
] as const;

export type VendorProductCategoryKey = (typeof VENDOR_PRODUCT_CATEGORIES)[number]["key"];

export const VENDOR_PRODUCT_CATEGORY_KEYS = VENDOR_PRODUCT_CATEGORIES.map((category) => category.key);

export const VENDOR_PRODUCT_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const VENDOR_PRODUCT_IMAGE_MAX_SIZE_BYTES = 8 * 1024 * 1024;
export const VENDOR_PRODUCT_BATCH_MAX_FILES = 40;

export function isVendorProductCategoryKey(value: string): value is VendorProductCategoryKey {
  return VENDOR_PRODUCT_CATEGORY_KEYS.includes(value as VendorProductCategoryKey);
}

export function getVendorProductCategoryLabel(categoryKey: VendorProductCategoryKey): string {
  return VENDOR_PRODUCT_CATEGORIES.find((category) => category.key === categoryKey)?.label ?? categoryKey;
}
