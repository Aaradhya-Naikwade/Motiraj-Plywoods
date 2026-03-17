import path from "path";
import { promises as fs } from "fs";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const PDF_DIR_CANDIDATES = ["pdf", "pdfs"];

async function directoryExists(targetPath) {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function walkFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

function toPublicUrl(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  return encodeURI(`/${normalized}`);
}

async function buildStaticCatalogAssets() {
  const publicDir = path.join(process.cwd(), "public");
  const assets = [];

  const staticImageRoots = [
    "products",
    "Products",
    "decorative",
    "Decorative",
    "hardware",
    "Hardware",
    "laminates",
    "Laminates",
  ];
  for (const root of staticImageRoots) {
    const rootDir = path.join(publicDir, root);
    if (!(await directoryExists(rootDir))) {
      continue;
    }

    const rootFiles = await walkFiles(rootDir);
    for (const filePath of rootFiles) {
      const ext = path.extname(filePath).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext) && !PDF_EXTENSIONS.has(ext)) {
        continue;
      }

      const relativePath = path.relative(publicDir, filePath);
      const parts = relativePath.split(path.sep);
      const category = parts.length > 2 ? parts[1] : root.charAt(0).toUpperCase() + root.slice(1);
      const name = path.basename(filePath, ext);
      const type = PDF_EXTENSIONS.has(ext) ? "pdf" : "image";
      const idPrefix = type === "pdf" ? "static-pdf" : "static-image";

      assets.push({
        id: `${idPrefix}:${relativePath}`,
        type,
        source: "static",
        name,
        category,
        url: toPublicUrl(relativePath),
      });
    }
  }

  for (const pdfDirName of PDF_DIR_CANDIDATES) {
    const pdfDir = path.join(publicDir, pdfDirName);
    if (!(await directoryExists(pdfDir))) {
      continue;
    }

    const pdfFiles = await walkFiles(pdfDir);
    for (const filePath of pdfFiles) {
      const ext = path.extname(filePath).toLowerCase();
      if (!PDF_EXTENSIONS.has(ext)) {
        continue;
      }

      const relativePath = path.relative(publicDir, filePath);
      const parts = relativePath.split(path.sep);
      const category = parts.length > 2 ? parts[1] : "PDFs";
      const name = path.basename(filePath, ext);

      assets.push({
        id: `static-pdf:${relativePath}`,
        type: "pdf",
        source: "static",
        name,
        category,
        url: toPublicUrl(relativePath),
      });
    }
  }

  return assets;
}

async function main() {
  const assets = await buildStaticCatalogAssets();
  const dataDir = path.join(process.cwd(), "src", "data");
  await fs.mkdir(dataDir, { recursive: true });
  const outPath = path.join(dataDir, "catalog-index.json");
  await fs.writeFile(outPath, JSON.stringify(assets, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Generated catalog index with ${assets.length} items at ${outPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to generate catalog index.", err);
  process.exit(1);
});
