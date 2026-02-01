"use client";

import { StorefrontLayout } from "@/components/StorefrontLayout";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Purchase = {
  shoe_id: string;
  shoe_name: string;
  display_image: string | null;
  order_date: string;
  has_reviewed: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { avatar_url?: string } } | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session.user ?? null);
    const res = await fetch("/api/profile/purchases", { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (res.ok) {
      const data = await res.json();
      setPurchases(Array.isArray(data) ? data : []);
    } else {
      setPurchases([]);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f4f4f4] flex items-center justify-center">
        <p className="font-cabinet text-neutral-500">Loading…</p>
      </div>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1280px] px-6 pb-16 pt-8">
        <h1 className="font-cabinet text-2xl font-bold uppercase tracking-wide text-[#181818]">Profile</h1>

        <div className="mt-8 flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
          <section className="shrink-0">
            <div className="flex flex-col items-start gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-[#E9E9EB]">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#4A4C6C] font-cabinet text-2xl font-bold text-white">
                    {user?.email?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <div>
                <p className="font-cabinet text-sm font-bold uppercase text-neutral-500">Email</p>
                <p className="mt-1 font-cabinet text-lg text-[#181818]">{user?.email ?? "—"}</p>
              </div>
            </div>
          </section>

          <section className="min-w-0 flex-1">
            <h2 className="font-cabinet text-xl font-bold uppercase tracking-wide text-[#181818]">Shoes purchased</h2>
            {purchases.length === 0 ? (
              <p className="mt-4 font-cabinet text-neutral-600">No purchases yet. Your order history will appear here.</p>
            ) : (
              <ul className="mt-6 space-y-8">
                {purchases.map((p) => (
                  <li key={p.shoe_id} className="rounded-lg border border-neutral-200 bg-white p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                      <Link href={`/shoe/${p.shoe_id}`} className="flex shrink-0 items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded bg-[#E9E9EB]">
                          <Image
                            src={p.display_image || "/assets/Sport Shoes.png"}
                            alt={p.shoe_name}
                            fill
                            className="object-contain"
                            unoptimized={(p.display_image ?? "").startsWith("/")}
                          />
                        </div>
                        <div>
                          <p className="font-cabinet font-bold text-[#181818] hover:underline">{p.shoe_name}</p>
                          <p className="mt-0.5 text-sm text-neutral-500">
                            Purchased {p.order_date ? new Date(p.order_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                          </p>
                        </div>
                      </Link>
                      <div className="min-w-0 flex-1 sm:ml-0">
                        {p.has_reviewed ? (
                          <p className="font-cabinet text-sm font-bold uppercase text-neutral-500">Reviewed</p>
                        ) : (
                          <ReviewForm shoeId={p.shoe_id} shoeName={p.shoe_name} onSubmitted={load} />
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </StorefrontLayout>
  );
}

function ReviewForm({
  shoeId,
  shoeName,
  onSubmitted,
}: {
  shoeId: string;
  shoeName: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ shoe_id: shoeId, rating, text: text.trim() || undefined }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError((data as { error?: string }).error ?? "Failed to submit review");
          return;
        }
        setText("");
        setRating(5);
        onSubmitted();
      } finally {
        setSubmitting(false);
      }
    },
    [shoeId, rating, text, onSubmitted]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="font-cabinet text-sm font-bold uppercase text-neutral-600">Write a review</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={star <= rating ? "#EAB308" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className={`h-6 w-6 ${star <= rating ? "text-amber-400" : "text-neutral-300 hover:text-amber-400"}`}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Optional: share your experience..."
        rows={3}
        className="w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-sm text-neutral-900 placeholder:text-neutral-400"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-neutral-900 px-5 py-2.5 font-cabinet text-sm font-bold uppercase text-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
