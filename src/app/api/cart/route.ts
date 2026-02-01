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

/** GET /api/cart - list current user's cart (requires Authorization: Bearer token). */
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("cart_items").select("id, shoe_id, size, color, quantity, created_at, shoes(shoe_name, display_image, msrp)").eq("user_id", user.id).order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = data ?? [];
  const shoeIds = [...new Set(rows.map((r) => r.shoe_id))];
  const { data: stockRows } = await supabase.from("stock").select("shoe_id, size, color, sale_percent").in("shoe_id", shoeIds);
  const stockByKey = new Map<string, number>();
  for (const s of stockRows ?? []) {
    const key = `${s.shoe_id}:${normalizeSize((s as { size?: string }).size ?? "")}:${s.color}`;
    stockByKey.set(key, s.sale_percent ?? 0);
  }
  const items = rows.map((row) => {
    const shoe = Array.isArray(row.shoes) ? row.shoes[0] : row.shoes;
    const salePercent = stockByKey.get(`${row.shoe_id}:${normalizeSize(row.size)}:${row.color}`) ?? 0;
    return { id: row.id, shoe_id: row.shoe_id, size: row.size, quantity: row.quantity, created_at: row.created_at, shoe_name: shoe?.shoe_name ?? "", display_image: shoe?.display_image ?? null, msrp: shoe?.msrp ?? 0, sale_percent: salePercent };
  });
  return NextResponse.json(items);
}

/** POST /api/cart - add to cart. Body: { shoe_id, size, quantity? }. */
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { shoe_id?: string; size?: string; quantity?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const shoeId = body.shoe_id;
  const rawSize = body.size != null ? String(body.size).trim() : "";
  const size = rawSize ? normalizeSize(rawSize) : "";
  const quantity = Math.max(1, Math.min(99, body.quantity ?? 1));
  if (!shoeId || !size) return NextResponse.json({ error: "shoe_id and size required" }, { status: 400 });

  const { data: cartRows } = await supabase.from("cart_items").select("id, quantity, color, size").eq("user_id", user.id).eq("shoe_id", shoeId);
  const existing = (cartRows ?? []).find((r) => normalizeSize(r.size) === size) ?? null;

  if (existing) {
    const { data: stockRowsForColor } = await supabase.from("stock").select("id, size, quantity, reserved_quantity").eq("shoe_id", shoeId).eq("color", existing.color);
    const stockRow = (stockRowsForColor ?? []).find((r) => normalizeSize((r as { size?: string }).size ?? "") === size) as { id: string; quantity: number; reserved_quantity: number } | undefined;
    if (!stockRow) return NextResponse.json({ error: "Stock row not found for this size and color." }, { status: 400 });
    const available = (stockRow.quantity ?? 0) - (stockRow.reserved_quantity ?? 0);
    if (available < existing.quantity + quantity) return NextResponse.json({ error: "Not enough stock for this size and color." }, { status: 400 });
    await supabase.from("stock").update({ reserved_quantity: (stockRow.reserved_quantity ?? 0) + quantity }).eq("id", stockRow.id);
    await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
  } else {
    const { data: allStock } = await supabase.from("stock").select("id, size, color, quantity, reserved_quantity").eq("shoe_id", shoeId).order("id", { ascending: true });
    const row = (allStock ?? []).filter((r) => normalizeSize((r as { size?: string }).size ?? "") === size).find((r) => (r.quantity ?? 0) - (r.reserved_quantity ?? 0) >= quantity) as { id: string; size: string; color: string; quantity: number; reserved_quantity: number } | undefined;
    if (!row) return NextResponse.json({ error: "This size is out of stock." }, { status: 400 });
    await supabase.from("stock").update({ reserved_quantity: (row.reserved_quantity ?? 0) + quantity }).eq("id", row.id);
    const { error: insertError } = await supabase.from("cart_items").insert({ user_id: user.id, shoe_id: shoeId, size, color: row.color, quantity });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
