import VendorHero from "@/components/VendorHero";
import VendorProducts from "@/components/VendorProducts";
import { findAllVendorProducts } from "@/lib/vendor-product-repo";
import { findVendorsByIds } from "@/lib/vendor-repo";

export default async function VendorPage() {
  const products = await findAllVendorProducts();
  const vendorIds = products.map((product) => product.vendor_id.toString());
  const vendors = await findVendorsByIds(vendorIds);
  const vendorMap = new Map(vendors.map((vendor) => [vendor._id.toString(), vendor]));

  const productList = products
    .map((product) => {
      const owner = vendorMap.get(product.vendor_id.toString());
      if (!owner || owner.status !== "active") {
        return null;
      }

      return {
        id: product._id.toString(),
        title: product.title,
        description: product.description,
        city: product.city,
        price: product.price,
        discountPercent: product.discount_percent,
        imageUrls: product.image_urls,
        vendorName: owner.company_name,
        vendorMobile: owner.mobile,
        vendorWhatsapp: owner.whatsapp_number,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <>
      <VendorHero />
      <VendorProducts products={productList} />
    </>
  );
}
