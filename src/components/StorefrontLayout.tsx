import { NavBar } from "@/components/NavBar";
import { ProductGridWithFavorites } from "@/components/ProductGridWithFavorites";
import type { Shoe } from "@/types/database";
import Image from "next/image";
import Link from "next/link";

type ProductTab = "new-arrivals" | "whats-trending";

type StorefrontLayoutProps = {
  activeLink?: string;
  shoes?: Shoe[];
  reviewCountsByShoeId?: Record<string, number>;
  averageRatingByShoeId?: Record<string, number>;
  activeProductTab?: ProductTab;
  variant?: "home" | "favorites" | "category";
  categoryTitle?: string;
  categoryDescription?: string;
  breadcrumbLabel?: string;
  children?: React.ReactNode;
};

export function StorefrontLayout({
  activeLink,
  shoes = [],
  reviewCountsByShoeId = {},
  averageRatingByShoeId = {},
  activeProductTab = "new-arrivals",
  variant = "home",
  categoryTitle,
  categoryDescription,
  breadcrumbLabel,
  children,
}: StorefrontLayoutProps) {
  const isFavorites = variant === "favorites";
  const isCategory = variant === "category";
  const customContent = children != null;

  return (
    <div className="flex min-h-screen w-full min-w-full flex-col overflow-x-hidden bg-[#f4f4f4] font-sans text-neutral-900">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
        <header className="font-cabinet mb-[153px] flex min-h-[41px] w-full shrink-0 items-center justify-end gap-[10px] bg-[#4A4C6C] px-[596px] pb-[12px] pt-[12px]">
          <p className="whitespace-nowrap text-[14px] font-bold leading-[100%] tracking-normal text-[#FFFFFF]">
            New here? Save 20% with code: YR24
          </p>
        </header>

        <NavBar activeLink={activeLink} />

        <div className="flex flex-1 flex-col">
          {customContent ? (
            <div className="mx-auto w-full max-w-[1280px] border-b border-neutral-500 px-6 pb-12 pt-8">
              {children}
            </div>
          ) : !isFavorites && !isCategory ? (
            <section className="relative flex min-h-[1058px] min-w-[1279px] items-center justify-center bg-[#f4f4f4] pl-[63px] py-16 md:py-24">
              <div
                className="absolute left-0 top-0 z-0 font-teko uppercase"
                style={{
                  paddingLeft: "341px",
                  paddingTop: "249px",
                  fontWeight: 400,
                  fontSize: "24px",
                  lineHeight: "100px",
                  letterSpacing: "0.15em",
                  color: "#181818",
                }}
              >
                ADJUSTABLE
              </div>
              <div
                className="absolute left-0 top-0 z-0 font-teko uppercase"
                style={{
                  paddingLeft: "1008px",
                  paddingTop: "581px",
                  fontWeight: 400,
                  fontSize: "24px",
                  lineHeight: "100px",
                  letterSpacing: "0.15em",
                  color: "#181818",
                }}
              >
                SOFT PAD
              </div>
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <span
                  className="font-teko uppercase"
                  style={{
                    color: "rgba(74, 76, 108, 0.17)",
                    fontWeight: 700,
                    fontSize: "300px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    marginLeft: "50px",
                    marginTop: "100px",
                  }}
                >
                  SHOP ALL
                </span>
              </div>
              <Image
                src="/assets/Sport Shoes.png"
                alt="Sport shoe"
                width={753}
                height={552}
                className="relative z-10 h-[552px] w-[753px] shrink-0 object-contain"
              />
              <div
                className="absolute z-10 overflow-hidden"
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
          ) : null}

          {!customContent && (
            <div className="mx-auto max-w-[1280px] border-b border-neutral-500 px-6 pb-12 pt-8">
              {!isFavorites && !isCategory && (
                <section className="bg-[#f4f4f4]">
                  <div className="flex justify-start gap-[36px]">
                    <Link
                      href="/?tab=new-arrivals"
                      scroll={false}
                      className={`font-cabinet rounded-full border-4 px-[33px] py-4 text-[20px] uppercase shadow-[0_5px_8px_0_rgba(74,76,108,0.4)] transition-colors ${
                        activeProductTab === "new-arrivals"
                          ? "border-[#7C7EA1] bg-[#4A4C6C] text-[#F4F4F4]"
                          : "border-[#7C7EA1] bg-transparent text-[#4A4C6C] hover:bg-[#4A4C6C] hover:text-[#F4F4F4]"
                      }`}
                      style={{
                        fontFamily: '"Cabinet Grotesk", sans-serif',
                        fontWeight: 700,
                        lineHeight: "100%",
                        letterSpacing: "0.05em",
                      }}
                    >
                      NEW ARRIVALS
                    </Link>
                    <Link
                      href="/?tab=whats-trending"
                      scroll={false}
                      className={`font-cabinet rounded-full border-4 px-[33px] py-4 text-[20px] uppercase shadow-[0_5px_8px_0_rgba(119,121,78,0.4)] transition-colors ${
                        activeProductTab === "whats-trending"
                          ? "border-[#9FA16D] bg-[#77794E] text-[#F4F4F4]"
                          : "border-[#9FA16D] bg-transparent text-[#77794E] hover:bg-[#77794E] hover:text-[#F4F4F4]"
                      }`}
                      style={{
                        fontFamily: '"Cabinet Grotesk", sans-serif',
                        fontWeight: 700,
                        lineHeight: "100%",
                        letterSpacing: "0.05em",
                      }}
                    >
                      WHAT&apos;S TRENDING
                    </Link>
                  </div>
                </section>
              )}

              {isCategory && breadcrumbLabel && (
                <section className="bg-[#f4f4f4] pb-2">
                  <nav className="font-space-grotesk text-sm text-neutral-500" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-[#181818]">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#181818] font-medium">{breadcrumbLabel}</span>
                  </nav>
                  <h1 className="font-cabinet mt-2 text-3xl font-bold uppercase tracking-wide text-[#181818]">
                    {categoryTitle}
                  </h1>
                  {categoryDescription && (
                    <p className="font-space-grotesk mt-1 text-base text-neutral-600">{categoryDescription}</p>
                  )}
                </section>
              )}
              {isFavorites && (
                <section className="bg-[#f4f4f4] pb-4">
                  <h2 className="font-cabinet text-2xl font-bold uppercase tracking-wide text-[#181818]">
                    Your Favorites
                  </h2>
                </section>
              )}

              <section className="bg-[#f4f4f4] pt-8">
                {isFavorites && shoes.length === 0 ? (
                  <p className="font-cabinet text-[18px] text-neutral-600">
                    You haven&apos;t favorited any shoes yet. Browse the store and click the heart on items you like.
                  </p>
                ) : isCategory && shoes.length === 0 ? (
                  <p className="font-cabinet text-[18px] text-neutral-600">
                    No shoes in this category yet. <Link href="/" className="underline hover:no-underline">Browse all</Link>.
                  </p>
                ) : (
                  <ProductGridWithFavorites
                    shoes={shoes.length > 0 ? shoes : (isFavorites || isCategory ? [] : FALLBACK_SHOES)}
                    reviewCountsByShoeId={reviewCountsByShoeId}
                    averageRatingByShoeId={averageRatingByShoeId}
                    limit={!isFavorites && !isCategory ? 8 : undefined}
                  />
                )}
              </section>
            </div>
          )}

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
        </div>

        <footer className="mt-auto flex min-h-[451px] w-full max-w-[1440px] shrink-0 flex-col gap-[43px] bg-[#333333] px-[144px] pb-[35px] pt-[58px] text-white">
          <div>
            <p className="text-xl font-bold">Logo</p>
            <p className="mt-3 text-sm text-neutral-300">Address: USA, California</p>
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
          <p className="text-center text-sm text-neutral-400">© 2023. lavaria. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

const FALLBACK_SHOES: Shoe[] = [
  { id: "1", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 130, is_sport: false, is_classic: false, created_at: "", updated_at: "" },
  { id: "2", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 140, is_sport: false, is_classic: false, created_at: "", updated_at: "" },
  { id: "3", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 100, is_sport: false, is_classic: false, created_at: "", updated_at: "" },
  { id: "4", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 85, is_sport: false, is_classic: false, created_at: "", updated_at: "" },
  { id: "5", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 100, is_sport: false, is_classic: false, created_at: "", updated_at: "" },
  { id: "6", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 130, is_sport: false, is_classic: false, created_at: "", updated_at: "" },
  { id: "7", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 120, is_sport: false, is_classic: false, created_at: "", updated_at: "" },
  { id: "8", shoe_name: "Placeholder Shoe", display_image: "/assets/Sport Shoes.png", gender: "unisex", age: "adults", msrp: 110, is_sport: false, is_classic: false, created_at: "", updated_at: "" },
];

function FeatureBlock({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3">{icon}</div>
      <h3 className="font-cabinet text-[24px] font-bold leading-[28px] tracking-normal text-[#181818] uppercase">
        {title}
      </h3>
      <p className="mt-1 font-cabinet text-center text-[16px] leading-[21px] tracking-normal text-[#181818]" style={{ fontWeight: 400 }}>
        {description}
      </p>
    </div>
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
