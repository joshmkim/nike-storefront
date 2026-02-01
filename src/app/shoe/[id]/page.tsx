import { ShoeDetailContent } from "@/components/ShoeDetailContent";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { supabase } from "@/lib/supabase";
import type { Shoe } from "@/types/database";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type StockRow = { size: string; color: string; quantity: number; reserved_quantity: number; sale_percent?: number | null };

export default async function ShoePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: shoe, error } = await supabase.from("shoes").select("*").eq("id", id).single();
  if (error || !shoe) notFound();
  const { data: stockRows } = await supabase.from("stock").select("id, size, color, quantity, reserved_quantity, sale_percent").eq("shoe_id", id);
  const rows = (stockRows ?? []) as StockRow[];

  return (
    <StorefrontLayout>
      <ShoeDetailContent shoe={shoe as Shoe} stockRows={rows} />
    </StorefrontLayout>
  );
}
