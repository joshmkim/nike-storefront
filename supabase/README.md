# Supabase schema

## Tables

- **shoes** – One row per shoe product (model). Columns: `id`, `shoe_name`, `display_image`, `gender`, `age`, `msrp`, timestamps. No `sale_percent` here; that is per stock variant.
- **stock** – One row per size/color. Columns: `shoe_id`, `size`, `color`, `quantity`, `sale_percent`. `sale_percent` is per variant (e.g. one color on sale). Unique on `(shoe_id, size, color)`.
- **user_favorites** – Favorited is per shoe (product), not per stock. One row per user per shoe: `user_id`, `shoe_id`. Requires Supabase Auth.

## Run the migration

1. In the [Supabase Dashboard](https://supabase.com/dashboard), open your project.
2. Go to **SQL Editor** and run the contents of `supabase/migrations/20250130000000_create_shoes_and_stock.sql` (copy/paste or run the file).

Or with the Supabase CLI (if linked):

```bash
supabase db push
```

## Seed dummy data

After the tables exist, run `supabase/seed_dummy_data.sql` in the SQL Editor to insert sample shoes and stock. It adds 5 shoes and several size/color variants (some with `sale_percent`). `display_image` uses `/assets/Sport Shoes.png`; replace with Supabase Storage URLs when you upload real images.

## RLS

- `shoes` and `stock`: public read (anyone can list products and stock).
- `user_favorites`: users can only select/insert/delete their own rows (`auth.uid() = user_id`).

Favorites require signed-in users (Supabase Auth). Until you add auth, the storefront can still read shoes and stock; favorite buttons can be no-ops or redirect to login.
