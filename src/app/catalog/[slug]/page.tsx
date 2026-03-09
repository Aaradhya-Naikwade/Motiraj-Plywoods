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

  const viewerSrc = `${pdfPath}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--secondary)]">
      
      {/* HEADER */}
      <section className="px-4 pt-6 md:px-8 md:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-[var(--lightgray)] bg-gradient-to-br from-white to-gray-50 p-5 shadow-lg md:p-7">
            
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--darkgray)]">
              Catalog Viewer
            </p>

            <h1 className="mt-2 text-2xl font-bold capitalize text-[var(--black)] md:text-4xl">
              {title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[var(--darkgray)] md:text-base">
              Browse the catalog directly here or open it in a new tab for fullscreen viewing.
            </p>

          </div>
        </div>
      </section>

      {/* VIEWER */}
      <main className="flex flex-1 px-4 pb-4 pt-4 md:px-8">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-[var(--lightgray)] bg-white shadow-xl">

          {/* PDF TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--lightgray)] bg-[var(--secondary)] px-4 py-3 md:px-6">

            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]"></span>
              <p className="truncate text-sm font-semibold text-[var(--black)]">
                {title}.pdf
              </p>
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
                    Open
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
            <div className="flex-1 bg-[var(--secondary)] p-2 md:p-3">
              <div className="h-full w-full overflow-hidden rounded-2xl border border-[var(--lightgray)] bg-white">

                <iframe
                  src={viewerSrc}
                  className="h-full w-full"
                  title={`${title} PDF`}
                  scrolling="no"
                />

              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-lg font-semibold text-[var(--black)]">
                Catalog not found
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}