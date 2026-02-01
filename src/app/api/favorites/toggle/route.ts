import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** POST /api/favorites/toggle - add or remove a shoe from user favorites. Body: { shoeId }. Returns { favorited: boolean }. */
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { shoeId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const shoeId = body.shoeId;
  if (!shoeId) return NextResponse.json({ error: "shoeId required" }, { status: 400 });

  const { data: existing } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("shoe_id", shoeId)
    .maybeSingle();

  if (existing) {
    await supabase.from("user_favorites").delete().eq("id", existing.id);
    return NextResponse.json({ favorited: false });
  }
  const { error: insertError } = await supabase.from("user_favorites").insert({
    user_id: user.id,
    shoe_id: shoeId,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json({ favorited: true });
}
