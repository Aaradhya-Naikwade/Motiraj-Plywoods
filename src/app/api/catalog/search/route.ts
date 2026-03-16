import { NextResponse } from "next/server";
import { searchCatalogAssets } from "@/lib/catalog-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const limitParam = Number(searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(20, limitParam)) : 8;

  if (!query) {
    return NextResponse.json({ query: "", total: 0, results: [] });
  }

  const { staticImages, staticPdfs, vendorImages } = await searchCatalogAssets(query);
  const results = [...staticPdfs, ...staticImages, ...vendorImages];

  return NextResponse.json({
    query,
    total: results.length,
    results: results.slice(0, limit),
  });
}