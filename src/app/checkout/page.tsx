"use client";

import { StorefrontLayout } from "@/components/StorefrontLayout";
import { supabase } from "@/lib/supabase";
import { salePrice } from "@/types/database";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CartItem = { shoe_id: string; size: string; quantity: number; msrp: number; sale_percent?: number };

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discount_amount_cents: number } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }
    const res = await fetch("/api/cart", { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!res.ok) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }
    const data = await res.json();
    setCartItems(Array.isArray(data) ? data : []);
    setCartLoading(false);
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const subtotalCents = cartItems.reduce((sum, i) => sum + Math.round(salePrice(i.msrp, i.sale_percent ?? 0) * i.quantity * 100), 0);
  const discountCents = appliedDiscount?.discount_amount_cents ?? 0;
  const totalCents = Math.max(0, subtotalCents - discountCents);

  const handleApplyDiscount = useCallback(async () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) {
      setDiscountError("Enter a code");
      return;
    }
    setDiscountError(null);
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal_cents: subtotalCents }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.valid && data.discount_amount_cents != null) {
        setAppliedDiscount({ code: data.code ?? code, discount_amount_cents: data.discount_amount_cents });
      } else {
        setAppliedDiscount(null);
        setDiscountError((data as { message?: string }).message ?? "Invalid code");
      }
    } catch {
      setDiscountError("Could not validate code");
      setAppliedDiscount(null);
    }
  }, [discountInput, subtotalCents]);

  const handleCheckout = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body = appliedDiscount ? { discount_code: appliedDiscount.code } : {};
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Checkout failed");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Checkout failed");
    } finally {
      setLoading(false);
    }
  }, [router, appliedDiscount]);

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1280px] px-6 pb-16 pt-8">
        <h1 className="font-cabinet text-2xl font-bold uppercase tracking-wide text-[#181818]">Checkout</h1>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          <div className="space-y-10">
            <section className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="font-cabinet text-lg font-bold uppercase tracking-wide text-[#181818]">Contact</h2>
              <div className="mt-4">
                <label htmlFor="checkout-email" className="block font-cabinet text-sm font-bold text-neutral-700">Email</label>
                <input
                  id="checkout-email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400"
                  aria-label="Email (optional)"
                />
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="font-cabinet text-lg font-bold uppercase tracking-wide text-[#181818]">Shipping address</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="checkout-name" className="block font-cabinet text-sm font-bold text-neutral-700">Full name</label>
                  <input id="checkout-name" type="text" placeholder="First and last name" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="Full name (optional)" />
                </div>
                <div>
                  <label htmlFor="checkout-address1" className="block font-cabinet text-sm font-bold text-neutral-700">Address</label>
                  <input id="checkout-address1" type="text" placeholder="Street address" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="Address (optional)" />
                </div>
                <div>
                  <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="Address line 2 (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="checkout-city" className="block font-cabinet text-sm font-bold text-neutral-700">City</label>
                    <input id="checkout-city" type="text" placeholder="City" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="City (optional)" />
                  </div>
                  <div>
                    <label htmlFor="checkout-state" className="block font-cabinet text-sm font-bold text-neutral-700">State</label>
                    <input id="checkout-state" type="text" placeholder="State" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="State (optional)" />
                  </div>
                  <div>
                    <label htmlFor="checkout-zip" className="block font-cabinet text-sm font-bold text-neutral-700">ZIP</label>
                    <input id="checkout-zip" type="text" placeholder="ZIP" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="ZIP (optional)" />
                  </div>
                </div>
                <div>
                  <label htmlFor="checkout-country" className="block font-cabinet text-sm font-bold text-neutral-700">Country</label>
                  <input id="checkout-country" type="text" placeholder="Country" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="Country (optional)" />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="font-cabinet text-lg font-bold uppercase tracking-wide text-[#181818]">Payment</h2>
              <p className="mt-1 text-sm text-neutral-500">All transactions are secure. This form is for display only.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="checkout-card-name" className="block font-cabinet text-sm font-bold text-neutral-700">Name on card</label>
                  <input id="checkout-card-name" type="text" placeholder="Name as it appears on card" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="Name on card (optional)" />
                </div>
                <div>
                  <label htmlFor="checkout-card-number" className="block font-cabinet text-sm font-bold text-neutral-700">Card number</label>
                  <input id="checkout-card-number" type="text" placeholder="1234 5678 9012 3456" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="Card number (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-expiry" className="block font-cabinet text-sm font-bold text-neutral-700">Expiry</label>
                    <input id="checkout-expiry" type="text" placeholder="MM / YY" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="Expiry (optional)" />
                  </div>
                  <div>
                    <label htmlFor="checkout-cvv" className="block font-cabinet text-sm font-bold text-neutral-700">CVV</label>
                    <input id="checkout-cvv" type="text" placeholder="123" className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900 placeholder:text-neutral-400" aria-label="CVV (optional)" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="font-cabinet text-lg font-bold uppercase tracking-wide text-[#181818]">Order summary</h2>
              {cartLoading ? (
                <p className="mt-2 text-sm text-neutral-500">Loading cart…</p>
              ) : (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Subtotal</span>
                      <span className="font-cabinet font-bold text-[#181818]">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(subtotalCents / 100)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                        placeholder="Discount code"
                        className="flex-1 rounded border border-neutral-300 px-3 py-2 font-cabinet text-sm text-neutral-900 placeholder:text-neutral-400"
                        aria-label="Discount code"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        className="shrink-0 rounded-full border-2 border-neutral-900 bg-transparent px-4 py-2 font-cabinet text-sm font-bold uppercase text-neutral-900 hover:bg-neutral-900 hover:text-white"
                      >
                        Apply
                      </button>
                    </div>
                    {discountError && <p className="text-sm text-red-600">{discountError}</p>}
                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-green-700">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span className="font-cabinet font-bold">
                          -{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(appliedDiscount.discount_amount_cents / 100)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
                      <span className="font-cabinet font-bold text-[#181818]">Total</span>
                      <span className="font-cabinet font-bold text-[#181818]">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(totalCents / 100)}
                      </span>
                    </div>
                  </div>
                </>
              )}
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || cartLoading || cartItems.length === 0}
                className="mt-6 w-full rounded-full bg-neutral-900 px-6 py-4 font-cabinet text-base font-bold uppercase text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Processing…" : "Place order"}
              </button>
              <p className="mt-3 text-center text-xs text-neutral-500">Form fields above are optional and for display only.</p>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
