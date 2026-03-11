import Image from "next/image";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { VENDOR_PRODUCT_CATEGORIES } from "@/lib/vendor-product-categories";

type VendorPageProduct = {
  id: string;
  category: string;
  imageName: string;
  imageUrl: string;
  vendorName: string;
  vendorMobile: string;
  vendorWhatsapp: string | null;
};

type VendorProductsProps = {
  products: VendorPageProduct[];
};

const VendorProducts = ({ products }: VendorProductsProps) => {
  const hasProducts = products.length > 0;
  const groupedProducts = VENDOR_PRODUCT_CATEGORIES.map((category) => ({
    category: category.label,
    items: products.filter((product) => product.category === category.label),
  })).filter((group) => group.items.length > 0);

  return (
    <section className="w-full bg-[#f6f3ef] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8b3e12]">Vendor Gallery</p>
          <h2 className="mt-4 text-4xl font-semibold text-gray-900">Browse Work by Category</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Explore real vendor uploads sorted into dedicated categories so buyers can reach the right supplier faster.
          </p>
        </div>

        {!hasProducts ? (
          <div className="mt-16 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No vendor gallery images yet. Be the first vendor to publish your work.
          </div>
        ) : null}

        <div className="mt-16 space-y-12">
          {groupedProducts.map((group) => (
            <div key={group.category} className="rounded-[30px] border border-[#e6d8c6] bg-white/90 p-6 shadow-[0_22px_70px_-48px_rgba(67,38,6,0.38)] md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{group.category}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {group.items.length} image{group.items.length === 1 ? "" : "s"} available in this category
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-[26px] border border-[#efe5d8] bg-[#fffdf9] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative">
                      <Image
                        src={product.imageUrl || "/image/plywood.png"}
                        alt={product.imageName}
                        width={500}
                        height={380}
                        className="h-72 w-full object-cover"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#8b3e12] shadow-sm">
                        {group.category}
                      </div>
                    </div>

                    <div className="space-y-3 px-5 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b3e12]/80">Vendor</p>
                          <h4 className="mt-1 text-lg font-semibold text-gray-900">{product.vendorName}</h4>
                        </div>
                      </div>

                      <p className="truncate text-sm text-gray-500">{product.imageName}</p>
                    </div>

                    <div className="flex border-t border-[#eadbc6]">
                      <a
                        href={`tel:${product.vendorMobile}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#8b3e12] px-4 py-4 font-medium text-white transition hover:bg-[#6f300e]"
                      >
                        <Phone size={18} />
                        Contact Vendor
                      </a>

                      <a
                        href={`https://wa.me/${product.vendorWhatsapp || product.vendorMobile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 flex items-center justify-center border-l border-[#eadbc6] bg-white transition hover:bg-[#f7f1ea]"
                      >
                        <FaWhatsapp size={28} className="text-[#1c9c47]" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VendorProducts;
