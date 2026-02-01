import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** GET /api/shoes/[id]/stock - return all stock rows for a shoe. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: shoeId } = await params;
  if (!shoeId) return NextResponse.json({ error: "Missing shoe id" }, { status: 400 });
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.from("stock").select("id, size, color, quantity, reserved_quantity, sale_percent").eq("shoe_id", shoeId).order("size", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
