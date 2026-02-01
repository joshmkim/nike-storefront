import { StorefrontLayout } from "@/components/StorefrontLayout";
import { supabase } from "@/lib/supabase";
import type { ShoeWithSale } from "@/types/database";
import { shoeSaleFromStock } from "@/types/database";

type ProductTab = "new-arrivals" | "whats-trending";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeProductTab: ProductTab =
    tab === "whats-trending" ? "whats-trending" : "new-arrivals";

  let shoes: ShoeWithSale[] = [];
  let reviewCountsByShoeId: Record<string, number> = {};
  let averageRatingByShoeId: Record<string, number> = {};

  try {
    const { data } = await supabase
      .from("shoes")
      .select("id, shoe_name, display_image, gender, age, msrp, is_sport, is_classic, created_at, updated_at, stock(sale_percent)")
      .order("created_at", { ascending: false });
    const rows = data ?? [];
    shoes = rows.map((row) => {
      const shoe = { id: row.id, shoe_name: row.shoe_name, display_image: row.display_image, gender: row.gender, age: row.age, msrp: row.msrp, is_sport: row.is_sport ?? false, is_classic: row.is_classic ?? false, created_at: row.created_at, updated_at: row.updated_at };
      const stock = Array.isArray(row.stock) ? row.stock : row.stock ? [row.stock] : [];
      const { minPrice, onSale } = shoeSaleFromStock(row.msrp, stock);
      return { ...shoe, minPrice, onSale };
    }) as ShoeWithSale[];
  } catch {
    shoes = [];
  }

  try {
    const { data: reviews } = await supabase.from("reviews").select("shoe_id, rating");
    const rows = (reviews ?? []) as { shoe_id: string; rating: number }[];
    const sumByShoe: Record<string, number> = {};
    const countByShoe: Record<string, number> = {};
    for (const r of rows) {
      sumByShoe[r.shoe_id] = (sumByShoe[r.shoe_id] ?? 0) + r.rating;
      countByShoe[r.shoe_id] = (countByShoe[r.shoe_id] ?? 0) + 1;
    }
    reviewCountsByShoeId = countByShoe;
    for (const id of Object.keys(sumByShoe)) {
      const n = countByShoe[id] ?? 1;
      averageRatingByShoeId[id] = sumByShoe[id]! / n;
    }
  } catch {
    // Reviews table may not exist or RLS may block
  }

  // Sort by tab: New Arrivals = newest first; What's Trending = highest rating then most reviews
  const sortedShoes = [...shoes].sort((a, b) => {
    if (activeProductTab === "whats-trending") {
      const aRating = averageRatingByShoeId[a.id] ?? 0;
      const bRating = averageRatingByShoeId[b.id] ?? 0;
      if (bRating !== aRating) return bRating - aRating;
      const aCount = reviewCountsByShoeId[a.id] ?? 0;
      const bCount = reviewCountsByShoeId[b.id] ?? 0;
      return bCount - aCount;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <StorefrontLayout
      shoes={sortedShoes}
      reviewCountsByShoeId={reviewCountsByShoeId}
      averageRatingByShoeId={averageRatingByShoeId}
      activeProductTab={activeProductTab}
    />
  );
}
