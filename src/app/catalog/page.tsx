import CatalogResults from "@/components/catalog/CatalogResults";

type CatalogSearchPageProps = {
  searchParams: Promise<{ query?: string }>;
};

export default async function CatalogSearchPage({ searchParams }: CatalogSearchPageProps) {
  const params = await searchParams;
  const query = params.query ?? "";

  return <CatalogResults query={query} />;
} 
