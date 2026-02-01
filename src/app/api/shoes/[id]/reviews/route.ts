import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** GET /api/shoes/[id]/reviews - list reviews for a shoe (public). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: shoeId } = await params;
  if (!shoeId) return NextResponse.json({ error: "Missing shoe id" }, { status: 400 });
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.from("reviews").select("id, user_id, text, rating, created_at").eq("shoe_id", shoeId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = data ?? [];
  const items = rows.map((r) => ({ id: r.id, user_id: r.user_id, text: r.text, rating: r.rating, created_at: r.created_at, display_name: "Customer" }));
  return NextResponse.json(items);
}
