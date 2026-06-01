import { useState, useEffect } from "react";
import { INITIAL_PRODUCTS } from "./data/products";
import { Product, CartItem, Order } from "./types";
import { triggerPixelEvent, getPixelSettings, injectPixelAndGtmScripts } from "./utils/pixelHelper";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductShelf from "./components/ProductShelf";
import CartDrawer from "./components/CartDrawer";
import ProductDetailModal from "./components/ProductDetailModal";
import CheckoutModal from "./components/CheckoutModal";
import AiAdvisorTab from "./components/AiAdvisorTab";
import AdminPanel from "./components/AdminPanel";
import PromoLandingTab from "./components/PromoLandingTab";
import OrderSuccessModal from "./components/OrderSuccessModal";
import AuthTab from "./components/AuthTab";
import UserProfilePanel from "./components/UserProfilePanel";
import LiveTrackingSystem from "./components/LiveTrackingSystem";
import { TenantConfig, getSavedTenant, IS_RESELLER_ACTIVE, isResellerFeatureUnlocked } from "./data/tenantConfig";
import ResellerConfigPanel from "./components/ResellerConfigPanel";
import { triggerOrderSmsNotification } from "./utils/smsHelper";
import { playNotificationChime } from "./utils/audioHelper";
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Star, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Truck,
  RotateCcw,
  BadgePercent,
  CheckCircle,
  Clock,
  Briefcase,
  Store,
  Building2,
  Lock,
  ArrowRight,
  Phone,
  MessageSquare,
  HelpCircle,
  Mail,
  Twitter,
  Linkedin,
  Youtube,
  Play,
  BookOpen,
  Volume2,
  Maximize2,
  Share2,
  Eye
} from "lucide-react";

const HOME_VIDEOS = [
  {
    id: "mD5bYf07d2Y",
    title: "Riverine Farms June 2021",
    titleBn: "রিভারাইন ফার্মস জুন ২০২১",
    author: "Riverine Farms Ltd",
    thumbnail: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600",
    length: "1:44"
  },
  {
    id: "kF2B_95fbyE",
    title: "One Of The Finest Bulls in Bangladesh",
    titleBn: "বাংলাদেশের সেরা ও চমৎকার ষাঁড়",
    author: "Goru Lovers Of Bangladesh",
    thumbnail: "https://images.unsplash.com/photo-1527153857715-3908f2bac5e8?auto=format&fit=crop&q=80&w=600",
    length: "0:28"
  },
  {
    id: "w88U_P5XQ7Y",
    title: "My First Time Visit Riverine Farms",
    titleBn: "আমার প্রথম রিভারাইন ফার্মস ভ্রমণ",
    author: "Biggest Cow in Bangladesh",
    thumbnail: "https://images.unsplash.com/photo-1596733430284-f74ca48c9bf7?auto=format&fit=crop&q=80&w=600",
    length: "4:15"
  }
];

const HOME_BLOGS = [
  {
    id: "blog-1",
    title: "Benefits Of Milk",
    titleBn: "অর্গানিক দুধের উপকারিতা ও স্বাস্থ্যগুণ",
    summary: "অ্যান্টিবায়োটিক ও রেসিডিউ মুক্ত খাঁটি তরল দুধ আমাদের শরীরের হাড়ের গঠন এবং ইমিউনিটি বৃদ্ধিতে অত্যন্ত গুরুত্বপূর্ণ ভূমিকা..." ,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600",
    bgColor: "bg-pink-50/70 border-pink-100",
    textColor: "text-zinc-800",
    headerColor: "text-pink-600",
    tagColor: "bg-pink-100 text-pink-700",
    tag: "Benefits Of Milk",
    content: `খাঁটি তরল দুধের উপকারিতা অপরিসীম। রিভারাইন ফার্মস নিয়ে এসেছে শতভাগ অ্যান্টিবায়োটিক ও কেমিক্যাল মুক্ত খাঁটি তরল দুধ।

১. হাড় ও দাঁতের মজবুত গঠন: দুধ ক্যালসিয়াম এবং ফসফরাসের একটি অত্যন্ত সমৃদ্ধ উৎস, যা মানুষের হাড় ও দাঁতের গঠনে সাহায্য করে।
২. পেশী শক্তি ও কর্মক্ষমতা বৃদ্ধি: দুধে থাকা উচ্চমানের প্রোটিন পেশীর ক্ষয় পূরণ করে শক্তি জোগায়।
৩. কোলেস্টেরল নিয়ন্ত্রণ ও হৃদযন্ত্রের যত্ন: খাঁটি ফ্যাট হৃদপিন্ডের কার্যক্ষমতা সচল রাখতে সাহায্য করতে পারে।`
  },
  {
    id: "blog-2",
    title: "Benefits Of Milk",
    titleBn: "দুধের সাথে হলুদ মিশিয়ে খাওয়ার চমৎকার গুণাবলী",
    summary: "দুধের সাথে হলুদ মিশিয়ে পান করলে তা প্রাকৃতিক অ্যান্টিবায়োটিক হিসেবে কাজ করে এবং শরীরের রোগ প্রতিরোধ ক্ষমতা বহু গুণ বাড়িয়ে...",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    bgColor: "bg-amber-50/70 border-amber-100",
    textColor: "text-zinc-800",
    headerColor: "text-amber-600",
    tagColor: "bg-amber-105 text-amber-700",
    tag: "Benefits Of Milk",
    content: `দুধ ও হলুদ একসঙ্গে মেশালে কারকিউমিন ও ক্যালসিয়ামের এক শক্তিশালী মেলবন্ধন তৈরি হয়।

১. ইমিউনিটি বা রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি: হলুদ একটি শক্তিশালী অ্যান্টি-অক্সিডেন্ট।
২. ঠাণ্ডা ও কাশির প্রাকৃতিক সমাধান: হালকা গরম হলুদের দুধ কফ ও শ্বাসযন্ত্রের সংক্রমণে জাদুর মতো কাজ করে।
৩. হজম ক্ষমতার উন্নতি: গ্যাস্ট্রিক প্রতিরোধ ও লিভার ডিটক্সিফিকেশনে হলুদ সাহায্য করে।`
  },
  {
    id: "blog-3",
    title: "Bnefits Of Pure Gh...",
    titleBn: "খাঁটি দেশি গাওয়া ঘি কেন আমাদের ডায়েটে রাখা উচিত?",
    summary: "খাঁটি দেশি গাওয়া ঘি আমাদের শরীরের নার্ভ সিস্টেম সচল রাখতে সুপ্রাচীনকাল থেকে সমাদৃত। এতে রয়েছে ভিটামিন এ, ডি, ই এবং কে...",
    image: "https://images.unsplash.com/photo-1622484211148-7164999ae368?auto=format&fit=crop&q=80&w=600",
    bgColor: "bg-orange-50/70 border-orange-100",
    textColor: "text-zinc-805",
    headerColor: "text-orange-600",
    tagColor: "bg-orange-100 text-orange-700",
    tag: "Benefits Of Pure Ghee",
    content: `দেশি গাওয়া ঘিতে রয়েছে ওমেগা-৩ ফ্যাটি এসিড এবং বুটিরিক এসিড, যা আমাদের পরিপাকতন্ত্রকে সুস্থ রাখে।

১. ব্রেইন ডেভেলপমেন্ট ও স্মৃতিশক্তি বৃদ্ধি: ঘিতে থাকা হেলদি ফ্যাট মস্তিষ্কের সুস্থ কার্যক্ষমতা বজায় রাখে।
২. ত্বক ও চুলের উজ্জ্বলতা বৃদ্ধি: ঘি খেলে ভেতর থেকে ত্বক নরম ও উজ্জ্বল হয়ে ওঠে।
৩. হাড়ের জয়েন্টের কার্যক্ষমতা বজায় রাখা: জয়েন্ট লুব্রিকেশনে ঘি দারুণ ভূমিকা পালন করে।`
  },
  {
    id: "blog-4",
    title: "Benefits Of Milk",
    titleBn: "শতভাগ অ্যান্টিবায়োটিক রেসিডিউ প্রিভেনশন ও দুধ",
    summary: "পশুর চিকিৎসায় ব্যবহৃত অ্যান্টিবায়োটিক উপাদান যাতে দুধে না আসে, সেজন্য ১০-১৫ দিনের উইথড্রয়াল পিরিয়ড কঠোরভাবে মেনে চলা হয়...",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600",
    bgColor: "bg-pink-50/70 border-pink-100",
    textColor: "text-zinc-800",
    headerColor: "text-pink-600",
    tagColor: "bg-pink-100 text-pink-700",
    tag: "Benefits Of Milk",
    content: `রিভারাইন ফার্মস দুধে কোনো ধরনের প্রিজারভেটিভ, ফরমালিন বা অ্যান্টিবায়োটিক রেসিডিউ ব্যবহার করা হয় না।

১. শতভাগ বিশুদ্ধতা টেস্ট: প্রতিটি ব্যাচ ল্যাবে পরিক্ষিত ও নিশ্চিত করা হয়।
২. শিশুদের জন্য নির্ভরযোগ্য ও নিরাপদ: এটি সাধারণ দুধের চেয়ে ১০ গুণ রোগমুক্ত ও নিরাপদ।
৩. প্রাকৃতিক পুষ্টির আধার: প্রাকৃতিকভাবে সবুজ ঘাস খাওয়ানো গরুর আসল স্বাদ এতে সম্পূর্ণ অক্ষুণ্ণ থাকে।`
  },
  {
    id: "blog-5",
    title: "Benefits Of Milk",
    titleBn: "গর্ভবতী ও শিশুদের হলুদের দুধ খাওয়ার বিজ্ঞানসম্মত চমৎকার উপকারিতা",
    summary: "হলুদের প্রধান কার্যকরী উপাদান কারকিউমিন শরীরের ইনফ্লামেশন কমায় ও দীর্ঘমেয়াদী ব্যথা লাঘব করে...",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    bgColor: "bg-amber-50/70 border-amber-100",
    textColor: "text-zinc-800",
    headerColor: "text-amber-600",
    tagColor: "bg-amber-105 text-amber-700",
    tag: "Benefits Of Milk",
    content: `হলুদ একটি অ্যান্টি-ইনফ্ল্যামেটরি ভেষজ উপাদান। দুধের সাথে এটি সেবন করলে শারীরিক টক্সিন অবমুক্ত হয়।

১. জয়েন্টের বাতের ব্যথা উপশম: বাতের ব্যথা কমাতে সকালে বা রাতে কুসুম গরম দুধে হলুদ মিশিয়ে পান করুন।
২. ক্লান্তি ও মানসিক চাপ নিরসন: হলুদের দুধ পান করলে ভালো ঘুম হয় এবং শারীরিক সতেজতা আসে।
৩. উজ্জ্বল ত্বক ও স্কিন বুস্টিং: প্রাকৃতিক উজ্জ্বলতা ফিরিয়ে আনতে ও রোগ প্রতিরোধে হলুদের বিকল্প মেলা ভার।`
  },
  {
    id: "blog-6",
    title: "Bnefits Of Pure Gh...",
    titleBn: "রিভারাইন ফার্মসের দেশি গাওয়া ঘি প্রস্তুত প্রণালীর বিবরণ ও গুণ",
    summary: "সম্পূর্ণ ট্র্যাডিশনাল উপায়ে কাঠের ঘানিতে তৈরি মাখন জ্বাল দিয়ে প্রস্তুতকৃত প্রিমিয়াম দানা ঘি...",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600",
    bgColor: "bg-orange-50/70 border-orange-100",
    textColor: "text-zinc-805",
    headerColor: "text-orange-600",
    tagColor: "bg-orange-100 text-orange-700",
    tag: "Benefits Of Pure Ghee",
    content: `আমাদের দেশি গাওয়া ঘি প্রস্তুত প্রণালী পুরোপুরি কৃত্রিম গন্ধ ও ভেজাল মুক্ত। সম্পূর্ণ ঐতিহ্যবাহী দেশিয় উপায়ে প্রস্তুতকৃত।

১. স্বাদে ও সুবাসে অনন্য: রান্নায় সামান্য এই সুগন্ধি ঘি ছড়ালেই মৌ মৌ সুবাসে ভরে উঠবে আপনার খাবার টেবিল।
২. দীর্ঘস্থায়ী সাধারণ তাপমাত্রা সংরক্ষণ: কোনো কৃত্রিম প্রিজারভেটিভ ছাড়াই এক বছর নিশ্চিন্তে সংরক্ষণ করতে পারবেন।
৩. কোলেস্টেরল হীনা ও উপকারী: রক্তনালী অবরুদ্ধ মুক্ত রাখার উপকারী চর্বি এতে বিদ্যমান।`
  }
];

const slides = [
  {
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
    title: "Exclusive Premium T-Shirts Collection",
    titleBn: "এক্সক্লুসিভ প্রিমিয়াম টি-শার্ট কালেকশন",
    subtitle: "Upto 35% discount on top designer wearables.",
    subtitleBn: "সেরা ডিজাইনার পোশাকের উপর ৩৫% পর্যন্ত মূল্যছাড়।"
  },
  {
    image: "https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=1200&q=80",
    title: "Next-Gen Laptops & Accessories",
    titleBn: "নেক্সট-জেন ল্যাপটপ ও কম্পিউটেশনাল কিট",
    subtitle: "Equip your workspace with high speed machines.",
    subtitleBn: "উচ্চ গতির প্রফেশনাল ল্যাপটপের সাথে আপনার ক্যারিয়ার গড়ুন।"
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    title: "Smart Premium Sport Watches",
    titleBn: "স্মার্ট প্রিমিয়াম স্পোর্টস ঘড়ি ও ট্র্যাকার",
    subtitle: "Monitor health and styles on the go.",
    subtitleBn: "আপনার স্বাস্থ্য ও দৈনন্দিন লাইফস্টাইল ট্র্যাক করুন প্রফেশনালি।"
  }
];

