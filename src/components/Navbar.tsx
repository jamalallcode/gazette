import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  ShoppingCart,
  Search, 
  Heart, 
  User, 
  Phone, 
  ChevronDown, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Bell
} from "lucide-react";
import { TenantConfig } from "../data/tenantConfig";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currency: 'BDT' | 'USD';
  setCurrency: (currency: 'BDT' | 'USD') => void;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  cartTotalValue: string | number;
  onShowVendorModal: () => void;
  langText: any;
  onAddToCart?: (product: any, quantity?: number) => void;
  onBrandSelect?: () => void;
  currentUser?: any;
  setCurrentUser?: (user: any) => void;
  activeTenant?: TenantConfig;
  onScrollToBlog?: () => void;
  onScrollToVideo?: () => void;
  unreadNotifications?: any[];
  setUnreadNotifications?: (orders: any[]) => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  currency,
  setCurrency,
  language,
  setLanguage,
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  cartTotalValue,
  onShowVendorModal,
  langText,
  onAddToCart,
  onBrandSelect,
  currentUser,
  setCurrentUser,
  activeTenant,
  onScrollToBlog,
  onScrollToVideo,
  unreadNotifications = [],
  setUnreadNotifications
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [showEidBanner, setShowEidBanner] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  
  // Custom states matching requested items
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [wishlistDropdownOpen, setWishlistDropdownOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: "prod-1",
      name: "Antec ATOM B550 Power Supply",
      nameBn: "অ্যান্টেক এটম বি৫৫০ ৫৫০ওয়াট পিএসইউ",
      priceBDT: 4200,
      priceUSD: 35,
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "prod-2",
      name: "Golden Field ATX Case",
      nameBn: "গোল্ডেন ফিল্ড ১১৬ এটিএক্স কেসিং",
      priceBDT: 1800,
      priceUSD: 15,
      image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "prod-3",
      name: "LG 24QP750-B 23.8 Monitor",
      nameBn: "এলজি ২৪কিউপি৭৫০-বি মনিটর",
      priceBDT: 23500,
      priceUSD: 195,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "prod-4",
      name: "ASRock B760M Motherboard",
      nameBn: "অ্যাসরক বি৭৬০এম প্রো-এ মাদারবোর্ড",
      priceBDT: 14900,
      priceUSD: 124,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "prod-5",
      name: "HP 250 G9 Core i3 Laptop",
      nameBn: "এইচপি ২৫০ জি৯ ল্যাপটপ",
      priceBDT: 54200,
      priceUSD: 451,
      image: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=800&auto=format&fit=crop&q=60"
    }
  ]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [sellerDropdownOpen, setSellerDropdownOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);

  const [searchFocused, setSearchFocused] = useState(false);
  const [isHoveringSuggestions, setIsHoveringSuggestions] = useState(false);

  // Hover timeout managers for smooth, unbreakable desktop dropdown transitions
  const [profileTimeoutId, setProfileTimeoutId] = useState<any>(null);
  const [brandTimeoutId, setBrandTimeoutId] = useState<any>(null);
  const [sellerTimeoutId, setSellerTimeoutId] = useState<any>(null);

  const handleMouseEnterProfile = () => {
    if (profileTimeoutId) clearTimeout(profileTimeoutId);
    setProfileDropdownOpen(true);
  };
  const handleMouseLeaveProfile = () => {
    const timeout = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 280);
    setProfileTimeoutId(timeout);
  };

  const handleMouseEnterBrand = () => {
    if (brandTimeoutId) clearTimeout(brandTimeoutId);
    setBrandDropdownOpen(true);
  };
  const handleMouseLeaveBrand = () => {
    const timeout = setTimeout(() => {
      setBrandDropdownOpen(false);
    }, 280);
    setBrandTimeoutId(timeout);
  };

  const handleMouseEnterSeller = () => {
    if (sellerTimeoutId) clearTimeout(sellerTimeoutId);
    setSellerDropdownOpen(true);
  };
  const handleMouseLeaveSeller = () => {
    const timeout = setTimeout(() => {
      setSellerDropdownOpen(false);
    }, 280);
    setSellerTimeoutId(timeout);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > 150) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      triggerToast(customEvent.detail);
    };
    window.addEventListener("app-toast", handleToastEvent);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("app-toast", handleToastEvent);
    };
  }, []);

  const categoriesList = [
    { id: "all", name: "All Categories", nameBn: "সব ক্যাটালগ" },
    { id: "tshirt", name: "T-Shirt", nameBn: "টি-শার্ট" },
    { id: "laptop", name: "Laptop & Notebooks", nameBn: "ল্যাপটপ ও নোটবুক" },
    { id: "appliances", name: "Home Appliance", nameBn: "হোম অ্যাপ্লায়েন্স" },
    { id: "gadgets", name: "Redmi Powerbank 10k", nameBn: "রেডমি পাওয়ার ব্যাংক" },
    { id: "sony", name: "Sony 10 Mark IV", nameBn: "সোনি হেডফোন" },
    { id: "watches", name: "Colmi Smart Watch P71", nameBn: "স্মার্টওয়াচ" }
  ];

  const brandList = [
    { name: "Mokarram", nameBn: "মোকাররম", count: 2 },
    { name: "Robi", nameBn: "রবি", count: 1 },
    { name: "TRASH BAG BLACK", nameBn: "ট্র্যাশ ব্যাগ ব্ল্যাক", count: 1 },
    { name: "Showsee C1 Nose Trimmer", nameBn: "শোওসি সি১ নোজ ট্রিমার", count: 1 },
    { name: "Zeblaze Thor Ultra", nameBn: "জেব্লেজ থর আল্ট্রা", count: 1 },
    { name: "Klospet Tank T2 Elite", nameBn: "ক্লোসপেট ট্যাংক টি২ এলিট", count: 1 },
    { name: "Noise Halo Plus Elite Edition", nameBn: "নয়েজ হ্যালো প্লাস এলিট", count: 1 },
    { name: "Noise Halo Smartwatch", nameBn: "নয়েজ হ্যালো スマートウォッチ", count: 1 },
    { name: "huawei honor band 9", nameBn: "হুয়াওয়ে অনার ব্যান্ড ৯", count: 2 },
    { name: "Imilab w02", nameBn: "ইমিলাব ডব্লিউ০২", count: 1 },
    { name: "Antec Power Supply", nameBn: "অ্যান্টেক পাওয়ার সাপ্লাই", count: 3 },
    { name: "HP Latitude Series", nameBn: "এইচপি ল্যাটিটিউড সিরিজ", count: 2 },
    { name: "LG Ultrawide Monitor", nameBn: "এলজি আল্ট্রাওয়াইড মনিটর", count: 1 },
    { name: "ASRock Pro Motherboard", nameBn: "অ্যাসরক মাদারবোর্ড", count: 2 },
    { name: "Dell Inspiron Core", nameBn: "ডেল ইন্সপিরন কোর", count: 2 },
    { name: "Golden Field RGB Case", nameBn: "গোল্ডেন ফিল্ড আরজিবি কেসিং", count: 3 },
    { name: "Xiaomi Powerbank", nameBn: "শাওমি পাওয়ার ব্যাংক", count: 3 },
    { name: "Sony Wireless Headset", nameBn: "সোনি ওয়্যারলেস হেডসেট", count: 2 },
    { name: "iPhone X Edition", nameBn: "আইফোন এক্স এডিশন", count: 1 },
    { name: "Samsung Z Fold series", nameBn: "স্যামসাং জেড ফোল্ড সিরিজ", count: 1 },
    { name: "Colmi Smart Wearable", nameBn: "কলমি স্মার্ট ওয়্যারেবল", count: 2 },
    { name: "Miyako Blender & Mixer", nameBn: "মিয়াকো ব্লেন্ডার", count: 1 },
    { name: "Walton Refrigerator", nameBn: "ওয়ালটন রেফ্রিজারেটর", count: 2 },
    { name: "Realme Watch Pro", nameBn: "রিয়েলমি ওয়াচ প্রো", count: 1 },
    { name: "H&M Luxury Tees", nameBn: "এইচএন্ডএম টি-শার্ট", count: 4 },
    { name: "Zara Classic Fit Polo", nameBn: "জারা ক্লাসিক পোলো", count: 3 },
    { name: "Nike Sportswear Ready", nameBn: "নাইকি স্পোর্টসওয়্যার", count: 2 },
    { name: "Adidas Performance Wear", nameBn: "অ্যাডিডাস স্পোর্টস ওয়্যার", count: 2 },
    { name: "Tommy Hilfiger Casuals", nameBn: "টমি হিলফিগার ক্যাজুয়াল", count: 1 },
    { name: "Lacoste Signature Shirts", nameBn: "ল্যাকোস্ট সিগনেচার শার্ট", count: 1 },
    { name: "Drop Shoulder Style", nameBn: "ড্রপ শোল্ডার স্টাইল", count: 3 },
    { name: "Bespoke Premium Cotton", nameBn: "বিস্পোক প্রিমিয়াম কটন", count: 2 },
    { name: "Urban Outfit Knitwear", nameBn: "আরবান আউটফিট নিটওয়্যার", count: 2 },
    { name: "Aura Studio Printed", nameBn: "অরা স্টুডিও প্রিন্টেড", count: 1 },
    { name: "Singer Air Conditioner", nameBn: "সিঙ্গার এয়ার কন্ডিশনার", count: 1 },
    { name: "Gree Split Inverter", nameBn: "গ্রি স্প্লিট ইনভার্টার", count: 2 },
    { name: "Midea Eco Cool Series", nameBn: "মিডিয়া ইকো কুল এসি", count: 1 },
    { name: "Philips Kitchen Master", nameBn: "ফিলিপস কিচেন মাস্টার", count: 2 },
    { name: "Panasonic Max Blender", nameBn: "প্যানাসনিক ব্লেন্ডার", count: 1 },
    { name: "Sharp Convection Oven", nameBn: "শার্প ওভেন", count: 1 },
    { name: "Corsair Vengeance RAM", nameBn: "কর্সেয়ার র‍্যাম", count: 4 },
    { name: "G.Skill Trident Neo", nameBn: "জি-স্কিল ট্রাইডেন্ট র‍্যাম", count: 3 },
    { name: "TeamGroup Elite Storage", nameBn: "টিমগ্রুপ এলিট স্টোরেজ", count: 2 },
    { name: "Kingston Fury Memory", nameBn: "কিংস্টন ফিউরি মেমোরি", count: 2 },
    { name: "Crucial MX Series SSD", nameBn: "ক্রুশিয়াল এসএসডি", count: 3 },
    { name: "Western Digital Caviar", nameBn: "ওয়েস্টার্ন ডিজিটাল হার্ডডেস্ক", count: 1 },
    { name: "Seagate Barracuda HDD", nameBn: "সিগেট বারাকুডা হার্ডডিস্ক", count: 1 },
    { name: "Transcend StoreJet Hard", nameBn: "ট্রান্সসেন্ট এক্সটার্নাল ড্রাইভ", count: 2 },
    { name: "Lian Li Dynamic Casing", nameBn: "লিয়ান লি পিসি কেসিং", count: 2 },
    { name: "NZXT Kraken Liquid", nameBn: "এনজেডএক্সটি লিকুইড কুলার", count: 2 },
    { name: "Thermaltake Toughpower", nameBn: "থার্মালটেক পাওয়ার সাপ্লাই", count: 1 },
    { name: "Cooler Master Hyper", nameBn: "কুলার মাস্টার কুলিং ফ্যান", count: 2 },
    { name: "Cougar Gemini RGB Case", nameBn: "কুগার আরজিবি কেসিং", count: 1 },
    { name: "Deepcool Gammaxx Air", nameBn: "ডিপকুল এয়ার কুলার", count: 3 },
    { name: "Xigmatek Windpower Fan", nameBn: "জিগমেটেক উইন্ডপাওয়ার ফ্যান", count: 1 },
    { name: "MSI MAG Carbon Board", nameBn: "এমএসআই মাদারবোর্ড", count: 2 },
    { name: "Gigabyte Aorus Master", nameBn: "গিগাবাইট মাদারবোর্ড", count: 2 },
    { name: "Zotac Gaming GeForce", nameBn: "জোটাক গ্রাফিক্স কার্ড", count: 1 },
    { name: "Sapphire Nitro Graphics", nameBn: "স্যাফায়ার নাইট্রো জিপিইউ", count: 1 },
    { name: "Gamdias Aeolus Cooling", nameBn: "গ্যামডিয়াস কুলিং ফ্যান", count: 2 },
    { name: "Walton Smart Air", nameBn: "ওয়ালটন এয়ার কন্ডিশনার", count: 2 },
    { name: "Singer Multi Cooker", nameBn: "সিঙ্গার মাল্টি কুকার", count: 1 },
    { name: "Jaipan Commando Mixer", nameBn: "জাইপান কমান্ডো মিক্সার", count: 1 },
    { name: "Mi Pocket Powerbank", nameBn: "মি পকেট পাওয়ার ব্যাংক", count: 2 },
    { name: "WH-1000XM5 Premium", nameBn: "ডব্লিউএইচ-১০০০এক্সএম৫ হেডফোন", count: 1 },
    { name: "WH-CH720N Noise Cancel", nameBn: "ডব্লিউএইচ-সিএইচ৭২০এন হেডফোন", count: 1 },
    { name: "MDR-7506 Studio Pro", nameBn: "এমডিআর-৭৫০৬ হেডফোন", count: 1 },
    { name: "Colmi P71 Smart Watch", nameBn: "কলমি পি৭১ স্মার্টওয়াচ", count: 2 },
    { name: "Redmi QuickCharge 10k", nameBn: "রেডমি কুইক চার্জ ১০কে", count: 1 },
    { name: "Real-time GPS Tracker", nameBn: "জিপিএস ট্র্যাকার", count: 1 },
    { name: "Apple Watch Ultra", nameBn: "অ্যাপল ওয়াচ আল্ট্রা", count: 1 },
    { name: "OnePlus Nord Watch", nameBn: "ওয়ানপ্লাস নর্ড ওয়াচ", count: 1 },
    { name: "Huawei Fit Active", nameBn: "হুয়াওয়ে ফিট অ্যাক্টিভ", count: 2 },
    { name: "Amazfit Bip 3 Pro", nameBn: "অ্যামাজফিট বিপ ৩ প্রো", count: 1 },
    { name: "Fire-Boltt Ring Series", nameBn: "ফায়ার বল্ট রিং সিরিজ", count: 1 },
    { name: "Noise ColorFit Pulse", nameBn: "নয়েজ কালারফিট পালস", count: 2 },
    { name: "Pebble Cosmos Prime", nameBn: "পেবল কসমস প্রাইম", count: 1 },
    { name: "boAt Wave Call", nameBn: "বোট ওয়েভ কল", count: 1 },
    { name: "Fastrack Reflex Play", nameBn: "ফাস্ট্র্যাক রিফ্লেক্স প্লে", count: 1 },
    { name: "Lenovo Legion Pro", nameBn: "লেনোভো লিজিয়ন প্রো", count: 2 },
    { name: "Asus ROG Strix", nameBn: "আসুস আরওজি স্ট্রিপ", count: 1 },
    { name: "Acer Predator Triton", nameBn: "এসার প্রিডেটর ল্যাপটপ", count: 1 },
    { name: "MSI Katana Gaming", nameBn: "এমএসআই কাটানা গেমিং", count: 2 },
    { name: "Apple MacBook Air M3", nameBn: "অ্যাপল ম্যাকবুক এয়ার এম৩", count: 2 },
    { name: "Razors Blade Stealth", nameBn: "রেজর ব্লেড স্টিলথ ল্যাপটপ", count: 1 },
    { name: "Microsoft Surface Pro3", nameBn: "সারফেস প্রো ৩ ট্যাব ল্যাপটপ", count: 1 },
    { name: "Chuwi HeroBook Pro", nameBn: "চুয়ি হিরোবুক প্রো", count: 2 },
    { name: "Avita Liber V14", nameBn: "আভিতা ল্যাটিটিউড ল্যাপটপ", count: 1 },
    { name: "Huawei MateBook D15", nameBn: "হুয়াওয়ে মেটবুক ডি১৫", count: 1 },
    { name: "Infinix INBook Y1", nameBn: "ইনফিনিক্স ইনবুক ওয়াই১", count: 2 },
    {name: "Baseus Magnetic Bank", nameBn: "বেসিয়াস ম্যাগনেটিক ব্যাংক", count: 1},
    {name: "Joyroom Power Charge", nameBn: "জয়রুম পাওয়ার ব্যাংক", count: 1},
    {name: "Remax Proda Power", nameBn: "রেম্যাক্স প্রোডা পাওয়ার", count: 1},
    {name: "Oraimo Toast Portable", nameBn: "ওরাইমো টোস্ট পোর্টেবল", count: 1},
    {name: "Havit Multi Storage", nameBn: "হ্যাভিট মাল্টি স্টোরেজ", count: 2},
    {name: "A4Tech Bloody Click", nameBn: "এফরটেক ব্লাডি মাউস", count: 2},
    {name: "Fantech Esports Mouse", nameBn: "ফ্যানটেক গেমিং মাউস", count: 1},
    {name: "Redragon Kumara Board", nameBn: "রেডড্রাগন কিবোর্ড", count: 1},
    {name: "Rapoo MultiMode Wireless", nameBn: "রাপো ওয়্যারলেস কিবোর্ড", count: 2},
    {name: "Logitech G Pro Series", nameBn: "লজিটেক প্রো মাউস কিবোর্ড", count: 1},
    {name: "Nabik Signature Polo", nameBn: "নাবিক সিগনেচার পোলো শার্ট", count: 1},
    {name: "Club Room Designer Premium", nameBn: "ক্লাব রুম ডিজাইনার টিশার্ট", count: 1}
  ];

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setSearchQuery("");
    setCurrentTab('shop');
    setCategoriesDropdownOpen(false);
  };

  // Human-readable active label based on mapping
  const activeCategoryLabel = categoriesList.find(c => c.id === selectedCategory)?.[language === 'bn' ? 'nameBn' : 'name'] || "Categories";

  return (
    <header className="w-full flex flex-col font-sans text-zinc-800" id="nabik-bazar-header">
      
      {/* 1. Maroon/Red Top Offer Banner */}
      {showEidBanner && activeTenant?.enableDiscountedProducts && (
        <div className="bg-[#511111] text-white text-xs py-1 px-4 select-none relative transition-all duration-300">
          <div className="max-w-7xl mx-auto flex justify-center items-center font-bold text-sm">
            <span>Eid Offer Discount Price Coming Soon</span>
          </div>
          <button 
            type="button"
            onClick={() => setShowEidBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-orange-400 font-bold bg-[#380b0c] hover:bg-[#200506] border-0 text-white rounded w-6 h-6 flex items-center justify-center transition cursor-pointer"
            id="dismiss-eid-banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Orange Top Ribbon Row */}
      <div className="bg-brand text-black text-sm py-1 px-4 shadow-sm font-semibold" style={{ backgroundColor: 'var(--brand-color)' }}>
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center sm:px-6 lg:px-8">
          {/* Left phone number layout */}
          <div className="flex items-center space-x-2">
            <Phone size={14} className="text-black fill-black stroke-[3px]" />
            <span className="font-mono text-black font-extrabold text-[13px] sm:text-[14px]">
              {activeTenant?.phone || "+8801784905075"}
            </span>
          </div>
          
          {/* Right country flag currency / language picker */}
          <div className="flex items-center space-x-4">
            {/* Currency selector toggle with ৳ */}
            <button 
              onClick={() => setCurrency(currency === 'BDT' ? 'USD' : 'BDT')}
              className="hover:opacity-80 transition cursor-pointer flex items-center space-x-1.5 focus:outline-none bg-transparent border-none"
            >
              <span className="font-bold text-[12px] sm:text-[13px]">BDT ৳</span>
              <ChevronDown size={14} className="stroke-[3.5px] mt-0.5" />
            </button>

            <span className="text-black/30">|</span>

            {/* Language dropdown switcher with USA flag */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="hover:opacity-80 transition cursor-pointer flex items-center space-x-1.5 focus:outline-none bg-transparent border-none"
            >
              {/* USA Flag Emoji as standard elegant rendering */}
              <span className="text-[14px] leading-none">🇺🇸</span>
              <span className="font-bold text-[12px] sm:text-[13px]">English</span>
              <ChevronDown size={14} className="stroke-[3.5px] mt-0.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white py-[6px] px-4 border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:px-6 lg:px-8">
          
          {/* Dynamic White-labeled Logo representation */}
          <div 
            onClick={() => {
              setCurrentTab('shop');
              setSelectedCategory('all');
              setSearchQuery("");
            }} 
            className="flex items-center cursor-pointer select-none group shrink-0"
          >
            {activeTenant?.logoUrl ? (
              <div className="bg-white p-1 border border-zinc-200 rounded shadow-xs flex items-center justify-center">
                <img 
                  src={activeTenant.logoUrl} 
                  alt={activeTenant.shopName || "Nabik Bazar"} 
                  className="h-11 sm:h-12 w-auto object-contain rounded" 
                  referrerPolicy="no-referrer" 
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div 
                  className="h-10 w-10 flex items-center justify-center rounded-lg text-white shadow-xs"
                  style={{ backgroundColor: 'var(--brand-color)' }}
                >
                  <ShoppingBag size={20} className="stroke-[2.5px]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center">
                    <span className="text-[17px] font-black uppercase text-zinc-900 tracking-tight leading-none block">
                      {(language === 'bn' ? (activeTenant?.shopNameBn || "নাবিক বাজার") : (activeTenant?.shopName || "Nabik Bazar")).split(" ")[0]}
                    </span>
                    <span 
                      className="text-[17px] font-black uppercase tracking-tight leading-none ml-1 block"
                      style={{ color: 'var(--brand-color)' }}
                    >
                      {(language === 'bn' ? (activeTenant?.shopNameBn || "নাবিক বাজার") : (activeTenant?.shopName || "Nabik Bazar")).split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                  <span className="text-[8.5px] font-semibold text-zinc-500 uppercase tracking-widest block mt-1 leading-none font-sans">
                    {language === 'bn' ? (activeTenant?.taglineBn || "স্মার্ট শপিং, সেরা জীবন") : (activeTenant?.tagline || "Shop Smart. Live Better")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Large custom search bar: rounded-full pill container, solid orange rounded-right button */}
          <div className="w-full md:max-w-xl group relative">
            <div className="flex items-center overflow-hidden bg-white rounded-full border border-zinc-300 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 shadow-xs transition h-[42px]">
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                aria-label="Search items"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== 'shop') setCurrentTab('shop');
                }}
                className="w-full px-5 py-2 text-sm text-zinc-800 bg-white placeholder-zinc-400 focus:outline-none focus:ring-0"
              />
              <button 
                type="button"
                onClick={() => {
                  setCurrentTab('shop');
                }}
                className="bg-[#f58220] hover:bg-orange-655 text-white h-full px-6 transition cursor-pointer shrink-0 border-0 flex items-center justify-center rounded-r-full"
              >
                <Search size={16} className="stroke-[3.5px]" />
              </button>
            </div>

            {/* Search autocomplete suggestions list */}
            {(searchFocused || isHoveringSuggestions) && (
              <div 
                onMouseEnter={() => setIsHoveringSuggestions(true)}
                onMouseLeave={() => setIsHoveringSuggestions(false)}
                className="absolute top-full left-0 right-0 mt-1 bg-white text-zinc-800 rounded-xl shadow-2xl border border-zinc-200 py-1.5 z-[1000] max-h-[354px] overflow-y-auto divide-y divide-zinc-100 font-sans"
              >
                {brandList
                  .filter((b) => {
                    if (!searchQuery) return true;
                    return b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           b.nameBn.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((brand) => {
                    const isMokarram = brand.name === "Mokarram";
                    return (
                      <button
                        key={brand.name}
                        type="button"
                        onClick={() => {
                          setCurrentTab('shop');
                          setSelectedCategory('all');
                          setSearchQuery(brand.name);
                          setSearchFocused(false);
                          setIsHoveringSuggestions(false);
                          triggerToast(`Showing products for brand: ${language === 'bn' ? brand.nameBn : brand.name}`);
                          if (onBrandSelect) onBrandSelect();
                        }}
                        className={`w-full text-left px-5 py-2.5 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex justify-between items-center ${
                          isMokarram ? "bg-orange-50/30" : ""
                        }`}
                      >
                        <span className={`font-semibold text-zinc-800 text-[12.5px] ${isMokarram ? 'text-orange-600 font-extrabold' : ''}`}>
                          {language === 'bn' ? brand.nameBn : brand.name}
                        </span>
                        <span className="text-zinc-400 font-bold text-[11px] font-mono">({brand.count})</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Custom Action Badges (Wishlists, Account, My Cart) with exact colors & placements */}
          <div className="flex items-center space-x-6">
            


            {/* Wishlists badge */}
            <div 
              onMouseEnter={() => setWishlistDropdownOpen(true)}
              onMouseLeave={() => setWishlistDropdownOpen(false)}
              onClick={() => setWishlistDropdownOpen(!wishlistDropdownOpen)}
              className="flex items-center space-x-2 cursor-pointer select-none group relative py-2"
            >
              <div className="relative p-2 rounded-full hover:bg-zinc-100 transition duration-150">
                <Heart size={20} className="text-[#f58220] stroke-[2.2px] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 bg-[#f58220] text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center shadow">
                  {wishlistItems.length}
                </span>
              </div>
              <div className="text-left hidden xs:block leading-none">
                <span className="block text-xs font-black text-zinc-900 font-sans group-hover:text-[#f58220] transition">Wishlists</span>
              </div>

              {/* Wishlist list dropdown block */}
              {wishlistDropdownOpen && (
                <div 
                   className="absolute top-full right-0 pt-2 w-72 h-auto z-[999]"
                   onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white text-zinc-850 rounded-xl shadow-2xl border border-zinc-200 py-3 px-3 text-left font-sans animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-100 mb-2">
                      <span className="text-xs font-black text-zinc-800 tracking-tight">Your Wishlist ({wishlistItems.length})</span>
                      <span className="text-[10px] text-[#f58220] font-bold">Quick Add</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-1 text-xs py-1 hover:bg-zinc-50 rounded-lg p-1 transition">
                          <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded-md border" />
                          <div className="flex-1 min-w-0 pl-2">
                            <p className="font-bold text-zinc-800 truncate text-[11px] leading-tight max-w-[130px]">{language === 'bn' ? item.nameBn : item.name}</p>
                            <p className="font-mono text-[10px] text-zinc-500 font-bold mt-0.5">৳{item.priceBDT.toLocaleString()}</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAddToCart) {
                                const productToBuy = {
                                  id: item.id,
                                  name: item.name,
                                  nameBn: item.nameBn,
                                  priceBDT: item.priceBDT,
                                  priceUSD: item.priceUSD,
                                  image: item.image,
                                  description: "",
                                  descriptionBn: "",
                                  category: "all",
                                  rating: 4.8,
                                  reviewsCount: 30,
                                  stock: 10,
                                  features: [],
                                  featuresBn: []
                                };
                                onAddToCart(productToBuy, 1);
                                triggerToast(`"${language === 'bn' ? item.nameBn : item.name}" added to cart!`);
                              } else {
                                triggerToast("Add to Cart simulator activated.");
                              }
                            }}
                            className="bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-[9px] px-2 py-1 rounded shadow-2xs border-0 cursor-pointer uppercase transition-all whitespace-nowrap"
                          >
                            + Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account registration / Hello Dashboard dropdown badge */}
            <div 
              onMouseEnter={handleMouseEnterProfile}
              onMouseLeave={handleMouseLeaveProfile}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 py-2 cursor-pointer select-none group relative"
              id="user-dashboard-profile-button"
            >
              <div className="relative p-1.5 rounded-full hover:bg-zinc-100 transition duration-150 shrink-0">
                <User size={20} className="text-[#f58220] stroke-[2.5px] group-hover:scale-105 transition-transform" />
              </div>
              <div className="text-left hidden xs:block leading-none">
                <span className="block text-xs font-black text-zinc-900 font-sans tracking-tight">
                  {currentUser ? (language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'Account') : (language === 'bn' ? 'Account' : 'Account')}
                </span>
                <span className="block text-[10.5px] text-zinc-500 font-semibold mt-1 max-w-[110px] truncate">
                  {currentUser ? `${language === 'bn' ? 'হ্যালো,' : 'Hello,'} ${currentUser.firstName}` : (language === 'bn' ? 'রেজিস্টার বা লগইন' : 'Register or Login')}
                </span>
              </div>

              {/* Account Dropdown Options Panel matched exactly with screenshot layout */}
              {profileDropdownOpen && (
                <div 
                  className="absolute top-full right-0 pt-2 w-44 h-auto z-[999]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white text-zinc-800 rounded-xl shadow-2xl border border-zinc-150 py-1.5 text-left font-sans overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                    {!currentUser ? (
                      <>
                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentTab('signin');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                        >
                          <User size={13} className="text-zinc-650 stroke-[2.5px]" />
                          <span>Sign in</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentTab('signup');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                        >
                          <User size={13} className="text-zinc-650 stroke-[2.5px]" />
                          <span>Sign up</span>
                        </button>

                        <div className="border-t border-zinc-100 my-1"></div>

                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentTab('ai-advisor');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                        >
                          <Sparkles size={11} className="text-amber-500 fill-amber-200" />
                          <span>Aura AI Assistant</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentTab('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                        >
                          <ShieldCheck size={11} className="text-zinc-500" />
                          <span>Admin Control</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentTab('orders');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                        >
                          My Order
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            setProfileModalOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                        >
                          My Profile
                        </button>

                        <div className="border-t border-zinc-100 my-1"></div>

                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentTab('ai-advisor');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                        >
                          <Sparkles size={11} className="text-amber-500 fill-amber-200" />
                          <span>Aura AI Assistant</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentTab('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                        >
                          <ShieldCheck size={11} className="text-zinc-500" />
                          <span>Admin Control</span>
                        </button>

                        <div className="border-t border-zinc-100 my-1"></div>

                        <button 
                          type="button"
                          onClick={() => {
                            setCurrentUser?.(null);
                            setCurrentTab('shop');
                            triggerToast("Successfully cleared active session.");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-extrabold text-rose-500 hover:bg-rose-50 transition border-0 bg-transparent cursor-pointer"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* My Cart trigger badge matches BDT layout perfectly */}
            <div 
              onClick={onOpenCart}
              className="flex items-center space-x-2.5 cursor-pointer select-none group"
              id="header-bar-cart"
            >
              <div className="relative p-2 rounded-full hover:bg-zinc-100 transition duration-150">
                <ShoppingCart size={20} className="text-[#f58220] stroke-[2.2px] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 bg-[#f58220] text-white font-extrabold text-[9px] h-4 w-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              </div>
              <div className="text-left hidden xs:block leading-none select-none">
                <span className="block text-[11px] font-semibold text-zinc-500 font-sans">My cart</span>
                <div className="flex items-center space-x-0.5 text-xs font-black text-zinc-900 mt-1 font-mono">
                  <span>৳{typeof cartTotalValue === 'number' ? cartTotalValue.toLocaleString() : cartTotalValue}</span>
                  <ChevronDown size={11} className="stroke-[2.5px] text-zinc-400 inline mt-0.5" />
                </div>
              </div>
            </div>

            {/* Mobile Menu humburger icon */}
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-850 rounded-lg shrink-0"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* 4. Navigation Menu Bar: White code categories trigger + Orange Navigation strip */}
      {isSticky && (
        <div className="h-[44px] hidden md:block" />
      )}
      <div 
        className={`bg-[#f58220] text-black hidden md:block transition-all duration-300 ease-in-out ${
          isSticky 
            ? "fixed top-0 left-0 right-0 z-50 shadow-xl bg-[#f58220]/95 backdrop-blur-md border-b border-orange-600/20 py-1" 
            : "relative shadow-md py-0"
        }`} 
        id="sticky-header-menu"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:px-6 lg:px-8">
          
          <div className="flex items-center">
            
            {/* White Dropdown Categories Tab with orange grid and font */}
            <div className="relative my-1.5 mr-4">
              <button 
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className={`bg-white text-[#f58220] hover:bg-zinc-50 font-bold text-sm flex items-center space-x-2.5 border-0 transition-all duration-300 select-none tracking-wide rounded-lg shadow-sm ${
                  isSticky ? "px-6 py-1.5 sm:px-8" : "px-6 sm:px-8 py-1.5"
                }`}
                style={{ width: "260px" }}
                id="white-categories-button"
              >
                <LayoutGrid size={16} className="text-[#f58220] fill-[#f58220] stroke-[2.5px]" />
                <span className="font-bold shrink-0">Categories</span>
                <ChevronDown size={14} className="stroke-[3px] text-[#f58220] ml-auto" />
              </button>
 
               {/* Popup categories list dropdown block */}
              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white text-zinc-800 rounded-b-xl shadow-2xl border border-zinc-200 py-1.5 z-50">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full text-left px-5 py-2.5 text-xs font-semibold hover:bg-orange-50 hover:text-orange-650 transition duration-150 flex items-center justify-between border-b last:border-b-0 border-zinc-100 ${
                        selectedCategory === cat.id ? 'bg-orange-50 text-orange-500 font-extrabold' : ''
                      }`}
                    >
                      <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                      {selectedCategory === cat.id && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Horizontal menu bar - solid black/dark text on vibrant orange canvas strip */}
            <div className="flex items-center pl-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('shop');
                  setSelectedCategory('all');
                  setSearchQuery("");
                }}
                className={`px-4.5 text-[13.5px] font-bold text-black hover:bg-[#e06c09] transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                  isSticky ? "py-2" : "py-3"
                }`}
              >
                <span>Home</span>
              </button>

              <div 
                className="relative"
                onMouseEnter={handleMouseEnterBrand}
                onMouseLeave={handleMouseLeaveBrand}
              >
                <button
                  type="button"
                  onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                  className={`px-4.5 text-[13.5px] font-bold text-black hover:bg-[#e06c09] transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                    isSticky ? "py-2" : "py-3"
                  }`}
                >
                  <span>Brand</span>
                </button>

                {brandDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 pt-2 w-72 h-auto z-[999]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-white text-zinc-808 rounded-xl shadow-2xl border border-zinc-200 py-2.5 text-left font-sans animate-in fade-in slide-in-from-top-2 duration-200 max-h-[354px] overflow-y-auto divide-y divide-zinc-100">
                      {brandList.map((brand) => (
                        <button
                          key={brand.name}
                          type="button"
                          onClick={() => {
                            setCurrentTab('shop');
                            setSelectedCategory('all');
                            setSearchQuery(brand.name);
                            setBrandDropdownOpen(false);
                            triggerToast(`Showing products for brand: ${language === 'bn' ? brand.nameBn : brand.name}`);
                            if (onBrandSelect) onBrandSelect();
                          }}
                          className="w-full text-left px-5 py-2 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-semibold text-zinc-800 text-[12.5px]">{language === 'bn' ? brand.nameBn : brand.name}</span>
                          <span className="text-zinc-400 font-bold text-[11px] font-mono">({brand.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeTenant?.enableDiscountedProducts && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('landing');
                  }}
                  className={`px-4.5 text-[13.5px] font-bold text-black hover:bg-[#e06c09] transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                    isSticky ? "py-2" : "py-3"
                  }`}
                >
                  <span>Discounted Products</span>
                </button>
              )}

              {activeTenant?.enableVendorModal && (
                <button
                  type="button"
                  onClick={onShowVendorModal}
                  className={`px-4.5 text-[13.5px] font-bold text-black hover:bg-[#e06c09] transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                    isSticky ? "py-2" : "py-3"
                  }`}
                >
                  <span>All Vendors</span>
                </button>
              )}

              <div 
                className="relative"
                onMouseEnter={handleMouseEnterSeller}
                onMouseLeave={handleMouseLeaveSeller}
              >
                <button
                  type="button"
                  onClick={() => setSellerDropdownOpen(!sellerDropdownOpen)}
                  className={`px-4.5 text-[13.5px] font-bold text-black hover:bg-[#e06c09] transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                    isSticky ? "py-2" : "py-3"
                  }`}
                >
                  <span>Seller Zone</span>
                  <ChevronDown size={12} className="stroke-[3.5px] ml-0.5 inline" />
                </button>

                {sellerDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-0 w-44 bg-white text-zinc-800 rounded-lg shadow-2xl border border-zinc-200 py-1.5 z-[999] text-left font-sans animate-in fade-in slide-in-from-top-2 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      type="button"
                      onClick={() => {
                        onShowVendorModal();
                        setSellerDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-750 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                    >
                      Become A Seller
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        setCurrentTab('admin');
                        setSellerDropdownOpen(false);
                        triggerToast("Switched to Merchant Administration environment.");
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-705 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                    >
                      Seller login
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        setCurrentTab('admin');
                        setSellerDropdownOpen(false);
                        triggerToast("Welcome promoter! Showing affiliate & influencer ledgers.");
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                    >
                      Affiliate
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onScrollToBlog}
                className={`px-4.5 text-[13.5px] font-semibold text-black hover:bg-[#e06c09] hover:text-white transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                  isSticky ? "py-2" : "py-3"
                }`}
              >
                <span>{language === 'bn' ? 'ব্লগ' : 'Blog'}</span>
              </button>

              <button
                type="button"
                onClick={onScrollToVideo}
                className={`px-4.5 text-[13.5px] font-semibold text-black hover:bg-[#e06c09] hover:text-white transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                  isSticky ? "py-2" : "py-3"
                }`}
              >
                <span>{language === 'bn' ? 'ভিডিও' : 'Video'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('live-tracking');
                }}
                className={`px-4.5 text-[13.5px] font-bold text-black hover:bg-[#e06c09] transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                  isSticky ? "py-2" : "py-3"
                }`}
              >
                <span>Track Order</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu list item drawers */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-zinc-900 border-b border-zinc-200 py-3 px-4 space-y-2 z-40 relative">
          <div className="flex flex-col space-y-1 text-sm font-bold">
            <button 
              onClick={() => {
                setCurrentTab('shop');
                setSelectedCategory('all');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2"
            >
              Home
            </button>
            <div>
              <button 
                onClick={() => {
                  setMobileBrandsOpen(!mobileBrandsOpen);
                }}
                className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2 flex justify-between items-center"
              >
                <span>Brand</span>
                <ChevronDown size={14} className={`transform transition-transform ${mobileBrandsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileBrandsOpen && (
                <div className="pl-4 max-h-48 overflow-y-auto space-y-1 mt-1 bg-zinc-50 rounded-lg p-1.5 border border-zinc-100">
                  {brandList.map((brand) => (
                    <button
                      key={brand.name}
                      onClick={() => {
                        setCurrentTab('shop');
                        setSelectedCategory('all');
                        setSearchQuery(brand.name);
                        setMobileBrandsOpen(false);
                        setMobileMenuOpen(false);
                        if (onBrandSelect) onBrandSelect();
                      }}
                      className="w-full text-left py-1.5 px-2 text-xs text-zinc-700 hover:text-orange-500 hover:bg-white rounded transition flex justify-between items-center cursor-pointer border-0 bg-transparent font-medium"
                    >
                      <span className="font-bold text-zinc-800">{language === 'bn' ? brand.nameBn : brand.name}</span>
                      <span className="text-zinc-400 text-[10px] font-mono font-bold">({brand.count})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {activeTenant?.enableDiscountedProducts && (
              <button 
                onClick={() => {
                  setCurrentTab('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2 text-rose-600"
              >
                Discounted Products
              </button>
            )}
            {activeTenant?.enableVendorModal && (
              <>
                <button 
                  onClick={() => {
                    onShowVendorModal();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2"
                >
                  All Vendors
                </button>
                <button 
                  onClick={() => {
                    onShowVendorModal();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2"
                >
                  Seller Zone/Register
                </button>
              </>
            )}
            <button 
              onClick={() => {
                onScrollToBlog?.();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2"
            >
              {language === 'bn' ? 'ব্লগ' : 'Blog'}
            </button>
            <button 
              onClick={() => {
                onScrollToVideo?.();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2"
            >
              {language === 'bn' ? 'ভিডিও' : 'Video'}
            </button>
            {activeTenant?.enableTrackOrder && (
              <button 
                onClick={() => {
                  setCurrentTab('live-tracking');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2"
              >
                Track Order
              </button>
            )}
            {activeTenant?.enableAiAdvisor && (
              <button 
                onClick={() => {
                  setCurrentTab('ai-advisor');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-brand hover:bg-zinc-50 rounded px-2 font-black"
                style={{ color: 'var(--brand-color)' }}
              >
                Aura AI Assistant
              </button>
            )}
            <button 
              onClick={() => {
                setCurrentTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-[#f58220] hover:bg-zinc-50 rounded px-2"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Profile Details Dialog Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-zinc-100 text-left font-sans">
            <button 
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 bg-zinc-100 hover:bg-zinc-200 rounded-full h-7 w-7 flex items-center justify-center border-0 cursor-pointer text-xs font-black"
            >
              ✕
            </button>
            {currentUser ? (
              <>
                <div className="flex flex-col items-center text-center pb-4 border-b border-zinc-100 mb-4 font-sans">
                  <div className="h-16 w-16 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-orange-655 font-black text-lg mb-2 text-[#f58220]">
                    {(currentUser.firstName?.slice(0, 1) || "G").toUpperCase()}{(currentUser.lastName?.slice(0, 1) || "U").toUpperCase()}
                  </div>
                  <h3 className="text-base font-black text-zinc-900">{currentUser.firstName} {currentUser.lastName}</h3>
                  <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider mt-0.5">Verified Account Space</p>
                </div>
                <div className="space-y-3.5 text-xs font-sans font-semibold">
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-400">User Account Type:</span>
                    <span className="font-bold text-zinc-805">Customer / Client</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-400">Email Address:</span>
                    <span className="font-mono font-bold text-zinc-800 text-[11px]">{currentUser.email || (language === 'bn' ? 'সংযুক্ত ইমেইল নেই' : 'No email address')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-400">Phone Sequence:</span>
                    <span className="font-mono font-bold text-zinc-850">{currentUser.phone || (language === 'bn' ? 'সংযুক্ত ফোন নেই' : 'No mobile number')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-400">Account Status:</span>
                    <span className="bg-emerald-50 text-emerald-705 text-[9.5px] uppercase font-black px-2 py-0.5 rounded-full">
                      ★ Active
                    </span>
                  </div>
                  {currentUser.address && (
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Linked Address:</span>
                      <span className="font-bold text-zinc-805 truncate max-w-[160px] text-right">{currentUser.address}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setProfileModalOpen(false);
                    setCurrentTab('orders');
                  }}
                  className="mt-6 w-full bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-xs py-2.5 rounded-lg border-0 cursor-pointer shadow transition"
                >
                  {language === 'bn' ? 'অ্যাকাউন্ট ড্যাশবোর্ড পরিচালনা' : 'Manage Account Settings'}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center pb-4 border-b border-zinc-100 mb-4 font-sans max-w-sm">
                  <div className="h-16 w-16 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-[#f58220] font-black text-lg mb-2">
                    G
                  </div>
                  <h3 className="text-base font-black text-zinc-900">{language === 'bn' ? 'গেস্ট ভিজিটর' : 'Guest Visitor'}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{language === 'bn' ? 'নিবন্ধিত নাই' : 'No Active Session'}</p>
                </div>
                <div className="space-y-3.5 text-xs font-semibold font-sans text-center text-zinc-500 py-3 leading-relaxed">
                  {language === 'bn' 
                    ? 'অর্ডার হিস্ট্রি ট্র্যাকিং করতে এবং আপনার ডেলিভারি প্রোফাইল পরিচালনা করতে লগইন করুন।' 
                    : 'Please register or authenticate an account to unlock personalized tracking logs.'}
                </div>
                <div className="mt-4 flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setProfileModalOpen(false);
                      setCurrentTab('signin');
                    }}
                    className="w-full bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-xs py-2.5 rounded-lg border-0 cursor-pointer shadow transition font-sans"
                  >
                    {language === 'bn' ? 'সাইন ইন করুন' : 'Sign in to Account'}
                  </button>
                  <button
                    onClick={() => {
                      setProfileModalOpen(false);
                      setCurrentTab('signup');
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-lg border-0 cursor-pointer shadow transition font-sans text-center"
                  >
                    {language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Customer Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sleek Floating Action Toasts */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-zinc-950/95 text-white text-xs font-black px-4.5 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 border border-zinc-800/50 animate-bounce">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="tracking-wide select-none">{toastMsg}</span>
        </div>
      )}
    </header>
  );
}
