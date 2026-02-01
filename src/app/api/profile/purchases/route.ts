import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** GET /api/profile/purchases - list shoes the user has purchased (for review eligibility). */
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: orders } = await supabase.from("orders").select("id").eq("user_id", user.id);
  const orderIds = (orders ?? []).map((o) => o.id);
  if (orderIds.length === 0) return NextResponse.json([]);

  const { data: orderItems } = await supabase.from("order_items").select("shoe_id").in("order_id", orderIds);
  const shoeIds = [...new Set((orderItems ?? []).map((i) => i.shoe_id))];
  if (shoeIds.length === 0) return NextResponse.json([]);

  const { data: reviews } = await supabase.from("reviews").select("shoe_id").eq("user_id", user.id);
  const reviewedShoeIds = new Set((reviews ?? []).map((r) => r.shoe_id));

  const { data: shoes } = await supabase.from("shoes").select("id, shoe_name, display_image").in("id", shoeIds);
  const shoeMap = new Map((shoes ?? []).map((s) => [s.id, s]));

  const { data: lastOrderItems } = await supabase.from("order_items").select("shoe_id, order_id").in("order_id", orderIds);
  const orderByOrderId = new Map<string, string>();
  for (const o of orders ?? []) orderByOrderId.set(o.id, o.id);
  const { data: orderRows } = await supabase.from("orders").select("id, created_at").in("id", orderIds);
  const orderDateById = new Map((orderRows ?? []).map((o) => [o.id, (o as { created_at?: string }).created_at ?? ""]));
  const shoeToOrderDate = new Map<string, string>();
  for (const oi of lastOrderItems ?? []) {
    const orderId = (oi as { order_id?: string }).order_id;
    const date = orderId ? orderDateById.get(orderId) : "";
    const sid = (oi as { shoe_id: string }).shoe_id;
    if (sid && date) shoeToOrderDate.set(sid, date);
  }

  const purchases = shoeIds.map((shoeId) => {
    const shoe = shoeMap.get(shoeId);
    return {
      shoe_id: shoeId,
      shoe_name: shoe?.shoe_name ?? "",
      display_image: shoe?.display_image ?? null,
      order_date: shoeToOrderDate.get(shoeId) ?? "",
      has_reviewed: reviewedShoeIds.has(shoeId),
    };
  });
  return NextResponse.json(purchases);
}