const STATIC_BRANDS = [
  { name: "Mokarram", nameBn: "মোকাররম" },
  { name: "Robi", nameBn: "রবি" },
  { name: "TRASH BAG BLACK", nameBn: "ট্র্যাশ ব্যাগ ব্ল্যাক" },
  { name: "Showsee C1 Nose Trimmer", nameBn: "শোওসি সি১ নোজ ট্রিমার" },
  { name: "Zeblaze Thor Ultra", nameBn: "জেব্লেজ থর আল্ট্রা" },
  { name: "Klospet Tank T2 Elite", nameBn: "ক্লোসপেট ট্যাংক টি২ এলিট" },
  { name: "Noise Halo Plus Elite Edition", nameBn: "নয়েজ হ্যালো প্লাস এলিট" },
  { name: "Noise Halo Smartwatch", nameBn: "নয়েজ হ্যালো スマートウォッチ" },
  { name: "huawei honor band 9", nameBn: "হুয়াওয়ে অনার ব্যান্ড ৯" },
  { name: "Imilab w02", nameBn: "ইমিলাব ডব্লিউ০২" },
  { name: "Antec Power Supply", nameBn: "অ্যান্টেক পাওয়ার সাপ্লাই" },
  { name: "HP Latitude Series", nameBn: "এইচপি ল্যাটিটিউড সিরিজ" },
  { name: "LG Ultrawide Monitor", nameBn: "এলজি আল্ট্রাওয়াইড মনিটর" },
  { name: "ASRock Pro Motherboard", nameBn: "অ্যাসরক মাদারবোর্ড" },
  { name: "Dell Inspiron Core", nameBn: "ডেল ইন্সপিরন কোর" },
  { name: "Golden Field RGB Case", nameBn: "গোল্ডেন ফিল্ড আরজিবি কেসিং" },
  { name: "Xiaomi Powerbank", nameBn: "শাওমি পাওয়ার ব্যাংক" },
  { name: "Sony Wireless Headset", nameBn: "সোনি ওয়্যারলেস হেডসেট" },
  { name: "iPhone X Edition", nameBn: "আইফোন এক্স এডিশন" },
  { name: "Samsung Z Fold series", nameBn: "স্যামসাং জেড ফোল্ড সিরিজ" },
  { name: "Colmi Smart Wearable", nameBn: "কলমি স্মার্ট ওয়্যারেবল" },
  { name: "Miyako Blender & Mixer", nameBn: "মিয়াকো ব্লেন্ডার" },
  { name: "Walton Refrigerator", nameBn: "ওয়ালটন রেফ্রিজারেটর" },
  { name: "Realme Watch Pro", nameBn: "রিয়েলমি ওয়াচ প্রো" },
  { name: "H&M Luxury Tees", nameBn: "এইচএন্ডএম টি-শার্ট" },
  { name: "Zara Classic Fit Polo", nameBn: "জারা ক্লাসিক পোলো" },
  { name: "Nike Sportswear Ready", nameBn: "নাইকি স্পোর্টসওয়্যার" },
  { name: "Adidas Performance Wear", nameBn: "অ্যাডিডাস স্পোর্টস ওয়্যার" },
  { name: "Tommy Hilfiger Casuals", nameBn: "টমি হিলফিগার ক্যাজুয়াল" },
  { name: "Lacoste Signature Shirts", nameBn: "ল্যাকোস্ট সিগনেচার শার্ট" },
  { name: "Drop Shoulder Style", nameBn: "ড্রপ শোল্ডার স্টাইল" },
  { name: "Bespoke Premium Cotton", nameBn: "বিস্পোক প্রিমিয়াম কটন" },
  { name: "Urban Outfit Knitwear", nameBn: "আরবান আউটফিট নিটওয়্যার" },
  { name: "Aura Studio Printed", nameBn: "অরা স্টুডিও প্রিন্টেড" }
];

const sidebarExtraData: Record<string, {
  name: string;
  subcategories: Array<{
    id: string;
    name: string;
    icon: string;
    brands: string[];
  }>;
}> = {
  "laptop": {
    name: "Laptop & Notebooks",
    subcategories: [
      {
        id: "cpu-cooler",
        name: "CPU Cooler",
        icon: "🔌",
        brands: ["Antec", "Gamdias", "Xtreme", "Lian Li", "Team", "MSI", "Gigabyte", "NZXT", "Thermaltake", "Cooler Master", "Cougar", "Asus", "Deepcool", "XIGMATEK", "AMD", "Value-Top", "ARCTIC", "Huntkey"]
      },
      {
        id: "liquid-cooling",
        name: "Water / Liquid Cooling",
        icon: "💧",
        brands: ["Deepcool", "Cooler Master", "Antec", "Corsair"]
      },
      {
        id: "motherboard",
        name: "Motherboard",
        icon: "🎛️",
        brands: ["ASRock (Intel)", "ASRock (AMD)", "ASUS (intel)", "ASUS (AMD)", "GIGABYTE (Intel)", "GIGABYTE (AMD)", "MSI (Intel)", "MSI(AMD)", "Colorful (Intel)", "Colorful (AMD)", "Intel Motherboard", "AMD Motherboard"]
      },
      {
        id: "graphics-card",
        name: "Graphics Card",
        icon: "🎮",
        brands: ["Colorful", "ASRock", "ASUS", "GIGABYTE", "Intel", "ZOTAC", "MSI", "Sapphire", "GUNNIR", "ARKTEK", "BIOSTAR", "PELADN", "Galax", "OCPC", "Palit"]
      },
      {
        id: "ram-desktop",
        name: "RAM (Desktop)",
        icon: "💾",
        brands: ["Adata", "TEAM", "Colorful", "Corsair", "Gigabyte", "G.Skill", "PNY", "Kingston", "Transcend", "HP", "XOC", "Lexar", "Netac"]
      },
      {
        id: "ram-laptop",
        name: "RAM (Laptop)",
        icon: "💾",
        brands: ["TEAM", "Colorful", "Adata", "Transcend", "G.Skill", "Kingston", "Crucial", "Lexar", "Corsair", "OCPC", "Netac"]
      },
      {
        id: "power-supply",
        name: "Power Supply",
        icon: "🔌",
        brands: ["Antec", "Gamdias", "Lian Li", "MaxGreen", "FSP", "Cooler Master", "ThermalTake", "Corsair", "Gigabyte", "1STPLAYER", "MSI", "Asus"]
      },
      {
        id: "hdd",
        name: "Hard Disk Drive",
        icon: "💽",
        brands: ["Western Digital", "Seagate", "Toshiba"]
      },
      {
        id: "portable-hdd",
        name: "Portable Hard Disk Drive",
        icon: "💾",
        brands: ["Transcend", "Western Digital", "Seagate"]
      },
      {
        id: "casing",
        name: "Casing",
        icon: "🖥️",
        brands: ["Antec", "Lian Li", "Corsair", "NZXT"]
      },
      {
        id: "casing-cooler",
        name: "Casing Cooler",
        icon: "🌀",
        brands: ["Antec", "Gamdias", "Corsair", "Deepcool"]
      },
      {
        id: "optical-drive",
        name: "Optical Disk Drive",
        icon: "💿",
        brands: ["Asus Premium", "LG Writer", "Lite-On"]
      }
    ]
  },
  "tshirt": {
    name: "T-Shirt",
    subcategories: [
      {
        id: "polo-tshirt",
        name: "Polo T-Shirt",
        icon: "👕",
        brands: ["Polo Ralph", "Tommy Hilfiger", "Lacoste", "Club Room"]
      },
      {
        id: "crew-neck",
        name: "Crew Neck T-Shirt",
        icon: "👕",
        brands: ["H&M", "Zara", "Nike", "Adidas"]
      },
      {
        id: "oversized",
        name: "Oversized Tees",
        icon: "👕",
        brands: ["Drop Shoulder", "Bespoke Classic", "Urban Outfit"]
      },
      {
        id: "printed-tshirt",
        name: "Premium Printed Tees",
        icon: "🎨",
        brands: ["Aura Studio", "Nabik Signature"]
      }
    ]
  },
  "appliances": {
    name: "Home Appliance",
    subcategories: [
      {
        id: "refrigerator",
        name: "Smart Refrigerator",
        icon: "❄️",
        brands: ["Samsung", "Walton", "Singer", "LG"]
      },
      {
        id: "air-conditioner",
        name: "Air Conditioner",
        icon: "🌀",
        brands: ["Gree", "General", "Midea", "Walton"]
      },
      {
        id: "blender",
        name: "Blender & Mixer",
        icon: "🍹",
        brands: ["Miyako", "Panasonic", "Philips", "Jaipan"]
      },
      {
        id: "microwave",
        name: "Microwave Oven",
        icon: "🍲",
        brands: ["Singer", "LG", "Samsung", "Sharp"]
      }
    ]
  },
  "powerbank": {
    name: "Redmi Powerbank 10k",
    subcategories: [
      {
        id: "xiaomi-power",
        name: "Xiaomi Power Banks",
        icon: "🔋",
        brands: ["Redmi QuickCharge", "Mi Compact 3", "Pocket Edition"]
      }
    ]
  },
  "sony": {
    name: "Sony 10 Mark IV",
    subcategories: [
      {
        id: "sony-audio",
        name: "Sony Wireless Headphones",
        icon: "🎧",
        brands: ["WH-1000XM5", "WH-CH720N", "MDR-7506 Professional"]
      }
    ]
  },
  "iphone1": {
    name: "Iphone X 256gb",
    subcategories: [
      {
        id: "iphone-variants",
        name: "iPhone X Series",
        icon: "📱",
        brands: ["Space Gray 256GB", "Silver 256GB"]
      }
    ]
  },
  "iphone2": {
    name: "iphone X 256gb 88616405",
    subcategories: [
      {
        id: "iphone-variants-2",
        name: "iPhone X Series Pro",
        icon: "📱",
        brands: ["Space Gray 256GB", "Silver 256GB"]
      }
    ]
  },
  "samsung": {
    name: "Samsung Z fold 4 5g 12/256gb",
    subcategories: [
      {
        id: "foldable-series",
        name: "Galaxy Fold Series",
        icon: "📱",
        brands: ["Samsung Z Fold 4", "Samsung Z Flip 4"]
      }
    ]
  },
  "colmi": {
    name: "Colmi Smart Watch P71",
    subcategories: [
      {
        id: "colmi-fitness",
        name: "Colmi Fitness Smartwatches",
        icon: "⌚",
        brands: ["Colmi P71 Plus", "Colmi Sizes", "Colmi Classic"]
      }
    ]
  },
  "pc": {
    name: "Desktop PC",
    subcategories: [
      {
        id: "gaming-pc",
        name: "Gaming Computers",
        icon: "🎮",
        brands: ["Intel Extreme", "AMD Beast Pro", "Aura Custom Design"]
      }
    ]
  },
  "dt": {
    name: "DT no 1",
    subcategories: [
      {
        id: "dt-wearables",
        name: "DT Wearable Series",
        icon: "⌚",
        brands: ["DT No.1 Ultra Super", "DT 8 active", "DT 7 gold"]
      }
    ]
  },
  "realme": {
    name: "Realme Watch 2",
    subcategories: [
      {
        id: "realme-wearables",
        name: "Realme Smart Bands",
        icon: "⌚",
        brands: ["Realme Watch 2 Pro Plus", "Realme Fitness Band 2"]
      }
    ]
  },
  "zeblaze": {
    name: "Zeblaze Beyond 3 Pro",
    subcategories: [
      {
        id: "zeblaze-wearables",
        name: "Zeblaze Smartwatch Series",
        icon: "⌚",
        brands: ["Zeblaze Beyond 3 Pro", "Zeblaze Thor Ultra", "Zeblaze Stratos"]
      }
    ]
  }
};

