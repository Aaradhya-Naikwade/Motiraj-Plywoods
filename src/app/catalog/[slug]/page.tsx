import { access } from "node:fs/promises";
import path from "node:path";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function pdfExists(slug: string) {
  const filePath = path.join(process.cwd(), "public", "pdf", `${slug}.pdf`);

  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export default async function CatalogPage({ params }: PageProps) {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ");
  const pdfPath = `/pdf/${slug}.pdf`;
  const hasPdf = await pdfExists(slug);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--darkb)] text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold capitalize tracking-wide">{title} PDF</h1>
        </div>
      </section>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          {hasPdf ? (
            <a
              href={pdfPath}
              download
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-[var(--primary)] text-white text-sm font-medium shadow hover:opacity-90 transition"
            >
              Download PDF
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-gray-300 text-gray-600 text-sm font-medium cursor-not-allowed">
              PDF Not Available
            </span>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          {hasPdf ? (
            <div className="w-full h-[70vh] md:h-[80vh]">
              <iframe src={pdfPath} className="w-full h-full" title={`${title} PDF`} />
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-semibold text-gray-800 mb-2">Catalog not found</p>
              <p className="text-sm text-gray-600">
                No PDF is available for <span className="font-medium capitalize">{title}</span>.
              </p>
            </div>
          )}
        </div>
      </main>

      <div className="text-center text-sm text-gray-500 pb-8 px-4">
        Need assistance or more information about these products? Contact our team for support.
      </div>
    </div>
  );
}