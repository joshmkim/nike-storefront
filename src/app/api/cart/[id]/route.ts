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

/** DELETE /api/cart/[id] - remove cart item and release reserved stock. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: cartItemId } = await params;
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!cartItemId) return NextResponse.json({ error: "Missing cart item id" }, { status: 400 });

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: item, error: fetchError } = await supabase.from("cart_items").select("shoe_id, size, color, quantity").eq("id", cartItemId).single();
  if (fetchError || !item) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

  const { data: stockRows } = await supabase.from("stock").select("id, size, reserved_quantity").eq("shoe_id", item.shoe_id).eq("color", item.color);
  const stockRow = (stockRows ?? []).find((r) => normalizeSize((r as { size?: string }).size ?? "") === normalizeSize(item.size)) as { id: string; reserved_quantity: number } | undefined;
  if (stockRow) {
    const newReserved = Math.max(0, (stockRow.reserved_quantity ?? 0) - item.quantity);
    await supabase.from("stock").update({ reserved_quantity: newReserved }).eq("id", stockRow.id);
  }
  const { error: deleteError } = await supabase.from("cart_items").delete().eq("id", cartItemId);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
