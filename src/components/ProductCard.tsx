import { FavoriteHeart } from "@/components/FavoriteHeart";
import { SaleSticker } from "@/components/SaleSticker";
import type { Shoe, ShoeWithSale } from "@/types/database";
import Link from "next/link";

const STAR_PATH = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

type ProductCardProps = {
  shoe: Shoe | ShoeWithSale;
  reviewCount: number;
  averageRating: number;
  isFavorited?: boolean;
  onFavoriteChange?: () => void;
};

export function ProductCard({ shoe, reviewCount, averageRating, isFavorited = false, onFavoriteChange }: ProductCardProps) {
  const imageSrc = shoe.display_image || "/assets/Sport Shoes.png";
  const onSale = "onSale" in shoe && shoe.onSale && "minPrice" in shoe && typeof shoe.minPrice === "number";
  const displayPrice = onSale ? (shoe as ShoeWithSale).minPrice : shoe.msrp;
  const discountPercent =
    onSale && shoe.msrp > 0
      ? Math.round((1 - (shoe as ShoeWithSale).minPrice / shoe.msrp) * 100)
      : 0;
  const salePriceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayPrice);
  const originalPriceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(shoe.msrp);
  const goldCount = Math.min(5, Math.max(0, Math.round(averageRating)));

  return (
    <article className="group relative flex h-[350px] w-[270px] shrink-0 flex-col">
      <div className="relative h-[250px] w-[270px] shrink-0 overflow-hidden bg-[#E9E9EB]">
        {onSale && discountPercent > 0 && (
          <SaleSticker discountPercent={discountPercent} size="sm" />
        )}
        <Link href={`/shoe/${shoe.id}`} className="block h-full w-full">
          <img
            src={imageSrc}
            alt={shoe.shoe_name}
            className="h-full w-full object-contain"
          />
        </Link>
        <FavoriteHeart shoeId={shoe.id} initialFavorited={isFavorited} onToggle={onFavoriteChange ? () => onFavoriteChange() : undefined} />
      </div>
      <button
        type="button"
        className="absolute left-0 top-[209px] flex h-[41px] w-[270px] items-center justify-center rounded-b-[4px] bg-[#000000] font-cabinet text-[20px] font-medium leading-[100%] tracking-[0.05em] text-[#F4F4F4] opacity-0 transition-opacity group-hover:opacity-100"
      >
        Add To Cart
      </button>
      <div className="flex h-[100px] w-[270px] shrink-0 flex-col justify-center gap-1 bg-[#f4f4f4] px-0 py-2">
        <Link href={`/shoe/${shoe.id}`} className="font-space-grotesk text-[16px] font-medium leading-[24px] tracking-normal text-[#000000] hover:underline">
          {shoe.shoe_name}
        </Link>
        <p className="flex items-baseline gap-2 font-space-grotesk text-[16px] font-medium leading-[24px] tracking-normal">
          {onSale ? (
            <>
              <span className="text-[#DB4444]">{salePriceFormatted}</span>
              <span className="font-space-grotesk text-[16px] font-medium leading-[24px] tracking-normal text-[#000000] line-through opacity-50">{originalPriceFormatted}</span>
            </>
          ) : (
            <span className="text-[#000000] opacity-50">{salePriceFormatted}</span>
          )}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="flex" aria-hidden>
            {[1, 2, 3, 4, 5].map((i) =>
              i <= goldCount ? (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#EAB308"
                  className="h-4 w-4 shrink-0"
                >
                  <polygon points={STAR_PATH} />
                </svg>
              ) : (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0 text-neutral-300"
                >
                  <polygon points={STAR_PATH} />
                </svg>
              )
            )}
          </span>
          <span className="font-space-grotesk text-[14px] font-bold leading-[21px] tracking-normal text-[#000000] opacity-50">
            ({reviewCount})
          </span>
        </div>
      </div>
    </article>
  );
}
