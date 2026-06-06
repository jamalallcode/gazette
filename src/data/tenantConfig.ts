// MASTER CONTROLLER: Set this to false when you sell/deliver the site to a client!
// যখন ক্লায়েন্টকে সাইটটি সেল করবেন, তখন এটিকে false করে দিবেন। তাহলে সাইটের কোথাও রিসেল বা প্রিসেট চেঞ্জ করার প্যানেল থাকবে না।
export const IS_RESELLER_ACTIVE = true;

export interface MenuItemDropdownItem {
  id: string;
  label: string;
  labelBn: string;
  actionType: 'tab' | 'scroll' | 'url' | 'none';
  actionValue: string;
}

export interface MenuItemConfig {
  id: string;
  label: string;
  labelBn: string;
  enabled: boolean;
  actionType: 'tab' | 'scroll' | 'url' | 'none';
  actionValue: string;
  dropdownType?: 'none' | 'brandList' | 'custom';
  dropdownItems?: MenuItemDropdownItem[];
}

export interface TenantConfig {
  id: string;
  name: string; // Internal name for the reseller
  shopName: string;
  shopNameBn: string;
  tagline: string;
  taglineBn: string;
  logoUrl: string; // Image or SVG path
  phone: string;
  email: string;
  address: string;
  addressBn: string;
  whatsappNumber: string; // format: 8801xxxxxxxxx
  whatsappMessage: string;
  defaultCurrency: 'BDT' | 'USD';
  defaultLanguage: 'en' | 'bn';
  primaryColor: string; // Hex color e.g. #f58220
  hoverColor: string; // Hex color e.g. #e06c09
  bgLightColor: string; // Hex color e.g. #fff7ed
  // Feature Toggles (So different clients can pay for different tiers!)
  enableAiAdvisor: boolean;
  enableSellerZone: boolean;
  enableDiscountedProducts: boolean;
  enableTrackOrder: boolean;
  enableBrandCarousel: boolean;
  enableWhatsappFloat: boolean;
  enableVendorModal: boolean;
  facebookUrl?: string;
  youtubeUrl?: string;
  slides?: {
    image: string;
    title: string;
    titleBn: string;
    subtitle: string;
    subtitleBn: string;
  }[];
  menuItems?: MenuItemConfig[];
}

export const DEFAULT_MENU_ITEMS: MenuItemConfig[] = [
  {
    id: "home",
    label: "Home",
    labelBn: "হোম",
    enabled: true,
    actionType: "tab",
    actionValue: "shop",
    dropdownType: "none"
  },
  {
    id: "brand",
    label: "Brand",
    labelBn: "ব্র্যান্ড",
    enabled: true,
    actionType: "none",
    actionValue: "",
    dropdownType: "brandList"
  },
  {
    id: "discount",
    label: "Discounted Products",
    labelBn: "ডিসকাউন্ট প্রোডাক্টস",
    enabled: true,
    actionType: "tab",
    actionValue: "landing",
    dropdownType: "none"
  },
  {
    id: "vendors",
    label: "All Vendors",
    labelBn: "সকল ভেন্ডর",
    enabled: false,
    actionType: "none",
    actionValue: "",
    dropdownType: "none"
  },
  {
    id: "seller_zone",
    label: "Seller Zone",
    labelBn: "সেলার জোন",
    enabled: false,
    actionType: "none",
    actionValue: "",
    dropdownType: "custom",
    dropdownItems: [
      {
        id: "become_seller",
        label: "Become A Seller",
        labelBn: "সেলার হোন",
        actionType: "scroll",
        actionValue: "become-seller-anchor"
      },
      {
        id: "seller_login",
        label: "Seller login",
        labelBn: "সেলার লগইন",
        actionType: "tab",
        actionValue: "admin"
      },
      {
        id: "affiliate",
        label: "Affiliate",
        labelBn: "অ্যাফিলিয়েট",
        actionType: "tab",
        actionValue: "admin"
      }
    ]
  },
  {
    id: "blog",
    label: "Blog",
    labelBn: "ব্লগ",
    enabled: false,
    actionType: "scroll",
    actionValue: "home-blogs-section",
    dropdownType: "none"
  },
  {
    id: "video",
    label: "Video",
    labelBn: "ভিডিও",
    enabled: false,
    actionType: "scroll",
    actionValue: "home-videos-section",
    dropdownType: "none"
  },
  {
    id: "track_order",
    label: "Track Order",
    labelBn: "অর্ডার ট্র্যাকিং",
    enabled: false,
    actionType: "tab",
    actionValue: "live-tracking",
    dropdownType: "none"
  }
];

