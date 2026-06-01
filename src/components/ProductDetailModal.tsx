import React, { useState } from "react";
import { 
  X, Star, ShoppingBag, Plus, Minus, Check, 
  Heart, Truck, CreditCard, RefreshCw, ShieldCheck, ShoppingCart,
  Mail, MessageSquare, Twitter, Linkedin, Youtube, Award, Briefcase, ChevronRight, Phone
} from "lucide-react";
import { Product } from "../types";
import { INITIAL_PRODUCTS } from "../data/products";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  currency: 'BDT' | 'USD';
  language: 'en' | 'bn';
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  langText: any;
}

// 1. More From Store list precisely matching screenshots
const MORE_FROM_STORE = [
  {
    id: "mfs-1",
    name: "Crusher machine",
    priceBDT: 121000,
    originalPriceBDT: 121000,
    rating: 0,
    reviewsCount: 0,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80",
    discountTag: ""
  },
  {
    id: "mfs-2",
    name: "Kiam 2.8 Liter Stainless Steel + Non-stick",
    priceBDT: 1107,
    originalPriceBDT: 1230,
    rating: 0,
    reviewsCount: 0,
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&q=80",
    discountTag: "10% Off"
  },
  {
    id: "mfs-3",
    name: "Y60",
    priceBDT: 2300,
    originalPriceBDT: 2500,
    rating: 0,
    reviewsCount: 0,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80",
    discountTag: "৳200.00 Off"
  },
  {
    id: "mfs-4",
    name: "Logitech C270 HD Webcam",
    priceBDT: 2300,
    originalPriceBDT: 2300,
    rating: 0,
    reviewsCount: 0,
    image: "https://images.unsplash.com/photo-1629424125438-6228522e851a?w=300&q=80",
    discountTag: ""
  },
  {
    id: "mfs-5",
    name: "Logitech K120 USB Keyboard With Bangla",
    priceBDT: 750,
    originalPriceBDT: 920,
    rating: 0,
    reviewsCount: 0,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80",
    discountTag: "৳170.00 Off"
  }
];

// 2. Similar Products list precisely matching screenshots
const SIMILAR_PRODUCTS = [
  {
    id: "sp-1",
    name: "Pantum P2506 Single Function Laser Printer",
    priceBDT: 11500,
    originalPriceBDT: 12300,
    discountTag: "৳800.00 Off",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80"
  },
  {
    id: "sp-2",
    name: "Pantum P2500 Single Function Laser Printer",
    priceBDT: 11100,
    originalPriceBDT: 11500,
    discountTag: "৳400.00 Off",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80"
  },
  {
    id: "sp-3",
    name: "Pantum M6500NW Multifunction Laser Printer",
    priceBDT: 16500,
    originalPriceBDT: 17350,
    discountTag: "৳850.00 Off",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80"
  },
  {
    id: "sp-4",
    name: "Pantum M6700DW Mono Laser Printer",
    priceBDT: 20700,
    originalPriceBDT: 21700,
    discountTag: "৳1,000.00 Off",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80"
  },
  {
    id: "sp-5",
    name: "Pantum P3305DW Mono Laser Printer",
    priceBDT: 23300,
    originalPriceBDT: 24500,
    discountTag: "৳1,200.00 Off",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&q=80"
  },
  {
    id: "sp-6",
    name: "Brother PT-E110VP Handheld Label Printer",
    priceBDT: 8500,
    originalPriceBDT: 9000,
    discountTag: "৳500.00 Off",
    image: "https://images.unsplash.com/photo-1563161402-8a11e0dc1e15?w=300&q=80"
  },
  {
    id: "sp-7",
    name: "Brother QL-800 Professional High-Speed Label Printer",
    priceBDT: 16700,
    originalPriceBDT: 16900,
    discountTag: "৳200.00 Off",
    image: "https://images.unsplash.com/photo-1563161402-8a11e0dc1e15?w=300&q=80"
  },
  {
    id: "sp-8",
    name: "Brother PT-P900W Label Printer",
    priceBDT: 39050,
    originalPriceBDT: 39550,
    discountTag: "৳500.00 Off",
    image: "https://images.unsplash.com/photo-1563161402-8a11e0dc1e15?w=300&q=80"
  },
  {
    id: "sp-9",
    name: "Power Guard 650VA Offline UPS",
    priceBDT: 3400,
    originalPriceBDT: 3750,
    discountTag: "৳350.00 Off",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80"
  },
  {
    id: "sp-10",
    name: "Power Guard 800VA Offline UPS",
    priceBDT: 5000,
    originalPriceBDT: 5500,
    discountTag: "৳500.00 Off",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80"
  }
];

