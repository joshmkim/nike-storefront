"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AddedToBagModalProps = {
  open: boolean;
  onClose: () => void;
  /** Product that was just added */
  shoeName: string;
  shoeImage: string | null;
  msrp: number;
  /** Effective price when on sale (optional); used for display instead of msrp when set. */
  unitPrice?: number;
  /** Size that was added (men's), e.g. "13" */
  size: string;
  /** Optional: e.g. "Men's", "Women's", "Unisex" */
  gender?: string | null;
  /** Optional: e.g. "Adults", "Kids" */
  age?: string | null;
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function AddedToBagModal({
  open,
  onClose,
  shoeName,
  shoeImage,
  msrp,
  unitPrice,
  size,
  gender,
  age,
}: AddedToBagModalProps) {
  const [cartCount, setCartCount] = useState(0);
  const displayPrice = unitPrice ?? msrp;

  const loadCartCount = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch("/api/cart", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return;
    const items = await res.json();
    const total = items.reduce((sum: number, i: { quantity?: number }) => sum + (i.quantity ?? 1), 0);
    setCartCount(total);
  }, []);

  useEffect(() => {
    if (open) loadCartCount();
  }, [open, loadCartCount]);

  const wSize = (parseFloat(size) + 1.5).toString();
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayPrice);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="added-to-bag-title"
      >
        {/* Header: checkmark + title + close */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
              <CheckIcon className="h-5 w-5" />
            </span>
            <h2 id="added-to-bag-title" className="font-cabinet text-lg font-bold text-[#181818]">
              Added to Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 hover:text-[#181818]"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Product row: image + name, type, size, price */}
        <div className="mt-4 flex gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f4f4f4]">
            <Image
              src={shoeImage || "/assets/Sport Shoes.png"}
              alt={shoeName}
              fill
              className="object-contain"
              unoptimized={(shoeImage ?? "").startsWith("/")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-cabinet font-bold text-[#181818]">{shoeName}</p>
            <p className="mt-0.5 text-sm text-neutral-500">
              {(gender || "Unisex")} · {(age || "Adults")}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Size M {size} / W {wSize}
            </p>
            <p className={`mt-1 ${unitPrice != null && unitPrice < msrp ? "font-space-grotesk text-[16px] font-medium leading-[24px] tracking-normal text-[#DB4444]" : "font-cabinet font-bold text-[#181818]"}`}>
              {priceFormatted}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/cart"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-full border-2 border-[#181818] bg-white py-3 font-cabinet text-base font-bold text-[#181818] hover:bg-neutral-50"
          >
            View Bag ({cartCount})
          </Link>
          <Link
            href="/checkout"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-full bg-[#181818] py-3 font-cabinet text-base font-bold text-white hover:opacity-90"
          >
            Checkout
          </Link>
        </div>
      </div>
    </>
  );
}
