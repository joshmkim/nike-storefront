import { StorefrontLayout } from "@/components/StorefrontLayout";
import { supabase } from "@/lib/supabase";
import type { Shoe } from "@/types/database";

export default async function Home() {
  let shoes: Shoe[] = [];
  try {
    const { data } = await supabase
      .from("shoes")
      .select("id, shoe_name, display_image, gender, age, msrp, created_at, updated_at")
      .order("created_at", { ascending: false });
    shoes = (data ?? []) as Shoe[];
  } catch {
    shoes = [];
  }

  return <StorefrontLayout shoes={shoes} />;
}
