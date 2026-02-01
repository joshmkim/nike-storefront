"use client";

import { AddedToBagModal } from "@/components/AddedToBagModal";
import { ReviewFeed } from "@/components/ReviewFeed";
import { SaleSticker } from "@/components/SaleSticker";
import { ShoeSizeSelector } from "@/components/ShoeSizeSelector";
import { supabase } from "@/lib/supabase";
import type { Shoe } from "@/types/database";
import { salePrice } from "@/types/database";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function normalizeSize(s: string): string {
  const n = parseFloat(s);
  if (Number.isNaN(n)) return s.trim();
  return n % 1 === 0 ? String(Math.round(n)) : String(n);
}

type StockRow = { size: string; color: string; quantity: number; reserved_quantity: number; sale_percent?: number | null };

type ShoeDetailContentProps = {
  shoe: Shoe;
  /** All stock rows (with quantity, reserved_quantity). Available sizes computed client-side. */
  stockRows?: StockRow[];
};

function availableQty(r: StockRow): number {
  return (r.quantity ?? 0) - (r.reserved_quantity ?? 0);
}

export function ShoeDetailContent({ shoe, stockRows: initialStockRows = [] }: ShoeDetailContentProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [addedModal, setAddedModal] = useState<{ size: string; unitPrice: number; quantity: number } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [stockOverride, setStockOverride] = useState<StockRow[] | null>(null);
  const [sizesInCart, setSizesInCart] = useState<Set<string>>(new Set());
  const [canReview, setCanReview] = useState(false);
  const stockRows = stockOverride ?? initialStockRows;
  const imageSrc = shoe.display_image || "/assets/Sport Shoes.png";

  const fetchStock = useCallback(async () => {
    const res = await fetch(`/api/shoes/${shoe.id}/stock`);
    if (!res.ok) return;
    const data = await res.json();
    setStockOverride(Array.isArray(data) ? data : []);
  }, [shoe.id]);

  const fetchCartSizes = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSizesInCart(new Set());
      return;
    }
    const res = await fetch("/api/cart", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return;
    const items = await res.json();
    const forThisShoe = (items as { shoe_id: string; size: string }[]).filter(
      (i) => i.shoe_id === shoe.id
    );
    setSizesInCart(new Set(forThisShoe.map((i) => normalizeSize(i.size))));
  }, [shoe.id]);

  useEffect(() => {
    fetchCartSizes();
  }, [fetchCartSizes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/profile/purchases", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const p = list.find((x: { shoe_id: string; has_reviewed: boolean }) => x.shoe_id === shoe.id);
      if (!cancelled && p && !p.has_reviewed) setCanReview(true);
    })();
    return () => { cancelled = true; };
  }, [shoe.id]);

  const availableStockRows = useMemo(
    () => stockRows.filter((r) => availableQty(r) > 0),
    [stockRows]
  );

  const availableSizes = useMemo(
    () => new Set(availableStockRows.map((r) => normalizeSize(r.size))),
    [availableStockRows]
  );

  const priceBySize = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of availableStockRows) {
      const size = normalizeSize(r.size);
      const p = salePrice(shoe.msrp, r.sale_percent ?? 0);
      if (map[size] === undefined || p < map[size]) map[size] = p;
    }
    return map;
  }, [shoe.msrp, availableStockRows]);

  const salePercentBySize = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of availableStockRows) {
      const size = normalizeSize(r.size);
      const p = r.sale_percent ?? 0;
      if (p > (map[size] ?? 0)) map[size] = p;
    }
    return map;
  }, [availableStockRows]);

  const onSale = availableStockRows.some((r) => (r.sale_percent ?? 0) > 0);
  const minPrice = Object.keys(priceBySize).length > 0 ? Math.min(...Object.values(priceBySize)) : shoe.msrp;
  const displayPrice = selectedSize && priceBySize[selectedSize] !== undefined ? priceBySize[selectedSize] : minPrice;
  const isDisplayPriceOnSale = displayPrice < shoe.msrp;
  const discountPercent = onSale && shoe.msrp > 0 ? Math.round((1 - minPrice / shoe.msrp) * 100) : 0;
  const salePriceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayPrice);
  const originalPriceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(shoe.msrp);

  const handleAddToCart = useCallback(
    async (size: string, quantity: number) => {
      const qty = Math.max(1, Math.min(99, quantity));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setAdding(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ shoe_id: shoe.id, size, quantity: qty }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? "Failed to add to cart");
        }
        const unitPrice = priceBySize[normalizeSize(size)] ?? shoe.msrp;
        setAddedModal({ size, unitPrice, quantity: qty });
        await fetchStock();
        await fetchCartSizes();
        router.refresh();
      } catch {
        // Keep state; could show toast
      } finally {
        setAdding(false);
      }
    },
    [shoe.id, router, priceBySize, shoe.msrp, fetchStock, fetchCartSizes]
  );

  return (
    <>
    <div className="flex flex-col gap-8 bg-[#f4f4f4] pb-8 pt-4 lg:flex-row lg:gap-12">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#E9E9EB] lg:max-w-[560px]">
        {onSale && discountPercent > 0 && (
          <SaleSticker discountPercent={discountPercent} size="md" />
        )}
        <Image
          src={imageSrc}
          alt={shoe.shoe_name}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 560px"
          unoptimized={imageSrc.startsWith("/")}
        />
      </div>
      <div className="flex flex-1 flex-col">
        <h1 className="font-cabinet text-2xl font-bold uppercase tracking-wide text-[#181818] lg:text-3xl">
          {shoe.shoe_name}
        </h1>
        <div className="mt-2 flex items-baseline gap-2 font-space-grotesk text-[16px] font-medium leading-[24px] tracking-normal">
          {isDisplayPriceOnSale ? (
            <>
              <span className="text-[#DB4444]">{salePriceFormatted}</span>
              <span className="font-space-grotesk text-[16px] font-medium leading-[24px] tracking-normal text-[#000000] line-through opacity-50">{originalPriceFormatted}</span>
              {!selectedSize && Object.keys(priceBySize).length > 1 && (
                <span className="font-normal text-neutral-600">and up</span>
              )}
            </>
          ) : (
            <span className="font-bold text-[#181818]">{salePriceFormatted}</span>
          )}
        </div>
        <div className="mt-6">
          <ShoeSizeSelector
            availableSizes={availableSizes}
            sizesInCart={sizesInCart}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            onAddToCart={handleAddToCart}
            disabled={adding}
            salePercentBySize={salePercentBySize}
          />
        </div>
        <ReviewFeed shoeId={shoe.id} canReview={canReview} />
      </div>
    </div>

    {addedModal && (
      <AddedToBagModal
        open={true}
        onClose={() => setAddedModal(null)}
        shoeName={shoe.shoe_name}
        shoeImage={shoe.display_image}
        msrp={shoe.msrp}
        unitPrice={addedModal.unitPrice}
        size={addedModal.size}
        gender={shoe.gender}
        age={shoe.age}
      />
    )}
    </>
  );
}
