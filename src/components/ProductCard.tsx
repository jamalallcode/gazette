import React from "react";
import { Product, Category } from "../types";
import { Star, ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  product: Product;
  currency: 'BDT' | 'USD';
  language: 'en' | 'bn';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  key?: any;
}

export default function ProductCard({
  product,
  currency,
  language,
  onSelectProduct,
  onAddToCart
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  // Language based rendering
  const displayName = language === 'bn' ? product.nameBn : product.name;
  const displayCategory = language === 'bn' 
    ? {
        tshirt: 'টি-শার্ট',
        laptop: 'ল্যাপটপ ও নোটবুক',
        appliances: 'হোম অ্যাপ্লায়েন্স',
        gadgets: 'পাওয়ার ব্যাংক',
        watches: 'স্মার্টওয়াচ'
      }[product.category as Category]
    : product.category.charAt(0).toUpperCase() + product.category.slice(1);

  // Price formatting
  const displayPrice = currency === 'BDT' 
    ? `৳${product.priceBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}` 
    : `$${product.priceUSD}`;

  // Checked discount fields to calculate the dynamic "Off" amount
  const originalPriceBDT = product.originalPriceBDT || (product.priceBDT + Math.round(product.priceBDT * 0.15));
  const originalPriceUSD = product.originalPriceUSD || (product.priceUSD + Math.round(product.priceUSD * 0.15));

  const discountAmountBDT = originalPriceBDT - product.priceBDT;
  const discountAmountUSD = originalPriceUSD - product.priceUSD;

  const displayOriginalPrice = currency === 'BDT'
    ? `৳${originalPriceBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
    : `$${originalPriceUSD}`;

  const discountText = currency === 'BDT'
    ? (discountAmountBDT > 0 ? `৳${discountAmountBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')} Off` : null)
    : (discountAmountUSD > 0 ? `$${discountAmountUSD.toFixed(1)} Off` : null);

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="product-card group bg-white border border-zinc-150 rounded-lg overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all duration-300 flex flex-col h-full relative cursor-pointer"
    >
      {/* Product Image Frame - Clean container with lower height matching screenshot */}
      <div 
        className="product-card-image-frame relative h-20 sm:h-24 md:h-28 overflow-hidden bg-white w-full flex items-center justify-center p-2.5"
        id={`product-img-frame-${product.id}`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          referrerPolicy="no-referrer"
        />
        
        {/* Dynamic Discount Badge (Replica look and position) */}
        {discountText && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-[#f97316] text-white rounded shadow-sm z-10 select-none">
            {discountText}
          </span>
        )}

        {/* Stock status overlays */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="px-2 py-0.5 border border-red-500/20 bg-red-50/80 text-red-600 text-[9px] font-bold tracking-wider uppercase rounded shadow-xs select-none">
              {language === 'en' ? 'OUT OF STOCK' : 'স্টক শেষ'}
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase bg-red-500 text-white rounded shadow-xs z-10 animate-pulse select-none">
            {language === 'en' ? 'LIMITED' : 'সীমিত'}
          </span>
        ) : null}

        {/* Interactive Hover Action Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(product);
              }}
              className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-700 rounded-full shadow-md transition-all hover:scale-110 cursor-pointer border-0"
              title={language === 'en' ? 'Details' : 'বিস্তারিত'}
            >
              <Eye size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="p-1.5 bg-[#f97316] hover:bg-orange-600 text-white rounded-full shadow-md transition-all hover:scale-110 cursor-pointer border-0"
              title={language === 'en' ? 'Add' : 'যোগ করুন'}
            >
              <ShoppingCart size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Product Details Section - Compact layout & zero lines division matching user's custom photo */}
      <div className="product-card-details p-2 sm:p-2.5 flex flex-col flex-grow bg-white border-t border-zinc-50 text-left">
        {/* Brand label and rating in one mini row */}
        <div className="text-[8px] sm:text-[9px] text-zinc-400 font-semibold tracking-normal mb-1 flex items-center justify-between">
          <span>{product.brand || displayCategory}</span>
          <div className="flex items-center space-x-0.5 text-amber-500">
            <Star size={7} fill="currentColor" />
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-zinc-500">
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Standard bold title */}
        <h3 
          className="text-zinc-900 hover:text-[#f97316] text-[11px] sm:text-xs font-semibold leading-snug line-clamp-2 transition-colors duration-200 cursor-pointer text-left h-8 sm:h-9 flex-shrink-0" 
        >
          {displayName}
        </h3>

        {/* Pricing side-by-side format */}
        <div className="mt-1 flex items-center gap-2 justify-start flex-wrap">
          {displayOriginalPrice && (
            <span className="text-[10px] sm:text-[11px] text-zinc-400 line-through font-mono">
              {displayOriginalPrice}
            </span>
          )}
          <span className="text-xs sm:text-sm font-extrabold text-zinc-900 font-mono">
            {displayPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
