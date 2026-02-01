"use client";

import { StorefrontLayout } from "@/components/StorefrontLayout";
import { supabase } from "@/lib/supabase";
import { salePrice } from "@/types/database";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CartItem = {
  id: string;
  shoe_id: string;
  size: string;
  quantity: number;
  shoe_name: string;
  display_image: string | null;
  msrp: number;
  sale_percent?: number;
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    const res = await fetch("/api/cart", { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!res.ok) {
      setItems([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const removeItem = useCallback(async (cartItemId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`/api/cart/${cartItemId}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.access_token}` } });
    loadCart();
    router.refresh();
  }, [loadCart, router]);

  const subtotal = items.reduce((sum, i) => sum + salePrice(i.msrp, i.sale_percent ?? 0) * i.quantity, 0);
  const subtotalFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(subtotal);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f4f4f4] flex items-center justify-center">
        <p className="font-cabinet text-neutral-500">Loading cart…</p>
      </div>
    );
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1280px] border-b border-neutral-500 px-6 pb-12 pt-8">
        <h1 className="font-cabinet text-2xl font-bold uppercase tracking-wide text-[#181818]">Your Cart</h1>
        {items.length === 0 ? (
          <p className="mt-6 font-cabinet text-[18px] text-neutral-600">
            Your cart is empty. <Link href="/" className="underline hover:no-underline">Continue shopping</Link>.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div className="flex-1 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-neutral-200 pb-6 last:border-0">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#E9E9EB]">
                    <Image src={item.display_image || "/assets/Sport Shoes.png"} alt={item.shoe_name} fill className="object-contain" unoptimized={(item.display_image ?? "").startsWith("/")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/shoe/${item.shoe_id}`} className="font-cabinet font-bold text-[#181818] hover:underline">{item.shoe_name}</Link>
                    <p className="mt-0.5 text-sm text-neutral-500">Size M {item.size} · Qty {item.quantity}</p>
                    <p className="mt-1 font-cabinet font-bold text-[#181818]">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(salePrice(item.msrp, item.sale_percent ?? 0) * item.quantity)}
                    </p>
                    <button type="button" onClick={() => removeItem(item.id)} className="mt-2 text-sm text-neutral-500 underline hover:text-neutral-900">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full shrink-0 lg:w-80">
              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <p className="font-cabinet text-sm font-bold uppercase text-neutral-600">Subtotal</p>
                <p className="mt-2 font-cabinet text-2xl font-bold text-[#181818]">{subtotalFormatted}</p>
                <Link href="/checkout" className="mt-4 block w-full rounded-full bg-neutral-900 py-3 text-center font-cabinet text-base font-bold uppercase text-white hover:opacity-90">Checkout</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
