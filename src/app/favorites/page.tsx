"use client";

import { StorefrontLayout } from "@/components/StorefrontLayout";
import { supabase } from "@/lib/supabase";
import type { ShoeWithSale } from "@/types/database";
import { shoeSaleFromStock } from "@/types/database";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function FavoritesPage() {
  const router = useRouter();
  const [shoes, setShoes] = useState<ShoeWithSale[]>([]);
  const [reviewCountsByShoeId, setReviewCountsByShoeId] = useState<Record<string, number>>({});
  const [averageRatingByShoeId, setAverageRatingByShoeId] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    const { data: favRows } = await supabase
      .from("user_favorites")
      .select("shoe_id")
      .eq("user_id", session.user.id);
    const shoeIds = (favRows ?? []).map((r) => r.shoe_id);
    if (shoeIds.length === 0) {
      setShoes([]);
      setReviewCountsByShoeId({});
      setAverageRatingByShoeId({});
      setLoading(false);
      return;
    }
    const { data: shoesData } = await supabase
      .from("shoes")
      .select("id, shoe_name, display_image, gender, age, msrp, is_sport, is_classic, created_at, updated_at, stock(sale_percent)")
      .in("id", shoeIds);
    const rows = shoesData ?? [];
    const shoeList: ShoeWithSale[] = rows.map((row) => {
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
    });
    setShoes(shoeList);

    const { data: reviews } = await supabase.from("reviews").select("shoe_id, rating");
    const reviewRows = (reviews ?? []) as { shoe_id: string; rating: number }[];
    const sumByShoe: Record<string, number> = {};
    const countByShoe: Record<string, number> = {};
    for (const r of reviewRows) {
      sumByShoe[r.shoe_id] = (sumByShoe[r.shoe_id] ?? 0) + r.rating;
      countByShoe[r.shoe_id] = (countByShoe[r.shoe_id] ?? 0) + 1;
    }
    setReviewCountsByShoeId(countByShoe);
    const avgByShoe: Record<string, number> = {};
    for (const id of Object.keys(sumByShoe)) {
      const n = countByShoe[id] ?? 1;
      avgByShoe[id] = sumByShoe[id]! / n;
    }
    setAverageRatingByShoeId(avgByShoe);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f4f4f4] flex items-center justify-center">
        <p className="font-cabinet text-neutral-500">Loading favorites…</p>
      </div>
    );
  }

  return (
    <StorefrontLayout
      shoes={shoes}
      reviewCountsByShoeId={reviewCountsByShoeId}
      averageRatingByShoeId={averageRatingByShoeId}
      variant="favorites"
    />
  );
}
