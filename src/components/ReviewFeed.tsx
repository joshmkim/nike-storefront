"use client";

import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

type Review = {
  id: string;
  user_id: string;
  text: string | null;
  rating: number;
  created_at: string;
  display_name: string;
};

type ReviewFeedProps = {
  shoeId: string;
  /** If true, show "Write a review" form (user has purchased and not yet reviewed). */
  canReview?: boolean;
  onReviewSubmitted?: () => void;
};

export function ReviewFeed({ shoeId, canReview = false, onReviewSubmitted }: ReviewFeedProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/shoes/${shoeId}/reviews`);
    if (!res.ok) return;
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
  }, [shoeId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchReviews();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchReviews]);

  const handleSubmit = useCallback(async () => {
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
        setError(data?.error ?? "Failed to submit review");
        return;
      }
      setText("");
      setRating(5);
      await fetchReviews();
      onReviewSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  }, [shoeId, rating, text, fetchReviews, onReviewSubmitted]);

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div id="reviews" className="mt-10 border-t border-neutral-200 pt-8 scroll-mt-4">
      <h2 className="font-cabinet text-xl font-bold uppercase tracking-wide text-[#181818]">
        Reviews
      </h2>

      {canReview && (
        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="mb-3 font-cabinet text-sm font-bold text-neutral-700">
            Write a review (you purchased this shoe)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-space-grotesk text-sm text-neutral-600">
              Rating:
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="rounded border border-neutral-300 bg-white px-2 py-1"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="text"
              placeholder="Your review (optional)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-w-[200px] flex-1 rounded border border-neutral-300 bg-white px-3 py-2 font-space-grotesk text-sm"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-neutral-900 px-4 py-2 font-cabinet text-sm font-bold uppercase text-white disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

      <div
        className="mt-4 max-h-[320px] overflow-y-auto rounded-lg border border-neutral-200 bg-white"
        style={{ scrollBehavior: "smooth" }}
      >
        {loading ? (
          <div className="flex items-center justify-center p-8 text-neutral-500">
            Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center font-space-grotesk text-sm text-neutral-500">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {reviews.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-cabinet text-sm font-bold text-[#181818]">
                    {r.display_name}
                  </span>
                  <span className="text-yellow-500" aria-label={`${r.rating} stars`}>
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </span>
                  <span className="font-space-grotesk text-xs text-neutral-400">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                {r.text && (
                  <p className="mt-1 font-space-grotesk text-sm text-neutral-700">{r.text}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
