import Image from "next/image";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
type VendorCatalogueCard = {
  id: string;
  catalogueSlug: string;
  imageUrl: string;
  imageCount: number;
  categories: string[];
  vendorName: string;
  vendorMobile: string;
  vendorWhatsapp: string | null;
};

type VendorProductsProps = {
  products: VendorCatalogueCard[];
};

const VendorProducts = ({ products }: VendorProductsProps) => {
  const hasProducts = products.length > 0;

  return (
    <section className="w-full bg-[#f6f3ef] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8b3e12]">Vendor Gallery</p>
          <h2 className="mt-4 text-4xl font-semibold text-gray-900">Browse Vendor Catalogues</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Explore vendor showcase cards and open their catalogue to see all uploaded product images.
          </p>
        </div>

        {!hasProducts ? (
          <div className="mt-16 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No vendor gallery images yet. Be the first vendor to publish your work.
          </div>
        ) : null}

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-[26px] border border-[#efe5d8] bg-[#fffdf9] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative">
                <Image
                  src={product.imageUrl || "/image/plywood.png"}
                  alt={product.vendorName}
                  width={500}
                  height={380}
                  className="h-72 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/35">
                  <a
                    href={`/vendor/catalogue/${product.catalogueSlug}`}
                    className="translate-y-3 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1f1f1f] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    Visit Catalogue
                  </a>
                </div>
                <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#8b3e12] shadow-sm">
                  {product.imageCount} images
                </div>
              </div>

              <div className="space-y-3 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b3e12]/80">Vendor</p>
                    <h4 className="mt-1 text-lg font-semibold text-gray-900">{product.vendorName}</h4>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.categories.slice(0, 3).map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-[#f5ede4] px-3 py-1 text-xs font-medium text-[#6b4a2d]"
                    >
                      {category}
                    </span>
                  ))}
                  {product.categories.length > 3 ? (
                    <span className="rounded-full bg-[#f5ede4] px-3 py-1 text-xs font-medium text-[#6b4a2d]">
                      +{product.categories.length - 3} more
                    </span>
                  ) : null}
                </div>
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
    </section>
  );
};

export default VendorProducts;
