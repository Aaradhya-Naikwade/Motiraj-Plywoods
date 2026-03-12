import VendorHero from "@/components/VendorHero";
import VendorProducts from "@/components/VendorProducts";
import { getVendorProductCategoryLabel } from "@/lib/vendor-product-categories";
import { findVisibleVendorProducts } from "@/lib/vendor-product-repo";
import { findVendorsByIds } from "@/lib/vendor-repo";

export default async function VendorPage() {
  const products = await findVisibleVendorProducts();
  const vendorIds = products.map((product) => product.vendor_id.toString());
  const vendors = await findVendorsByIds(vendorIds);
  const vendorMap = new Map(vendors.map((vendor) => [vendor._id.toString(), vendor]));

  const vendorCatalogueMap = new Map<
    string,
    {
      id: string;
      vendorName: string;
      vendorMobile: string;
      vendorWhatsapp: string | null;
      catalogueSlug: string;
      imageUrl: string;
      imageCount: number;
      categories: string[];
    }
  >();

  for (const product of products) {
    const owner = vendorMap.get(product.vendor_id.toString());
    if (!owner || owner.status !== "active") {
      continue;
    }

    const categoryLabel = getVendorProductCategoryLabel(product.category_key);
    const existing = vendorCatalogueMap.get(owner._id.toString());
    if (existing) {
      existing.imageCount += 1;
      if (!existing.categories.includes(categoryLabel)) {
        existing.categories.push(categoryLabel);
      }
      continue;
    }

    vendorCatalogueMap.set(owner._id.toString(), {
      id: owner._id.toString(),
      vendorName: owner.company_name,
      vendorMobile: owner.mobile,
      vendorWhatsapp: owner.whatsapp_number,
      catalogueSlug: owner.catalogue_slug,
      imageUrl: product.image_url,
      imageCount: 1,
      categories: [categoryLabel],
    });
  }

  const productList = Array.from(vendorCatalogueMap.values());

  return (
    <>
      <VendorHero />
      <VendorProducts products={productList} />
    </>
  );
}
