import { StorefrontLayout } from "@/components/StorefrontLayout";
import { getCategoryPageData } from "@/lib/category-shoes";
import { notFound } from "next/navigation";

export default async function KidsPage() {
  const data = await getCategoryPageData("kids");
  if (!data) notFound();
  return (
    <StorefrontLayout
      shoes={data.shoes}
      reviewCountsByShoeId={data.reviewCountsByShoeId}
      averageRatingByShoeId={data.averageRatingByShoeId}
      variant="category"
      categoryTitle={data.title}
      categoryDescription={data.description}
      breadcrumbLabel={data.breadcrumbLabel}
    />
  );
}
