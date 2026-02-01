import { StorefrontLayout } from "@/components/StorefrontLayout";
import { getCategoryPageData } from "@/lib/category-shoes";
import { notFound } from "next/navigation";

export default async function WomenPage() {
  const data = await getCategoryPageData("women");
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