export const PRESET_TENANTS: TenantConfig[] = [
  {
    id: "nabik-bazar",
    name: "Gadget Bazar (Default)",
    shopName: "Gadget Bazar",
    shopNameBn: "গেজেট বাজার",
    tagline: "Your Ultimate Tech & Style Outlet",
    taglineBn: "আপনার পছন্দের সেরা গ্যাজেট ও ফ্যাশন হাউজ",
    logoUrl: "", // Empty to fall back to the newly designed gorgeous custom vector logo
    phone: "+8801784905075",
    email: "commercialauditkhulna@gmail.com",
    address: "Haji Mohshin Road, Khulna, Bangladesh",
    addressBn: "হাজী মহসিন রোড, খুলনা, বাংলাদেশ",
    whatsappNumber: "8801784905075",
    whatsappMessage: "Hello! I would like to make an inquiry about products on Gadget Bazar.",
    defaultCurrency: "BDT",
    defaultLanguage: "bn",
    primaryColor: "#f58220",
    hoverColor: "#e06c09",
    bgLightColor: "#fff7ed",
    enableAiAdvisor: true,
    enableSellerZone: true,
    enableDiscountedProducts: true,
    enableTrackOrder: true,
    enableBrandCarousel: true,
    enableWhatsappFloat: true,
    enableVendorModal: true,
    facebookUrl: "https://facebook.com/nabikbazar",
    youtubeUrl: "https://youtube.com/nabikbazar"
  },
  {
    id: "electro-mart",
    name: "Electro Mart (Gadgets & tech)",
    shopName: "Electro Mart",
    shopNameBn: "ইলেক্ট্রো মার্ট",
    tagline: "Unleash True Innovation",
    taglineBn: "নতুন প্রযুক্তির সেরা উৎসব",
    logoUrl: "", // Use dynamic initials if empty
    phone: "+8801811223344",
    email: "support@electromart.com",
    address: "IDB Bhaban, Agargaon, Dhaka",
    addressBn: "আইডিবি ভবন, আগারগাঁও, ঢাকা",
    whatsappNumber: "8801811223344",
    whatsappMessage: "Hi Electro Mart! I need tech advice.",
    defaultCurrency: "BDT",
    defaultLanguage: "en",
    primaryColor: "#2563eb", // Royal blue
    hoverColor: "#1d4ed8",
    bgLightColor: "#eff6ff",
    enableAiAdvisor: true,
    enableSellerZone: false,
    enableDiscountedProducts: true,
    enableTrackOrder: true,
    enableBrandCarousel: false,
    enableWhatsappFloat: true,
    enableVendorModal: false,
    facebookUrl: "https://facebook.com",
  },
  {
    id: "organic-bazar",
    name: "Organic Bazar (Green Grocery / Food)",
    shopName: "Organic Bazar",
    shopNameBn: "অর্গানিক বাজার",
    tagline: "100% Pure & Organic Daily Food",
    taglineBn: "শতভাগ খাঁটি ও পুষ্টিকর খাবার",
    logoUrl: "",
    phone: "+8801999888777",
    email: "fresh@organicbazar.com",
    address: "Banani Super Market, Dhaka",
    addressBn: "বনানী সুপার মার্কেট, ঢাকা",
    whatsappNumber: "8801999888777",
    whatsappMessage: "Hi Organic Bazar! I am looking for fresh honey and organic ghee.",
    defaultCurrency: "BDT",
    defaultLanguage: "bn",
    primaryColor: "#16a34a", // Vibrant Green
    hoverColor: "#15803d",
    bgLightColor: "#f0fdf4",
    enableAiAdvisor: false,
    enableSellerZone: true,
    enableDiscountedProducts: true,
    enableTrackOrder: false,
    enableBrandCarousel: true,
    enableWhatsappFloat: true,
    enableVendorModal: true,
  },
  {
    id: "chic-fashion",
    name: "Chic Fashion (Luxury / Clothing)",
    shopName: "Chic Fashion",
    shopNameBn: "চিক ফ্যাশন",
    tagline: "Elevate Your Style Statement",
    taglineBn: "আপনার ব্যক্তিত্বের সাথে সেরা ফ্যাশন",
    logoUrl: "",
    phone: "+8801555444333",
    email: "style@chicfashion.com",
    address: "Bashundhara City, Dhaka",
    addressBn: "বসুন্ধরা সিটি, ঢাকা",
    whatsappNumber: "8801555444333",
    whatsappMessage: "Hi Chic Fashion! What is the price of your current designer clothing collection?",
    defaultCurrency: "USD",
    defaultLanguage: "en",
    primaryColor: "#db2777", // Rose / Hot Pink
    hoverColor: "#be185d",
    bgLightColor: "#fdf2f8",
    enableAiAdvisor: true,
    enableSellerZone: false,
    enableDiscountedProducts: true,
    enableTrackOrder: true,
    enableBrandCarousel: true,
    enableWhatsappFloat: true,
    enableVendorModal: false,
  }
];

// Load initially saved tenant or default to target store configuration
export function getSavedTenant(): TenantConfig {
  try {
    const saved = localStorage.getItem("reseller_active_tenant_config");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed loading tenant config", e);
  }
  return PRESET_TENANTS[0];
}

export function saveTenant(config: TenantConfig) {
  localStorage.setItem("reseller_active_tenant_config", JSON.stringify(config));
}

// SECURE OWNER MODE: Checks if the reseller panel has been unlocked for the current browser session.
// visiting the site with URL parameter "?reseller=true" will unlock it securely on your browser.
export function isResellerFeatureUnlocked(): boolean {
  if (!IS_RESELLER_ACTIVE) return false;
  try {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reseller") === "true") {
        localStorage.setItem("reseller_unlocked", "true");
        return true;
      }
      return localStorage.getItem("reseller_unlocked") === "true";
    }
  } catch (e) {
    console.error("Failed checking reseller lock status", e);
  }
  return false;
}

export function lockResellerFeature() {
  try {
    localStorage.removeItem("reseller_unlocked");
  } catch (e) {
    console.error(e);
  }
}
