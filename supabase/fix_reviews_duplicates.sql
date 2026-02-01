-- Run this once in Supabase SQL Editor if the reviews_one_per_user_shoe migration failed due to duplicates.
-- 1. Drop the constraint if it was partially created or you want to retry.
-- 2. Delete duplicate reviews (keep one per user_id, shoe_id: earliest created_at, then smallest id).
-- 3. Add the unique constraint.

alter table public.reviews drop constraint if exists reviews_one_per_user_shoe;

delete from public.reviews a
using public.reviews b
where a.user_id = b.user_id
  and a.shoe_id = b.shoe_id
  and (a.created_at > b.created_at or (a.created_at = b.created_at and a.id > b.id));

alter table public.reviews add constraint reviews_one_per_user_shoe unique (user_id, shoe_id);
