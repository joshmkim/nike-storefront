"use client";

import { SaleSticker } from "@/components/SaleSticker";
import { useCallback, useState } from "react";

/** Men's sizes M 6 - M 15 (half steps). W equivalent is M + 1.5 (W 7.5 - W 16.5). */
const MEN_SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15];

function normalizeSize(s: string): string {
  const n = parseFloat(s);
  if (Number.isNaN(n)) return s.trim();
  return n % 1 === 0 ? String(Math.round(n)) : String(n);
}

type ShoeSizeSelectorProps = {
  /** Set of sizes that have stock (normalized). */
  availableSizes: Set<string>;
  /** Set of sizes the user already has in cart for this shoe (grey out / "In your cart"). */
  sizesInCart?: Set<string>;
  /** Controlled selected size (optional). */
  selectedSize?: string | null;
  /** Called when user selects a size (optional, for parent to sync price). */
  onSelectSize?: (size: string) => void;
  /** Called with (size, quantity) when user adds to cart. */
  onAddToCart?: (size: string, quantity: number) => void;
  disabled?: boolean;
  /** Per-size sale percent (normalized size -> percent). Show small sticker on sizes on sale. */
  salePercentBySize?: Record<string, number>;
};

export function ShoeSizeSelector({ availableSizes, sizesInCart = new Set(), selectedSize: controlledSize, onSelectSize, onAddToCart, disabled = false, salePercentBySize = {} }: ShoeSizeSelectorProps) {
  const [internalSize, setInternalSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const selectedSize = controlledSize ?? internalSize;

  const setSelectedSize = useCallback(
    (size: string) => {
      setInternalSize(size);
      onSelectSize?.(size);
    },
    [onSelectSize]
  );

  const canAddSelected = selectedSize && availableSizes.has(selectedSize);
  const handleAddToCart = useCallback(() => {
    if (canAddSelected) {
      onAddToCart?.(selectedSize!, quantity);
    }
  }, [selectedSize, quantity, canAddSelected, onAddToCart]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-cabinet text-sm font-bold uppercase text-neutral-600">
          Select Size (M)
        </span>
        <span className="text-xs text-neutral-500">UK · US M · US W</span>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {MEN_SIZES.map((size) => {
          const sizeStr = normalizeSize(String(size));
          const available = availableSizes.has(sizeStr);
          const inCart = sizesInCart.has(sizeStr);
          const selected = selectedSize === sizeStr;
          const salePercent = salePercentBySize[sizeStr] ?? 0;
          const sizeOnSale = available && salePercent > 0;
          const wSize = size + 1.5; // W equivalent
          const wStr = wSize % 1 === 0 ? String(wSize) : String(wSize);
          const title = !available ? "Out of stock" : inCart ? `M ${size} (W ${wStr}) · In your cart` : `M ${size} (W ${wStr})`;
          return (
            <button
              key={size}
              type="button"
              disabled={!available}
              onClick={() => available && setSelectedSize(sizeStr)}
              className={`relative flex flex-col items-center justify-center rounded border-2 px-3 py-2.5 text-center font-cabinet text-sm font-bold transition-colors ${
                !available
                  ? "cursor-not-allowed border-neutral-200 bg-neutral-200 text-neutral-500 opacity-75"
                  : selected
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-500"
              }`}
              title={title}
            >
              {sizeOnSale && (
                <SaleSticker discountPercent={salePercent} size="xs" />
              )}
              <span className={!available ? "line-through" : undefined}>M {size}</span>
              <span className={`text-[10px] ${selected ? "text-neutral-300" : !available ? "text-neutral-500 line-through" : "text-neutral-500"}`}>
                W {wStr}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-cabinet text-sm font-bold uppercase text-neutral-600">
          Quantity
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="rounded border border-neutral-300 bg-white px-3 py-2 font-space-grotesk text-sm"
            aria-label="Quantity"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={disabled || !canAddSelected}
          onClick={handleAddToCart}
          className="flex-1 min-w-[140px] rounded-full bg-neutral-900 px-6 py-4 font-cabinet text-lg font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Adding…" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