export default function ProductDetailModal({
  product,
  onClose,
  currency,
  language,
  onAddToCart,
  onBuyNow,
  langText
}: ProductDetailModalProps) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccessfully, setIsAddedSuccessfully] = useState(false);

  // States and Handlers for the Hover-to-Zoom Dynamic Magnifier
  const [zoomStyle, setZoomStyle] = useState({
    transformOrigin: 'center center',
    transform: 'scale(1)'
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)' // 2.5x Zoom Factor
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  
  // Custom clothing attributes state
  const [selectedColor, setSelectedColor] = useState<'blue' | 'grey'>('blue');
  const [selectedSize, setSelectedSize] = useState<'M' | 'L' | 'XL' | 'XXL'>('XL');
  const [selectedAge, setSelectedAge] = useState<'28' | '30' | '32'>('30');
  const [isLoved, setIsLoved] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const displayName = language === 'bn' ? product.nameBn : product.name;
  const displayDesc = language === 'bn' ? product.descriptionBn : product.description;

  // Real-time calculations
  const unitPrice = product.priceBDT;
  const originalPrice = product.originalPriceBDT || Math.round(unitPrice * 1.052);
  const totalPrice = unitPrice * quantity;

  // Formatting helper for currency
  const formatMoney = (val: number) => {
    if (currency === 'BDT') {
      return `৳${val.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    } else {
      const valUSD = val / 120;
      return `$${valUSD.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleCartSubmit = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    setIsAddedSuccessfully(true);
    setTimeout(() => {
      setIsAddedSuccessfully(false);
    }, 2500);
  };

  const handleBuyNowSubmit = () => {
    if (isOutOfStock) return;
    if (onBuyNow) {
      onBuyNow(product, quantity);
    } else {
      onAddToCart(product, quantity);
    }
  };

  // Thumbnails matching screenshots
  const secondThumbImage = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%2520height%3D%22300%22%20viewBox%3D%220%200%2024%2024%22%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22%232563eb%22%2F%3E%3Ctext%20x%3D%2212%22%20y%3D%2216%22%20fill%3D%22%23ffffff%22%20font-size%3D%2212%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%3E%25%3C%2Ftext%3E%3C%2Fsvg%3E";
  const thirdThumbImage = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%2024%2024%22%3E%3Crect%20width%3D%2224%22%2520height%3D%2224%22%20fill%3D%22%23edf2f7%22%2F%3E%3Cpath%20d%3D%22M20%2021v-2a4%204%200%200%200-4-4H8a4%204%200%200%200-4%204v2%22%20stroke%3D%22%232563eb%22%20stroke-width%3D%222%22%3E%3C%2Fpath%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%227%22%20r%3D%224%22%20stroke%3D%22%232563eb%22%20stroke-width%3D%222%22%2F%3E%3C%2Fsvg%3E";
  const fourthThumbImage = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%2024%2024%22%3E%3Crect%20width%3D%2224%22%252520height%3D%2224%22%20fill%3D%22%23fef3c7%22%2F%3E%3Cpolygon%20points%3D%2212%202%2022%208.5%2022%2015.5%2012%2022%202%2015.5%202%208.5%22%20stroke%3D%22%23d97706%22%20stroke-width%3D%222%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E";

  const [activePreviewImage, setActivePreviewImage] = useState<string>(product.image);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f3f4f6]" id="product-detail-modal">
      
      {/* Upper Navigation Bar */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-black text-zinc-800 tracking-tight uppercase">
              {language === 'bn' ? 'প্রোডাক্ট বিবরণী' : 'Product Details'}
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#f58220] hover:text-orange-600 bg-orange-50 hover:bg-orange-100/60 rounded-lg transition cursor-pointer flex items-center space-x-1.5 border-0"
            id="close-detail-modal"
          >
            <X size={14} className="stroke-[2.5px]" />
            <span>{language === 'bn' ? 'ফিরে যান' : 'Back to Shop'}</span>
          </button>
        </div>
      </div>

      {/* Main Page Scrollable container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8 pb-20">
        
        {/* ROW 1: Main Product Canvas Card */}
        <div className="bg-white rounded-2xl border border-zinc-100/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMN 1: LEFT IMAGE PANEL (Span 4) */}
            <div className="lg:col-span-4 flex flex-col items-center space-y-4">
              <div 
                className="w-full aspect-square bg-white border border-zinc-100 rounded-xl relative overflow-hidden group h-72 lg:h-80 shadow-xs cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={activePreviewImage}
                  alt={displayName}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  style={{
                    transformOrigin: zoomStyle.transformOrigin,
                    transform: zoomStyle.transform,
                    transition: zoomStyle.transform === 'scale(1)' ? 'transform 0.2s ease-out' : 'none'
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Decorative Gallery Grid */}
              <div className="flex items-center justify-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setActivePreviewImage(product.image)}
                  className={`h-14 w-14 rounded-lg border-2 flex items-center justify-center p-1 bg-white transition cursor-pointer overflow-hidden ${
                    activePreviewImage === product.image ? 'border-orange-500 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <img src={product.image} className="max-h-full max-w-full object-contain" alt="Thumb 1" referrerPolicy="no-referrer" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewImage(secondThumbImage)}
                  className={`h-14 w-14 rounded-lg border-2 flex items-center justify-center p-1 bg-white transition cursor-pointer overflow-hidden ${
                    activePreviewImage === secondThumbImage ? 'border-orange-500 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <img src={secondThumbImage} className="max-h-full max-w-full object-contain" alt="Thumb 2" referrerPolicy="no-referrer" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewImage(thirdThumbImage)}
                  className={`h-14 w-14 rounded-lg border-2 flex items-center justify-center p-1 bg-white transition cursor-pointer overflow-hidden ${
                    activePreviewImage === thirdThumbImage ? 'border-orange-500 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <img src={thirdThumbImage} className="max-h-full max-w-full object-contain" alt="Thumb 3" referrerPolicy="no-referrer" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewImage(fourthThumbImage)}
                  className={`h-14 w-14 rounded-lg border-2 flex items-center justify-center p-1 bg-white transition cursor-pointer overflow-hidden ${
                    activePreviewImage === fourthThumbImage ? 'border-orange-500 shadow-sm' : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <img src={fourthThumbImage} className="max-h-full max-w-full object-contain" alt="Thumb 4" referrerPolicy="no-referrer" />
                </button>
              </div>
            </div>

            {/* COLUMN 2: MIDDLE INPUT CONTROLS (Span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-start text-left space-y-4">
              
              {/* Elegant Breadcrumbs with Blue links */}
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex flex-wrap items-center gap-1 font-sans">
                <button onClick={onClose} className="text-blue-600 hover:underline bg-transparent border-0 cursor-pointer p-0 font-bold">{language === 'bn' ? 'হোম' : 'Home'}</button>
                <span>&gt;</span>
                <button onClick={onClose} className="text-blue-600 hover:underline bg-transparent border-0 cursor-pointer p-0 font-bold">{language === 'bn' ? 'টি-শার্ট' : 'T-Shirt'}</button>
                <span>&gt;</span>
                <button onClick={onClose} className="text-blue-600 hover:underline bg-transparent border-0 cursor-pointer p-0 font-bold">{language === 'bn' ? 'পোলো টি-শার্ট' : 'Pollo T-Shirt'}</button>
                <span>&gt;</span>
                <button onClick={onClose} className="text-blue-600 hover:underline bg-transparent border-0 cursor-pointer p-0 font-bold">{language === 'bn' ? 'জার্সি' : 'Jarsy'}</button>
                <span>&gt;</span>
                <span className="text-zinc-800 font-extrabold">{displayName}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight">
                {displayName}
              </h2>

              {/* Star line with Review links precisely styled */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-zinc-500">
                <span className="flex text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-current text-amber-500 stroke-none" />
                  ))}
                </span>
                <span className="text-orange-500">({product.reviewsCount})</span>
                <span className="text-orange-500 hover:underline cursor-pointer">{product.reviewsCount} {language === 'bn' ? 'রিভিউ' : 'Reviews'}</span>
                <span className="text-zinc-350">|</span>
                <span className="text-orange-500">2 {language === 'bn' ? 'অর্ডার' : 'Orders'}</span>
                <span className="text-zinc-350">|</span>
                <span className="text-orange-500">0 {language === 'bn' ? 'উইশ লিস্টেড' : 'Wish Listed'}</span>
              </div>

              {/* Code */}
              <p className="text-[11px] font-black text-zinc-800 tracking-wider">
                {language === 'bn' ? 'প্রোডাক্ট কোড' : 'Product Code'}: {131900 + displayName.length * 3}
              </p>

              {/* Key Features block */}
              <div className="border border-zinc-100 p-4 rounded-xl">
                <h4 className="text-xs font-black uppercase text-zinc-850 mb-1.5 font-sans">
                  {language === 'bn' ? 'মূল বৈশিষ্ট্যসমূহ' : 'Key Features'}
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {displayDesc}
                </p>
              </div>

              {/* Price details explicitly formatted */}
              <div className="flex items-baseline space-x-2.5 pt-1">
                <span className="text-[#f58220] font-black text-xl tracking-normal">
                  {formatMoney(unitPrice)}
                </span>
                <span className="text-zinc-400 line-through text-xs font-bold font-mono">
                  {formatMoney(originalPrice)}
                </span>
                <span className="text-zinc-350 font-bold"> - </span>
                <span className="text-[#f58220] font-black text-xl tracking-normal">
                  {formatMoney(Math.ceil(unitPrice * 1.015))}
                </span>
                <span className="text-zinc-400 line-through text-xs font-bold font-mono">
                  {formatMoney(Math.ceil(originalPrice * 1.015))}
                </span>
              </div>

              {/* Clothing Selection details */}
              <div className="space-y-3 pt-2.5 border-t border-zinc-100">
                {/* Color Selector */}
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-extrabold text-zinc-700 w-12 shrink-0">
                    {language === 'bn' ? 'কালার :' : 'Color :'}
                  </span>
                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedColor('blue')}
                      className={`h-6 w-6 rounded-full bg-white border-2 transition cursor-pointer flex items-center justify-center ${
                        selectedColor === 'blue' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-zinc-300 hover:scale-105'
                      }`}
                    >
                      <div className="h-4.5 w-4.5 rounded-full bg-[#3b82f6]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedColor('grey')}
                      className={`h-6 w-6 rounded-full bg-white border-2 transition cursor-pointer flex items-center justify-center ${
                        selectedColor === 'grey' ? 'border-zinc-800' : 'border-zinc-300 hover:scale-105'
                      }`}
                    >
                      <div className="h-4.5 w-4.5 rounded-full bg-[#475569]" />
                    </button>
                  </div>
                </div>

                {/* Size Selector */}
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-extrabold text-zinc-700 w-12 shrink-0">
                    {language === 'bn' ? 'সাইজ :' : 'Size :'}
                  </span>
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    {(['M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`h-8 w-11 border font-semibold rounded text-xs transition cursor-pointer select-none ${
                          selectedSize === sz
                            ? 'border-blue-500 bg-blue-50/20 text-blue-600'
                            : 'border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Selector */}
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-extrabold text-zinc-700 w-12 shrink-0">
                    {language === 'bn' ? 'বয়স :' : 'Age :'}
                  </span>
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    {(['28', '30', '32'] as const).map((ag) => (
                      <button
                        key={ag}
                        type="button"
                        onClick={() => setSelectedAge(ag)}
                        className={`h-8 w-11 border font-semibold rounded text-xs transition cursor-pointer select-none ${
                          selectedAge === ag
                            ? 'border-blue-500 bg-blue-50/20 text-blue-600'
                            : 'border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50'
                        }`}
                      >
                        {ag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity Selector + share row with orange details */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-100/50">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-extrabold text-zinc-700 shrink-0">
                    {language === 'bn' ? 'পরিমাণ :' : 'Quantity :'}
                  </span>
                  <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-1 max-w-xs shadow-2xs">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      className="h-7 w-7 rounded-lg hover:bg-zinc-50 flex items-center justify-center text-[#f58220] transition cursor-pointer border-0 bg-transparent font-black"
                    >
                      <Minus size={11} className="stroke-[3.5px]" />
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={quantity}
                      className="text-xs font-mono font-black w-8 text-center text-zinc-800 bg-transparent border-0 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock}
                      className="h-7 w-7 rounded-lg hover:bg-zinc-50 flex items-center justify-center text-[#f58220] transition cursor-pointer border-0 bg-transparent font-black"
                    >
                      <Plus size={11} className="stroke-[3.5px]" />
                    </button>
                  </div>
                </div>

                {/* Circular social logos precisely matched */}
                <div className="flex items-center space-x-2 shrink-0">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-[#3b5998] hover:opacity-90 text-white flex items-center justify-center shadow-xs transition font-black text-xs">f</a>
                  <a href="https://messenger.com" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-[#0084ff] hover:opacity-90 text-white flex items-center justify-center shadow-xs transition text-xs">💬</a>
                  <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-[#25d366] hover:opacity-90 text-white flex items-center justify-center shadow-xs transition text-xs">📞</a>
                  <a href="mailto:dapathshala.info@gmail.com" className="h-7 w-7 rounded-full bg-[#ea4335] hover:opacity-90 text-white flex items-center justify-center shadow-xs transition text-xs">✉</a>
                </div>
              </div>

              {/* Total Price dynamic info banner */}
              <div className="py-3.5 border-t border-b border-zinc-100/60 flex items-center justify-between w-full">
                <span className="text-xs font-extrabold text-zinc-700">
                  {language === 'bn' ? 'মোট দাম :' : 'Total Price :'}
                </span>
                <span className="text-sm font-black text-[#f58220] font-sans">
                  {formatMoney(totalPrice)} <span className="text-[10px] text-zinc-400 font-bold">({language === 'bn' ? 'ভ্যাট : ৳০.০০' : 'Tax : ৳0.00'})</span>
                </span>
              </div>

              {/* Action buttons with orange accents */}
              <div className="flex items-center space-x-3 w-full pt-1">
                {/* BUY NOW TRIGGER */}
                <button
                  type="button"
                  onClick={handleBuyNowSubmit}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-5 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm border-0 ${
                    isOutOfStock
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-[#ff8f00] hover:bg-[#f58220] text-white active:scale-95'
                  }`}
                >
                  <ShoppingCart size={13} className="stroke-[3px]" />
                  <span>{language === 'bn' ? 'সরাসরি কিনুন' : 'Buy now'}</span>
                </button>

                {/* ADD TO CART TRIGGER */}
                <button
                  type="button"
                  onClick={handleCartSubmit}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-5 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm border-0 ${
                    isOutOfStock
                      ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed'
                      : isAddedSuccessfully
                        ? 'bg-green-600 text-white'
                        : 'bg-[#f58220] hover:bg-orange-600 text-white active:scale-95'
                  }`}
                >
                  {isAddedSuccessfully ? (
                    <>
                      <Check size={13} className="stroke-[3.5px]" />
                      <span>{language === 'bn' ? 'যোগ হয়েছে!' : 'Added!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={13} className="stroke-[3px]" />
                      <span>{language === 'bn' ? 'কার্ট যোগ করুন' : 'Add to cart'}</span>
                    </>
                  )}
                </button>

                {/* Heart wishlist toggle count */}
                <button
                  type="button"
                  onClick={() => setIsLoved(!isLoved)}
                  className={`h-11 w-12 rounded-lg border flex items-center justify-center transition cursor-pointer select-none relative shrink-0 ${
                    isLoved 
                      ? 'bg-red-50 border-red-200 text-red-500' 
                      : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <Heart size={15} fill={isLoved ? "currentColor" : "none"} className="stroke-[2.5px]" />
                  <span className="ml-1 text-xs font-bold text-zinc-600">
                    {isLoved ? 1 : 0}
                  </span>
                </button>
              </div>

            </div>

            {/* COLUMN 3: RIGHT PANEL - TRUST ACTIONS & VENDOR INFO (Span 3) */}
            <div className="lg:col-span-3 flex flex-col space-y-5 text-left">
              
              {/* Trust List with nice colored badge backgrounds */}
              <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl p-5 space-y-4 text-left border border-zinc-100/30">
                
                <div className="pb-2 border-b border-zinc-100/50">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-sans">
                    {language === 'bn' ? 'আমাদের প্রতিশ্রুত সেবা' : 'OUR ASSURED SERVICE'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 py-1">
                  <div className="h-9 w-9 rounded-full bg-orange-100/85 flex items-center justify-center text-orange-600 shrink-0">
                    <Truck size={15} className="stroke-[2.5px]" />
                  </div>
                  <div>
                    <h5 className="text-[12px] font-black text-zinc-800 leading-snug">
                      {language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}
                    </h5>
                    <p className="text-[10px] font-semibold text-zinc-400">
                      {language === 'bn' ? 'সারা দেশজুড়ে নিরাপদ শিপিং' : 'all across the country'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-100/50"></div>

                <div className="flex items-center space-x-3 py-1">
                  <div className="h-9 w-9 rounded-full bg-blue-100/85 flex items-center justify-center text-blue-600 shrink-0">
                    <CreditCard size={15} className="stroke-[2.5px]" />
                  </div>
                  <div>
                    <h5 className="text-[12px] font-black text-zinc-800 leading-snug">
                      {language === 'bn' ? 'নিরাপদ পেমেন্ট' : 'Safe Payment'}
                    </h5>
                    <p className="text-[10px] font-semibold text-zinc-400">
                      {language === 'bn' ? 'ক্যাশ অন ডেলিভারি সাপোর্ট' : 'with cash on delivery support'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-100/50"></div>

                <div className="flex items-center space-x-3 py-1">
                  <div className="h-9 w-9 rounded-full bg-rose-100/85 flex items-center justify-center text-rose-500 shrink-0">
                    <RefreshCw size={15} className="stroke-[2.5px]" />
                  </div>
                  <div>
                    <h5 className="text-[12px] font-black text-zinc-800 leading-snug">
                      {language === 'bn' ? '৭ দিনের রিটার্ন পলিসি' : '7 Days Return Policy'}
                    </h5>
                    <p className="text-[10px] font-semibold text-zinc-400">
                      {language === 'bn' ? 'সহজ ও ফ্রি রিপ্লেসমেন্ট' : 'worry-free simple replacement'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-100/50"></div>

                <div className="flex items-center space-x-3 py-1">
                  <div className="h-9 w-9 rounded-full bg-teal-100/85 flex items-center justify-center text-teal-600 shrink-0">
                    <ShieldCheck size={15} className="stroke-[2.5px]" />
                  </div>
                  <div>
                    <h5 className="text-[12px] font-black text-zinc-800 leading-snug">
                      {language === 'bn' ? '১০০% আসল প্রোডাক্ট' : '100% Authentic Products'}
                    </h5>
                    <p className="text-[10px] font-semibold text-zinc-400">
                      {language === 'bn' ? 'অরিজিনাল ব্র্যান্ড ওয়ারেন্টি' : 'official genuine assurance'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Vendor Info Box - Custom professional representation of Nabik Bazar as seen in screenshot */}
              <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col items-center select-none text-center border border-zinc-100/30">
                <div className="flex items-center space-x-3 w-full justify-start pb-4 border-b border-zinc-100/50">
                  <div className="h-12 w-12 rounded-full border border-zinc-100 bg-white flex items-center justify-center p-1.5 shadow-3xs overflow-hidden select-none shrink-0">
                    {/* High-fidelity store bag logo illustration */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-xl leading-none">🛒</span>
                    </div>
                  </div>
                  <div className="text-left leading-tight">
                    <h3 className="text-base font-black text-zinc-900 tracking-tight">
                      Nabik Bazar
                    </h3>
                    <span className="text-[9px] font-bold text-[#f58220] uppercase tracking-widest mt-0.5 block">
                      VERIFIED MERCHANT
                    </span>
                  </div>
                </div>

                {/* Reviews count and products counts in beautiful column format with star indicators */}
                <div className="grid grid-cols-2 gap-2 w-full py-4 my-1 text-center font-sans">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative flex flex-col items-center mb-1">
                      <span className="text-[8px] text-amber-500 absolute -top-2 select-none tracking-tighter">⭐⭐⭐</span>
                      <span className="text-lg mt-1 leading-none select-none">👍</span>
                    </div>
                    <span className="text-xs font-bold text-[#f58220] tracking-tight mt-1.5">
                      0 Reviews
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center border-l border-zinc-100">
                    <div className="flex items-center justify-center mb-1 h-6">
                      <span className="text-xl leading-none select-none">📦</span>
                    </div>
                    <span className="text-xs font-bold text-[#f58220] tracking-tight mt-1.5">
                      25 Products
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(language === 'bn' ? 'নাবিক বাজার আউটলেটে আপনাকে স্বাগতম!' : 'Welcome to Nabik Bazar outlet store!')}
                  className="w-full mt-2.5 py-3 px-5 bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-xs cursor-pointer transition flex items-center justify-center space-x-2 border-0 active:scale-95"
                >
                  <span className="text-xs">🔒</span>
                  <span>{language === 'bn' ? 'স্টোর ভিজিট' : 'Visit Store'}</span>
                </button>

              </div>

            </div>

          </div>
        </div>

        {/* ROW 2: TABS COLUMN ON LEFT (SPANS 9) & MORE FROM STORE COLUMN ON RIGHT (SPANS 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Tabs Container (Span 9) */}
          <div className="lg:col-span-9 flex flex-col space-y-4">
            
            {/* Elegant Tab Switch triggers */}
            <div className="flex border-b border-zinc-100 bg-white rounded-t-xl p-2.5 justify-start space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-0 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#f58220] text-white shadow-xs'
                    : 'text-zinc-500 bg-transparent hover:bg-zinc-50'
                }`}
              >
                {language === 'bn' ? 'ভূমিকা / বিবরণী' : 'Overview'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-0 cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-[#f58220] text-white shadow-xs'
                    : 'text-zinc-500 bg-transparent hover:bg-zinc-50'
                }`}
              >
                {language === 'bn' ? 'রিভিউসমূহ' : 'Reviews'}
              </button>
            </div>

            <div className="bg-white border border-zinc-100/50 rounded-b-xl p-6 shadow-sm min-h-[160px]">
              {activeTab === 'overview' ? (
                <div className="prose prose-sm text-zinc-650 space-y-3.5 text-xs">
                  <p className="font-semibold text-zinc-800 text-sm">{displayName} - {language === 'bn' ? 'প্রোডাক্ট সারাংশ' : 'Product Information Summary'}</p>
                  <p className="leading-relaxed text-zinc-600">{displayDesc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                    <div>
                      <strong className="block text-zinc-805 text-zinc-800 text-[11px] uppercase tracking-wider mb-1">{language === 'bn' ? 'স্পেসিফিকেশন' : 'Specifications'}</strong>
                      <ul className="space-y-1 text-zinc-500 list-disc list-inside font-bold">
                        <li>{language === 'bn' ? 'রং : নীল এবং অ্যাশ' : 'Colors: Blue & Grey'}</li>
                        <li>{language === 'bn' ? 'সাইজ : M, L, XL, XXL' : 'Sizes: M, L, XL, XXL'}</li>
                        <li>{language === 'bn' ? 'বয়সসীমা : ২৮, ৩০, ৩২' : 'Age Range: 28, 30, 32'}</li>
                        <li>{language === 'bn' ? 'সহজ ৭ দিনের রিটার্ন গ্যারান্টি' : 'Worry-free 7 days replacement'}</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="block text-zinc-805 text-zinc-800 text-[11px] uppercase tracking-wider mb-1">{language === 'bn' ? 'ডেলিভারি সংক্রান্ত নিয়ম' : 'Delivery details'}</strong>
                      <ul className="space-y-1 text-zinc-555 list-disc list-inside text-zinc-500 font-bold">
                        <li>{language === 'bn' ? 'সারা বাংলাদেশে হোম ডেলিভারি প্রাপ্য' : 'Cash on delivery islandwide Bangladesh'}</li>
                        <li>{language === 'bn' ? 'সহজ রিটার্ন এবং এক্সচেঞ্জ সাপোর্ট' : 'Hassle-free dynamic store exchange active'}</li>
                        <li>{language === 'bn' ? '২৪ ঘণ্টার মধ্যে দ্রুত ও বিশ্বস্ত শিপিং' : 'Dispatched within 24 hours actively'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs font-bold text-zinc-500">
                  <div className="text-zinc-600 text-left mb-2 text-sm font-black">{language === 'bn' ? 'রিভিউ ও ফিডব্যাকসমূহ :' : 'Product Reviews :'}</div>
                  
                  {/* Default sample reviews matching the visual picture */}
                  <div className="border border-zinc-100 p-3.5 rounded-lg text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-zinc-850">Md. Arif Hasan</strong>
                      <span className="text-[10px] text-zinc-400">30 May, 2026</span>
                    </div>
                    <div className="flex text-amber-500 gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={9} className="fill-current stroke-none" />)}
                    </div>
                    <p className="text-zinc-650 font-medium">দারুণ প্রোডাক্ট এবং কাপড় অনেক নরম। খুবই সন্তুষ্ট!</p>
                  </div>

                  <div className="border border-zinc-100 p-3.5 rounded-lg text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-zinc-850">Shakil Ahmed</strong>
                      <span className="text-[10px] text-zinc-400">14 May, 2026</span>
                    </div>
                    <div className="flex text-amber-500 gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={9} className="fill-current stroke-none" />)}
                    </div>
                    <p className="text-zinc-650 font-medium">Highly recommended seller! Delivered on target time.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* More From The Store Sidebar Card (Span 3) */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <div className="bg-white border border-zinc-100/50 rounded-xl p-4 shadow-sm text-left">
              <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest pb-3 border-b border-zinc-100 mb-3.5">
                {language === 'bn' ? 'স্টোরের অন্যান্য পণ্য' : 'More From The Store'}
              </h3>

              <div className="space-y-4">
                {MORE_FROM_STORE.map((p) => (
                  <div key={p.id} className="flex space-x-3 items-center group cursor-pointer border-b border-zinc-50 pb-2 bg-white relative">
                    {p.discountTag && (
                      <span className="absolute top-0 left-0 bg-[#f58220] text-white text-[8px] font-black px-1 py-0.5 rounded shadow-3xs z-10">
                        {p.discountTag}
                      </span>
                    )}
                    <div className="h-14 w-14 bg-zinc-50 border border-zinc-100 rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={p.image} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" alt={p.name} />
                    </div>
                    <div className="space-y-0.5 text-left text-xs min-w-0 flex-1">
                      <h4 className="font-extrabold text-zinc-800 truncate group-hover:text-orange-500 transition">{p.name}</h4>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={8} className="fill-current stroke-none" />)}
                      </div>
                      <div className="flex items-baseline space-x-1 border-0">
                        <strong className="text-orange-500 font-bold text-xs">৳{p.priceBDT.toLocaleString()}</strong>
                        {p.originalPriceBDT > p.priceBDT && (
                          <span className="text-[10px] text-zinc-400 line-through font-mono">৳{p.originalPriceBDT.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ROW 3: SIMILAR PRODUCTS CAROUSEL / GRID LIST */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100/80">
            <h3 className="text-base font-black text-zinc-800 font-sans tracking-tight">
              {language === 'bn' ? 'অনুরূপ প্রোডাক্টস' : 'Similar Products'}
            </h3>
            <button
              onClick={onClose}
              className="text-xs font-black text-[#f58220] hover:text-orange-655 uppercase tracking-wider bg-transparent border-0 cursor-pointer hover:underline flex items-center"
            >
              <span>{language === 'bn' ? 'সব দেখুন >' : 'View All >'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SIMILAR_PRODUCTS.slice(0, 5).map((sp) => (
              <div 
                key={sp.id} 
                className="bg-white border border-zinc-100/60 rounded-xl p-3 shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                onClick={onClose}
              >
                {sp.discountTag && (
                  <span className="absolute top-1.5 left-1.5 bg-[#f58220] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-3xs z-10">
                    {sp.discountTag}
                  </span>
                )}
                <div className="w-full aspect-square bg-zinc-50 rounded-lg p-2 flex items-center justify-center overflow-hidden h-32">
                  <img src={sp.image} alt={sp.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300" />
                </div>
                <div className="mt-3 space-y-1.5 w-full text-left">
                  <h4 className="text-[11px] font-bold text-zinc-800 line-clamp-2 min-h-[32px] leading-tight">
                    {sp.name}
                  </h4>
                  <div className="flex items-baseline space-x-1.5">
                    <strong className="text-orange-500 font-black text-xs">৳{sp.priceBDT.toLocaleString()}</strong>
                    <span className="text-[10px] text-zinc-400 line-through font-mono">৳{sp.originalPriceBDT.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 4: BEAUTIFUL SITEMAP AND NEWSLETTER FOOTER SUBSECTION precisely matching layout */}
        <div className="bg-[#5c5d60] rounded-2xl p-6 sm:p-10 text-white mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 shadow-sm">
          
          <div className="md:col-span-4 flex flex-col space-y-4 text-left">
            {/* Nabik Bazar logo inside footer */}
            <div className="flex items-center space-x-2">
              <div className="h-10 w-28 bg-white rounded p-1.5 flex items-center justify-center shadow-xs overflow-hidden select-none">
                <span className="text-zinc-800 text-xs font-black tracking-tighter uppercase flex items-center justify-center">
                  <span className="inline-block bg-orange-500 text-white p-0.5 rounded mr-1">🛒</span> Nabik Bazar
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="text-[11px] font-black tracking-widest text-[#f58220] uppercase">{language === 'bn' ? 'অ্যাড ডাউনলোড করুন' : 'DOWNLOAD OUR APP'}</h4>
              <div className="flex items-center space-x-2 mt-2 gap-2">
                <a href="#store-google" className="h-8 py-1.5 px-3 bg-zinc-850 hover:bg-zinc-750 text-white rounded-lg text-[10px] font-extrabold tracking-tight select-none flex items-center space-x-1 text-left active:scale-95 transition">
                  <span>📱 Google Play</span>
                </a>
                <a href="#store-apple" className="h-8 py-1.5 px-3 bg-zinc-850 hover:bg-zinc-750 text-white rounded-lg text-[10px] font-extrabold tracking-tight select-none flex items-center space-x-1 text-left active:scale-95 transition">
                  <span>🍏 App Store</span>
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col space-y-2 text-left">
            <h4 className="text-xs font-black text-[#f58220] tracking-widest uppercase mb-1.5">{language === 'bn' ? 'বিশেষ ক্যাটাগরি' : 'SPECIAL'}</h4>
            {[
              "Flash Deal", "Featured Products", "Latest Products", "Best Selling Products", "Top Rated Products", "Terms & Conditions", "Privacy Policy"
            ].map((link) => (
              <a key={link} href={`#${link}`} className="text-[11px] font-semibold text-zinc-100 hover:text-orange-300 hover:underline tracking-normal">{link}</a>
            ))}
          </div>

          <div className="md:col-span-3 flex flex-col space-y-2 text-left">
            <h4 className="text-xs font-black text-[#f58220] tracking-widest uppercase mb-1.5">{language === 'bn' ? 'একাউন্ট এবং শিপিং' : 'ACCOUNT & SHIPPING INFO'}</h4>
            {[
              "Profile Info", "Wish List", "Track Order", "Refund Policy", "Return Policy", "Cancellation Policy"
            ].map((link) => (
              <a key={link} href={`#${link}`} className="text-[11px] font-semibold text-zinc-100 hover:text-orange-300 hover:underline tracking-normal">{link}</a>
            ))}
          </div>

          <div className="md:col-span-3 flex flex-col space-y-4 text-left">
            <div>
              <h4 className="text-xs font-black text-[#f58220] tracking-widest uppercase mb-1.5">{language === 'bn' ? 'নিউজলেটার' : 'NEWSLETTER'}</h4>
              <p className="text-[10px] text-zinc-100 font-semibold tracking-wide">
                Subscribe to our new channel to get latest updates
              </p>
              
              <div className="flex bg-white rounded-lg p-0.5 mt-2.5 max-w-full overflow-hidden">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  className="w-full text-xs text-zinc-800 bg-transparent px-2 focus:outline-none placeholder-zinc-400"
                />
                <button
                  type="button"
                  className="bg-[#f58220] hover:bg-orange-650 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-md cursor-pointer tracking-wider border-0 transition"
                >
                  Subscribe
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-[#f58220] tracking-widest uppercase mb-2">{language === 'bn' ? 'অনুসরণ করুন' : 'FOLLOW US'}</h4>
              <div className="flex items-center space-x-2 gap-1 flex-wrap">
                <a href="#twitter" className="h-7 w-7 rounded-full bg-zinc-700/80 hover:bg-blue-400 text-white flex items-center justify-center transition shadow-2xs"><Twitter size={11} /></a>
                <a href="#linkedin" className="h-7 w-7 rounded-full bg-zinc-700/80 hover:bg-blue-600 text-white flex items-center justify-center transition shadow-2xs"><Linkedin size={11} /></a>
                <a href="#youtube" className="h-7 w-7 rounded-full bg-zinc-700/80 hover:bg-red-650 text-white flex items-center justify-center transition shadow-2xs"><Youtube size={11} /></a>
                <a href="#facebook" className="h-7 w-7 rounded-full bg-zinc-700/80 hover:bg-blue-800 text-white flex items-center justify-center transition shadow-2xs"><strong>f</strong></a>
              </div>
            </div>
          </div>

          {/* Quick Contact metadata grid with icons */}
          <div className="md:col-span-12 border-t border-zinc-550 pt-5 mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-zinc-100 text-left">
            <div className="flex items-center space-x-2 font-mono">
              <Phone size={13} className="text-[#f58220]" />
              <span>+8801784905075</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={13} className="text-[#f58220]" />
              <span>juniorclab5656@gmail.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare size={13} className="text-[#f58220]" />
              <span>Support Ticket</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-orange-400 text-sm">📍</span>
              <span>House 11 Rd 3A, Dhaka 1230</span>
            </div>
          </div>

          <div className="md:col-span-12 border-t border-zinc-600 pt-4 flex flex-col md:flex-row justify-between text-[10px] text-zinc-300 select-none">
            <span className="text-left">Powered & Maintained by N.I.Biz Soft</span>
            <div className="flex space-x-3 gap-1.5 mt-2 md:mt-0 font-semibold">
              <a href="#terms" className="hover:underline hover:text-white">Terms & Conditions</a>
              <span>|</span>
              <a href="#privacy" className="hover:underline hover:text-white">Privacy Policy</a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
