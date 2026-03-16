import CatalogResults from "@/components/catalog/CatalogResults";

type CatalogCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

function slugToQuery(slug: string): string {
  return decodeURIComponent(slug).replace(/[-_]+/g, " ").trim();
}

function capitalizeFirst(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function CatalogCategoryPage({ params }: CatalogCategoryPageProps) {
  const { slug } = await params;
  const query = slugToQuery(slug);
  const heading = query ? `Category: ${capitalizeFirst(query)}` : undefined;

  return <CatalogResults query={query} heading={heading} />;
}
