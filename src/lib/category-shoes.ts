import { supabase } from "@/lib/supabase";
import type { ShoeWithSale } from "@/types/database";
import { shoeSaleFromStock } from "@/types/database";

export type CategorySlug = "men" | "women" | "kids" | "sport" | "classics" | "sale";

export const CATEGORY_CONFIG: Record<
  CategorySlug,
  { title: string; description: string; breadcrumb: string }
> = {
  men: {
    title: "Men's Shoes",
    description: "Running, training, and lifestyle shoes for men.",
    breadcrumb: "Men",
  },
  women: {
    title: "Women's Shoes",
    description: "Running, training, and lifestyle shoes for women.",
    breadcrumb: "Women",
  },
  kids: {
    title: "Kids' Shoes",
    description: "Shoes built for play and everyday adventure.",
    breadcrumb: "Kids",
  },
  sport: {
    title: "Sport",
    description: "Performance running and training shoes.",
    breadcrumb: "Sport",
  },
  classics: {
    title: "Classics",
    description: "Iconic styles that never go out of style.",
    breadcrumb: "Classics",
  },
  sale: {
    title: "Sale",
    description: "Limited-time deals on select styles.",
    breadcrumb: "Sale",
  },
};

export async function getCategoryPageData(
  category: CategorySlug
): Promise<{
  shoes: ShoeWithSale[];
  reviewCountsByShoeId: Record<string, number>;
  averageRatingByShoeId: Record<string, number>;
  title: string;
  description: string;
  breadcrumbLabel: string;
}> {
  const config = CATEGORY_CONFIG[category];

  let shoes: ShoeWithSale[] = [];
  let reviewCountsByShoeId: Record<string, number> = {};
  let averageRatingByShoeId: Record<string, number> = {};

  try {
    const { data } = await supabase
      .from("shoes")
      .select("id, shoe_name, display_image, gender, age, msrp, is_sport, is_classic, created_at, updated_at, stock(sale_percent)")
      .order("created_at", { ascending: false });
    const rows = data ?? [];
    const allShoes = rows.map((row) => {
      const shoe = {
        id: row.id,
        shoe_name: row.shoe_name,
        display_image: row.display_image,
        gender: row.gender,
        age: row.age,
        msrp: row.msrp,
        is_sport: row.is_sport ?? false,
        is_classic: row.is_classic ?? false,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
      const stock = Array.isArray(row.stock) ? row.stock : row.stock ? [row.stock] : [];
      const { minPrice, onSale } = shoeSaleFromStock(row.msrp, stock);
      return { ...shoe, minPrice, onSale };
    }) as ShoeWithSale[];

    switch (category) {
      case "men":
        shoes = allShoes.filter((s) => s.gender === "men");
        break;
      case "women":
        shoes = allShoes.filter((s) => s.gender === "women");
        break;
      case "kids":
        shoes = allShoes.filter((s) => s.age === "kids");
        break;
      case "sport":
        shoes = allShoes.filter((s) => s.is_sport);
        break;
      case "classics":
        shoes = allShoes.filter((s) => s.is_classic);
        break;
      case "sale":
        shoes = allShoes.filter((s) => s.onSale);
        break;
    }
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
    // ignore
  }

  return {
    shoes,
    reviewCountsByShoeId,
    averageRatingByShoeId,
    title: config.title,
    description: config.description,
    breadcrumbLabel: config.breadcrumb,
  };
}