export default function App() {
  // Settings States
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [language, setLanguage] = useState<'en' | 'bn'>('bn'); // default to Bangla

  // Global App States
  const [activeTenant, setActiveTenant] = useState<TenantConfig>(getSavedTenant());
  const activeSlides = activeTenant.slides || slides;
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("nabik_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("nabik_orders");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTab, setCurrentTab] = useState<string>('shop');
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("nabik_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("nabik_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("nabik_orders", JSON.stringify(orders));
  }, [orders]);

  const [unreadNotificationOrders, setUnreadNotificationOrders] = useState<Order[]>([]);

  // Bidirectional order synchronization (Poll server every 8 seconds)
  useEffect(() => {
    let active = true;

    const syncWithServer = async () => {
      try {
        const localSavedStr = localStorage.getItem("nabik_orders") || "[]";
        let currentLocalOrders: Order[] = [];
        try {
          currentLocalOrders = JSON.parse(localSavedStr);
        } catch (_) {}

        const response = await fetch("/api/orders/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ orders: currentLocalOrders })
        });

        if (!response.ok || !active) return;
        const mergedFromBackend: Order[] = await response.json();

        if (Array.isArray(mergedFromBackend)) {
          // Identify any orders that are completely new to this browser session
          const newlyDiscovered: Order[] = [];
          mergedFromBackend.forEach((bo) => {
            if (!currentLocalOrders.some((lo) => lo.id === bo.id)) {
              newlyDiscovered.push(bo);
            }
          });

          setOrders((prev) => {
            const hasChange = prev.length !== mergedFromBackend.length || 
              JSON.stringify(prev) !== JSON.stringify(mergedFromBackend);

            if (hasChange) {
              return mergedFromBackend;
            }
            return prev;
          });

          if (newlyDiscovered.length > 0) {
            const latest = newlyDiscovered[0];
            
            // 1. Dispatch custom event toast
            window.dispatchEvent(
              new CustomEvent("app-toast", { 
                detail: language === 'bn' 
                  ? `🔔 [নতুন অনলাইন অর্ডার] ${latest.customerInfo.name} একটি অর্ডার করেছেন! মোট মূল্য: ৳${latest.totalBDT.toLocaleString()}`
                  : `🔔 [New Online Order] ${latest.customerInfo.name} placed a new order! Total BDT: ${latest.totalBDT.toLocaleString()}` 
              })
            );

            // 2. Play the beautiful auditory customer alert chime!
            try {
              playNotificationChime();
            } catch (err) {
              console.warn("Chime alert blocked:", err);
            }

            // 3. Save to unread orders notifications dropdown
            setUnreadNotificationOrders((prev) => {
              const uniques = newlyDiscovered.filter(no => !prev.some(po => po.id === no.id));
              return [...uniques, ...prev];
            });
          }
        }
      } catch (e) {
        console.warn("Backend order sync failed, continuing offline mode:", e);
      }
    };

    // Run immediately on page load
    syncWithServer();

    // Set up polling interval (every 8 seconds to be lightweight)
    const interval = setInterval(syncWithServer, 8000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [language]);

  useEffect(() => {
    injectPixelAndGtmScripts(getPixelSettings());
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("nabik_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("nabik_current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    // Dynamically inject theme colors onto root for white labeling
    document.documentElement.style.setProperty('--brand-color', activeTenant.primaryColor);
    document.documentElement.style.setProperty('--brand-hover', activeTenant.hoverColor);
    document.documentElement.style.setProperty('--brand-light', activeTenant.bgLightColor);
    document.documentElement.style.setProperty('--brand-shadow', `${activeTenant.primaryColor}20`);

    if (activeTenant.defaultCurrency) {
      setCurrency(activeTenant.defaultCurrency);
    }
    if (activeTenant.defaultLanguage) {
      setLanguage(activeTenant.defaultLanguage);
    }
  }, [activeTenant]);
  
  // Custom Nabik States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorTab, setVendorTab] = useState<'list' | 'register'>('list');
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsAppResponse, setWhatsAppResponse] = useState<string | null>(null);
  const [timeSecs, setTimeSecs] = useState(1446736200); // 1674 Days countdown clock equivalent
  const [registeredMerchant, setRegisteredMerchant] = useState(false);
  const [merchantName, setMerchantName] = useState("");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  
  // Brand Sidebar Filter States
  const [inputMinPrice, setInputMinPrice] = useState("");
  const [inputMaxPrice, setInputMaxPrice] = useState("");
  const [activeMinPrice, setActiveMinPrice] = useState(0);
  const [activeMaxPrice, setActiveMaxPrice] = useState(999999);
  const [brandSearchText, setBrandSearchText] = useState("");

  // Multi-level Sidebar Hover States
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);

  // Multi-level Sidebar Accordion States
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "tshirt": true,
    "laptop": true
  });
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({
    "cpu-cooler": true
  });

  // Interaction Modals States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrderReceipt, setPlacedOrderReceipt] = useState<Order | null>(null);

  // Countdown timer clock engine ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSecs((prev) => (prev > 0 ? prev - 1 : 1446736200));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide effect for the main banner carousel on header
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 4500); // Transitions slide every 4.5 seconds automatically
    return () => clearInterval(slideInterval);
  }, [activeSlides]);

  const getCountdownGrid = () => {
    const d = Math.floor(timeSecs / (24 * 3600));
    const h = Math.floor((timeSecs % (24 * 3600)) / 3600);
    const m = Math.floor((timeSecs % 3600) / 60);
    const s = timeSecs % 60;
    return {
      days: String(d),
      hours: String(h).padStart(2, '0'),
      mins: String(m).padStart(2, '0'),
      secs: String(s).padStart(2, '0')
    };
  };

  const ticker = getCountdownGrid();

  // Translation Dictionaries
  const langText = {
    en: {
      browseCatalog: "Browse Catalog",
      aiAdvisor: "AI Assistant",
      myOrders: "History",
      adminPanel: "Admin Suite",
      allProducts: "All Products",
      electronics: "Electronics",
      fashion: "Fashion",
      home: "Home Decor",
      accessories: "Accessories",
      books: "Books & Gifts",
      searchPlaceholder: "Search premium essentials...",
      sortByPriceAsc: "Price: Low to High",
      sortByPriceDesc: "Price: High to Low",
      sortByRating: "Top Rated first",
      noProducts: "No products fit your filters.",
      cartIsProcessed: "Completed placing order!",
      backToShop: "Back To Catalog",
      featuredTitle: "Curated Craftsmanship",
      featuredDesc: "Discover hand-woven materials, studio noise-canceling acoustics, and minimal volcanically molded ornaments.",
      heroTitle: "Bespoke Lifestyle Portal",
      heroSubtitle: "Handpicked premium essentials for modern Bangladeshi living spaces, with instant AI consultation.",
      estimatedDelivery: "Estimated Delivery",
      paymentStatus: "Payment",
      orderSuccessTitle: "Order Placed Successfully!",
      orderSuccessSubtitle: "Your order details have been securely recorded. Receipt summary below:",
      paymentMethod: "Payment Mode",
      customerDetails: "Customer Information",
      address: "Address",
      purchasedProducts: "Purchased Items",
      orderStatus: "Order Status",
      totalBill: "Total Billing Address",
      anyQuestions: "Have any questions about custom styling or electronics specifications?",
      askAura: "Ask Aura AI Now",
      footerRights: "© 2026 Aura Bespoke Portal. All Rights Reserved."
    },
    bn: {
      browseCatalog: "ক্যাটালগ ব্রাউজ",
      aiAdvisor: "এআই অ্যাসিস্ট্যান্ট",
      myOrders: "হিস্ট্রি",
      adminPanel: "অ্যাডমিন স্যুট",
      allProducts: "সব ক্যাটাগরি",
      electronics: "ইলেকট্রনিক্স",
      fashion: "ফ্যাশন পরিধেয়",
      home: "হোম ডেকর",
      accessories: "অ্যাক্সেসরিজ",
      books: "বই ও উপহার",
      searchPlaceholder: "পছন্দের প্রিমিয়াম পণ্য খুঁজুন...",
      sortByPriceAsc: "মূল্য: কম থেকে বেশি",
      sortByPriceDesc: "মূল্য: বেশি থেকে কম",
      sortByRating: "কাস্টমার রেটিং অনুযায়ী",
      noProducts: "আপনার ফিল্টারের সাথে মিলে যায় এমন কোনো পণ্য পাওয়া যায়নি।",
      cartIsProcessed: "অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!",
      backToShop: "পুনরায় কেনাকাটায় ফিরুন",
      featuredTitle: "নির্বাচিত ও নান্দনিক কালেকশন",
      featuredDesc: "অভিজাত হাতে বোনা কাপড়, অ্যাক্টিভ নয়েজ ক্যান্সেলেশন হেডফোন এবং প্রাকৃতিক সিরামিক শৈলীর অপূর্ব মেলবন্ধন।",
      heroTitle: "আধুনিক ই-কমার্স পোর্টাল",
      heroSubtitle: "বাংলাদেশী রুচিশীল জীবনযাপনের উপযোগী প্রিমিয়াম সংকলন, সাথে রয়েছে ইনস্ট্যান্ট এআই শপিং পরামর্শক।",
      estimatedDelivery: "আনুমানিক ডেলিভারি সময়",
      paymentStatus: "পেমেন্ট স্ট্যাটাস",
      orderSuccessTitle: "অর্ডার সফলভাবে সম্পন্ন হয়েছে!",
      orderSuccessSubtitle: "আপনার অর্ডার তথ্য সিস্টেমে নথিভুক্ত করা হয়েছে। পেমেন্টের রসিদ নিচে দেয়া হলো:",
      paymentMethod: "পেমেন্ট মাধ্যম",
      customerDetails: "গ্রাহকের বিবরণী",
      address: "ঠিকানা",
      purchasedProducts: "ক্রয়কৃত পণ্যসমূহ",
      orderStatus: "অর্ডার স্ট্যাটাস",
      totalBill: "সর্বমোট প্রদেয় বিল",
      anyQuestions: "কোনো পণ্য বা কলার ফিটিং সম্পর্কিত প্রশ্ন আছে কি?",
      askAura: "অরা এআই-কে জিজ্ঞাসা করুন",
      footerRights: "© ২০২৬ অরা বেস্পোক পোর্টাল। সর্বস্বত্ব সংরক্ষিত।"
    }
  }[language];

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    triggerPixelEvent("AddToCart", {
      id: product.id,
      name: product.name,
      price: product.priceBDT,
      currency: "BDT",
      quantity
    });

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleOpenCheckout = (immediateCartOverride?: CartItem[]) => {
    const activeCart = immediateCartOverride || cart;
    const totalVal = activeCart.reduce((sum, item) => sum + item.product.priceBDT * item.quantity, 0);
    triggerPixelEvent("InitiateCheckout", {
      value: totalVal,
      currency: "BDT",
      numItems: activeCart.length
    });
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    // Save to server database immediately!
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    }).catch(e => console.error("Error saving order to backend:", e));

    setOrders((prev) => [newOrder, ...prev]);

    // Play an auditory chime notification for the admin
    playNotificationChime();

    // Trigger Facebook Pixel / GTM Purchase event
    triggerPixelEvent("Purchase", {
      orderId: newOrder.id,
      value: newOrder.totalBDT,
      currency: "BDT",
      numItems: newOrder.items.length
    });
    
    // Trigger automated mobile SMS notification alert (and admin alert if enabled!)
    triggerOrderSmsNotification(newOrder, 'placed', activeTenant?.siteName || "Nabik Bazar");

    // Dispatch a browser-wide notification event to alert the admin inside the app UI instantly
    window.dispatchEvent(
      new CustomEvent("app-toast", { 
        detail: `🔔 [নতুন অর্ডার] ${newOrder.customerInfo.name} একটি অর্ডার করেছেন! মোট মূল্য: ৳${newOrder.totalBDT.toLocaleString()}` 
      })
    );

    // Deduct stock levels on server state simulator
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const orderedItem = newOrder.items.find((item) => item.product.id === p.id);
        if (orderedItem) {
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
        }
        return p;
      })
    );
    // Flush shopping Cart
    setCart([]);
    setIsCheckoutOpen(false);
    setPlacedOrderReceipt(newOrder);
  };

  // Filter Catalog Products logic
  const filteredProducts = products
    .filter((p) => {
      const title = language === 'bn' ? p.nameBn : p.name;
      const desc = language === 'bn' ? p.descriptionBn : p.description;
      const brandName = p.brand ? p.brand : "";
      const brandNameBn = p.brandBn ? p.brandBn : "";
      
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brandNameBn.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "priceAsc") {
        return a.priceBDT - b.priceBDT;
      }
      if (sortBy === "priceDesc") {
        return b.priceBDT - a.priceBDT;
      }
      if (sortBy === "rating" || sortBy === "topRated") {
        return b.rating - a.rating;
      }
      if (sortBy === "bestSelling") {
        return b.reviewsCount - a.reviewsCount;
      }
      if (sortBy === "mostFavorite") {
        return (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount);
      }
      if (sortBy === "featured") {
        return (b.priceBDT < 2000 ? 1 : -1) - (a.priceBDT < 2000 ? 1 : -1);
      }
      return 0;
    });

  // Price range filtered elements
  const filteredProductsPriceRange = filteredProducts.filter((p) => {
    return p.priceBDT >= activeMinPrice && p.priceBDT <= activeMaxPrice;
  });

  // Sidebar brand entries calculations
  const sidebarBrands = STATIC_BRANDS.map((br) => {
    const count = products.filter((p) => {
      const matchesBrand = (p.brand && p.brand.toLowerCase() === br.name.toLowerCase()) ||
                          (p.brandBn && p.brandBn.toLowerCase() === br.nameBn.toLowerCase());
      return matchesBrand;
    }).length;
    return {
      name: br.name,
      nameBn: br.nameBn,
      count
    };
  });

  const displayBrandSidebarList = sidebarBrands.filter((b) => {
    if (!brandSearchText) return true;
    return b.name.toLowerCase().includes(brandSearchText.toLowerCase()) ||
           b.nameBn.toLowerCase().includes(brandSearchText.toLowerCase());
  });

  const activeBrand = STATIC_BRANDS.find(
    b => b.name.toLowerCase() === searchQuery.toLowerCase() || b.nameBn.toLowerCase() === searchQuery.toLowerCase()
  );

  const handleApplyPriceFilter = () => {
    const min = inputMinPrice === "" ? 0 : Number(inputMinPrice);
    const max = inputMaxPrice === "" ? 999999 : Number(inputMaxPrice);
    setActiveMinPrice(min);
    setActiveMaxPrice(max);
  };

  const handleScrollToCatalog = () => {
    setTimeout(() => {
      const element = document.getElementById("product-catalog-anchor");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalValue = cart.reduce((acc, item) => {
    const price = currency === 'BDT' ? item.product.priceBDT : item.product.priceUSD;
    return acc + (price * item.quantity);
  }, 0);

  const isHomePage = currentTab === 'shop' && !searchQuery && selectedCategory === 'all';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-800 flex flex-col font-sans" id="app-root-frame">
      
      {/* 1. Nabik Bazar Branded Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartTotalValue={cartTotalValue}
        onShowVendorModal={() => {
          setVendorTab('list');
          setShowVendorModal(true);
        }}
        langText={langText}
        onAddToCart={handleAddToCart}
        onBrandSelect={handleScrollToCatalog}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        activeTenant={activeTenant}
        onScrollToBlog={() => {
          setCurrentTab('shop');
          setSelectedCategory('all');
          setSearchQuery('');
          setTimeout(() => {
            document.getElementById('home-blogs-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }}
        onScrollToVideo={() => {
          setCurrentTab('shop');
          setSelectedCategory('all');
          setSearchQuery('');
          setTimeout(() => {
            document.getElementById('home-videos-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }}
        unreadNotifications={unreadNotificationOrders}
        setUnreadNotifications={setUnreadNotificationOrders}
      />

      {/* Main Container Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-6">
        
        {/* Receipt Success Screen Frame */}
        {placedOrderReceipt && (
          <div className="mb-8 bg-white border-2 border-orange-500 rounded-2xl p-6 sm:p-8 shadow-xl relative" id="receipt-success-screen">
            <button 
              onClick={() => setPlacedOrderReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-105 text-zinc-400 hover:text-zinc-700 transition cursor-pointer font-bold font-sans"
            >
              X
            </button>
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-6">
              <div className="h-14 w-14 bg-green-100 text-green-655 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 size={32} className="animate-pulse text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-orange-550 text-zinc-900 tracking-tight">
                {langText.orderSuccessTitle}
              </h2>
              <p className="text-xs text-zinc-500 mt-1 max-w-lg leading-relaxed">
                {language === 'bn' ? 'নাবিক বাজারে আপনার অর্ডার সফলভাবে নথিভুক্ত হয়েছে! আনুমানিক সময়ের মধ্যে পণ্য পৌঁছে যাবে।' : langText.orderSuccessSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-100 pt-6 text-xs sm:text-sm">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500">{langText.customerDetails}</h3>
                <div className="space-y-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <p><span className="text-zinc-550 font-bold">Name:</span> <strong className="text-zinc-800">{placedOrderReceipt.customerInfo.name}</strong></p>
                  <p><span className="text-zinc-550 font-bold">Phone:</span> <strong className="text-zinc-850 font-mono">{placedOrderReceipt.customerInfo.phone}</strong></p>
                  <p><span className="text-zinc-550 font-bold">Email:</span> <strong className="text-zinc-800 font-mono">{placedOrderReceipt.customerInfo.email}</strong></p>
                  <p><span className="text-zinc-550 font-bold">{langText.address}:</span> <span className="text-zinc-700">{placedOrderReceipt.customerInfo.address}</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500">{langText.purchasedProducts}</h3>
                <div className="divide-y divide-zinc-200 bg-zinc-50 px-4 py-2 border border-zinc-200 rounded-xl">
                  {placedOrderReceipt.items.map((item) => {
                    const priceText = currency === 'BDT'
                      ? `৳${item.product.priceBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
                      : `$${item.product.priceUSD}`;
                    return (
                      <div key={item.product.id} className="py-2 flex justify-between text-xs">
                        <span className="text-zinc-700">
                          {language === 'bn' ? item.product.nameBn : item.product.name} <strong className="text-orange-550">x{item.quantity}</strong>
                        </span>
                        <span className="font-mono text-zinc-900 font-bold">{priceText}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-baseline pt-2 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{langText.totalBill}</span>
                  <span className="text-lg font-black text-orange-600 font-sans tracking-tight">
                    {currency === 'BDT' 
                      ? `৳${placedOrderReceipt.totalBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
                      : `$${placedOrderReceipt.totalUSD.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-150 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-2 text-zinc-500 bg-orange-50 px-3 py-1 rounded-full text-[11px] font-bold">
                <Calendar size={13} className="text-orange-500" />
                <span>{langText.estimatedDelivery}: <strong>{placedOrderReceipt.estimatedDelivery}</strong></span>
              </div>
              <div className="flex items-center space-x-3.5 text-[11px] text-zinc-550 font-bold uppercase">
                <span>{langText.paymentMethod}: <strong className="text-orange-655">{placedOrderReceipt.customerInfo.paymentMethod}</strong></span>
                <span>{langText.orderStatus}: <span className="bg-orange-500 text-white rounded px-2 py-0.5 text-[9px] uppercase font-mono">{placedOrderReceipt.status}</span></span>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'shop' && (
          <div className="space-y-8" id="shop-tab">
            
            {/* 2. Top-tier 2-column Slider and Sidebar layout block */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="sidebar-slider-wrapper">
              
              {/* Category list sidebar navigation */}
              <div 
                className="hidden lg:block lg:col-span-1 bg-white rounded-xl border border-zinc-200 shadow-sm w-full relative lg:h-[350px]" 
                onMouseLeave={() => { 
                  setHoveredCategory(null); 
                  setHoveredSubcategory(null); 
                }}
                id="category-sidebar-nav"
              >
                <div className="divide-y divide-zinc-200 lg:h-full lg:flex lg:flex-col lg:justify-between py-0 rounded-xl overflow-hidden font-sans">
                  {[
                    { id: "tshirt", name: "T-Shirt", filterQuery: "T-Shirt", icon: "👕", hasChevron: true },
                    { id: "laptop", name: "Laptop & Notebooks", filterQuery: "Laptop", icon: "💻", hasChevron: true },
                    { id: "appliances", name: "Home Appliance", filterQuery: "Appliance", icon: "🔌", hasChevron: true },
                    { id: "powerbank", name: "Redmi Powerbank 10k", filterQuery: "Powerbank", icon: "🔋", hasChevron: true },
                    { id: "sony", name: "Sony 10 Mark IV", filterQuery: "Sony", icon: "🎧", hasChevron: true },
                    { id: "iphone1", name: "Iphone X 256gb", filterQuery: "Iphone", icon: "📱", hasChevron: true },
                    { id: "iphone2", name: "iphone X 256gb 88616405", filterQuery: "iphone X", icon: "📱", hasChevron: true },
                    { id: "samsung", name: "Samsung Z fold 4 5g 12/256gb", filterQuery: "Samsung", icon: "📱", hasChevron: true },
                    { id: "colmi", name: "Colmi Smart Watch P71", filterQuery: "Colmi", icon: "⌚", hasChevron: true },
                    { id: "pc", name: "Desktop PC", filterQuery: "PC", icon: "🖥️", hasChevron: true },
                    { id: "dt", name: "DT no 1", filterQuery: "DT", icon: "⌚", hasChevron: true },
                    { id: "realme", name: "Realme Watch 2", filterQuery: "Realme", icon: "⌚", hasChevron: true },
                    { id: "zeblaze", name: "Zeblaze Beyond 3 Pro", filterQuery: "Zeblaze", icon: "⌚", hasChevron: true }
                  ].map((cat) => {
                    const isSelected = selectedCategory === cat.id || searchQuery.toLowerCase() === cat.filterQuery.toLowerCase();
                    const isHovered = hoveredCategory === cat.id;
                    return (
                      <button
                        key={cat.name}
                        onMouseEnter={() => {
                          setHoveredCategory(cat.id);
                          const customData = sidebarExtraData[cat.id];
                          if (customData && customData.subcategories.length > 0) {
                            setHoveredSubcategory(customData.subcategories[0].id);
                          } else {
                            setHoveredSubcategory(null);
                          }
                        }}
                        onClick={() => {
                          if (cat.id === "tshirt" || cat.id === "laptop" || cat.id === "appliances") {
                            setSelectedCategory(cat.id);
                            setSearchQuery("");
                          } else {
                            setSelectedCategory("all");
                            setSearchQuery(cat.filterQuery);
                          }
                          setCurrentTab('shop');
                          handleScrollToCatalog();
                        }}
                        className={`w-full text-left px-5 py-[9px] lg:py-0 lg:flex-1 text-[12.5px] font-bold transition duration-150 flex items-center justify-between cursor-pointer border-0 group/cat ${
                          isSelected || isHovered
                            ? "bg-orange-50 text-orange-600 font-extrabold" 
                             : "text-zinc-700 bg-white hover:bg-zinc-50 hover:text-[#f58220]"
                        }`}
                        id={`sidebar-cat-${cat.id}`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <span className="text-[14px] leading-none select-none">{cat.icon}</span>
                          <span className="font-semibold">{cat.name}</span>
                        </div>
                        {/* Modernized chevron right indicator with premium glow & translate-x micro-interaction */}
                        {cat.hasChevron ? (
                          <ChevronRight 
                            size={12} 
                            className={`transition-all duration-300 stroke-[3] ${
                              isSelected || isHovered
                                ? "text-orange-600 translate-x-0.5"
                                : "text-zinc-350 group-hover/cat:text-[#f58220] group-hover/cat:translate-x-0.5"
                            }`}
                          />
                        ) : (
                          <span className="w-3"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* FLYOUT PANELS LEVEL 2 & 3 IN SYNC */}
                {hoveredCategory && sidebarExtraData[hoveredCategory] && (
                  <div 
                    className="absolute left-[100%] top-0 flex z-55 font-sans h-full items-start pl-2"
                    onMouseLeave={() => {
                      // Handled by outer wrapping div
                    }}
                    id="sidebar-flying-panels"
                  >
                    {/* Unified Premium Solid Container to prevent background showing through */}
                    <div className="flex bg-white border border-zinc-200 shadow-xl rounded-xl h-[350px] divide-x divide-zinc-150 overflow-hidden animate-in fade-in slide-in-from-left-1 duration-150">
                      
                      {/* Level 2 Subcategories Menu Column */}
                      <div className="w-[270px] bg-white flex flex-col divide-y divide-zinc-100 h-full overflow-y-auto py-1 shrink-0">
                        {sidebarExtraData[hoveredCategory].subcategories.map((sub) => {
                          const isSubActive = hoveredSubcategory === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onMouseEnter={() => setHoveredSubcategory(sub.id)}
                              onClick={() => {
                                setSelectedCategory("all");
                                setSearchQuery(sub.name);
                                setHoveredCategory(null);
                                setHoveredSubcategory(null);
                                handleScrollToCatalog();
                              }}
                              className={`w-full text-left px-5 py-2.5 text-[12.5px] font-bold hover:text-[#f58220] transition duration-150 flex items-center justify-between border-0 group/sub cursor-pointer ${
                                isSubActive 
                                  ? "bg-orange-50 text-orange-600 font-extrabold" 
                                  : "text-zinc-700 bg-white hover:bg-zinc-50"
                              }`}
                            >
                              <div className="flex items-center space-x-3.5">
                                <span className="text-[14px] select-none text-zinc-400 group-hover/sub:text-[#f58220]">{sub.icon}</span>
                                <span className="font-semibold">{sub.name}</span>
                              </div>
                              <ChevronRight 
                                size={12} 
                                className={`transition-all duration-300 stroke-[3] ${
                                  isSubActive
                                    ? "text-[#f58220] translate-x-0.5"
                                    : "text-zinc-350 group-hover/sub:text-[#f58220] group-hover/sub:translate-x-0.5"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Level 3 Brands Menu Column */}
                      {hoveredSubcategory && 
                       sidebarExtraData[hoveredCategory].subcategories.find(s => s.id === hoveredSubcategory)?.brands && (
                        <div className="w-[250px] bg-white flex flex-col divide-y divide-zinc-100 h-full overflow-y-auto py-1 shrink-0 animate-in fade-in duration-100">
                          {sidebarExtraData[hoveredCategory].subcategories
                            .find(s => s.id === hoveredSubcategory)
                            ?.brands.map((brand) => (
                              <button
                                key={brand}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory("all");
                                  setSearchQuery(brand);
                                  setHoveredCategory(null);
                                  setHoveredSubcategory(null);
                                  handleScrollToCatalog();
                                }}
                                className="w-full text-left px-5 py-2 text-[12.5px] font-semibold text-zinc-700 bg-white hover:bg-zinc-50 hover:text-[#f58220] transition flex items-center justify-between border-0 cursor-pointer group/brand"
                              >
                                <div className="flex items-center space-x-3">
                                  {/* Image placeholder box on left */}
                                  <div className="h-5 w-5 bg-zinc-50 border border-zinc-150 rounded flex items-center justify-center text-[10px] text-zinc-400 group-hover/brand:bg-orange-50 group-hover/brand:border-orange-200 transition shrink-0">
                                    🏷️
                                  </div>
                                  <span className="font-bold text-zinc-700 group-hover/brand:text-[#f58220] leading-none">{brand}</span>
                                </div>
                                <ChevronRight 
                                  size={11} 
                                  className="text-zinc-300 stroke-[3] transition-all duration-300 group-hover/brand:text-[#f58220] group-hover/brand:translate-x-0.5"
                                />
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Slider image component header with custom 100% replica of slide 1 */}
              <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm relative aspect-[21/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-auto lg:h-[350px] group">
                {activeSlides.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {idx === 0 ? (
                      <div className="w-full h-full flex flex-row overflow-hidden relative select-none" id="slide-0-custom">
                        
                        {/* Left side: Wavy/futuristic magsafe battery promo */}
                        <div className="w-2/3 bg-[#031531] relative flex flex-col justify-between p-6 sm:p-9 text-left animate-fade-in">
                          {/* Grid/wave graphical elements */}
                          <div className="absolute inset-0 opacity-25 pointer-events-none">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              <path d="M 0 120 Q 180 40 320 220 T 640 120" fill="none" stroke="#f58220" strokeWidth="2.5" />
                              <path d="M 0 180 Q 220 80 440 260 T 640 180" fill="none" stroke="#ff007f" strokeWidth="1.5" />
                              <circle cx="280" cy="180" r="100" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="5,5" />
                            </svg>
                          </div>

                          {/* Headline Text section */}
                          <div className="relative z-10 space-y-1 sm:space-y-2 max-w-sm mt-3">
                            <span className="text-red-500 font-black font-sans text-xl sm:text-2xl lg:text-3.5xl tracking-widest block uppercase">
                              Metal
                            </span>
                            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-[28px] font-extrabold text-white leading-tight tracking-tight mt-0.5 font-sans" style={{ whiteSpace: 'pre-line' }}>
                              {language === 'bn' ? slide.titleBn : slide.title}
                            </h2>
                          </div>

                          {/* Magsafe physical device styling mockup floating */}
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 scale-75 sm:scale-100 lg:scale-[1.1] transition duration-500 z-10">
                            <div className="w-28 h-44 bg-gradient-to-b from-[#b5b5ba] to-[#808085] rounded-[20px] border border-white/20 shadow-2xl relative flex flex-col items-center justify-start py-6">
                              {/* Circle charging ring */}
                              <div className="w-16 h-16 rounded-full border-2.5 border-dashed border-white/30 flex items-center justify-center relative">
                                <div className="w-4 h-4 rounded-full border border-white/20" />
                                <div className="absolute -bottom-1 w-1.5 h-4 border-l border-r border-white/30" />
                              </div>
                              <span className="text-[7.5px] font-black text-black/25 uppercase tracking-widest mt-6">MAGSAFE</span>
                              {/* Battery dots */}
                              <div className="absolute bottom-3 flex space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Turquoise block with Splatter Pink "New" */}
                        <div className="w-1/3 bg-[#0ab69a] relative flex flex-col items-center justify-center overflow-hidden">
                          {/* Splatter mask */}
                          <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-115">
                            <svg className="w-full h-full text-[#ec008c] fill-current" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                              <path d="M44.3,-76.3C55.9,-69.5,63.6,-54.6,71.1,-39.8C78.6,-25,85.9,-10.4,85.1,3.7C84.3,17.7,75.4,31.2,66.1,43.2C56.8,55.1,47,65.5,34.8,72C22.6,78.5,8.1,81.1,-6.6,79.5C-21.3,77.9,-36.2,72.2,-48.5,63.2C-60.8,54.1,-70.6,41.9,-75.4,27.8C-80.1,13.8,-79.9,-2.1,-75.4,-16.9C-70.9,-31.6,-62.1,-45.3,-50.3,-52.1C-38.4,-58.9,-23.6,-59,-7.7,-64.1C8.1,-69.3,27.7,-79.6,44.3,-76.3Z" transform="translate(100 100)" />
                            </svg>
                          </div>

                          {/* Display Text New */}
                          <h3 className="relative z-10 text-white font-serif font-black text-3xl sm:text-4xl lg:text-[42px] italic tracking-tight drop-shadow-md -rotate-[12deg] tracking-wider select-none">
                            New
                          </h3>

                          {/* Humorous Windows Activation overlay */}
                          <div className="absolute bottom-2.5 right-2 text-right opacity-30 pointer-events-none select-none z-10 font-sans text-[7.5px] sm:text-[9px] leading-tight text-zinc-100">
                            <p className="font-semibold">Activate Windows</p>
                            <p className="font-light">Go to Settings to activate Windows.</p>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="w-full h-full relative select-none">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {/* Premium gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
                        
                        {/* Slide content details overlay */}
                        <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-12 text-left z-10">
                          <div className="max-w-md space-y-2 sm:space-y-4">
                            <span className="inline-block px-2.5 py-1 text-[10px] font-extrabold bg-orange-500 text-white tracking-widest uppercase rounded">
                              {language === 'bn' ? 'বিশেষ অফার' : 'SPECIAL OFFER'}
                            </span>
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                              {language === 'bn' ? slide.titleBn : slide.title}
                            </h2>
                            <p className="text-xs sm:text-sm md:text-base text-zinc-200">
                              {language === 'bn' ? slide.subtitleBn : slide.subtitle}
                            </p>
                            <button 
                              onClick={handleScrollToCatalog}
                              className="inline-block self-start mt-2 px-5 py-2 bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-lg transition border-0 cursor-pointer"
                            >
                              {language === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Next & Previous slide buttons overlays */}
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/20 hover:bg-white/45 text-white flex items-center justify-center transition z-25 cursor-pointer border-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/20 hover:bg-white/45 text-white flex items-center justify-center transition z-25 cursor-pointer border-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-300"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Slider dot indices indicator bar - aligned exactly under MagSafe matching bottom dot dots */}
                <div className="absolute bottom-5 left-[43%] -translate-x-1/2 flex space-x-2 z-20">
                  {activeSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 w-2.5 rounded-full transition-all border-0 cursor-pointer ${
                        currentSlide === idx ? 'bg-orange-500 w-5.5' : 'bg-neutral-350 bg-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* 3. Flash Deals countdown tickers section block */}
            <div className="space-y-5" id="flash-deals-banner">
              <div className="flex items-end justify-between border-b border-zinc-200 pb-3" id="hurry-up-header">
                <div className="text-left">
                  <h3 className="text-[22px] font-black tracking-tight text-[#f58220] uppercase font-sans">
                    {language === 'bn' ? 'তাড়াতাড়ি করুন!' : 'HURRY UP!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 font-semibold mt-1">
                    {language === 'bn' ? 'অফারটি সীমিত সময়ের জন্য। শেষ হওয়ার আগেই লুফে নিন!' : 'Hurry Up ! The offer is limited. Grab while it lasts'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleScrollToCatalog}
                  className="text-xs font-bold text-[#f58220] hover:text-orange-600 transition flex items-center bg-transparent border-0 cursor-pointer group"
                >
                  <span className="mr-1">{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
                  <ChevronRight size={12} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch" id="hurry-up-grid">
                {/* Left side column: Countdown vertical grid container */}
                <div className="md:col-span-3 bg-gradient-to-br from-[#f58220] to-orange-500 text-white rounded-xl p-6 flex flex-col justify-center items-center shadow-sm relative min-h-[220px] md:min-h-0">
                  <div className="w-full text-center space-y-4">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white/10 backdrop-blur-md rounded-lg py-3 px-1 border border-white/10 shadow-xs">
                        <span className="block text-xl font-extrabold font-mono tracking-tight leading-none">{ticker.days}</span>
                        <span className="text-[9px] uppercase font-black text-white/90 mt-2 block tracking-wider">{language === 'bn' ? 'দিন' : 'Days'}</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-lg py-3 px-1 border border-white/10 shadow-xs">
                        <span className="block text-xl font-extrabold font-mono tracking-tight leading-none">{ticker.hours}</span>
                        <span className="text-[9px] uppercase font-black text-white/90 mt-2 block tracking-wider">{language === 'bn' ? 'ঘণ্টা' : 'Hrs'}</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-lg py-3 px-1 border border-white/10 shadow-xs">
                        <span className="block text-xl font-extrabold font-mono tracking-tight leading-none">{ticker.mins}</span>
                        <span className="text-[9px] uppercase font-black text-white/90 mt-2 block tracking-wider">{language === 'bn' ? 'মিনিট' : 'Min'}</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-lg py-3 px-1 border border-white/10 shadow-xs">
                        <span className="block text-xl font-extrabold font-mono tracking-tight leading-none">{ticker.secs}</span>
                        <span className="text-[9px] uppercase font-black text-white/90 mt-2 block tracking-wider">{language === 'bn' ? 'সেকেন্ড' : 'Sec'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side columns: 4 beautifully aligned white Product Card representations */}
                <div className="md:col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.slice(0, 4).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currency={currency}
                      language={language}
                      onSelectProduct={setSelectedProduct}
                      onAddToCart={(prod) => handleAddToCart(prod, 1)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Explore Popular Categories grid */}
            <div className="space-y-4 text-center">
              <div>
                <h3 className="text-lg font-black tracking-wider uppercase text-zinc-900">{language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি এক্সপ্লোর করুন' : 'EXPLORE POPULAR CATEGORIES'}</h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">{language === 'bn' ? 'নাবিক বাজারের সেরা নির্বাচিত পণ্যসামগ্রী' : 'Premium handpicked essentials for modern lifestyles'}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { id: "tshirt", label: "Tshirt PSU Case", labelBn: "টি-শার্ট ও কেসিং", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=120&auto=format&fit=crop&q=80" },
                  { id: "laptop", label: "Laptops", labelBn: "ল্যাপটপ সমূহ", image: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=120&auto=format&fit=crop&q=80" },
                  { id: "appliances", label: "Home Tech", labelBn: "হোম অ্যাপ্লায়েন্স", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=120&auto=format&fit=crop&q=80" },
                  { id: "gadgets", label: "Power banks", labelBn: "পাওয়ার ব্যাংক", image: "https://images.unsplash.com/photo-1609592424085-f5db66899775?w=120&auto=format&fit=crop&q=80" },
                  { id: "watches", label: "Smart Watches", labelBn: "স্মার্টওয়াচ", image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=120&auto=format&fit=crop&q=80" },
                  { id: "all", label: "All Items", labelBn: "সব ক্যাটালগ", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=80" },
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setSelectedCategory(item.id);
                      setSearchQuery("");
                    }}
                    className={`bg-white border rounded-xl p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer shadow-sm hover:shadow-md hover:border-orange-400 transform hover:-translate-y-0.5 transition duration-200 ${
                      selectedCategory === item.id ? 'border-orange-500 bg-orange-50/20 shadow-inner' : 'border-zinc-200'
                    }`}
                  >
                    <div className="h-14 w-14 rounded-full overflow-hidden border border-zinc-200 flex items-center justify-center p-1 bg-zinc-50 group-hover:scale-105 transition-transform">
                      <img src={item.image} className="w-full h-full object-cover rounded-full" alt={item.label} referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-xs font-bold text-zinc-800 leading-none block">
                      {language === 'bn' ? item.labelBn : item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Horizontal Service Trust Badges */}
            <div className="bg-white border border-zinc-200 rounded-xl py-5 px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 shadow-sm">
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600"><Truck size={18} className="stroke-[2.5px]" /></div>
                <div className="leading-none text-left">
                  <span className="block text-[11px] font-black text-zinc-800 uppercase tracking-widest">{language === 'bn' ? 'দ্রুত ডেলিভারি' : 'FAST DELIVERY'}</span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">{language === 'bn' ? 'সারাদেশে ৭২ ঘণ্টায়' : '72 Hours Nationwide'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 rounded-lg bg-blue-105 bg-blue-100 text-blue-600"><Lock size={18} className="stroke-[2.5px]" /></div>
                <div className="leading-none text-left">
                  <span className="block text-[11px] font-black text-zinc-800 uppercase tracking-widest">{language === 'bn' ? 'নিরাপদ পেমেন্ট' : 'SECURE CHECKOUT'}</span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">{language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery etc'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600"><RotateCcw size={18} className="stroke-[2.5px]" /></div>
                <div className="leading-none text-left">
                  <span className="block text-[11px] font-black text-zinc-800 uppercase tracking-widest">{language === 'bn' ? '৭ দিনের রিটার্ন' : '7 DAYS RETURNS'}</span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">{language === 'bn' ? 'সহজ ফ্রী পলিসি' : 'No questions refund'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600"><CheckCircle size={18} className="stroke-[2.5px]" /></div>
                <div className="leading-none text-left">
                  <span className="block text-[11px] font-black text-zinc-800 uppercase tracking-widest">{language === 'bn' ? '১০০% আসল পণ্য' : 'AUTHENTIC ITEM'}</span>
                  <span className="text-[10px] text-zinc-505 text-zinc-500 font-medium block mt-0.5">{language === 'bn' ? 'সরাসরি ডিস্ট্রিবিউটর' : 'Verified distributors'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600"><Clock size={18} className="stroke-[2.5px]" /></div>
                <div className="leading-none text-left">
                  <span className="block text-[11px] font-black text-zinc-800 uppercase tracking-widest">{language === 'bn' ? '২৪/৭ কাস্টমার কেয়ার' : 'ACTIVE CARE'}</span>
                  <span className="text-[10px] text-zinc-500 font-bold block mt-0.5 font-mono">+8801784905075</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 rounded-lg bg-rose-100 text-rose-650 text-rose-600"><SlidersHorizontal size={18} className="stroke-[2.5px]" /></div>
                <div className="leading-none text-left">
                  <span className="block text-[11px] font-black text-zinc-800 uppercase tracking-widest">{language === 'bn' ? 'স্মার্ট গ্যাজেট' : 'SMART GADGETS'}</span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">{language === 'bn' ? 'সেরা মানের নিশ্চয়তা' : 'Best Quality Guaranteed'}</span>
                </div>
              </div>
            </div>

                        {/* Catalog Grid Row wrapper */}
            <div id="product-catalog-anchor" className="scroll-mt-24" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="catalog-main-row">
              {/* Left Column Filters */}
              {!isHomePage && (
                <div className="lg:col-span-1 space-y-6 flex flex-col" id="catalog-sidebar-col">
                {/* 1. Brands Search-enabled lists from first screenshot (now placed at top) */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4" id="sidebar-brands-card">
                  {activeBrand ? (
                    <div className="space-y-4 select-none">
                      {/* Filter sub-section representing Image 2 */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase text-zinc-800 tracking-wider pb-1.5 border-b border-zinc-100 font-sans">
                          {language === 'bn' ? 'ফিল্টার' : 'Filter'}
                        </h4>
                        <div className="relative">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs font-extrabold text-zinc-700 bg-white border border-zinc-200 rounded-lg outline-none focus:border-orange-500 cursor-pointer appearance-none shadow-3xs"
                          >
                            <option value="default">{language === 'bn' ? 'বাছাই করুন' : 'Choose'}</option>
                            <option value="bestSelling">{language === 'bn' ? 'বেস্ট সেলিং প্রোডাক্টস' : 'Best Selling Products'}</option>
                            <option value="topRated">{language === 'bn' ? 'সর্বোচ্চ রেটেড' : 'Top rated'}</option>
                            <option value="mostFavorite">{language === 'bn' ? 'সবচেয়ে পছন্দসই' : 'Most favorite'}</option>
                            <option value="featured">{language === 'bn' ? 'ফিচার্ড ডিল' : 'Featured deal'}</option>
                          </select>
                          <div className="absolute inset-y-0 right-3.5 pointer-events-none flex items-center">
                            <ChevronDown size={14} className="text-zinc-500" />
                          </div>
                        </div>
                      </div>

                      {/* Price sub-section representing Image 2 */}
                      <div className="space-y-2 pt-1">
                        <h4 className="text-xs font-black uppercase text-zinc-800 tracking-wider pb-1.5 border-b border-zinc-100 font-sans">
                          {language === 'bn' ? 'প্রাইস' : 'Price'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            placeholder="0"
                            value={inputMinPrice}
                            onChange={(e) => setInputMinPrice(e.target.value)}
                            className="w-full text-center bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-1.5 text-xs font-bold font-mono text-zinc-800 focus:outline-none focus:border-orange-500 hover:bg-white transition"
                          />
                          <span className="text-zinc-400 text-xs font-bold font-sans">To</span>
                          <input
                            type="number"
                            placeholder="100"
                            value={inputMaxPrice}
                            onChange={(e) => setInputMaxPrice(e.target.value)}
                            className="w-full text-center bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-1.5 text-xs font-bold font-mono text-zinc-850 focus:outline-none focus:border-orange-500 hover:bg-white transition"
                          />
                          <button
                            onClick={handleApplyPriceFilter}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-8 w-8 rounded-lg select-none cursor-pointer border-0 shrink-0 transition flex items-center justify-center shadow-3xs active:scale-95"
                            title="Apply price filter"
                          >
                            <ChevronRight size={12} className="stroke-[3.5px]" />
                          </button>
                        </div>
                      </div>

                      {/* Brands sub-section representing Image 2 */}
                      <div className="space-y-2 pt-1 border-t border-zinc-100/50 mt-2">
                        <h4 className="text-xs font-black uppercase text-zinc-800 tracking-wider pb-1.5 border-b border-zinc-100 font-sans">
                          {language === 'bn' ? 'ব্র্যান্ডসমূহ' : 'Brands'}
                        </h4>
                        {/* Brand search box */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={language === 'bn' ? 'ব্র্যান্ড খুঁজুন...' : 'Search by brands'}
                            value={brandSearchText}
                            onChange={(e) => setBrandSearchText(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-orange-500 focus:bg-white font-bold"
                          />
                          <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-400" />
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin divide-y divide-zinc-50">
                          {displayBrandSidebarList.map((brand) => {
                            const isSelected = searchQuery.toLowerCase() === brand.name.toLowerCase() || searchQuery.toLowerCase() === brand.nameBn.toLowerCase();
                            return (
                              <button
                                key={brand.name}
                                onClick={() => {
                                  setSearchQuery(brand.name);
                                  setSelectedCategory("all");
                                  handleScrollToCatalog();
                                }}
                                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-bold flex justify-between items-center transition border-0 bg-transparent cursor-pointer ${
                                  isSelected 
                                    ? "bg-orange-50 text-orange-600 font-extrabold" 
                                    : "text-zinc-600 hover:bg-zinc-50 hover:text-orange-500"
                                }`}
                              >
                                <span className="font-sans leading-none">{language === 'bn' ? brand.nameBn : brand.name}</span>
                                <span className={`text-[10px] font-bold font-mono leading-none ${isSelected ? 'text-orange-500' : 'text-zinc-400'}`}>
                                  ({brand.count})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xs font-black uppercase text-zinc-800 tracking-wider pb-2 border-b border-zinc-100 font-sans">{language === 'bn' ? 'ব্র্যান্ডসমূহ' : 'Brands'}</h4>
                      
                      {/* Brand search box */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={language === 'bn' ? 'ব্র্যান্ড খুঁজুন...' : 'Search by brands'}
                          value={brandSearchText}
                          onChange={(e) => setBrandSearchText(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-orange-500 focus:bg-white font-bold"
                        />
                        <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-400" />
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin divide-y divide-zinc-50">
                        {displayBrandSidebarList.map((brand) => {
                          const isSelected = searchQuery.toLowerCase() === brand.name.toLowerCase() || searchQuery.toLowerCase() === brand.nameBn.toLowerCase();
                          return (
                            <button
                              key={brand.name}
                              onClick={() => {
                                setSearchQuery(brand.name);
                                setSelectedCategory("all");
                                handleScrollToCatalog();
                              }}
                              className={`w-full text-left py-2 px-2 rounded-lg text-xs font-bold flex justify-between items-center transition border-0 bg-transparent cursor-pointer ${
                                isSelected 
                                  ? "bg-orange-50 text-orange-600 font-extrabold" 
                                  : "text-zinc-600 hover:bg-zinc-50 hover:text-orange-500"
                              }`}
                            >
                              <span className="font-sans leading-none">{language === 'bn' ? brand.nameBn : brand.name}</span>
                              <span className={`text-[10px] font-bold font-mono leading-none ${isSelected ? 'text-orange-500' : 'text-zinc-400'}`}>
                                ({brand.count})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Interactive Accordion Categories list (now placed at second position matching the exact screenshot) */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative flex-grow" id="sidebar-categories-accordion-card">
                  <div className="py-3 bg-white text-center border-b border-zinc-150">
                    <h3 className="text-[13px] font-black uppercase text-zinc-800 tracking-wider font-sans">
                      {language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-zinc-150 flex flex-col">
                    {[
                      { id: "tshirt", name: "T-Shirt", filterQuery: "T-Shirt", icon: "👕" },
                      { id: "laptop", name: "Laptop & Notebooks", filterQuery: "Laptop", icon: "💻" },
                      { id: "appliances", name: "Home Appliance", filterQuery: "Appliance", icon: "🔌" },
                      { id: "powerbank", name: "Redmi Powerbank 10k", filterQuery: "Powerbank", icon: "🔋" },
                      { id: "sony", name: "Sony 10 Mark IV", filterQuery: "Sony", icon: "🎧" },
                      { id: "iphone1", name: "Iphone X 256gb", filterQuery: "Iphone", icon: "📱" },
                      { id: "iphone2", name: "iphone X 256gb 88616405", filterQuery: "iphone X", icon: "📱" },
                      { id: "samsung", name: "Samsung Z fold 4 5g 12/256gb", filterQuery: "Samsung", icon: "📱" },
                      { id: "colmi", name: "Colmi Smart Watch P71", filterQuery: "Colmi", icon: "⌚" },
                      { id: "pc", name: "Desktop PC", filterQuery: "PC", icon: "🖥️" },
                      { id: "dt", name: "DT no 1", filterQuery: "DT", icon: "⌚" },
                      { id: "realme", name: "Realme Watch 2", filterQuery: "Realme", icon: "⌚" },
                      { id: "zeblaze", name: "Zeblaze Beyond 3 Pro", filterQuery: "Zeblaze", icon: "⌚" }
                    ].map((cat) => {
                      const hasChildren = !!sidebarExtraData[cat.id]?.subcategories?.length;
                      const isExpanded = !!expandedCategories[cat.id];
                      const isSelected = selectedCategory === cat.id || searchQuery.toLowerCase() === cat.filterQuery.toLowerCase();
                      
                      return (
                        <div key={cat.id} className="flex flex-col bg-white">
                          
                          {/* Level 1 Category Row */}
                          <div
                            onClick={() => {
                              if (hasChildren) {
                                setExpandedCategories(prev => ({ ...prev, [cat.id]: !prev[cat.id] }));
                              } else {
                                setSelectedCategory("all");
                                setSearchQuery(cat.filterQuery);
                                handleScrollToCatalog();
                              }
                            }}
                            className={`w-full text-left px-5 py-[11px] text-[12.5px] font-bold transition duration-150 flex items-center justify-between cursor-pointer border-0 ${
                              isSelected || isExpanded
                                ? "bg-orange-50/50 text-orange-600 font-extrabold" 
                                : "text-zinc-700 bg-white hover:bg-zinc-50 hover:text-orange-500"
                            }`}
                          >
                            <div className="flex items-center space-x-3.5">
                              <span className="text-[14px] leading-none select-none">{cat.icon}</span>
                              <span className="font-semibold">{cat.name}</span>
                            </div>
                            
                            {hasChildren ? (
                              isExpanded ? (
                                <ChevronDown size={14} className="text-[#f58220] stroke-[2.5]" />
                              ) : (
                                <ChevronRight size={14} className="text-[#f58220] stroke-[2.5]" />
                              )
                            ) : (
                              <span className="w-3"></span>
                            )}
                          </div>

                          {/* Level 2 Subcategories Inline List (Indented slightly and styled beautifully) */}
                          {hasChildren && isExpanded && (
                            <div className="bg-zinc-50/40 pl-2.5 divide-y divide-zinc-150 border-t border-zinc-150/50 animate-in fade-in duration-200">
                              {sidebarExtraData[cat.id].subcategories.map((sub) => {
                                const isSubExpanded = !!expandedSubcategories[sub.id];
                                const hasSubBrands = sub.brands && sub.brands.length > 0;
                                const isSubActive = searchQuery.toLowerCase() === sub.name.toLowerCase();

                                return (
                                  <div key={sub.id} className="flex flex-col">
                                    
                                    {/* Level 2 Subcategory list row */}
                                    <div
                                      onClick={() => {
                                        if (hasSubBrands) {
                                          setExpandedSubcategories(prev => ({ ...prev, [sub.id]: !prev[sub.id] }));
                                        } else {
                                          setSelectedCategory("all");
                                          setSearchQuery(sub.name);
                                          handleScrollToCatalog();
                                        }
                                      }}
                                      className={`w-full text-left px-4 py-[11px] text-[12px] font-bold transition duration-150 flex items-center justify-between cursor-pointer border-0 ${
                                        isSubActive || isSubExpanded
                                          ? "text-orange-600 font-extrabold" 
                                          : "text-zinc-650 hover:text-[#f58220]"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2.5">
                                        <span className="text-[13px] leading-none select-none text-zinc-450">{sub.icon}</span>
                                        <span className="font-semibold">{sub.name}</span>
                                      </div>
                                      
                                      {hasSubBrands ? (
                                        isSubExpanded ? (
                                          <ChevronDown size={13} className="text-zinc-500 stroke-[2]" />
                                        ) : (
                                          <ChevronRight size={13} className="text-zinc-400 stroke-[2]" />
                                        )
                                      ) : null}
                                    </div>

                                    {/* Level 3 Brands/Items Inline List (Piped nested items separated by borders exactly matching physical image layout) */}
                                    {hasSubBrands && isSubExpanded && (
                                      <div className="bg-white border-l border-zinc-200/80 divide-y divide-zinc-100/70 flex flex-col animate-in fade-in duration-200">
                                        {sub.brands.map((brand) => {
                                          const isBrandActive = searchQuery.toLowerCase() === brand.toLowerCase();
                                          return (
                                            <button
                                              key={brand}
                                              type="button"
                                              onClick={() => {
                                                setSelectedCategory("all");
                                                setSearchQuery(brand);
                                                handleScrollToCatalog();
                                              }}
                                              className={`w-full text-left px-6 py-2.5 text-[12px] transition duration-150 border-0 bg-white font-medium cursor-pointer ${
                                                isBrandActive 
                                                  ? "text-orange-600 font-bold bg-orange-50/30" 
                                                  : "text-zinc-6 \t text-zinc-650 hover:bg-zinc-50 hover:text-[#f58220]"
                                              }`}
                                            >
                                              {brand}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price card is now neatly integrated into the main card when a brand is active */}
                {/* Close Left Sidebar Column */}
              </div>
              )}

              {/* RIGHT GRID COLUMN */}
              <div className={`${isHomePage ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`} id="catalog-products-col">
                
                {/* Brand Products Header Page title matching Image 2 layout exactly */}
                {activeBrand && (
                  <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left mb-6">
                    <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900 tracking-tight font-sans">
                      {language === 'bn' ? `Brand Products (${activeBrand.nameBn || activeBrand.name})` : `Brand Products (${activeBrand.name})`}
                    </h2>
                    <p className="text-xs font-black text-[#f58220] tracking-tight uppercase mt-1">
                      {language === 'bn' ? `${filteredProductsPriceRange.length} Items found` : `${filteredProductsPriceRange.length} Items found`}
                    </p>
                  </div>
                )}

                {/* Active Tag Indicators row */}
                {(searchQuery || selectedCategory !== "all" || activeMinPrice > 0 || activeMaxPrice < 999999) && (
                  <div className="flex flex-wrap items-center gap-2 pb-1 bg-white border border-zinc-150 p-3 rounded-xl shadow-3xs">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{language === 'bn' ? 'অ্যাক্টিভ ফিল্টার:' : 'Active Filters:'}</span>
                    {searchQuery && (
                      <div className="bg-orange-50 border border-orange-200 text-orange-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center space-x-1.5 font-sans">
                        <span>{searchQuery}</span>
                        <button onClick={() => setSearchQuery("")} className="hover:text-red-500 font-bold bg-transparent border-0 p-0 hover:bg-transparent ml-1 cursor-pointer">✕</button>
                      </div>
                    )}
                    {selectedCategory !== "all" && (
                      <div className="bg-purple-50 border border-purple-200 text-purple-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center space-x-1.5 font-sans">
                        <span>{selectedCategory.toUpperCase()}</span>
                        <button onClick={() => setSelectedCategory("all")} className="hover:text-red-500 font-bold bg-transparent border-0 p-0 hover:bg-transparent ml-1 cursor-pointer">✕</button>
                      </div>
                    )}
                    {(activeMinPrice > 0 || activeMaxPrice < 999999) && (
                      <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center space-x-1.5 font-sans">
                        <span>৳{activeMinPrice} - ৳{activeMaxPrice}</span>
                        <button onClick={() => { setInputMinPrice(""); setInputMaxPrice(""); setActiveMinPrice(0); setActiveMaxPrice(999999); }} className="hover:text-red-500 font-bold bg-transparent border-0 p-0 hover:bg-transparent ml-1 cursor-pointer">✕</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Grid of Results */}
                {filteredProductsPriceRange.length === 0 ? (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="text-center py-12 bg-white border border-dashed border-zinc-300 rounded-2xl p-6 shadow-sm">
                      <p className="text-zinc-500 text-sm font-semibold">{langText.noProducts}</p>
                      <button 
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                          setBrandSearchText("");
                          setInputMinPrice("");
                          setInputMaxPrice("");
                          setActiveMinPrice(0);
                          setActiveMaxPrice(999999);
                        }}
                        className="mt-4 px-4.5 py-2 bg-[#f58220] text-black font-extrabold text-xs rounded-lg hover:opacity-90 select-none cursor-pointer border-0 shadow-sm transition"
                      >
                        {language === 'bn' ? 'নতুন করে খুঁজুন' : 'Reset filters'}
                      </button>
                    </div>

                    {/* Populating other products below to fill empty spaces */}
                    <div className="text-left bg-zinc-50/50 p-5 rounded-2xl border border-dashed border-zinc-200 select-none">
                      <div className="mb-4">
                        <h4 className="text-zinc-900 text-xs sm:text-sm font-black uppercase tracking-wide flex items-center space-x-1">
                          <span className="inline-block h-4 w-1.5 bg-[#f58220] mr-1.5" />
                          <span>{language === 'bn' ? 'অন্যান্য আকর্ষণীয় ক্যাটাগরির পণ্যসমূহ' : 'POPULAR PRODUCTS FROM OTHER CATEGORIES'}</span>
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-semibold leading-none mt-1">
                          {language === 'bn' ? 'পোর্টালে কোনো খালি জায়গা না রেখে সয়ংক্রিয়ভাবে আকর্ষণীয় পণ্য দিয়ে ডিসপ্লে পূর্ণ রাখা হয়েছে।' : 'Automatically populating potential empty white card zones with premium product representations.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {products.map((p) => (
                          <ProductCard
                            key={`empty-fill-${p.id}`}
                            product={p}
                            currency={currency}
                            language={language}
                            onSelectProduct={(prod) => setSelectedProduct(prod)}
                            onAddToCart={(prod) => handleAddToCart(prod, 1)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedCategory !== "all" ? (
                      <ProductShelf
                        title={
                          selectedCategory === "tshirt" ? (language === 'bn' ? 'টি-শার্ট ও কেসিং এক্সেসরিজ' : 'T-SHIRT & HARDWARE') :
                          selectedCategory === "laptop" ? (language === 'bn' ? 'ল্যাপটপ ও আইটি ডিভাইস মডিউল' : 'LAPTOP & BUSINESS NOTEBOOKS') :
                          selectedCategory === "watches" ? (language === 'bn' ? 'স্মার্টওয়াচ কালেকশন' : 'SMART WATCHES COLLECTION') :
                          selectedCategory === "gadgets" ? (language === 'bn' ? 'পাওয়ার ব্যাংক ও স্মার্ট গ্যাজেট' : 'POWER BANKS & GADGETS') :
                          selectedCategory === "appliances" ? (language === 'bn' ? 'হোম অ্যাপ্লায়েন্স ও টেকনিক্যাল ডিভাইস' : 'HOME APPLIANCES & TECH') :
                          (language === 'bn' ? 'ফিল্টারড প্রোডাক্টস' : 'Filtered Products')
                        }
                        onViewAll={() => {}}
                        products={filteredProductsPriceRange}
                        currency={currency}
                        language={language}
                        onSelectProduct={(prod) => setSelectedProduct(prod)}
                        onAddToCart={(prod) => handleAddToCart(prod, 1)}
                      />
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredProductsPriceRange.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            currency={currency}
                            language={language}
                            onSelectProduct={(prod) => setSelectedProduct(prod)}
                            onAddToCart={(prod) => handleAddToCart(prod, 1)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Dynamic layout filler module (fills open gaps with beautiful images) */}
                    {filteredProductsPriceRange.length < 12 && (
                      <div className="mt-8 pt-6 border-t border-zinc-200 text-left bg-zinc-50/50 p-5 rounded-2xl border border-dashed border-zinc-200 select-none">
                        <div className="mb-4">
                          <h4 className="text-zinc-900 text-xs sm:text-sm font-black uppercase tracking-wide flex items-center space-x-1">
                            <span className="inline-block h-4 w-1.5 bg-[#f58220] mr-1.5" />
                            <span>{language === 'bn' ? 'অন্যান্য আকর্ষণীয় পণ্যসমূহ (পাতা পূর্ণ করার জন্য সাজেস্টিড)' : 'SUGGESTED POPULAR PRODUCTS (FILLING EMPTY SPACES)'}</span>
                          </h4>
                          <p className="text-[10px] text-zinc-400 font-semibold leading-none mt-1">
                            {language === 'bn' ? 'পোর্টালে কোনো খালি জায়গা না রেখে সয়ংক্রিয়ভাবে আকর্ষণীয় পণ্য দিয়ে ডিসপ্লে পূর্ণ রাখা হয়েছে।' : 'Automatically populating potential empty white card zones with premium product representations.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fadeIn">
                          {products
                            .filter(p => !filteredProductsPriceRange.some(fp => fp.id === p.id))
                            .slice(0, 12 - filteredProductsPriceRange.length + 6)
                            .map((p) => (
                              <ProductCard
                                key={`fill-${p.id}`}
                                product={p}
                                currency={currency}
                                language={language}
                                onSelectProduct={(prod) => setSelectedProduct(prod)}
                                onAddToCart={(prod) => handleAddToCart(prod, 1)}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>

            {/* 7. Beautiful Category Specific Shelf Row Modules with Auto-sliding */}
            {selectedCategory === "all" && (
              <div className="space-y-6 pt-4">
                <ProductShelf
                  title={language === 'bn' ? 'স্মার্টওয়াচ কালেকশন' : 'SMART WATCHES COLLECTION'}
                  onViewAll={() => setSelectedCategory("watches")}
                  products={products.filter(p => p.category === 'watches')}
                  currency={currency}
                  language={language}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                />

                <ProductShelf
                  title={language === 'bn' ? 'পাওয়ার ব্যাংক ও স্মার্ট গ্যাজেট' : 'POWER BANKS & GADGETS'}
                  onViewAll={() => setSelectedCategory("gadgets")}
                  products={products.filter(p => p.category === 'gadgets')}
                  currency={currency}
                  language={language}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                />

                <ProductShelf
                  title={language === 'bn' ? 'হোম অ্যাপ্লায়েন্স ও টেকনিক্যাল ডিভাইস' : 'HOME APPLIANCES & TECH'}
                  onViewAll={() => setSelectedCategory("appliances")}
                  products={products.filter(p => p.category === 'appliances')}
                  currency={currency}
                  language={language}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                />

                <ProductShelf
                  title={language === 'bn' ? 'টি-শার্ট ও কেসিং এক্সেসরিজ' : 'T-SHIRT & HARDWARE'}
                  onViewAll={() => setSelectedCategory("tshirt")}
                  products={products.filter(p => p.category === 'tshirt')}
                  currency={currency}
                  language={language}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                />

                <ProductShelf
                  title={language === 'bn' ? 'ল্যাপটপ ও আইটি ডিভাইস মডিউল' : 'LAPTOP & BUSINESS NOTEBOOKS'}
                  onViewAll={() => setSelectedCategory("laptop")}
                  products={products.filter(p => p.category === 'laptop')}
                  currency={currency}
                  language={language}
                  onSelectProduct={(prod) => setSelectedProduct(prod)}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                />
              </div>
            )}

            {/* 7.5 Interactive VIDEO and BLOG Sections */}
            {selectedCategory === "all" && (
              <div className="space-y-10 pt-6">
                
                {/* VIDEOS SECTION FRAME */}
                <div id="home-videos-section" className="text-left scroll-mt-6">
                  <div className="flex items-center justify-between mb-5 border-b border-zinc-100 pb-3">
                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-900 border-l-4 border-[#f58220] pl-3.5 flex items-center space-x-2">
                      <Youtube size={22} className="text-[#f58220] animate-pulse" />
                      <span>{language === 'bn' ? 'ভিডিও গ্যালারি ও খামার পরিচিতি' : 'VIDEO'}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-bold hidden sm:block">
                      {language === 'bn' ? 'রিভারাইন ফার্মসের প্রামাণ্য চিত্র' : 'Farming & Cattle Spotlights'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {HOME_VIDEOS.map((video, idx) => {
                      const isPlaying = activePlayingVideoId === video.id;
                      return (
                        <div 
                          key={video.id}
                          onClick={() => {
                            if (!isPlaying) {
                              setActivePlayingVideoId(video.id);
                            }
                          }}
                          className="group bg-white rounded-xl border border-zinc-200/80 p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
                        >
                          {/* Custom visual video player frame matching mockups */}
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black flex-shrink-0">
                            {isPlaying ? (
                              <iframe 
                                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`} 
                                title={video.title} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              ></iframe>
                            ) : (
                              <>
                                {/* Image Thumbnail */}
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>

                                {/* Top video player brand header overlay */}
                                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {/* circular avatar mockup */}
                                    <div className="h-7 w-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[9px] border border-white/80 shrink-0">
                                      RB
                                    </div>
                                    <div className="text-left leading-none font-sans max-w-[150px]">
                                      <h4 className="text-[11px] font-bold text-white truncate drop-shadow-md">
                                        {language === 'bn' ? video.titleBn : video.title}
                                      </h4>
                                      <span className="text-[9px] text-zinc-300 font-semibold drop-shadow-xs">
                                        {video.author}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Premium red YouTube play icon matching exact picture */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-[52px] h-[36px] bg-[#FF0000] rounded-[10px] flex items-center justify-center shadow-lg transition-transform duration-300 transform group-hover:scale-115 relative">
                                    {/* Triangle inner path */}
                                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                                  </div>
                                </div>

                                {/* Bottom controls / timeline progress indicators tailored to screenshots */}
                                {idx === 1 ? (
                                  /* Card 2 Specific controls overlay */
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-white">
                                    <span className="font-semibold text-zinc-300">0:03 / 0:28</span>
                                    {/* progress timeline */}
                                    <div className="flex-grow mx-3 h-1 bg-zinc-600 rounded-full relative overflow-hidden">
                                      <div className="absolute left-0 top-0 bottom-0 w-[15%] bg-[#FF0000]"></div>
                                    </div>
                                    <div className="flex items-center space-x-2.5 text-zinc-300">
                                      <Volume2 size={11} className="hover:text-white cursor-pointer" />
                                      <span className="border border-zinc-500 text-[8px] px-0.5 rounded-xs leading-none font-sans">CC</span>
                                      <Maximize2 size={10} className="hover:text-white cursor-pointer" />
                                    </div>
                                  </div>
                                ) : (
                                  /* Card 1 & 3 "Watch on Youtube" layout */
                                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                    <span className="text-[9.5px] text-white/90 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full font-bold font-mono">
                                      {video.length}
                                    </span>
                                    <div className="bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[9.5px] font-bold flex items-center space-x-1.5 transition">
                                      <Share2 size={10} />
                                      <span>{language === 'bn' ? 'ইউটিউবে দেখুন' : 'Watch on YouTube'}</span>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Text Header Card Body */}
                          <div className="mt-3 text-left">
                            <h4 className="text-xs sm:text-sm font-bold text-zinc-800 line-clamp-1 group-hover:text-[#f58220] transition duration-150">
                              {language === 'bn' ? video.titleBn : video.title}
                            </h4>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400 font-bold">
                              <span>{video.author}</span>
                              {isPlaying ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePlayingVideoId(null);
                                  }}
                                  className="flex items-center space-x-1 text-red-600 bg-red-50 hover:bg-red-100 border-0 px-2 py-1 rounded cursor-pointer font-bold transition"
                                >
                                  <span>{language === 'bn' ? 'বন্ধ করুন' : 'Close Video'}</span>
                                  <span>✕</span>
                                </button>
                              ) : (
                                <div className="flex items-center space-x-1 text-[#f58220] group-hover:underline">
                                  <span>{language === 'bn' ? 'প্লে করুন' : 'Watch Video'}</span>
                                  <Play size={8} className="fill-current" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BLOGS SECTION FRAME */}
                <div id="home-blogs-section" className="text-left scroll-mt-6">
                  <div className="flex items-center justify-between mb-5 border-b border-zinc-100 pb-3">
                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-900 border-l-4 border-[#f58220] pl-3.5 flex items-center space-x-2">
                      <BookOpen size={20} className="text-[#f58220]" />
                      <span>{language === 'bn' ? 'ব্লগ ও স্বাস্থ্য পরামর্শ' : 'BLOG'}</span>
                    </h3>
                    
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        window.dispatchEvent(new CustomEvent("app-toast", { 
                          detail: language === 'bn' ? 'ক্যাটালগ ব্রাউজ করুন' : 'Exploring our top catalogs' 
                        }));
                      }}
                      className="text-xs sm:text-sm font-extrabold text-[#f58220] hover:text-orange-600 transition flex items-center bg-transparent border-0 cursor-pointer group"
                    >
                      <span className="mr-1">{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
                      <ChevronRight size={14} className="stroke-[3] transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {HOME_BLOGS.map((blog) => (
                      <div 
                        key={blog.id}
                        onClick={() => setSelectedBlog(blog)}
                        className="group flex flex-col bg-white rounded-xl border border-zinc-200 shadow-3xs hover:shadow-sm overflow-hidden cursor-pointer transition-all duration-300"
                      >
                        {/* Blog graphic box wrapper mirroring fuchsia/amber/orange tiles in picture */}
                        <div className={`relative aspect-square w-full ${blog.bgColor} border-b border-zinc-100 p-2.5 flex flex-col justify-between overflow-hidden`}>
                          
                          {/* Inner preview card containing cow or milk bottle graphics details beautifully */}
                          <div className="h-full w-full rounded-lg overflow-hidden relative shadow-3xs">
                            <img 
                              src={blog.image} 
                              alt={blog.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 min-h-[40px] flex items-center justify-center">
                              <span className="text-[8px] sm:text-[9.5px] font-bold text-white text-center leading-tight line-clamp-2">
                                {language === 'bn' ? blog.titleBn : blog.title}
                              </span>
                            </div>
                          </div>

                          {/* Float visual category pill tag */}
                          <div className="absolute top-3.5 left-3.5">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${blog.tagColor} shadow-3xs`}>
                              {blog.tag}
                            </span>
                          </div>
                        </div>

                        {/* Title printed under image matching picture layout perfectly */}
                        <div className="p-3 text-center flex-grow flex flex-col justify-between bg-white">
                          <h4 className="text-[12.5px] font-black text-zinc-900 leading-tight line-clamp-1 group-hover:text-[#f58220] transition duration-150">
                            {blog.title}
                          </h4>
                          <span className="text-[9px] text-[#f58220] font-bold tracking-widest uppercase mt-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                            {language === 'bn' ? 'পড়ুন 📖' : 'Read Article 📖'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
            
            {/* Bottom mini banner of consultations */}
            <div className="p-6 sm:p-10 bg-gradient-to-tr from-zinc-900 to-[#5c1314] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-sm font-bold uppercase tracking-wide text-orange-400 flex items-center justify-center md:justify-start space-x-1.5">
                  <Sparkles size={14} className="text-orange-400" />
                  <span>Aura AI Assistant Guidance Engine</span>
                </h4>
                <p className="text-white text-base font-semibold">
                  {langText.anyQuestions}
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('ai-advisor')}
                className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 border border-orange-400 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-lg shadow-orange-500/10"
              >
                {langText.askAura}
              </button>
            </div>

          </div>
        )}

        {currentTab === 'ai-advisor' && (
          <AiAdvisorTab
            products={products}
            language={language}
            currency={currency}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
          />
        )}

        {currentTab === 'landing' && (
          <PromoLandingTab
            products={products}
            language={language}
            currency={currency}
            onPlaceOrder={(newOrder) => handleOrderSuccess(newOrder)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'orders' && (
          <UserProfilePanel
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            orders={orders}
            setOrders={setOrders}
            language={language}
            currency={currency}
            triggerToast={(msg) => {
              window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
            }}
            onBackToShop={() => setCurrentTab('shop')}
            setCurrentTab={setCurrentTab}
            products={products}
            setProducts={setProducts}
          />
        )}

        {currentTab === 'live-tracking' && (
          <LiveTrackingSystem
            orders={orders}
            language={language}
            currency={currency}
            onBackToShop={() => setCurrentTab('shop')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            language={language}
            currency={currency}
            activeTenant={activeTenant}
            setActiveTenant={setActiveTenant}
          />
        )}

        {(currentTab === 'signup' || currentTab === 'signin') && (
          <AuthTab
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            language={language}
            onLoginSuccess={(user) => setCurrentUser(user)}
            triggerToast={(msg) => {
              const event = new CustomEvent("app-toast", { detail: msg });
              window.dispatchEvent(event);
            }}
          />
        )}

      </main>

      {/* Footer copyright frame */}
      <footer className="bg-[#5c5d60] text-white pt-12 pb-8 mt-6" id="portal-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            
            <div className="md:col-span-4 flex flex-col space-y-4">
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
                  <a href="#store-google" className="h-8 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700/80 text-white rounded text-[10px] font-bold tracking-tight select-none border border-zinc-650 flex items-center space-x-1 text-left">
                    <span>📱 Google Play</span>
                  </a>
                  <a href="#store-apple" className="h-8 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700/80 text-white rounded text-[10px] font-bold tracking-tight select-none border border-zinc-650 flex items-center space-x-1 text-left">
                    <span>🍏 App Store</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col space-y-2">
              <h4 className="text-xs font-black text-[#f58220] tracking-widest uppercase mb-1.5">{language === 'bn' ? 'বিশেষ ক্যাটাগরি' : 'SPECIAL'}</h4>
              <button onClick={() => setCurrentTab('shop')} className="text-left text-[11px] font-semibold text-zinc-100 hover:text-orange-300 hover:underline bg-transparent border-0 cursor-pointer p-0">Shop Home</button>
              <button onClick={() => setCurrentTab('orders')} className="text-left text-[11px] font-semibold text-zinc-100 hover:text-orange-300 hover:underline bg-transparent border-0 cursor-pointer p-0">My Consignments</button>
              <button onClick={() => { setVendorTab('list'); setShowVendorModal(true); }} className="text-left text-[11px] font-semibold text-zinc-100 hover:text-orange-300 hover:underline bg-transparent border-0 cursor-pointer p-0">Vendor Directories</button>
              <button onClick={() => setCurrentTab('admin')} className="text-left text-[11px] font-semibold text-zinc-100 hover:text-orange-300 hover:underline bg-transparent border-0 cursor-pointer p-0">Admin Board</button>
            </div>

            <div className="md:col-span-3 flex flex-col space-y-2">
              <h4 className="text-xs font-black text-[#f58220] tracking-widest uppercase mb-1.5">{language === 'bn' ? 'একাউন্ট এবং শিপিং' : 'ACCOUNT & SHIPPING INFO'}</h4>
              {[
                "Profile Info", "Wish List", "Track Order", "Refund Policy", "Return Policy", "Cancellation Policy"
              ].map((link) => (
                <a key={link} href={`#${link}`} className="text-[11px] font-semibold text-zinc-100 hover:text-orange-300 hover:underline tracking-normal">{link}</a>
              ))}
            </div>

            <div className="md:col-span-3 flex flex-col space-y-4">
              <div>
                <h4 className="text-xs font-black text-[#f58220] tracking-widest uppercase mb-1.5">{language === 'bn' ? 'নিউজলেটার' : 'NEWSLETTER'}</h4>
                <p className="text-[10px] text-zinc-100 font-semibold tracking-wide">
                  Subscribe to our new channel to get latest updates
                </p>
                
                <div className="flex bg-white rounded-lg p-0.5 mt-2.5 max-w-full overflow-hidden border border-zinc-300">
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
                  <a href="#twitter" className="h-7 w-7 rounded-full bg-zinc-750 bg-zinc-700 hover:bg-blue-400 text-white flex items-center justify-center transition shadow-2xs text-[10px] border-0"><Twitter size={11} /></a>
                  <a href="#linkedin" className="h-7 w-7 rounded-full bg-zinc-750 bg-zinc-700 hover:bg-blue-600 text-white flex items-center justify-center transition shadow-2xs text-[10px] border-0"><Linkedin size={11} /></a>
                  <a href="#youtube" className="h-7 w-7 rounded-full bg-zinc-750 bg-zinc-700 hover:bg-red-650 text-white flex items-center justify-center transition shadow-2xs text-[10px] border-0"><Youtube size={11} /></a>
                  <a href="#facebook" className="h-7 w-7 rounded-full bg-zinc-750 bg-zinc-700 hover:bg-blue-800 text-white flex items-center justify-center transition shadow-2xs text-xs font-black text-center border-0">f</a>
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-zinc-500 pt-5 mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-zinc-100 text-left">
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

          <div className="border-t border-zinc-500/80 pt-4 flex flex-col md:flex-row justify-between text-[10px] text-zinc-300 select-none">
            <span className="text-left">Powered & Maintained by N.I.Biz Soft</span>
            <div className="flex space-x-3 gap-1.5 mt-2 md:mt-0 font-semibold">
              <a href="#terms" className="hover:underline hover:text-white">Terms & Conditions</a>
              <span>|</span>
              <a href="#privacy" className="hover:underline hover:text-white">Privacy Policy</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Chat / WhatsApp Bubble */}
      {activeTenant?.enableWhatsappFloat && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end selection-none">
          {showWhatsApp && (
            <div className="mb-3 w-80 bg-white rounded-xl border border-zinc-200 shadow-2xl overflow-hidden animate-slideUp font-sans">
              <div className="bg-brand text-white p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--brand-color)' }}>
                <div className="flex items-center space-x-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-ping"></div>
                  <div className="text-left leading-none">
                    <h4 className="text-xs font-black tracking-wide">
                      {language === 'bn' ? `${activeTenant?.shopNameBn || "নাবিক বাজার"} হেল্প ডেস্ক` : `${activeTenant?.shopName || "Nabik Bazar"} Help Desk`}
                    </h4>
                    <span className="text-[9px] text-opacity-80 text-white block mt-0.5">
                      {language === 'bn' ? 'সর্বদা আপনার সেবায় নিয়োজিত' : 'Always here to guide you'}
                    </span>
                  </div>
                </div>
                <button onClick={() => {
                  setShowWhatsApp(false);
                  setWhatsAppResponse(null);
                }} className="text-white hover:text-orange-100 text-sm font-bold font-mono bg-transparent border-0 cursor-pointer">X</button>
              </div>
              
              <div className="p-4 space-y-3 text-xs text-left max-h-60 overflow-y-auto">
                <p className="p-2.5 bg-zinc-100 rounded-lg text-zinc-700">
                  {language === 'bn' 
                    ? `${activeTenant?.shopNameBn || "নাবিক বাজার"} হেল্পডেস্কে আপনাকে স্বাগত! আমাদের হটলাইন নম্বর ${activeTenant?.phone || "+8801784905075"} এ সরাসরি কল করতে পারেন বা নিচের সাহায্য টপিক বেছে নিন।`
                    : `Welcome to ${activeTenant?.shopName || "Nabik Bazar"} Customer Care! Learn more with our instant quick answers or ring ${activeTenant?.phone || "+8801784905075"}.`}
                </p>

                {whatsAppResponse && (
                  <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg text-orange-950 font-medium">
                    {whatsAppResponse}
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  {[
                    { q: "পেমেন্ট প্রসেস কেমন?", a: `আমাদের আউটলেটে ক্যাশ অন ডেলিভারি (Cash on Delivery) পেমেন্ট সম্পূর্ণভাবে গ্রহণযোগ্য। এছাড়াও পেমেন্ট গেটওয়ের মাধ্যমে বিকাশ, রকেট বা কার্ড পেমেন্ট করতে পারেন।` },
                    { q: "ডেলিভারি চার্জ কত?", a: "ঢাকার অভ্যন্তরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে যেকোনো জেলায় ১৫০ টাকা মাত্র।" },
                    { q: "ভেন্ডর মার্চেন্ট সুযোগ?", a: "অভিজাত বিক্রেতারা যেকোনো সময় আমাদের পোর্টালে যুক্ত হয়ে পণ্য বিক্রি করতে পারেন।" }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setWhatsAppResponse(item.a)}
                      className="w-full text-left p-2 bg-zinc-55 bg-zinc-50 hover:bg-orange-50 border border-zinc-200 hover:border-orange-200 rounded text-[11px] text-zinc-650 hover:text-orange-600 transition cursor-pointer"
                    >
                      • {item.q}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-2 bg-zinc-50 border-t text-center text-[10px] text-zinc-400">
                Hotline Support: {activeTenant?.phone || "+8801784905075"} (WhatsAPP)
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setShowWhatsApp(!showWhatsApp);
              setWhatsAppResponse(null);
            }}
            className="p-3.5 text-white rounded-full shadow-2xl hover:scale-105 transition duration-200 cursor-pointer flex items-center space-x-2 border-0"
            id="whatsapp-bubble"
            style={{ backgroundColor: 'var(--brand-color)' }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 font-sans"></span>
            </span>
            <span className="text-xs font-black tracking-wider uppercase">{language === 'bn' ? 'সাহায্য ডেস্ক' : 'HELP DESK'}</span>
          </button>
        </div>
      )}

      {/* 9. Interactive Dynamic Multi-vendor Info Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border flex flex-col font-sans">
            
            <div className="bg-[#fd7e14] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Store size={22} className="stroke-[2.5px]" />
                <h3 className="font-extrabold tracking-wide uppercase text-sm">{language === 'bn' ? 'নাবিক মাল্টিভেন্ডর জোন' : 'Nabik Multivendor Suite'}</h3>
              </div>
              <button 
                onClick={() => {
                  setShowVendorModal(false);
                  setRegisteredMerchant(false);
                  setMerchantName("");
                }} 
                className="text-white hover:text-orange-100 text-sm font-bold font-mono bg-transparent border-0 cursor-pointer"
              >
                X
              </button>
            </div>

            {/* Modal headers toggler tabs */}
            <div className="flex border-b text-xs font-bold uppercase tracking-wider select-none">
              <button
                onClick={() => setVendorTab('list')}
                className={`flex-1 py-3 text-center transition border-0 cursor-pointer ${
                  vendorTab === 'list' ? 'border-b-4 border-orange-500 text-orange-600 bg-orange-50/10' : 'text-zinc-500 bg-white hover:bg-zinc-50'
                }`}
              >
                {language === 'bn' ? 'নিবন্ধিত ভেন্ডর তালিকা' : 'Registered Vendors'}
              </button>
              <button
                onClick={() => setVendorTab('register')}
                className={`flex-1 py-3 text-center transition border-0 cursor-pointer ${
                  vendorTab === 'register' ? 'border-b-4 border-orange-500 text-orange-600 bg-orange-50/10' : 'text-zinc-500 bg-white hover:bg-zinc-50'
                }`}
              >
                {language === 'bn' ? 'নতুন সেলার আবেদন' : 'Seller Registration'}
              </button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto text-xs sm:text-sm text-left">
              {vendorTab === 'list' ? (
                <div className="space-y-4">
                  <p className="text-zinc-500 leading-relaxed">
                    {language === 'bn' 
                      ? "নাবিক বাজার মাল্টিভেন্ডর প্লাটফর্মে বর্তমানে ৪টি অত্যন্ত বিশ্বস্ত মার্চেন্ট প্রতিষ্ঠান রেজিস্টার্ড রয়েছে। যেকোনো বিক্রেতার ক্যাটাগরি ফিল্টার করতে নামের পাশে ক্লিক করুন।"
                      : "We currently host 4 elite verified merchant outlets around Bangladesh. Click on a vendor to load their inventories."}
                  </p>

                  <div className="space-y-2.5">
                    {[
                      { name: "NABIK IT WORLD", loc: "Dhanmondi, Dhaka", phone: "01784905075", category: "laptop", rating: 4.9 },
                      { name: "Bengal Smart Accessories", loc: "Chawkbazar, Dhaka", phone: "01822394011", category: "gadgets", rating: 4.7 },
                      { name: "Gazipur Home Appliance Tech", loc: "Gazipur Chowrasta", phone: "01991405011", category: "appliances", rating: 4.5 },
                      { name: "Dhaka Wear House", loc: "Sector 4, Uttara", phone: "01662551022", category: "tshirt", rating: 4.8 }
                    ].map((v) => (
                      <div key={v.name} className="border border-zinc-200 rounded-lg p-3.5 hover:border-orange-300 hover:bg-orange-50/10 transition flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-zinc-900">{v.name}</h4>
                          <p className="text-[11px] text-zinc-500">{v.loc} • Hotline: {v.phone}</p>
                          <span className="inline-block bg-zinc-100 text-[10px] text-zinc-650 px-2 py-0.5 rounded mt-1 font-semibold uppercase">{v.category}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCategory(v.category);
                            setShowVendorModal(false);
                            setCurrentTab('shop');
                          }}
                          className="bg-orange-500 hover:bg-orange-605 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded cursor-pointer border-0"
                        >
                          {language === 'bn' ? 'স্টোরে যান' : 'Go Store'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {registeredMerchant ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={30} />
                      </div>
                      <h4 className="text-sm font-black text-zinc-900">{language === 'bn' ? 'আবেদনটি সফলভাবে জমা হয়েছে!' : 'Application Submitted Successfully!'}</h4>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        {language === 'bn' 
                          ? `ধন্যবাদ, '${merchantName}'। নাবিক বাজার বিক্রেতা রিভিউ টিম শীঘ্রই আপনার প্রদত্ত নম্বরে যোগাযোগ করে স্টোরটি সক্রিয় করে দিবে।`
                          : `Thank you, '${merchantName}'. Our Review Team will call your phone soon to verify and activate.`}
                      </p>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (merchantName.trim() === '') return;
                        setRegisteredMerchant(true);
                      }} 
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">{language === 'bn' ? 'দোকান / ব্র্যান্ডের নাম' : 'Store / Outlet Name'} *</label>
                        <input 
                          type="text" 
                          required
                          value={merchantName}
                          onChange={(e) => setMerchantName(e.target.value)}
                          placeholder="e.g. Nabik IT World" 
                          className="w-full border border-zinc-200 px-3 py-2 rounded focus:outline-none focus:border-orange-500 text-xs text-zinc-800 bg-white" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">{language === 'bn' ? 'মালিকের নাম' : 'Owner Name'}</label>
                          <input type="text" required placeholder="e.g. Shafiul Islam" className="w-full border border-zinc-200 px-3 py-2 rounded focus:outline-none focus:border-orange-500 text-xs text-zinc-855 bg-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">{language === 'bn' ? 'যোগাযোগ নম্বর' : 'Phone Number'} *</label>
                          <input type="tel" required placeholder="e.g. 017XXXXXXXX" className="w-full border border-zinc-200 px-3 py-2 rounded focus:outline-none focus:border-orange-500 text-xs text-zinc-855 bg-white" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">{language === 'bn' ? 'পণ্য বিভাগ' : 'Product Category'} *</label>
                        <select className="w-full border border-zinc-200 px-3 py-2 rounded focus:outline-none focus:border-orange-500 text-xs text-zinc-850 bg-white">
                          <option value="tshirt">T-Shirt & Accessories (পোশাক ও যন্ত্রাংশ)</option>
                          <option value="laptop">Laptops & Computers (কম্পিউটার ও ল্যাপটপ)</option>
                          <option value="appliances">Home appliance (গৃহস্থালী সরঞ্জাম)</option>
                          <option value="watches">Smart wearable watches (ঘড়ি ও ট্র্যাকার)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">{language === 'bn' ? 'ব্যবসার ঠিকানা / শপ লোকেশন' : 'Business Outlet Address'} *</label>
                        <textarea required placeholder="e.g. Multiplan Center Level 4, Dhaka" className="w-full border border-zinc-200 px-3 py-2 rounded focus:outline-none focus:border-orange-500 text-xs text-zinc-855 bg-white h-16"></textarea>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wider text-xs py-3 rounded-lg shadow-md transition border-0 cursor-pointer"
                      >
                        {language === 'bn' ? 'আবেদন ফর্ম সাবমিট করুন' : 'Submit Registration Application'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="bg-zinc-50 p-4 border-t text-[10px] text-zinc-550 flex justify-between items-center text-zinc-500 selection-none font-bold">
              <span>Trusted Multi-vendor Network</span>
              <span>© ২০২৬ নাবিক বাজার পোর্টাল</span>
            </div>

          </div>
        </div>
      )}

      {/* Cart drawer overlay panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        currency={currency}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setIsCartOpen(false);
          handleOpenCheckout();
        }}
        langText={langText}
      />

      {/* Product Information Detail modal overlay */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        currency={currency}
        language={language}
        onAddToCart={(prod, qty) => {
          handleAddToCart(prod, qty);
          setSelectedProduct(null);
        }}
        onBuyNow={(prod, qty) => {
          handleAddToCart(prod, qty);
          setSelectedProduct(null);
          handleOpenCheckout([{ product: prod, quantity: qty }]);
        }}
        langText={langText}
      />

      {/* Custom checkout shipping modal overlay */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        currency={currency}
        language={language}
        onOrderSuccess={handleOrderSuccess}
        langText={langText}
        currentUser={currentUser}
      />

      {/* Animated Order Success Modal Takeover/Overlay */}
      <OrderSuccessModal
        isOpen={placedOrderReceipt !== null}
        order={placedOrderReceipt}
        onClose={() => setPlacedOrderReceipt(null)}
        language={language}
        currency={currency}
      />

      {/* 9. Premium Blog Post Viewer Modal */}
      {selectedBlog && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200"
          onClick={() => setSelectedBlog(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-zinc-100 text-left font-sans animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 text-zinc-500 bg-white/90 hover:bg-zinc-100 rounded-full h-8 w-8 flex items-center justify-center border-0 cursor-pointer shadow-md z-50 font-bold transition text-xs font-sans"
            >
              ✕
            </button>
            <div className="relative h-56 sm:h-64 w-full flex-shrink-0">
              <img 
                src={selectedBlog.image} 
                alt={selectedBlog.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                <div>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${selectedBlog.tagColor} shadow-sm`}>
                    {selectedBlog.tag}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white mt-1.5 leading-tight antialiased">
                    {language === 'bn' ? selectedBlog.titleBn : selectedBlog.title}
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-zinc-700 leading-relaxed text-sm">
              <p className="text-xs text-zinc-400 font-semibold flex items-center space-x-1 mt-0">
                <Clock size={12} />
                <span>Published: May 31, 2026</span>
                <span className="mx-1">•</span>
                <span>By Riverine Farms Team</span>
              </p>
              <div className="border-l-4 border-orange-500 pl-4 py-1.5 italic text-zinc-600 font-medium bg-orange-50/50 rounded-r-md">
                {selectedBlog.summary}
              </div>
              <div className="whitespace-pre-wrap font-medium text-zinc-800 pt-2 space-y-3 antialiased">
                {selectedBlog.content}
              </div>
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 mt-6 text-xs text-zinc-500 space-y-1">
                <p className="font-bold text-zinc-700">Health & Quality Note:</p>
                <p>All livestock at Riverine Farms are nurtured on rich green pastures, with strict withdrawal protocols for standard veterinary inputs. Enjoy 100% natural and safe farm fresh dairy items.</p>
              </div>
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end flex-shrink-0">
              <button 
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="px-5 py-2.5 bg-zinc-850 hover:bg-zinc-950 border-0 text-white font-bold rounded-xl text-xs uppercase cursor-pointer transition shadow-md"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Reseller White-labeled Config and Mock Presets System */}
      {isResellerFeatureUnlocked() && (
        <ResellerConfigPanel
          activeTenant={activeTenant}
          setActiveTenant={setActiveTenant}
          language={language}
          triggerToast={(msg) => {
            const event = new CustomEvent("app-toast", { detail: msg });
            window.dispatchEvent(event);
          }}
        />
      )}

    </div>
  );
}
