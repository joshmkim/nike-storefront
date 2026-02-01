"use client";

import { StorefrontLayout } from "@/components/StorefrontLayout";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          setError(err.message);
          return;
        }
        router.push("/");
        router.refresh();
      } catch {
        setError("Login failed");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1280px] border-b border-neutral-500 px-6 pb-12 pt-8">
        <h1 className="font-cabinet text-2xl font-bold uppercase tracking-wide text-[#181818]">Log in</h1>
        <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
          <div>
            <label htmlFor="email" className="block font-cabinet text-sm font-bold text-neutral-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-cabinet text-sm font-bold text-neutral-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-cabinet text-neutral-900"
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="rounded-full bg-neutral-900 px-6 py-3 font-cabinet font-bold uppercase text-white hover:opacity-90 disabled:opacity-50">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </StorefrontLayout>
  );
}
