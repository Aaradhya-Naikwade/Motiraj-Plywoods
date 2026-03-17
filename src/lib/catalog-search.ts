import "server-only";

import path from "path";
import { promises as fs } from "fs";
import { cache } from "react";
import { findVisibleVendorProducts } from "@/lib/vendor-product-repo";
import { findVendorsByIds } from "@/lib/vendor-repo";
import { VENDOR_PRODUCT_CATEGORIES } from "@/lib/vendor-product-categories";

type CatalogAssetSource = "static" | "vendor";

export type CatalogAsset = {
  id: string;
  type: "image" | "pdf";
  source: CatalogAssetSource;
  name: string;
  category: string;
  url: string;
  vendorName?: string;
  vendorMobile?: string;
  vendorWhatsapp?: string | null;
  catalogueSlug?: string;
};

export type CatalogSearchResults = {
  query: string;
  staticImages: CatalogAsset[];
  staticPdfs: CatalogAsset[];
  vendorImages: CatalogAsset[];
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const PDF_DIR_CANDIDATES = ["pdf", "pdfs"];

const vendorCategoryLabelByKey = new Map(
  VENDOR_PRODUCT_CATEGORIES.map((category) => [category.key, category.label])
);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toPublicUrl(relativePath: string): string {
  const normalized = relativePath.split(path.sep).join("/");
  return encodeURI(`/${normalized}`);
}

async function directoryExists(targetPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function walkFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results: string[] = [];

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

const getStaticCatalogAssets = cache(async (): Promise<CatalogAsset[]> => {
  if (process.env.NODE_ENV === "production") {
    try {
      const { default: assets } = await import("@/data/catalog-index.json");
      if (Array.isArray(assets)) {
        return assets as CatalogAsset[];
      }
    } catch {
      // Fallback to filesystem scan if the index is missing.
    }
  }

  const publicDir = path.join(process.cwd(), "public");
  const assets: CatalogAsset[] = [];

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
});

async function getVendorCatalogAssets(): Promise<CatalogAsset[]> {
  const products = await findVisibleVendorProducts();
  const vendorIds = products.map((product) => product.vendor_id.toString());
  const vendors = await findVendorsByIds(vendorIds);
  const vendorMap = new Map(vendors.map((vendor) => [vendor._id.toString(), vendor]));

  return products.flatMap((product) => {
    const vendor = vendorMap.get(product.vendor_id.toString());
    if (!vendor || vendor.status !== "active") {
      return [];
    }

    const asset: CatalogAsset = {
      id: `vendor-image:${product._id.toString()}`,
      type: "image",
      source: "vendor",
      name: product.image_name || vendor.company_name || "Vendor image",
      category: vendorCategoryLabelByKey.get(product.category_key) ?? product.category_key,
      url: product.image_url,
      vendorName: vendor.company_name,
      vendorMobile: vendor.mobile,
      vendorWhatsapp: vendor.whatsapp_number,
      catalogueSlug: vendor.catalogue_slug,
    };

    return [asset];
  });
}

function matchesQuery(asset: CatalogAsset, query: string): boolean {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return false;
  }

  const searchable = [
    asset.name,
    asset.category,
    asset.type,
    asset.source,
  ]
    .map(normalizeText)
    .filter(Boolean);

  return searchable.some((value) => value.includes(normalizedQuery));
}

export async function searchCatalogAssets(query: string): Promise<CatalogSearchResults> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      query: "",
      staticImages: [],
      staticPdfs: [],
      vendorImages: [],
    };
  }

  const [staticAssets, vendorAssets] = await Promise.all([
    getStaticCatalogAssets(),
    getVendorCatalogAssets(),
  ]);

  const matchedStatic = staticAssets.filter((asset) => matchesQuery(asset, trimmedQuery));
  const matchedVendor = vendorAssets.filter((asset) => matchesQuery(asset, trimmedQuery));

  return {
    query: trimmedQuery,
    staticImages: matchedStatic.filter((asset) => asset.type === "image"),
    staticPdfs: matchedStatic.filter((asset) => asset.type === "pdf"),
    vendorImages: matchedVendor,
  };
}
