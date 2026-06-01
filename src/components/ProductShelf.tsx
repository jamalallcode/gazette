import React, { useRef, useState, useEffect } from "react";
import { Product } from "../types";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductShelfProps {
  title: string;
  onViewAll: () => void;
  products: Product[];
  currency: 'BDT' | 'USD';
  language: 'en' | 'bn';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductShelf({
  title,
  onViewAll,
  products,
  currency,
  language,
  onSelectProduct,
  onAddToCart,
}: ProductShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const productsRef = useRef(products);
  const isHoveredRef = useRef(isHovered);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Auto-slide effect that slowly scrolls to the left (scrolling container to the right)
  useEffect(() => {
    let lastScrollLeft = -1;

    const interval = setInterval(() => {
      if (isHoveredRef.current) return;
      if (!productsRef.current || productsRef.current.length === 0) return;

      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // If scroll position has not changed since last tick, or we have hit the maximum scrollable width, wrap back to start
        if (Math.abs(scrollLeft - lastScrollLeft) < 2 && scrollLeft > 0) {
          scrollRef.current.scrollTo({
            left: 0,
            behavior: "smooth"
          });
          lastScrollLeft = 0;
        } else {
          lastScrollLeft = scrollLeft;
          if (scrollLeft >= scrollWidth - clientWidth - 10) {
            scrollRef.current.scrollTo({
              left: 0,
              behavior: "smooth"
            });
            lastScrollLeft = 0;
          } else {
            const firstCard = scrollRef.current.firstElementChild as HTMLElement;
            const scrollStep = firstCard ? firstCard.offsetWidth + 16 : 240;
            scrollRef.current.scrollBy({
              left: scrollStep,
              behavior: "smooth"
            });
          }
        }
      }
    }, 3000); // Slide every 3 seconds for dynamic motion

    return () => clearInterval(interval);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const firstCard = scrollRef.current.firstElementChild as HTMLElement;
      const scrollStep = firstCard ? firstCard.offsetWidth + 16 : 260;

      if (direction === "left") {
        if (scrollLeft <= 5) {
          // Wrap around to end
          scrollRef.current.scrollTo({
            left: scrollWidth - clientWidth,
            behavior: "smooth"
          });
        } else {
          scrollRef.current.scrollBy({
            left: -scrollStep,
            behavior: "smooth"
          });
        }
      } else {
        if (scrollLeft >= scrollWidth - clientWidth - 15) {
          // Wrap around to start
          scrollRef.current.scrollTo({
            left: 0,
            behavior: "smooth"
          });
        } else {
          scrollRef.current.scrollBy({
            left: scrollStep,
            behavior: "smooth"
          });
        }
      }
    }
  };

  return (
    <div 
      className="space-y-4 text-left relative group/shelf"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shelf Header */}
      <div className="flex justify-between items-baseline border-b-2 border-orange-500 pb-2">
        <div className="flex items-center space-x-2">
          <span className="h-5.5 w-1.5 bg-[#fd7e14] block" />
          <h3 className="text-sm sm:text-base font-black uppercase text-zinc-900 tracking-wider font-sans">
            {title}
          </h3>
        </div>
        <button 
          onClick={onViewAll}
          className="text-xs font-bold text-orange-500 hover:text-orange-600 transition cursor-pointer flex items-center space-x-1 border-0 bg-transparent"
        >
          <span>{language === 'bn' ? 'সবগুলো দেখুন >' : 'View All >'}</span>
        </button>
      </div>

      {/* Outer wrapper with arrows */}
      <div className="relative">
        {/* Left Arrow Button (Visible on hover) */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center hover:bg-orange-600 hover:scale-105 opacity-0 group-hover/shelf:opacity-100 pointer-events-none group-hover/shelf:pointer-events-auto transition-all duration-300 shadow-[0_4px_12px_rgba(249,115,22,0.35)] border-2 border-white cursor-pointer select-none"
          title="Scroll Left"
          id={`scroll-left-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <ChevronLeft size={20} className="stroke-[3.5] relative -left-[0.5px]" />
        </button>

        {/* Scrollable Container with hide scrollbar logic */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 py-2 px-1 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((p) => (
            <div 
              key={p.id} 
              className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
              id={`shelf-item-${p.id}`}
            >
              <ProductCard
                product={p}
                currency={currency}
                language={language}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow Button (Visible on hover) */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center hover:bg-orange-600 hover:scale-105 opacity-0 group-hover/shelf:opacity-100 pointer-events-none group-hover/shelf:pointer-events-auto transition-all duration-300 shadow-[0_4px_12px_rgba(249,115,22,0.35)] border-2 border-white cursor-pointer select-none"
          title="Scroll Right"
          id={`scroll-right-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <ChevronRight size={20} className="stroke-[3.5] relative left-[0.5px]" />
        </button>
      </div>
    </div>
  );
}
