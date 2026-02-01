import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function normalizeSize(s: string | number): string {
  const n = parseFloat(String(s));
  if (Number.isNaN(n)) return String(s).trim();
  return n % 1 === 0 ? String(Math.round(n)) : String(n);
}

/** POST /api/checkout - create order from cart, deduct stock, clear cart. Body: { discount_code?: string }. */
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { discount_code?: string };
  try { body = await request.json().catch(() => ({})); } catch { body = {}; }
  const discountCodeRaw = body.discount_code != null ? String(body.discount_code).trim().toUpperCase() : "";

  const { data: cartRows, error: cartError } = await supabase.from("cart_items").select("id, shoe_id, size, color, quantity").eq("user_id", user.id);
  if (cartError) return NextResponse.json({ error: cartError.message }, { status: 500 });
  const items = cartRows ?? [];
  if (items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const { data: shoeRows } = await supabase.from("shoes").select("id, msrp").in("id", items.map((i) => i.shoe_id));
  const msrpByShoe = new Map((shoeRows ?? []).map((s) => [s.id, s.msrp]));
  const { data: stockRows } = await supabase.from("stock").select("shoe_id, size, color, sale_percent").in("shoe_id", items.map((i) => i.shoe_id));
  const saleByKey = new Map((stockRows ?? []).map((s) => [`${s.shoe_id}:${normalizeSize(s.size)}:${s.color}`, s.sale_percent ?? 0]));
  let subtotalCents = 0;
  for (const it of items) {
    const msrp = msrpByShoe.get(it.shoe_id) ?? 0;
    const salePercent = saleByKey.get(`${it.shoe_id}:${normalizeSize(it.size)}:${it.color}`) ?? 0;
    const unitPrice = Math.round(msrp * (1 - salePercent / 100) * 100) / 100;
    subtotalCents += Math.round(unitPrice * it.quantity * 100);
  }

  let discountAmountCents = 0;
  let appliedCode = "";
  if (discountCodeRaw) {
    const { data: dRow } = await supabase.from("discount_codes").select("id, code, type, value, min_order_cents, valid_from, valid_until, max_uses, used_count").eq("code", discountCodeRaw).maybeSingle();
    const d = dRow as { id: string; type: string; value: number; min_order_cents: number; valid_from: string | null; valid_until: string | null; max_uses: number | null; used_count: number } | null;
    if (d) {
      const now = new Date().toISOString();
      if (!(d.valid_from && d.valid_from > now) && !(d.valid_until && d.valid_until < now) && (d.max_uses == null || d.used_count < d.max_uses) && (d.min_order_cents == null || subtotalCents >= d.min_order_cents)) {
        if (d.type === "percent") {
          const pct = Math.min(100, Math.max(0, Number(d.value)));
          discountAmountCents = Math.round((subtotalCents * pct) / 100);
        } else if (d.type === "fixed") {
          const fixedCents = Math.max(0, Math.round(Number(d.value)));
          discountAmountCents = Math.min(fixedCents, subtotalCents);
        }
        appliedCode = discountCodeRaw;
        await supabase.from("discount_codes").update({ used_count: d.used_count + 1 }).eq("id", d.id);
      }
    }
  }

  let orderId: string | null = null;
  const { data: order, error: orderErr } = await supabase.from("orders").insert({
    user_id: user.id,
    discount_code: appliedCode || null,
    discount_amount_cents: discountAmountCents,
  }).select("id").single();
  if (!orderErr && order?.id) {
    orderId = order.id;
    const { data: shoeRows } = await supabase.from("shoes").select("id, msrp").in("id", items.map((i) => i.shoe_id));
    const msrpByShoe = new Map((shoeRows ?? []).map((s) => [s.id, s.msrp]));
    const { data: stockRows } = await supabase.from("stock").select("shoe_id, size, color, sale_percent").in("shoe_id", items.map((i) => i.shoe_id));
    const saleByKey = new Map((stockRows ?? []).map((s) => [`${s.shoe_id}:${normalizeSize(s.size)}:${s.color}`, s.sale_percent ?? 0]));
    for (const it of items) {
      const msrp = msrpByShoe.get(it.shoe_id) ?? 0;
      const salePercent = saleByKey.get(`${it.shoe_id}:${normalizeSize(it.size)}:${it.color}`) ?? 0;
      const unitPrice = Math.round(msrp * (1 - salePercent / 100) * 100) / 100;
      const { error: oiErr } = await supabase.from("order_items").insert({ order_id: orderId!, shoe_id: it.shoe_id, size: it.size, color: it.color, quantity: it.quantity, unit_price: unitPrice });
      if (oiErr) return NextResponse.json({ error: oiErr.message }, { status: 500 });
    }
  }

  for (const it of items) {
    const { data: stockRows } = await supabase.from("stock").select("id, size, quantity, reserved_quantity").eq("shoe_id", it.shoe_id).eq("color", it.color);
    const match = (stockRows ?? []).find((r) => normalizeSize((r as { size?: string }).size ?? "") === normalizeSize(it.size)) as { id: string; quantity: number; reserved_quantity: number } | undefined;
    if (match) {
      const newQty = Math.max(0, match.quantity - it.quantity);
      const newRes = Math.max(0, (match.reserved_quantity ?? 0) - it.quantity);
      await supabase.from("stock").update({ quantity: newQty, reserved_quantity: newRes }).eq("id", match.id);
    }
  }
  await supabase.from("cart_items").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
