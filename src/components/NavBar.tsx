"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { HeartIcon, CartIcon, UserIcon } from "./icons";
import { supabase } from "@/lib/supabase";

export type NavLinkItem = { href: string; label: string };

const DEFAULT_LINKS: NavLinkItem[] = [
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/kids", label: "Kids" },
  { href: "/classics", label: "Classics" },
  { href: "/sport", label: "Sport" },
  { href: "/sale", label: "Sale" },
];

export type NavBarProps = {
  /** Which nav link is active (matches label, case-insensitive). */
  activeLink?: string;
  /** Nav links; defaults to Women, Men, Kids, etc. */
  links?: NavLinkItem[];
  /** Logo link href; defaults to "/". */
  logoHref?: string;
  /** Optional cart count badge (overrides fetched count when provided). */
  cartCount?: number;
  className?: string;
};

export function NavBar({
  activeLink,
  links = DEFAULT_LINKS,
  logoHref = "/",
  cartCount: cartCountProp,
  className = "",
}: NavBarProps) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.access_token) {
        const res = await fetch("/api/cart", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const items = await res.json();
          const total = items.reduce((sum: number, i: { quantity?: number }) => sum + (i.quantity ?? 1), 0);
          setCartCount(total);
        } else {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => subscription.unsubscribe();
  }, []);

  const displayCartCount = cartCountProp != null ? cartCountProp : cartCount;

  return (
    <nav
      className={`font-space-grotesk mx-auto flex h-[64.5px] w-[1354px] flex-none flex-row items-center gap-[752px] px-[43px] pb-[20px] pt-[20px] text-[16px] font-bold leading-[100%] tracking-normal text-[#181818] outline-none ${className}`}
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-10">
        <Link
          href={logoHref}
          className="flex items-center hover:opacity-90"
          aria-label="Home"
        >
          <Image
            src="/assets/logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 object-contain brightness-0"
          />
        </Link>
        <ul className="flex gap-6 font-bold">
          {links.map(({ href, label }) => {
            const isActive =
              activeLink != null &&
              activeLink.toLowerCase() === label.toLowerCase();
            return (
              <li key={label}>
                <Link
                  href={href}
                  className={
                    isActive
                      ? "font-bold text-[#181818] underline underline-offset-4"
                      : "font-bold text-[#181818] hover:text-[#181818]"
                  }
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Icons: 24×24px each, gap 10px */}
      <div className="flex items-center gap-[10px]">
        <Link
          href="/favorites"
          aria-label="Wishlist / Favorites"
          className="flex h-6 w-6 items-center justify-center hover:opacity-80"
        >
          <HeartIcon className="h-6 w-6 fill-transparent stroke-neutral-700" />
        </Link>
        <Link
          href="/cart"
          aria-label="Cart"
          className="relative flex h-6 w-6 items-center justify-center hover:opacity-80"
        >
          <CartIcon className="h-6 w-6 text-neutral-700" />
          {displayCartCount > 0 && (
            <span
              className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium text-white"
              aria-hidden
            >
              {displayCartCount > 99 ? "99+" : displayCartCount}
            </span>
          )}
        </Link>
        <Link
          href={user ? "/profile" : "/login"}
          aria-label={user ? "Profile" : "Log in"}
          className="flex h-6 w-6 items-center justify-center hover:opacity-80"
        >
          <UserIcon className="h-6 w-6 text-neutral-700" />
        </Link>
      </div>
    </nav>
  );
}
