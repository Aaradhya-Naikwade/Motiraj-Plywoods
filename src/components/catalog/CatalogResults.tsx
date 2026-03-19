import Image from "next/image";
import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { searchCatalogAssets } from "@/lib/catalog-search";

type CatalogResultsProps = {
  query: string;
  heading?: string;
};

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-2xl font-semibold text-[#201710]">{title}</h2>
      <p className="text-sm font-medium text-[#6b5f52]">{count} item{count === 1 ? "" : "s"}</p>
    </div>
  );
}

export default async function CatalogResults({ query, heading }: CatalogResultsProps) {
  const { staticImages, staticPdfs, vendorImages } = await searchCatalogAssets(query);
  const totalResults = staticImages.length + staticPdfs.length + vendorImages.length;

  if (!query.trim()) {
    return (
      <section className="min-h-screen bg-[#f6f3ef] px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-[32px] border border-[#e7dccf] bg-white p-6 shadow-[0_25px_80px_-50px_rgba(40,26,10,0.32)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b3e12]">Catalogue Search</p>
            <h1 className="mt-3 text-3xl font-semibold text-[#201710] md:text-4xl">
              Start typing to search products
            </h1>
            <p className="mt-2 text-sm text-[#64584c]">
              Search by category name or PDF name. Vendor images match by category.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f6f3ef] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[32px] border border-[#e7dccf] bg-white p-6 shadow-[0_25px_80px_-50px_rgba(40,26,10,0.32)] md:p-8">
          <h1 className="text-3xl font-semibold text-[#201710] md:text-4xl">
            {heading ?? `Results for "${query}"`}
          </h1>
        </div>

        {totalResults === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#d5c7b7] bg-white p-12 text-center text-[#6b5f52]">
            No results found for this search.
          </div>
        ) : null}

        {staticPdfs.length > 0 ? (
          <div className="rounded-[30px] border border-[#e6d8c6] bg-white p-5 shadow-[0_22px_70px_-48px_rgba(67,38,6,0.38)] md:p-7">
            <SectionHeader title="PDF Results" count={staticPdfs.length} />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staticPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex flex-col justify-between gap-4 rounded-[24px] border border-[#efe5d8] bg-[#fffdf9] p-5 shadow-[0_20px_50px_-40px_rgba(67,38,6,0.35)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3e8da] text-[#8b3e12]">
                      <FileText size={22} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#201710]">{pdf.name}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-[#8b3e12]">{pdf.category}</p>
                    </div>
                  </div>
                  <Link
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#8b3e12] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f300e]"
                  >
                    Open PDF
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {staticImages.length > 0 ? (
          <div className="rounded-[30px] border border-[#e6d8c6] bg-white p-5 shadow-[0_22px_70px_-48px_rgba(67,38,6,0.38)] md:p-7">
            <SectionHeader title="Image Results" count={staticImages.length} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {staticImages.map((image) => (
                <div
                  key={image.id}
                  className="group overflow-hidden rounded-[26px] border border-[#efe5d8] bg-[#fffdf9] shadow-[0_24px_60px_-44px_rgba(67,38,6,0.38)]"
                >
                  <div className="relative">
                    <Image
                      src={image.url}
                      alt={image.name}
                      width={520}
                      height={380}
                      className="h-72 w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-70 transition group-hover:opacity-90" />
                  </div>
                  <div className="p-4">
                    <p className="text-base font-semibold text-[#201710]">{image.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {vendorImages.length > 0 ? (
          <div className="rounded-[30px] border border-[#e6d8c6] bg-white p-5 shadow-[0_22px_70px_-48px_rgba(67,38,6,0.38)] md:p-7">
            <SectionHeader title="Vendor Gallery" count={vendorImages.length} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vendorImages.map((image) => (
                <div
                  key={image.id}
                  className="group overflow-hidden rounded-[26px] border border-[#efe5d8] bg-[#fffdf9] shadow-[0_24px_60px_-44px_rgba(67,38,6,0.38)]"
                >
                  <div className="relative">
                    <Image
                      src={image.url}
                      alt={image.vendorName ?? "Vendor product"}
                      width={520}
                      height={380}
                      className="h-72 w-full object-cover"
                    />
                    {image.vendorName ? (
                      <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#8b3e12] shadow-sm">
                        {image.vendorName}
                      </span>
                    ) : null}
                    {image.catalogueSlug ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/35">
                        <Link
                          href={`/vendor/catalogue/${image.catalogueSlug}`}
                          className="translate-y-3 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1f1f1f] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                        >
                          Visit Catalogue
                        </Link>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3 px-5 py-5">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b3e12]/80">Vendor</p>
                      <h4 className="mt-1 text-lg font-semibold text-gray-900">{image.vendorName ?? "Vendor"}</h4>
                    </div>
                  </div>
                    
                  {image.vendorMobile ? (
                    <div className="flex border-t border-[#eadbc6]">
                      <a
                        href={`tel:${image.vendorMobile}`}
                        className="flex flex-1 items-center justify-center gap-2 bg-[#8b3e12] px-4 py-4 font-medium text-white transition hover:bg-[#6f300e]"
                      >
                        <Phone size={18} />
                        Contact Vendor
                      </a>
                      <a
                        href={`https://wa.me/${image.vendorWhatsapp || image.vendorMobile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 flex items-center justify-center border-l border-[#eadbc6] bg-white transition hover:bg-[#f7f1ea]"
                      >
                        <FaWhatsapp size={28} className="text-[#1c9c47]" />
                      </a>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
