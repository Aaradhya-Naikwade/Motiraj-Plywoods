import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { VENDOR_PRODUCT_CATEGORIES } from "@/lib/vendor-product-categories";
import {
  getLikeCountsByProductIds,
  getVisitorLikedProductIds,
  VENDOR_CATALOGUE_VISITOR_COOKIE,
} from "@/lib/vendor-product-likes";
import { findVisibleVendorProductsByVendorId } from "@/lib/vendor-product-repo";
import { findVendorByCatalogueSlug, incrementVendorCatalogueView, setVendorStatus } from "@/lib/vendor-repo";
import { isVendorRenewalExpired } from "@/lib/vendor-renewal";
import VendorCatalogueGallery from "./VendorCatalogueGallery";

type VendorCataloguePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function VendorCataloguePage({ params }: VendorCataloguePageProps) {
  const { slug } = await params;
  const vendor = await findVendorByCatalogueSlug(slug);

  if (!vendor) {
    notFound();
  }

  if (vendor.status !== "active") {
    notFound();
  }

  if (isVendorRenewalExpired(vendor)) {
    await setVendorStatus(vendor._id.toString(), "locked");
    notFound();
  }

  await incrementVendorCatalogueView(vendor._id.toString());
  const products = await findVisibleVendorProductsByVendorId(vendor._id.toString());
  const cookieStore = await cookies();
  const visitorId = cookieStore.get(VENDOR_CATALOGUE_VISITOR_COOKIE)?.value ?? "";
  const productIds = products.map((product) => product._id.toString());
  const [likeCounts, likedProductIds] = await Promise.all([
    getLikeCountsByProductIds(productIds),
    getVisitorLikedProductIds(productIds, visitorId),
  ]);

  const groupedProducts = VENDOR_PRODUCT_CATEGORIES.map((category) => ({
    category: category.label,
    items: products
      .filter((product) => product.category_key === category.key)
      .map((product) => ({
        id: product._id.toString(),
        imageUrl: product.image_url,
        category: category.label,
        likeCount: likeCounts.get(product._id.toString()) ?? 0,
        initiallyLiked: likedProductIds.has(product._id.toString()),
      })),
  })).filter((group) => group.items.length > 0);


  return (
    <section className="min-h-screen bg-[#f6f3ef] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[32px] border border-[#e7dccf] bg-white p-6 shadow-[0_25px_80px_-50px_rgba(40,26,10,0.32)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b3e12]">Vendor Catalogue</p>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-[#201710] md:text-4xl">{vendor.company_name}</h1>
              <p className="mt-2 text-sm text-[#64584c]">Product gallery grouped by category</p>
              {vendor.address ? <p className="mt-4 max-w-2xl text-sm leading-6 text-[#54483d]">{vendor.address}</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${vendor.mobile}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#8b3e12] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6f300e]"
              >
                <Phone size={18} />
                Call Vendor
              </a>
              <a
                href={`https://wa.me/${vendor.whatsapp_number || vendor.mobile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8cbbd] bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition hover:bg-[#f7f2ec]"
              >
                <FaWhatsapp size={18} className="text-[#1c9c47]" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {groupedProducts.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#d5c7b7] bg-white p-12 text-center text-[#6b5f52]">
            No catalogue images available right now.
          </div>
        ) : (
          <VendorCatalogueGallery groups={groupedProducts} />
        )}
      </div>
    </section>
  );
}
