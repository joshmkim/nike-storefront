import { HeartIcon } from "@/components/icons";
import { NavBar } from "@/components/NavBar";
import type { Shoe } from "@/types/database";
import Image from "next/image";

type StorefrontLayoutProps = {
  activeLink?: string;
  /** Shoes from API/DB; when empty or missing, fallback placeholder list is used. */
  shoes?: Shoe[];
};

export function StorefrontLayout({ activeLink, shoes = [] }: StorefrontLayoutProps) {
  return (
    <div className="min-h-screen w-full min-w-full overflow-x-hidden bg-[#f4f4f4] font-sans text-neutral-900">
      <div className="mx-auto min-h-[2913.5px] max-w-[1440px]">
        {/* Top bar */}
        <header className="font-cabinet mb-[153px] flex min-h-[41px] w-full items-center justify-end gap-[10px] bg-[#4A4C6C] px-[596px] pb-[12px] pt-[12px]">
          <p className="whitespace-nowrap text-[14px] font-bold leading-[100%] tracking-normal text-[#FFFFFF]">
            New here? Save 20% with code: YR24
          </p>
        </header>

        <NavBar activeLink={activeLink} />

        {/* Hero section – shoe and shadow are separate (shadow not grouped with shoe) */}
        <section className="relative flex min-h-[1058px] min-w-[1279px] items-center justify-center bg-[#f4f4f4] pl-[63px] py-16 md:py-24">
          <Image
            src="/assets/Sport Shoes.png"
            alt="Sport shoe"
            width={753}
            height={552}
            className="h-[552px] w-[753px] shrink-0 object-contain"
          />
          <div
            className="absolute z-0 overflow-hidden"
            style={{
              left: 326 - (1932 - 483) / 2,
              top: 779 - (208 - 52) / 2,
              width: 1932,
              height: 208,
            }}
          >
            <img
              src="/assets/shadow.png"
              alt=""
              className="h-full w-full object-contain opacity-70"
            />
          </div>
        </section>

        {/* Shoe content box: tabs + grid (4 cols × 270px + 3×66px gap = 1278px) */}
        <div className="mx-auto max-w-[1280px] border-b border-neutral-500 px-6 pb-12 pt-8">
          {/* Product tabs */}
          <section className="bg-[#f4f4f4]">
            <div className="flex justify-start gap-[36px]">
              <button
                type="button"
                className="font-cabinet rounded-full border-4 border-[#7C7EA1] bg-[#4A4C6C] px-[33px] py-4 text-[20px] uppercase text-[#F4F4F4] shadow-[0_5px_8px_0_rgba(74,76,108,0.4)] transition-colors hover:bg-transparent hover:text-[#4A4C6C]"
                style={{
                  fontFamily: '"Cabinet Grotesk", sans-serif',
                  fontWeight: 700,
                  lineHeight: '100%',
                  letterSpacing: '0.05em',
                }}
              >
                NEW ARRIVALS
              </button>
              <button
                type="button"
                className="font-cabinet rounded-full border-4 border-[#9FA16D] bg-[#77794E] px-[33px] py-4 text-[20px] uppercase text-[#F4F4F4] shadow-[0_5px_8px_0_rgba(119,121,78,0.4)] transition-colors hover:bg-transparent hover:text-[#77794E]"
                style={{
                  fontFamily: '"Cabinet Grotesk", sans-serif',
                  fontWeight: 700,
                  lineHeight: '100%',
                  letterSpacing: '0.05em',
                }}
              >
                WHAT&apos;S TRENDING
              </button>
            </div>
          </section>

          {/* Product grid */}
          <section className="bg-[#f4f4f4] pt-8">
            <div className="grid grid-cols-1 gap-x-[66px] gap-y-[50px] sm:grid-cols-2 lg:grid-cols-4">
              {(shoes.length > 0 ? shoes : FALLBACK_SHOES).map((shoe) => (
                <ProductCard key={shoe.id} shoe={shoe} />
              ))}
            </div>
          </section>
        </div>

        {/* Features */}
        <section className="px-[200px] pb-[112px] pt-[112px]">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-3">
            <FeatureBlock
              icon={
                <Image
                  src="/assets/truck.png"
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                  className="h-[80px] w-[80px] object-contain"
                />
              }
              title="FREE AND FAST DELIVERY"
              description="Free delivery for all orders over $140"
            />
            <FeatureBlock
              icon={
                <Image
                  src="/assets/headphones.png"
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                  className="h-[80px] w-[80px] object-contain"
                />
              }
              title="24/7 CUSTOMER SERVICE"
              description="Friendly 24/7 customer support"
            />
            <FeatureBlock
              icon={
                <Image
                  src="/assets/moneyback.png"
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                  className="h-[80px] w-[80px] object-contain"
                />
              }
              title="MONEY BACK GUARANTEE"
              description="We return money within 30 days"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="flex min-h-[451px] w-full max-w-[1440px] flex-col gap-[43px] bg-[#333333] px-[144px] pb-[35px] pt-[58px] text-white">
          <div>
            <p className="text-xl font-bold">Logo</p>
            <p className="mt-3 text-sm text-neutral-300">
              Address: USA, California
            </p>
            <p className="text-sm text-neutral-300">Contact: 1800 123 4567</p>
            <p className="text-sm text-neutral-300">lavaria.xyz@gmail.com</p>
            <div className="mt-4 flex gap-4">
              <a href="#" aria-label="Facebook">
                <SocialIcon className="h-5 w-5 text-neutral-400 hover:text-white" />
              </a>
              <a href="#" aria-label="X">
                <SocialIcon className="h-5 w-5 text-neutral-400 hover:text-white" />
              </a>
              <a href="#" aria-label="Instagram">
                <SocialIcon className="h-5 w-5 text-neutral-400 hover:text-white" />
              </a>
              <a href="#" aria-label="YouTube">
                <SocialIcon className="h-5 w-5 text-neutral-400 hover:text-white" />
              </a>
            </div>
          </div>
          <p className="text-center text-sm text-neutral-400">
            © 2023. lavaria. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

/** Fallback when no shoes from API/DB (e.g. Supabase not configured or empty). */
const FALLBACK_SHOES: Shoe[] = [
  { id: "1", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 130, created_at: "", updated_at: "" },
  { id: "2", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 140, created_at: "", updated_at: "" },
  { id: "3", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 100, created_at: "", updated_at: "" },
  { id: "4", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 85, created_at: "", updated_at: "" },
  { id: "5", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 100, created_at: "", updated_at: "" },
  { id: "6", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 130, created_at: "", updated_at: "" },
  { id: "7", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 120, created_at: "", updated_at: "" },
  { id: "8", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 110, created_at: "", updated_at: "" },
];

function ProductCard({ shoe }: { shoe: Shoe }) {
  const imageSrc = shoe.display_image || "/assets/Sport Shoes.png";
  const priceFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(shoe.msrp);

  return (
    <article className="group relative flex h-[350px] w-[270px] shrink-0 flex-col">
      {/* Shoe image area: 270×250px */}
      <div className="relative h-[250px] w-[270px] shrink-0 overflow-hidden bg-[#E9E9EB]">
        <img
          src={imageSrc}
          alt={shoe.shoe_name}
          className="h-full w-full object-contain"
        />
        <button
          type="button"
          className="group/heart absolute right-[12px] top-[12px] flex h-[34px] w-[34px] items-center justify-center rounded p-0"
          aria-label="Add to wishlist"
        >
          <HeartIcon className="h-[34px] w-[34px] fill-transparent stroke-neutral-700 transition-colors group-hover/heart:fill-[#ff4747] group-hover/heart:stroke-transparent" />
        </button>
      </div>
      {/* Add to Cart – visible on hover */}
      <button
        type="button"
        className="absolute left-0 top-[209px] flex h-[41px] w-[270px] items-center justify-center rounded-b-[4px] bg-[#000000] font-cabinet text-[20px] font-medium leading-[100%] tracking-[0.05em] text-[#F4F4F4] opacity-0 transition-opacity group-hover:opacity-100"
      >
        Add To Cart
      </button>
      {/* Name and price underneath */}
      <div className="flex h-[100px] w-[270px] shrink-0 flex-col justify-center gap-1 bg-[#f4f4f4] px-0 py-2">
        <p className="font-space-grotesk text-[16px] font-medium leading-[24px] tracking-normal text-[#000000]">
          {shoe.shoe_name}
        </p>
        <p className="font-poppins text-[16px] font-medium leading-[24px] tracking-normal text-[#000000] opacity-50">
          {priceFormatted}
        </p>
      </div>
    </article>
  );
}

function FeatureBlock({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3">{icon}</div>
      <h3 className="font-cabinet text-[24px] font-bold leading-[28px] tracking-normal text-[#181818] uppercase">
          {title}
        </h3>
      <p
          className="mt-1 font-cabinet text-center text-[16px] leading-[21px] tracking-normal text-[#181818]"
          style={{ fontWeight: 400 }}
        >
          {description}
        </p>
    </div>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h2" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    </svg>
  );
}

function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z" />
      <path d="M21 14h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M12 2v4" />
      <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function StarRating() {
  return (
    <span className="flex text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function SocialIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
