import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** POST /api/reviews - submit a review (auth required; user must have purchased the shoe). */
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { shoe_id?: string; rating?: number; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const shoeId = body.shoe_id;
  const rating = Math.min(5, Math.max(1, Math.round(body.rating ?? 5)));
  const text = body.text != null ? String(body.text).trim() : "";

  if (!shoeId) {
    return NextResponse.json({ error: "shoe_id required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("shoe_id", shoeId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this product." }, { status: 400 });
  }

  const { data: ordersForUser } = await supabase.from("orders").select("id").eq("user_id", user.id);
  const orderIds = (ordersForUser ?? []).map((o) => o.id);
  const { data: userOrderItems } =
    orderIds.length > 0
      ? await supabase.from("order_items").select("shoe_id").in("order_id", orderIds)
      : { data: [] };
  const purchasedShoeIds = new Set((userOrderItems ?? []).map((i) => i.shoe_id));
  if (!purchasedShoeIds.has(shoeId)) {
    return NextResponse.json({ error: "You can only review products you have purchased." }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    shoe_id: shoeId,
    user_id: user.id,
    rating,
    text: text || null,
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
