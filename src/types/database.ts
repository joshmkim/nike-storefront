export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shoes: {
        Row: {
          id: string;
          shoe_name: string;
          display_image: string | null;
          gender: string | null;
          age: string | null;
          msrp: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shoe_name: string;
          display_image?: string | null;
          gender?: string | null;
          age?: string | null;
          msrp: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shoe_name?: string;
          display_image?: string | null;
          gender?: string | null;
          age?: string | null;
          msrp?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock: {
        Row: {
          id: string;
          shoe_id: string;
          size: string;
          color: string;
          quantity: number;
          sale_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shoe_id: string;
          size: string;
          color: string;
          quantity?: number;
          sale_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shoe_id?: string;
          size?: string;
          color?: string;
          quantity?: number;
          sale_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          shoe_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          shoe_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          shoe_id?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Shoe = Database["public"]["Tables"]["shoes"]["Row"];
export type ShoeInsert = Database["public"]["Tables"]["shoes"]["Insert"];
export type ShoeUpdate = Database["public"]["Tables"]["shoes"]["Update"];

export type Stock = Database["public"]["Tables"]["stock"]["Row"];
export type StockInsert = Database["public"]["Tables"]["stock"]["Insert"];
export type StockUpdate = Database["public"]["Tables"]["stock"]["Update"];

export type UserFavorite = Database["public"]["Tables"]["user_favorites"]["Row"];
export type UserFavoriteInsert = Database["public"]["Tables"]["user_favorites"]["Insert"];
