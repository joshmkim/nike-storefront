import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

type DiscountRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order_cents: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
};

/** POST /api/discount/validate - validate a discount code and return discount for given subtotal. Body: { code, subtotal_cents? }. */
export async function POST(request: Request) {
  let body: { code?: string; subtotal_cents?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const code = body.code != null ? String(body.code).trim().toUpperCase() : "";
  const subtotalCents = Math.max(0, Math.round(Number(body.subtotal_cents) || 0));

  if (!code) {
    return NextResponse.json({ valid: false, message: "Enter a code" });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: row, error } = await supabase
    .from("discount_codes")
    .select("id, code, type, value, min_order_cents, valid_from, valid_until, max_uses, used_count")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const d = row as DiscountRow | null;
  if (!d) {
    return NextResponse.json({ valid: false, message: "Invalid code" });
  }
  const now = new Date().toISOString();
  if (d.valid_from && d.valid_from > now) {
    return NextResponse.json({ valid: false, message: "Code not yet valid" });
  }
  if (d.valid_until && d.valid_until < now) {
    return NextResponse.json({ valid: false, message: "Code expired" });
  }
  if (d.max_uses != null && d.used_count >= d.max_uses) {
    return NextResponse.json({ valid: false, message: "Code no longer available" });
  }
  if (d.min_order_cents && subtotalCents < d.min_order_cents) {
    const minDollars = (d.min_order_cents / 100).toFixed(0);
    return NextResponse.json({ valid: false, message: `Minimum order is $${minDollars}` });
  }

  let discountAmountCents = 0;
  if (d.type === "percent") {
    const pct = Math.min(100, Math.max(0, Number(d.value)));
    discountAmountCents = Math.round((subtotalCents * pct) / 100);
  } else if (d.type === "fixed") {
    const fixedCents = Math.max(0, Math.round(Number(d.value)));
    discountAmountCents = Math.min(fixedCents, subtotalCents);
  }
  return NextResponse.json({
    valid: true,
    message: "Code applied",
    type: d.type,
    value: d.value,
    discount_amount_cents: discountAmountCents,
    code: d.code,
  });
}
