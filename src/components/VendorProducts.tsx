import Image from "next/image";
import { Image as ImageIcon, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

type VendorPageProduct = {
  id: string;
  title: string;
  description: string;
  city: string;
  price: number | null;
  discountPercent: number | null;
  imageUrls: string[];
  vendorName: string;
  vendorMobile: string;
  vendorWhatsapp: string | null;
};

type VendorProductsProps = {
  products: VendorPageProduct[];
};

const VendorProducts = ({ products }: VendorProductsProps) => {
  const hasProducts = products.length > 0;

  return (
    <section className="w-full bg-[#f6f3ef] py-20">
      <h2 className="text-4xl font-semibold text-center mb-16 text-gray-900">
        Get Skilled Workers On Demand Today
      </h2>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-6">
        {!hasProducts ? (
          <div className="md:col-span-3 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No vendor products yet. Be the first vendor to add a product.
          </div>
        ) : null}

        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-gray-100"
          >
            <div className="relative group">
              <Image
                src={product.imageUrls[0] || "/image/plywood.png"}
                alt={product.title}
                width={500}
                height={350}
                className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
              />

              {product.discountPercent ? (
                <div className="absolute top-4 right-4 bg-[#8b3e12] text-white text-xs px-3 py-1 rounded-full font-medium shadow">
                  {product.discountPercent}% OFF
                </div>
              ) : null}

              {product.imageUrls.length > 1 ? (
                <div className="absolute bottom-4 right-4 bg-white text-gray-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow">
                  <ImageIcon size={14} />+{product.imageUrls.length - 1}
                </div>
              ) : null}
            </div>

            <div className="px-6 py-6 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>

                <button className="text-xs bg-[#947A57] hover:bg-[#7f6647] transition text-white px-3 py-1.5 rounded-full">
                  {product.vendorName}
                </button>
              </div>

              {product.price !== null ? (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xl font-bold text-gray-900">
                    Rs {product.price.toLocaleString("en-IN")}
                  </span>
                </div>
              ) : null}

              <p className="text-sm text-gray-500">{product.city}</p>

              <p className="text-sm text-gray-400">{product.description}</p>
            </div>

            <div className="flex border-t  border-amber-600  rounded-tr-3xl rounded-tl-3xl">
              <a
                href={`tel:${product.vendorMobile}`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#8b3e12] hover:bg-[#6f300e] transition text-white py-4 font-medium rounded-tl-3xl"
              >
                <Phone size={20} />
                Contact Supplier
              </a>

              <a
                href={`https://wa.me/${product.vendorWhatsapp || product.vendorMobile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 flex items-center justify-center border-l border-gray-100 hover:bg-gray-50 transition rounded-tr-3xl"
              >
                <FaWhatsapp size={30} className="text-[#8b3e12]" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VendorProducts;
