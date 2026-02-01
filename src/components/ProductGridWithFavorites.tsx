"use client";

import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import type { Shoe } from "@/types/database";
import { useCallback, useEffect, useState } from "react";

type ProductGridWithFavoritesProps = {
  shoes: Shoe[];
  reviewCountsByShoeId: Record<string, number>;
  averageRatingByShoeId: Record<string, number>;
  /** When set, only show this many shoes (e.g. 8 for home). When undefined, show all (category/favorites). */
  limit?: number;
};

export function ProductGridWithFavorites({
  shoes,
  reviewCountsByShoeId,
  averageRatingByShoeId,
  limit,
}: ProductGridWithFavoritesProps) {
  const [favoriteShoeIds, setFavoriteShoeIds] = useState<Set<string>>(new Set());

  const loadFavorites = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setFavoriteShoeIds(new Set());
      return;
    }
    const { data } = await supabase
      .from("user_favorites")
      .select("shoe_id")
      .eq("user_id", session.user.id);
    const ids = new Set(((data ?? []) as { shoe_id: string }[]).map((r) => r.shoe_id));
    setFavoriteShoeIds(ids);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const displayShoes = limit != null ? shoes.slice(0, limit) : shoes;

  return (
    <div className="grid grid-cols-1 gap-x-[66px] gap-y-[50px] sm:grid-cols-2 lg:grid-cols-4">
      {displayShoes.map((shoe) => (
        <ProductCard
          key={shoe.id}
          shoe={shoe}
          reviewCount={reviewCountsByShoeId[shoe.id] ?? 0}
          averageRating={averageRatingByShoeId[shoe.id] ?? 0}
          isFavorited={favoriteShoeIds.has(shoe.id)}
          onFavoriteChange={loadFavorites}
        />
      ))}
    </div>
  );
}
