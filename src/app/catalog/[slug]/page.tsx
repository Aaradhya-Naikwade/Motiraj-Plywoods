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

  const viewerSrc = `${pdfPath}#view=FitH&toolbar=1&navpanes=0&scrollbar=1`;

  return (
    <div className="min-h-screen bg-[#f3eee7] px-3 py-3 md:px-6 md:py-5">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col overflow-hidden rounded-[30px] border border-[#ddd0c2] bg-white shadow-[0_28px_80px_-48px_rgba(33,24,15,0.38)]">

          {/* PDF TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5d8cb] bg-[#f8f3ed] px-4 py-3 md:px-6">

            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#d7b98f]"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#efe2d2]"></span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold capitalize text-[var(--black)]">{title}</p>
                <p className="truncate text-xs text-[var(--darkgray)]">{title}.pdf</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              {hasPdf ? (
                <>
                  <a
                    href={pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[var(--lightgray)] bg-white px-3 py-2 text-xs font-semibold text-[var(--black)] transition hover:bg-gray-100 md:text-sm"
                  >
                    Open in Full View
                  </a>
                  <a
                    href={pdfPath}
                    download
                    className="rounded-lg bg-[var(--darkb)] px-3 py-2 text-xs font-semibold text-white shadow hover:opacity-90 md:text-sm"
                  >
                    Download
                  </a>
                </>
              ) : (
                <span className="rounded-lg border border-[var(--lightgray)] bg-white px-3 py-2 text-xs text-[var(--darkgray)]">
                  PDF Not Available
                </span>
              )}

            </div>
          </div>

          {/* PDF AREA */}
          {hasPdf ? (
            <div className="bg-[#efe7dd] p-2 md:p-4">
              <div className="overflow-hidden rounded-[24px] border border-[#d9ccbe] bg-white shadow-[0_22px_50px_-38px_rgba(33,24,15,0.28)]">
                  <iframe
                    src={viewerSrc}
                    className="h-[82vh] w-full bg-white md:h-[88vh]"
                    title={`${title} PDF`}
                  />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-[#efe7dd] px-6 py-12 text-center">
              <div className="rounded-[28px] border border-dashed border-[#d5c7b7] bg-white px-8 py-12 shadow-sm">
                <p className="text-lg font-semibold text-[var(--black)]">
                  Catalog not found
                </p>
                <p className="mt-2 text-sm text-[var(--darkgray)]">
                  This PDF is not available right now.
                </p>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
