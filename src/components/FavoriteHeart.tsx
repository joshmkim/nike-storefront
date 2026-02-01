"use client";

import { HeartIcon } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type FavoriteHeartProps = {
  shoeId: string;
  initialFavorited?: boolean;
  /** Called after a successful toggle so parent can refetch (e.g. update grid). */
  onToggle?: (favorited: boolean) => void;
};

export function FavoriteHeart({ shoeId, initialFavorited = false, onToggle }: FavoriteHeartProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const toggle = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return;
    }
    setIsPending(true);
    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ shoeId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to toggle favorite");
      }
      const { favorited } = await res.json();
      setIsFavorited(favorited);
    } catch {
      // Keep current state on error
    } finally {
      setIsPending(false);
    }
  }, [shoeId, onToggle]);

  const filled = isFavorited;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="group/heart absolute right-[12px] top-[12px] flex h-[34px] w-[34px] items-center justify-center rounded p-0 disabled:opacity-60"
      aria-label={filled ? "Remove from wishlist" : "Add to wishlist"}
    >
      <HeartIcon
        className={`h-[34px] w-[34px] transition-colors ${
          filled
            ? "fill-[#ff4747] stroke-[#ff4747]"
            : "fill-transparent stroke-neutral-700 group-hover/heart:fill-[#ff4747] group-hover/heart:stroke-transparent"
        }`}
      />
    </button>
  );
}
