import React, { useState, useEffect, useRef } from "react";
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
  Bell,
  Languages
} from "lucide-react";
import { TenantConfig, MenuItemConfig, MenuItemDropdownItem, DEFAULT_MENU_ITEMS } from "../data/tenantConfig";

const GazzetteLogo = ({ isMobile = false, isDarkBg = false }: { isMobile?: boolean; isDarkBg?: boolean }) => {
  return (
    <div className="flex items-center space-x-2 select-none group">
      {/* Premium Emblem with double layering & glowing elements */}
      <div className={`relative ${isMobile ? 'h-[36px] w-[36px]' : 'h-[38px] w-[38px]'} rounded-xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-black p-[2px] shadow-sm flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-all duration-300`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-[#f58220] opacity-15 rounded-xl blur-xs group-hover:opacity-25 transition-all" />
        
        {/* Inner Core */}
        <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle line accent */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#f58220]/75 to-transparent" />
          
          <svg className="h-5 w-5 text-[#f58220]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12H12V14.5H17.2C16.5 16.5 14.5 17.5 12 17.5C8.96243 17.5 6.5 15.0376 6.5 12C6.5 8.96243 8.96243 6.5 12 6.5C14 6.5 15.8 7.5 16.8 9.2L18.9 7.1C17.3 4.8 14.8 4 12 4Z" fill="currentColor" className="drop-shadow-[0_0_2px_rgba(245,130,32,0.5)]" />
            <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
          </svg>
        </div>
      </div>
      
      {/* Brand Text Styling */}
      <div className="flex flex-col text-left justify-center">
        <span className={`font-sans font-black tracking-tight uppercase leading-none ${isDarkBg ? 'text-white' : 'text-zinc-900'} ${isMobile ? 'text-[16px]' : 'text-[18px]'} tracking-[0.03em]`}>
          Gazzette
        </span>
        <span className={`${isDarkBg ? 'text-black/80 font-black' : 'text-[#f58220] font-black'} tracking-[0.14em] leading-none ${isMobile ? 'text-[7.5px] mt-1' : 'text-[8px] mt-1.5'} font-sans uppercase`}>
          PREMIUM STORE
        </span>
      </div>
    </div>
  );
};

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
  const [logoClickHistory, setLogoClickHistory] = useState<number[]>([]);
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [quickHubOpen, setQuickHubOpen] = useState(false);

  const [searchFocused, setSearchFocused] = useState(false);
  const [isHoveringSuggestions, setIsHoveringSuggestions] = useState(false);

  // Hover timeout managers for smooth, unbreakable desktop dropdown transitions using refs to avoid React state closure desync
  const profileTimeoutRef = useRef<any>(null);
  const brandTimeoutRef = useRef<any>(null);
  const sellerTimeoutRef = useRef<any>(null);
  const dropdownTimeoutRef = useRef<any>(null);

  // Custom configuration menu state variables
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const openDropdownIdRef = useRef<string | null>(null);

  useEffect(() => {
    openDropdownIdRef.current = openDropdownId;
  }, [openDropdownId]);

  const handleMouseEnterItem = (id: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdownId(id);
  };

  const handleMouseLeaveItem = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 280);
  };

  const handleMouseEnterProfile = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setProfileDropdownOpen(true);
  };
  const handleMouseLeaveProfile = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    profileTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 280);
  };

  const handleMouseEnterBrand = () => {
    if (brandTimeoutRef.current) clearTimeout(brandTimeoutRef.current);
    setBrandDropdownOpen(true);
  };
  const handleMouseLeaveBrand = () => {
    if (brandTimeoutRef.current) clearTimeout(brandTimeoutRef.current);
    brandTimeoutRef.current = setTimeout(() => {
      setBrandDropdownOpen(false);
    }, 280);
  };

  const handleMouseEnterSeller = () => {
    if (sellerTimeoutRef.current) clearTimeout(sellerTimeoutRef.current);
    setSellerDropdownOpen(true);
  };
  const handleMouseLeaveSeller = () => {
    if (sellerTimeoutRef.current) clearTimeout(sellerTimeoutRef.current);
    sellerTimeoutRef.current = setTimeout(() => {
      setSellerDropdownOpen(false);
    }, 280);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleMenuItemClick = (item: MenuItemConfig) => {
    if (item.dropdownType && item.dropdownType !== 'none') {
      if (openDropdownId === item.id) {
        setOpenDropdownId(null);
      } else {
        setOpenDropdownId(item.id);
      }
      return;
    }

    if (item.actionType === 'tab') {
      setCurrentTab(item.actionValue);
      if (item.actionValue === 'shop') {
        setSelectedCategory('all');
        setSearchQuery('');
      }
    } else if (item.actionType === 'scroll') {
      if (item.actionValue === 'home-blogs-section') {
        onScrollToBlog?.();
      } else if (item.actionValue === 'home-videos-section') {
        onScrollToVideo?.();
      } else {
        setCurrentTab('shop');
        setTimeout(() => {
          const el = document.getElementById(item.actionValue);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    } else if (item.actionType === 'url') {
      if (item.actionValue) {
        window.location.href = item.actionValue;
      }
    }
  };

  const handleDropdownItemClick = (dpItem: MenuItemDropdownItem) => {
    setOpenDropdownId(null);
    if (dpItem.id === "become_seller" || dpItem.id === "register_seller") {
      onShowVendorModal?.();
      return;
    }

    if (dpItem.actionType === 'tab') {
      setCurrentTab(dpItem.actionValue);
      if (dpItem.actionValue === 'shop') {
        setSelectedCategory('all');
        setSearchQuery('');
      }
    } else if (dpItem.actionType === 'scroll') {
      if (dpItem.actionValue === 'home-blogs-section') {
        onScrollToBlog?.();
      } else if (dpItem.actionValue === 'home-videos-section') {
        onScrollToVideo?.();
      } else {
        setCurrentTab('shop');
        setTimeout(() => {
          const el = document.getElementById(dpItem.actionValue);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    } else if (dpItem.actionType === 'url') {
      if (dpItem.actionValue) {
        window.location.href = dpItem.actionValue;
      }
    }
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Bell Dropdown handling
      if (
        !target.closest('#bell-dropdown-container-1') && 
        !target.closest('#bell-dropdown-container-2')
      ) {
        setBellDropdownOpen(false);
      }

      // Profile Dropdown handling
      if (
        !target.closest('#profile-dropdown-container-1') && 
        !target.closest('#profile-dropdown-container-2') &&
        !target.closest('#profile-sidebar-container')
      ) {
        setProfileDropdownOpen(false);
      }

      // Menu dropdown (such as Brand dropdown) handling
      if (openDropdownIdRef.current) {
        if (!target.closest(`#nav-menu-item-${openDropdownIdRef.current}`)) {
          setOpenDropdownId(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    <header className="w-full flex flex-col font-sans text-zinc-805" id="nabik-bazar-header">
      
      {/* 1. Maroon/Red Top Offer Banner */}
      {showEidBanner && activeTenant?.enableDiscountedProducts && (
        <div className="order-1 bg-[#511111] text-white text-xs py-1 px-4 select-none relative transition-all duration-300">
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

      {/* 2. Mobile Ribbon Header - Optimized with borderless aesthetics and clean branding */}
      <div className="order-4 bg-zinc-50/80 backdrop-blur-md py-3.5 px-4.5 border-b border-zinc-200 shadow-xs animate-fade-in md:hidden relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col space-y-3.5">
          
          {/* Top Brand Bar Row */}
          <div className="flex items-center justify-between w-full">
            
            {/* Left side: branding logo or font signature */}
            <div 
              onClick={() => {
                setCurrentTab('shop');
                setSelectedCategory('all');
                setSearchQuery("");
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 cursor-pointer select-none group"
            >
              <GazzetteLogo isMobile={true} isDarkBg={false} />
            </div>

            {/* Right side: Clean action controls and Mobile menu toggle */}
            <div className="flex items-center space-x-1.5">

              {/* Admin Notification Bell */}
              {currentUser && currentUser.role === 'admin' && (
                <div className="relative" id="bell-dropdown-container-1">
                  <button 
                    type="button"
                    onClick={() => {
                      setBellDropdownOpen(!bellDropdownOpen);
                      setWishlistDropdownOpen(false);
                      setProfileDropdownOpen(false);
                    }}
                    className="p-2.5 rounded-full hover:bg-black/5 active:bg-black/10 text-neutral-800 hover:text-[#f58220] transition-colors duration-200 cursor-pointer flex items-center justify-center shrink-0 relative"
                  >
                    <Bell size={18} className="stroke-[2.5px]" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute top-1 right-1 bg-red-655 text-white font-black text-[8px] h-4 w-4 rounded-full flex items-center justify-center shadow animate-pulse">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>

                  {bellDropdownOpen && (
                    <div 
                      className="absolute top-full right-[-40px] pt-2 w-72 h-auto z-[9999]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-white text-zinc-855 rounded-2xl shadow-xl border border-zinc-200 py-3 px-3 text-left font-sans animate-in fade-in slide-in-from-top-3 duration-200 font-sans">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-100 mb-2">
                          <span className="text-xs font-black text-[#f58220] tracking-tight">
                            {language === 'bn' ? `নতুন অর্ডার (${unreadNotifications.length})` : `New Orders (${unreadNotifications.length})`}
                          </span>
                        </div>
                        <div className="max-h-48 overflow-y-auto text-xs py-2 text-zinc-500 space-y-1">
                          {unreadNotifications.length === 0 ? (
                            <div className="text-center py-4 text-zinc-400 font-bold">
                              {language === 'bn' ? "নতুন কোনো নোটিফিকেশন নেই" : "No new order alerts."}
                            </div>
                          ) : (
                            unreadNotifications.map((notif: any, index) => {
                              const notifAmt = currency === 'BDT' ? `৳${(notif.totalBDT || 0).toLocaleString()}` : `$${notif.totalUSD || 0}`;
                              const customerName = notif.customerInfo?.name || "Customer";
                              const orderId = notif.id || "";
                              return (
                                <div key={orderId || index} className="p-2 hover:bg-zinc-50 rounded border-b border-zinc-100 last:border-0 text-zinc-700 space-y-0.5">
                                  <div className="flex justify-between items-center gap-1">
                                    <span className="font-extrabold text-[11px] text-zinc-900 truncate max-w-[130px]">
                                      {customerName}
                                    </span>
                                    <span className="text-[11px] font-black text-[#f58220] shrink-0">
                                      {notifAmt}
                                    </span>
                                  </div>
                                  <div className="text-[9.5px] text-zinc-400 font-mono">
                                    ID: {orderId}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile / Dashboard Menu Wrapper - Only shown for logged-in admin/seller */}
              {currentUser?.role === 'admin' && (
                <div className="relative" id="profile-dropdown-container-1">
                  <button 
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setWishlistDropdownOpen(false);
                      setBellDropdownOpen(false);
                    }}
                    className="p-2.5 rounded-full hover:bg-black/5 active:bg-black/10 text-[#f58220] transition-colors duration-200 cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <User size={18} className="stroke-[2.5px]" />
                  </button>

                  {profileDropdownOpen && (
                    <div 
                      className="absolute top-full right-[-40px] pt-2 w-48 h-auto z-[9999]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-white text-zinc-805 rounded-2xl shadow-xl border border-zinc-150 py-2 px-1 text-left font-sans overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="space-y-1">
                          <div className="px-3 pb-2 border-b border-zinc-100 mb-1">
                            <p className="text-[10px] text-zinc-400 font-bold">{language === 'bn' ? 'স্বাগতম,' : 'Welcome,'}</p>
                            <p className="text-xs font-black text-zinc-900 truncate leading-tight mt-0.5">{currentUser.firstName}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setCurrentTab('orders');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-805 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                          >
                            My Order
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setProfileModalOpen(true);
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-805 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                          >
                            My Profile
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setCurrentTab('ai-advisor');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-black text-[#f58220] hover:bg-orange-50 hover:text-orange-700 transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                          >
                            <Sparkles size={11} className="text-amber-500 fill-amber-200" />
                            <span>Aura AI Assistant</span>
                          </button>
                          {currentUser?.role === 'admin' && (
                            <button 
                              type="button"
                              onClick={() => {
                                setCurrentTab('admin');
                                setProfileDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-705 hover:bg-[#f58220]/5 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                            >
                              <ShieldCheck size={11} className="text-zinc-550" />
                              <span>Admin Control</span>
                            </button>
                          )}
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
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu hamburger icon with modern borderless tactile styling */}
              <button 
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-full hover:bg-black/5 active:bg-black/10 text-neutral-800 hover:text-[#f58220] transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={20} className="stroke-[2.5px] text-zinc-800" /> : <Menu size={20} className="stroke-[2.5px] text-zinc-800" />}
              </button>

            </div>
          </div>

          {/* Row 2: Search Input Tray - Upgraded to ultra high-contrast pure white pill container */}
          <div className="w-full pt-1.5">
            <div className="relative">
              <div className="flex items-center overflow-hidden bg-white rounded-xl border border-zinc-250 focus-within:border-[#f58220] focus-within:ring-2 focus-within:ring-orange-100 shadow-sm transition-all duration-300 h-[40px] w-full px-3.5">
                <Search size={15} className="text-zinc-400 stroke-[2.5px] mr-2 shrink-0 animate-pulse" />
                <input
                  type="text"
                  placeholder={language === 'bn' ? "আপনি এখানে কী খুঁজছেন?" : "What are you looking for?"}
                  value={searchQuery}
                  aria-label="Mobile Search items"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentTab !== 'shop') setCurrentTab('shop');
                  }}
                  className="w-full text-xs font-semibold text-zinc-800 bg-transparent placeholder-zinc-400 focus:outline-none border-0 outline-none p-0 font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-zinc-400 hover:text-zinc-700 bg-transparent border-0 p-1 font-bold text-xs cursor-pointer flex items-center justify-center h-full"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Suggestions autocomplete list for mobile */}
              {(searchFocused || isHoveringSuggestions) && (
                <div 
                  onMouseEnter={() => setIsHoveringSuggestions(true)}
                  onMouseLeave={() => setIsHoveringSuggestions(false)}
                  className="absolute top-full left-0 right-0 mt-1 bg-white text-zinc-800 rounded-xl shadow-2xl border border-zinc-200 py-1.5 z-[9999] max-h-[220px] overflow-y-auto divide-y divide-zinc-105 font-sans"
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
                          className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex justify-between items-center text-xs font-semibold ${
                            isMokarram ? "bg-orange-50/20" : ""
                          }`}
                        >
                          <span className={`text-zinc-800 ${isMokarram ? 'text-orange-600 font-extrabold' : ''}`}>
                            {language === 'bn' ? brand.nameBn : brand.name}
                          </span>
                          <span className="text-zinc-400 font-bold text-[10px] font-mono">({brand.count})</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. Navigation Menu Bar: White code categories trigger + Orange Navigation strip */}
      {isSticky && (
        <div className="order-3 h-[44px] hidden md:block" />
      )}
      <div 
        className={`order-3 bg-[#f58220] text-black hidden md:block transition-all duration-300 ease-in-out ${
          isSticky 
            ? "fixed top-0 left-0 right-0 z-50 shadow-xl bg-[#f58220]/95 backdrop-blur-md border-b border-orange-600/20 py-1" 
            : "relative shadow-md py-0"
        }`} 
        id="sticky-header-menu"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:px-6 lg:px-8">
          
          <div className="flex items-center w-full justify-between">
            
            {/* Left side: Logo & Navigation/Menu Bar */}
            <div className="flex items-center space-x-4">
              
              {/* Dynamic Logo aligned left */}
              <div 
                onClick={() => {
                  const now = Date.now();
                  const newHistory = [...logoClickHistory, now].filter(t => now - t <= 10000);
                  setLogoClickHistory(newHistory);

                  setCurrentTab('shop');
                  setSelectedCategory('all');
                  setSearchQuery("");

                  if (newHistory.length >= 8) {
                    const slice = newHistory.slice(-8);
                    const intervals: number[] = [];
                    for (let i = 0; i < slice.length - 1; i++) {
                      intervals.push(slice[i+1] - slice[i]);
                    }

                    // 8-tap rhythm pattern: 3 fast, pause, 2 fast, pause, 3 fast
                    const isRhythmCorrect = 
                      intervals[0] <= 550 && 
                      intervals[1] <= 550 && 
                      intervals[2] > 550 && intervals[2] <= 2500 && 
                      intervals[3] <= 550 && 
                      intervals[4] > 550 && intervals[4] <= 2500 && 
                      intervals[5] <= 550 && 
                      intervals[6] <= 550;

                    if (isRhythmCorrect) {
                      setLogoClickHistory([]);
                      setPasscodeModalOpen(true);
                      setPasscodeInput('');
                    }
                  }
                }} 
                className="flex items-center cursor-pointer select-none group shrink-0 animate-fade-in"
                title={language === 'bn' ? "হোম পেজ" : "Home Page"}
              >
                <GazzetteLogo isMobile={false} isDarkBg={true} />
              </div>

              {/* Horizontal menu bar - solid black/dark text on vibrant orange canvas strip */}
              <div className="flex items-center pl-2">
                {(activeTenant?.menuItems || DEFAULT_MENU_ITEMS).filter(item => item.enabled && !["seller_zone", "blog", "video", "track_order"].includes(item.id)).map((item) => {
                  const hasDropdown = item.dropdownType && item.dropdownType !== 'none';
                  const isOpen = openDropdownId === item.id;

                  return (
                    <div
                      key={item.id}
                      id={`nav-menu-item-${item.id}`}
                      className="relative"
                      onMouseEnter={() => handleMouseEnterItem(item.id)}
                      onMouseLeave={handleMouseLeaveItem}
                    >
                      <button
                        type="button"
                        onClick={() => handleMenuItemClick(item)}
                        className={`px-4 text-[13.5px] font-bold text-black hover:bg-[#e06c09] hover:text-white transition-all duration-300 flex items-center space-x-1 border-0 bg-transparent select-none cursor-pointer ${
                          isSticky ? "py-2" : "py-3"
                        }`}
                      >
                        <span>{item.label}</span>
                        {hasDropdown && <ChevronDown size={12} className="stroke-[3.5px] ml-0.5 inline" />}
                      </button>

                      {/* Render Dropdown menu */}
                      {hasDropdown && isOpen && (
                        <div
                          className="absolute top-full left-0 pt-2 w-72 h-auto z-[999]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-white text-zinc-800 rounded-xl shadow-2xl border border-zinc-200 py-2.5 text-left font-sans animate-in fade-in slide-in-from-top-2 duration-200 max-h-[354px] overflow-y-auto divide-y divide-zinc-100">
                            {item.dropdownType === 'brandList' ? (
                              brandList.map((brand) => (
                                <button
                                  key={brand.name}
                                  type="button"
                                  onClick={() => {
                                    setCurrentTab('shop');
                                    setSelectedCategory('all');
                                    setSearchQuery(brand.name);
                                    setOpenDropdownId(null);
                                    triggerToast(`Showing products for brand: ${language === 'bn' ? brand.nameBn : brand.name}`);
                                    if (onBrandSelect) onBrandSelect();
                                  }}
                                  className="w-full text-left px-5 py-2 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex justify-between items-center"
                                >
                                  <span className="font-semibold text-zinc-800 text-[12.5px]">{language === 'bn' ? brand.nameBn : brand.name}</span>
                                  <span className="text-zinc-400 font-bold text-[11px] font-mono">({brand.count})</span>
                                </button>
                              ))
                            ) : (
                              item.dropdownItems?.map((dpItem) => (
                                <button
                                  key={dpItem.id}
                                  type="button"
                                  onClick={() => handleDropdownItemClick(dpItem)}
                                  className="w-full text-left px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                                >
                                  {dpItem.label}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right side: White rounded Search Bar + Quick Actions Menu Hub */}
            <div className="flex items-center space-x-3.5 shrink-0 my-1.5 ml-4">
              
              {/* White rounded Search Bar */}
              <div className="relative group w-[220px] lg:w-[280px]">
                <div className="flex items-center overflow-hidden bg-white rounded-lg border border-zinc-300 focus-within:border-orange-600 focus-within:ring-1 focus-within:ring-orange-600 shadow-sm transition h-[36px]">
                  <input
                    type="text"
                    placeholder={language === 'bn' ? "এখানে খুঁজুন..." : "Search here..."}
                    value={searchQuery}
                    aria-label="Search items"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (currentTab !== 'shop') setCurrentTab('shop');
                    }}
                    className="w-full px-4 text-xs text-zinc-800 bg-white placeholder-zinc-400 focus:outline-none focus:ring-0 border-0 outline-none font-sans font-semibold"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setCurrentTab('shop');
                    }}
                    className="bg-[#e06c09] hover:bg-orange-700 text-white h-full px-4 transition cursor-pointer shrink-0 border-0 flex items-center justify-center rounded-r-lg"
                  >
                    <Search size={14} className="stroke-[3px]" />
                  </button>
                </div>

                {/* Search autocomplete suggestions list */}
                {(searchFocused || isHoveringSuggestions) && (
                  <div 
                    onMouseEnter={() => setIsHoveringSuggestions(true)}
                    onMouseLeave={() => setIsHoveringSuggestions(false)}
                    className="absolute top-full left-0 right-0 mt-1 bg-white text-zinc-800 rounded-xl shadow-2xl border border-zinc-200 py-1.5 z-[1000] max-h-[300px] overflow-y-auto divide-y divide-zinc-100 font-sans"
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
                            className={`w-full text-left px-4 py-2 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex justify-between items-center ${
                              isMokarram ? "bg-orange-50/30" : ""
                            }`}
                          >
                            <span className={`font-semibold text-zinc-805 text-[11.5px] ${isMokarram ? 'text-orange-600 font-extrabold' : ''}`}>
                              {language === 'bn' ? brand.nameBn : brand.name}
                            </span>
                            <span className="text-zinc-400 font-bold text-[10px] font-mono">({brand.count})</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Direct Inline Controls for Languages, Wishlists, Notifications, Profiles & Checkout Cart */}
              <div className="flex items-center space-x-2 shrink-0 animate-fade-in">
                
                {/* 3. Direct Admin Alert Bell (only shown for passcode-logged-in admins) */}
                {currentUser && currentUser.role === 'admin' && (
                  <div className="relative" id="bell-dropdown-container-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setBellDropdownOpen(!bellDropdownOpen);
                        setWishlistDropdownOpen(false);
                        setProfileDropdownOpen(false);
                      }}
                      className="p-2 rounded-full hover:bg-black/10 text-black hover:text-white transition duration-200 cursor-pointer flex items-center justify-center shrink-0 relative animate-pulse"
                      title={language === 'bn' ? "বিজ্ঞপ্তি অ্যালার্ট" : "Notifications"}
                    >
                      <Bell size={18} className="stroke-[2.5px]" />
                      {unreadNotifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-655 text-white font-black text-[8px] h-4 w-4 rounded-full flex items-center justify-center shadow animate-pulse">
                          {unreadNotifications.length}
                        </span>
                      )}
                    </button>

                    {bellDropdownOpen && (
                      <div 
                        className="absolute top-full right-0 pt-2 w-72 h-auto z-[9999]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-white text-zinc-850 rounded-2xl shadow-xl border border-zinc-200 py-3 px-3 text-left font-sans animate-in fade-in slide-in-from-top-3 duration-250">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 mb-2">
                            <span className="text-xs font-black text-[#f58220] tracking-tight">
                              {language === 'bn' ? `নতুন অর্ডার (${unreadNotifications.length})` : `New Orders (${unreadNotifications.length})`}
                            </span>
                          </div>
                          <div className="max-h-48 overflow-y-auto text-xs py-2 text-zinc-500 space-y-1 font-sans">
                            {unreadNotifications.length === 0 ? (
                              <div className="text-center py-4 text-zinc-400 font-bold">
                                {language === 'bn' ? "নতুন কোনো নোটিফিকেশন নেই" : "No new order alerts."}
                              </div>
                            ) : (
                              unreadNotifications.map((notif: any, index) => {
                                const notifAmt = currency === 'BDT' ? `৳${(notif.totalBDT || 0).toLocaleString()}` : `$${notif.totalUSD || 0}`;
                                const customerName = notif.customerInfo?.name || "Customer";
                                const orderId = notif.id || "";
                                return (
                                  <div key={orderId || index} className="p-2 hover:bg-zinc-50 rounded border-b border-zinc-100 last:border-0 text-zinc-700 space-y-0.5">
                                    <div className="flex justify-between items-center gap-1">
                                      <span className="font-extrabold text-[11px] text-zinc-900 truncate max-w-[130px]">
                                        {customerName}
                                      </span>
                                      <span className="text-[11px] font-black text-[#f58220] shrink-0">
                                        {notifAmt}
                                      </span>
                                    </div>
                                    <div className="text-[9.5px] text-zinc-400 font-mono">
                                      ID: {orderId}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Direct User Profile (only shown for passcode-logged-in admins) */}
                {currentUser && currentUser.role === 'admin' && (
                  <div className="relative" id="profile-dropdown-container-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(!profileDropdownOpen);
                        setWishlistDropdownOpen(false);
                        setBellDropdownOpen(false);
                      }}
                      className="p-2 rounded-full hover:bg-black/10 text-black hover:text-white transition duration-200 cursor-pointer flex items-center justify-center shrink-0 relative"
                      title={language === 'bn' ? "প্রোফাইল মেনু" : "Admin Profile"}
                    >
                      <User size={18} className="stroke-[2.5px]" />
                    </button>

                    {profileDropdownOpen && (
                      <div 
                        className="absolute top-full right-0 pt-2 w-48 h-auto z-[9999]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-white text-zinc-805 rounded-2xl shadow-xl border border-zinc-150 py-2 px-1 text-left font-sans overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250 font-sans">
                          <div className="space-y-1">
                            <div className="px-3 pb-2 border-b border-zinc-100 mb-1">
                              <p className="text-[10px] text-zinc-400 font-bold">{language === 'bn' ? 'স্বাগতম,' : 'Welcome,'}</p>
                              <p className="text-xs font-black text-zinc-900 truncate leading-tight mt-0.5">{currentUser.firstName}</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setCurrentTab('orders');
                                setProfileDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                            >
                              {language === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setProfileModalOpen(true);
                                setProfileDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-805 hover:bg-orange-50 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer"
                            >
                              {language === 'bn' ? 'প্রোফাইল সম্পাদন' : 'My Profile'}
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setCurrentTab('ai-advisor');
                                setProfileDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-black text-[#f58220] hover:bg-orange-50 hover:text-orange-700 transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
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
                              className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-[#f58220] transition border-0 bg-transparent cursor-pointer flex items-center space-x-2"
                            >
                              <ShieldCheck size={11} className="text-zinc-550" />
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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* The Original Floating Quick Hub wrapper (Now safely hidden) */}
              <div className="hidden">

                {/* The Floating Quick Hub Panel */}
                {quickHubOpen && (
                  <div className="absolute right-0 mt-2.5 w-[330px] bg-white text-zinc-850 rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-[9999] font-sans animate-in fade-in slide-in-from-top-3 duration-250">
                    
                    {/* Header bar */}
                    <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-150 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles size={14} className="text-[#f58220] fill-[#f58220]/20 animate-pulse" />
                        <span className="font-extrabold text-[#f58220] text-xs uppercase tracking-wider">
                          {language === 'bn' ? 'কুইক অ্যাকশন হাব' : 'Quick Action Hub'}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setQuickHubOpen(false)}
                        className="text-zinc-400 hover:text-zinc-650 border-0 bg-transparent cursor-pointer p-0.5 text-xs font-black"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Action Hub Deck */}
                    <div className="p-3 space-y-2.5 max-h-[460px] overflow-y-auto">
                      
                      {/* 1. Language Changer */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50/50 border border-zinc-100 hover:border-orange-100 hover:bg-orange-50/10 transition">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 bg-orange-50 rounded-lg text-[#f58220] shrink-0">
                            <Languages size={16} className="stroke-[2.5px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-black text-zinc-900 leading-tight">
                              {language === 'bn' ? 'বাংলা সংস্করণ' : 'English Edition'}
                            </p>
                            <p className="text-[9px] text-zinc-500 font-bold mt-0.5">
                              {language === 'bn' ? 'ভাষা পরিবর্তনে চাপুন' : 'Click to toggle page language'}
                            </p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const targetLang = language === 'en' ? 'bn' : 'en';
                            setLanguage(targetLang);
                            triggerToast(targetLang === 'bn' ? 'ভাষা পরিবর্তন সফল হয়েছে!' : 'Language changed successfully!');
                          }}
                          className="bg-white hover:bg-[#e06c09] hover:text-white text-[#f58220] border border-orange-200 hover:border-[#e06c09] font-black text-[9.5px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-3xs shrink-0 whitespace-nowrap"
                        >
                          {language === 'bn' ? 'ENGLISH' : 'বাংলায় দেখুন'}
                        </button>
                      </div>

                      {/* 2. Wishlist List (Heart indicator) */}
                      <div className="p-2 rounded-xl bg-zinc-50/50 border border-zinc-100 hover:border-orange-100 hover:bg-orange-50/10 transition space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-500 shrink-0 relative">
                              <Heart size={16} className="stroke-[2.5px] fill-rose-500" />
                              <span className="absolute -top-1 -right-1 bg-rose-650 text-white font-extrabold text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center">
                                {wishlistItems.length}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-black text-zinc-900 leading-tight">
                                {language === 'bn' ? 'আমার প্রিয় তালিকা' : 'My Favorites'}
                              </p>
                              <p className="text-[9px] text-zinc-500 font-bold mt-0.5">
                                {language === 'bn' ? `${wishlistItems.length}টি পছন্দের প্রোডাক্ট রাখা আছে` : `${wishlistItems.length} items bookmarked`}
                              </p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setWishlistDropdownOpen(!wishlistDropdownOpen);
                            }}
                            className="bg-white hover:bg-neutral-100 text-zinc-700 border border-zinc-200 font-black text-[9.5px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-3xs shrink-0 flex items-center space-x-1"
                          >
                            <span>{language === 'bn' ? 'তালিকা' : 'Wishlist'}</span>
                            <ChevronDown size={10} className={`stroke-[3px] transition-transform duration-200 ${wishlistDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {/* Optional inline wishlist content preview */}
                        {wishlistDropdownOpen && (
                          <div className="p-2 bg-white rounded-lg border border-zinc-150 space-y-2 mt-1 max-h-48 overflow-y-auto">
                            {wishlistItems.length === 0 ? (
                              <p className="text-[10px] text-zinc-400 py-3 text-center">{language === 'bn' ? 'পছন্দের তালিকায় কোনো পণ্য নেই' : 'No items added'}</p>
                            ) : (
                              wishlistItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-1 text-[11px] py-1 bg-zinc-50/50 hover:bg-orange-50/30 rounded px-1 transition relative group border border-zinc-100">
                                  <img src={item.image} alt={item.name} className="w-7 h-7 object-cover rounded border" />
                                  <div className="flex-1 min-w-0 pl-1.5">
                                    <p className="font-bold text-zinc-805 truncate text-[10.5px] max-w-[110px]">{language === 'bn' ? item.nameBn : item.name}</p>
                                    <p className="font-mono text-[9px] text-[#f58220] font-bold">৳{item.priceBDT.toLocaleString()}</p>
                                  </div>
                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        if (onAddToCart) {
                                          onAddToCart({
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
                                          }, 1);
                                          triggerToast(`Added ${item.name} to cart!`);
                                        }
                                      }}
                                      className="bg-[#f58220] hover:bg-[#e06c09] text-white font-extrabold text-[8.5px] p-1 px-1.5 rounded transition cursor-pointer border-0 inline-flex items-center"
                                    >
                                      + Buy
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const updatedList = wishlistItems.filter(i => i.id !== item.id);
                                        setWishlistItems(updatedList);
                                        triggerToast("Removed item.");
                                      }}
                                      className="text-red-500 font-extrabold text-[9px] hover:text-red-700 cursor-pointer bg-transparent border-0"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3. Account / Profile block - Only shown for active admin session */}
                      {currentUser?.role === 'admin' && (
                        <div id="profile-sidebar-container" className="p-2 rounded-xl bg-zinc-50/50 border border-zinc-100 hover:border-orange-100 hover:bg-orange-50/10 transition space-y-2 animate-fade-in animate-duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                <User size={16} className="stroke-[2.5px]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-black text-zinc-900 leading-tight">
                                  {language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account'}
                                </p>
                                <p className="text-[9px] text-zinc-500 font-bold mt-0.5 truncate max-w-[130px]">
                                  {language === 'bn' ? `হ্যালো, ${currentUser?.firstName}` : `Hello, ${currentUser?.firstName}`}
                                </p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setProfileDropdownOpen(!profileDropdownOpen);
                              }}
                              className="bg-white hover:bg-neutral-100 text-zinc-700 border border-zinc-200 font-black text-[9.5px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-3xs shrink-0 flex items-center space-x-1"
                            >
                              <span>{language === 'bn' ? 'পোর্টাল' : 'Portal'}</span>
                              <ChevronDown size={10} className={`stroke-[3px] transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {profileDropdownOpen && (
                            <div className="p-2 bg-white rounded-lg border border-zinc-150 space-y-1.5 mt-1 animate-fade-in text-xs">
                              <button 
                                type="button"
                                onClick={() => {
                                  setCurrentTab('orders');
                                  setProfileDropdownOpen(false);
                                  setQuickHubOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-zinc-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition border-0 bg-transparent cursor-pointer"
                              >
                                {language === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setProfileModalOpen(true);
                                  setProfileDropdownOpen(false);
                                  setQuickHubOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-zinc-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition border-0 bg-transparent cursor-pointer"
                              >
                                {language === 'bn' ? 'প্রোফাইল সম্পাদন' : 'Edit Profile'}
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setCurrentTab('admin');
                                  setProfileDropdownOpen(false);
                                  setQuickHubOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-zinc-705 hover:bg-zinc-50 rounded-lg transition border-0 bg-transparent cursor-pointer flex items-center space-x-1.5"
                              >
                                <ShieldCheck size={11} className="text-zinc-500" />
                                <span>{language === 'bn' ? 'এডমিন প্যানেল' : 'Admin Panel'}</span>
                              </button>
                              <div className="border-t border-zinc-100 my-1"></div>
                              <button 
                                type="button"
                                onClick={() => {
                                  setCurrentUser?.(null);
                                  setCurrentTab('shop');
                                  triggerToast("Session logged out.");
                                  setProfileDropdownOpen(false);
                                  setQuickHubOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] font-extrabold text-rose-500 hover:bg-rose-50 rounded-lg transition border-0 bg-transparent cursor-pointer"
                              >
                                {language === 'bn' ? 'লগআউট সেশন' : 'Logout Session'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. Real-time notifications bell for admins */}
                      {currentUser && currentUser.role === 'admin' && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50/50 border border-zinc-100 hover:border-orange-100 hover:bg-orange-50/10 transition">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-500 shrink-0 relative animate-pulse">
                              <Bell size={16} className="stroke-[2.5px]" />
                              {unreadNotifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-650 text-white font-extrabold text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center shadow">
                                  {unreadNotifications.length}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-black text-zinc-900 leading-tight">
                                {language === 'bn' ? 'অর্ডার কিউ অ্যালার্ট' : 'Orders Queue Alert'}
                              </p>
                              <p className="text-[9px] text-zinc-500 font-bold mt-0.5">
                                {language === 'bn' ? `নতুন অর্ডারের কিউ (${unreadNotifications.length}টি)` : `${unreadNotifications.length} instant order sync`}
                              </p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setBellDropdownOpen(!bellDropdownOpen);
                            }}
                            className="bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-extrabold text-[9.5px] px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-0.5"
                          >
                            <span>{language === 'bn' ? 'দেখুন' : 'Alerts'}</span>
                          </button>
                        </div>
                      )}

                      {/* 5. In My Basket Cart trigger */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50/50 border border-zinc-150 hover:border-emerald-100 hover:bg-emerald-50/5 transition">
                        <div className="flex items-center space-x-2.5 font-sans">
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0 relative">
                            <ShoppingCart size={16} className="stroke-[2.5px]" />
                            <span className="absolute -top-1 -right-1 bg-emerald-650 text-white font-extrabold text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center">
                              {cartCount}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-black text-zinc-900 leading-tight">
                              {language === 'bn' ? 'আমার শপিং ব্যাগ' : 'Shopping Cart'}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5 font-mono">
                              ৳{typeof cartTotalValue === 'number' ? cartTotalValue.toLocaleString() : cartTotalValue}
                            </p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            setQuickHubOpen(false);
                            if (onOpenCart) onOpenCart();
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9.5px] px-3.5 py-1.5 rounded-lg border-0 transition-all cursor-pointer shadow-xs flex items-center"
                        >
                          {language === 'bn' ? 'ব্যাগ দেখুন' : 'View Cart'}
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu list item drawers */}
      {mobileMenuOpen && (
        <div className="order-5 md:hidden bg-white text-zinc-900 border-b border-zinc-200 py-3 px-4 space-y-2 z-40 relative">
          
          {/* Mobile language toggle option is no longer needed per user request, commented out to preserve code structure */}
          {/* 
          <button 
            type="button"
            onClick={() => {
              const targetLang = language === 'en' ? 'bn' : 'en';
              setLanguage(targetLang);
              setMobileMenuOpen(false);
              triggerToast(targetLang === 'bn' ? 'ভাষা পরিবর্তন সফল হয়েছে!' : 'Language changed successfully!');
            }}
            className="w-full text-left py-2.5 px-3 bg-orange-50 text-[#f58220] rounded-xl flex items-center justify-between font-extrabold text-[12.5px] border border-orange-100 transition-all active:scale-95"
          >
            <div className="flex items-center space-x-2">
              <Languages size={15} className="text-[#f58220] stroke-[2.5px]" />
              <span>{language === 'bn' ? 'English এ পরিবর্তন করুন' : 'Change Language (বাংলা)'}</span>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider bg-white border border-orange-200 text-orange-600 px-1.5 py-0.5 rounded-md leading-none">
              {language === 'bn' ? 'EN' : 'বাংলা'}
            </span>
          </button>
          */}

          <div className="flex flex-col space-y-1 text-sm font-bold">
            {(activeTenant?.menuItems || DEFAULT_MENU_ITEMS).filter(item => item.enabled && !["seller_zone", "blog", "video", "track_order"].includes(item.id)).map((item) => {
              const hasDropdown = item.dropdownType && item.dropdownType !== 'none';
              const isSpecialBrand = item.dropdownType === 'brandList';
              const isDropdownOpen = openDropdownId === item.id;

              return (
                <div key={item.id} className="w-full">
                  {hasDropdown ? (
                    <>
                      <button 
                        type="button"
                        onClick={() => {
                          if (openDropdownId === item.id) {
                            setOpenDropdownId(null);
                          } else {
                            setOpenDropdownId(item.id);
                          }
                        }}
                        className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2 flex justify-between items-center"
                      >
                        <span>{item.label}</span>
                        <ChevronDown size={14} className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isDropdownOpen && (
                        <div className="pl-4 max-h-48 overflow-y-auto space-y-1 mt-1 bg-zinc-50 rounded-lg p-1.5 border border-zinc-100">
                          {isSpecialBrand ? (
                            brandList.map((brand) => (
                              <button
                                key={brand.name}
                                type="button"
                                onClick={() => {
                                  setCurrentTab('shop');
                                  setSelectedCategory('all');
                                  setSearchQuery(brand.name);
                                  setMobileMenuOpen(false);
                                  setOpenDropdownId(null);
                                  if (onBrandSelect) onBrandSelect();
                                }}
                                className="w-full text-left py-1.5 px-2 text-xs text-zinc-700 hover:text-orange-500 hover:bg-white rounded transition flex justify-between items-center cursor-pointer border-0 bg-transparent font-medium"
                              >
                                <span className="font-bold text-zinc-800">{language === 'bn' ? brand.nameBn : brand.name}</span>
                                <span className="text-zinc-400 text-[10px] font-mono font-bold">({brand.count})</span>
                              </button>
                            ))
                          ) : (
                            item.dropdownItems?.map((dpItem) => (
                              <button
                                key={dpItem.id}
                                type="button"
                                onClick={() => {
                                  handleDropdownItemClick(dpItem);
                                  setMobileMenuOpen(false);
                                }}
                                className="w-full text-left py-1.5 px-2 text-xs text-zinc-700 hover:text-[#f58220] hover:bg-white rounded transition cursor-pointer border-0 bg-transparent font-semibold"
                              >
                                {dpItem.label}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        handleMenuItemClick(item);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 hover:bg-zinc-50 rounded px-2"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              );
            })}
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

      {/* Sleek Disguised Passcode Modal */}
      {passcodeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-100 font-sans relative overflow-hidden animate-fade-in">
            {/* Ambient Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-zinc-700 via-zinc-900 to-zinc-800" />
            
            <div className="flex items-center space-x-3.5 mb-4">
              <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-inner">
                <ShieldCheck size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">
                  {language === 'bn' ? 'সিস্টেম ক্লায়েন্ট ভেরিফিকেশন' : 'System Client Verification'}
                </h3>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                  {language === 'bn' ? 'ব্যবসায়িক ভেন্ডর ও লজিস্টিক পোর্টাল' : 'Business Vendor & Logistics Hub'}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed font-semibold mb-4 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              {language === 'bn' 
                ? 'অননুমোদিত অ্যাক্সেস রোধে আপনার চার অঙ্কের পার্টনার পোর্টাল পিন (PIN) কোডটি প্রদান করুন।' 
                : 'For secure localized environment tracking, please execute confirmation with your 4-digit partner allocation PIN.'}
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (passcodeInput === '7788') {
                  setPasscodeModalOpen(false);
                  setCurrentTab('admin');
                  if (setProfileDropdownOpen) setProfileDropdownOpen(false);
                  window.dispatchEvent(
                    new CustomEvent("app-toast", { 
                      detail: language === 'bn' 
                        ? "🔒 সিক্রেট কোড সঠিক! অ্যাডমিন প্যানেল উন্মোচিত হচ্ছে..." 
                        : "🔒 Security approved! Opening admin gateway..." 
                    })
                  );
                } else {
                  setPasscodeModalOpen(false);
                  window.dispatchEvent(
                    new CustomEvent("app-toast", { 
                      detail: language === 'bn' 
                        ? "❌ ত্রুটি: পার্টনার সেশন আইডি অবৈধ বা নেটওয়ার্ক সংযোগ নেই!" 
                        : "❌ Error: Partner session context mismatched or inactive!" 
                    })
                  );
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] uppercase font-black text-zinc-600 tracking-widest mb-1.5">
                  {language === 'bn' ? 'পোর্টাল পিন কোড' : 'PROMPT PORTAL PIN'}
                </label>
                <input 
                  type="password" 
                  maxLength={6}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center tracking-widest text-lg font-black bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 focus:border-zinc-800 focus:ring-0 text-zinc-800 rounded-xl py-2.5 transition"
                />
              </div>

              <div className="flex space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasscodeModalOpen(false);
                    setPasscodeInput('');
                  }}
                  className="w-1/2 bg-zinc-150 hover:bg-zinc-200 text-zinc-700 font-bold text-xs py-2.5 rounded-xl border-0 cursor-pointer transition text-center"
                >
                  {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={passcodeInput.length < 4}
                  className="w-1/2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs py-2.5 rounded-xl border-0 cursor-pointer shadow-md transition text-center"
                >
                  {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
                </button>
              </div>
            </form>
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
