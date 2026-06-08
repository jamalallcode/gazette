import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Order, Category, CartItem } from "../types";
import POSManager from "./POSManager";
import SmsNotificationSystem from "./SmsNotificationSystem";
import FraudProtectionSystem from "./FraudProtectionSystem";
import ModernInvoiceModal from "./ModernInvoiceModal";
import BanglaCourierSystem from "./BanglaCourierSystem";
import PixelGtmManager from "./PixelGtmManager";
import { analyzeOrderRisk } from "../utils/fraudHelper";
import { triggerOrderSmsNotification } from "../utils/smsHelper";
import { IS_RESELLER_ACTIVE, isResellerFeatureUnlocked, TenantConfig, saveTenant, PRESET_TENANTS, MenuItemConfig, MenuItemDropdownItem, DEFAULT_MENU_ITEMS } from "../data/tenantConfig";
import { 
  Search, Menu, X, Globe, Mail, ChevronDown, ChevronUp, CheckCircle, Clock, Check,
  AlertCircle, ShieldCheck, ShoppingBag, ShoppingCart, User, Users, Store, Coins, 
  BarChart3, RefreshCw, Plus, Trash2, Edit, Printer, ArrowRight, Heart, FileText, 
  CreditCard, Truck, Settings, MessageSquare, Ticket, Percent, Star, ArrowUpRight,
  MessageCircle, BookOpen, Layers, Radio, Receipt, Megaphone, Bell, TrendingUp, DollarSign,
  Code
} from "lucide-react";

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  currency: 'BDT' | 'USD';
  activeTenant: TenantConfig;
  setActiveTenant: (tenant: TenantConfig) => void;
  unreadNotifications?: any[];
  setUnreadNotifications?: (orders: any[]) => void;
}

// Prepopulated static statistics from screenshots
const BASE_STATS = {
  totalSale: 148,
  totalStores: 18,
  totalProducts: 1095,
  totalCustomers: 97,
  pending: 52,
  confirmed: 23,
  packaging: 1,
  outForDelivery: 27,
  delivered: 114,
  canceled: 16,
  returned: 0,
  failed: 0,
  inHouseEarning: 559287.00,
  commissionEarned: 937.00,
  deliveryChargeEarned: 3384.99,
  totalTax: 0.00,
  pendingAmount: 10.71
};

export default function AdminPanel({
  products,
  setProducts,
  orders,
  setOrders,
  language,
  setLanguage,
  currency,
  activeTenant,
  setActiveTenant,
  unreadNotifications = [],
  setUnreadNotifications
}: AdminPanelProps) {
  // Navigation inside panel
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [adminBellDropdownOpen, setAdminBellDropdownOpen] = useState(false);
  
  // Interactive state declarations for the top icons and selectors
  const [messagesDropdownOpen, setMessagesDropdownOpen] = useState(false);
  const [cartsDropdownOpen, setCartsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Refs for auto-closing on clicking outside
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const cartsContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);
  const bellContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (messagesDropdownOpen && messagesContainerRef.current && !messagesContainerRef.current.contains(target)) {
        setMessagesDropdownOpen(false);
      }
      if (cartsDropdownOpen && cartsContainerRef.current && !cartsContainerRef.current.contains(target)) {
        setCartsDropdownOpen(false);
      }
      if (profileDropdownOpen && profileContainerRef.current && !profileContainerRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (adminBellDropdownOpen && bellContainerRef.current && !bellContainerRef.current.contains(target)) {
        setAdminBellDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [messagesDropdownOpen, cartsDropdownOpen, profileDropdownOpen, adminBellDropdownOpen]);

  // State-driven interactive client messages
  const [clientInquiries, setClientInquiries] = useState([
    {
      id: "msg-1",
      sender: "Karim Islam",
      avatar: "KI",
      textBn: "আমি ১০০ কেজি প্রিমিয়াম ঘি নিতে চাই, কোনো হোলসেল ডিসকাউন্ট আছে?",
      textEn: "I want to buy 100 kg premium ghee, is there any wholesale discount?",
      timeBn: "১০ মিনিট আগে",
      timeEn: "10m ago",
      resolved: false,
    },
    {
      id: "msg-2",
      sender: "Shafiqul Alam",
      avatar: "SA",
      textBn: "অর্ডার নং #২৪৫২ ঢাকা সিটির বাইরে কতদিনে ডেলিভারি হবে?",
      textEn: "How long will Order #2452 take to deliver outside Dhaka City?",
      timeBn: "২৫ মিনিট আগে",
      timeEn: "25m ago",
      resolved: false,
    },
    {
      id: "msg-3",
      sender: "Nusrat Jahan",
      avatar: "NJ",
      textBn: "টি-শার্টের কালার কি ১০০% গ্যারান্টি? প্রথমবার নিচ্ছি তাই জিজ্ঞেস করলাম।",
      textEn: "Is the T-shirt color 100% guaranteed? Asking since it's my first purchase.",
      timeBn: "১ ঘণ্টা আগে",
      timeEn: "1h ago",
      resolved: false,
    },
    {
      id: "msg-4",
      sender: "Dr. Rafiq",
      avatar: "DR",
      textBn: "আপনাদের সুগন্ধি দুধে কোনো প্রকার প্রিজারভেটিভ বা কেমিক্যাল মেশানো নেই তো?",
      textEn: "Is there any preservative or chemical in your flavored milk?",
      timeBn: "৩ ঘণ্টা আগে",
      timeEn: "3h ago",
      resolved: false,
    },
    {
      id: "msg-5",
      sender: "Arif Hasan",
      avatar: "AH",
      textBn: "কালকে অর্ডার করলে কি রবিবারের মধ্যে খুলনাতে পাওয়া যাবে?",
      textEn: "If I order tomorrow, will I get it in Khulna by Sunday?",
      timeBn: "৫ ঘণ্টা আগে",
      timeEn: "5h ago",
      resolved: false,
    }
  ]);

  // State-driven abandoned shopping carts
  const [abandonedCarts, setAbandonedCarts] = useState([
    {
      id: "cart-1",
      customer: "Anisur Rahman",
      phone: "01724905075",
      itemsBn: "২x প্রিমিয়াম ঘি, ১x খাঁটি মধু",
      itemsEn: "2x Premium Ghee, 1x Pure Honey",
      total: 3250,
      timeBn: "১২ মিনিট আগে",
      timeEn: "12 mins ago",
      status: "pending"
    },
    {
      id: "cart-2",
      customer: "Mariam Begum",
      phone: "01815904832",
      itemsBn: "১x এক্সক্লুসিভ টি-শার্ট",
      itemsEn: "1x Exclusive T-Shirt",
      total: 950,
      timeBn: "৪৫ মিনিট আগে",
      timeEn: "45 mins ago",
      status: "pending"
    },
    {
      id: "cart-3",
      customer: "Fahim Tazwar",
      phone: "01987541235",
      itemsBn: "৩x স্মার্ট স্পোর্টস ওয়াচ",
      itemsEn: "3x Smart Sport Watch",
      total: 8700,
      timeBn: "২ ঘণ্টা আগে",
      timeEn: "2 hours ago",
      status: "pending"
    },
    {
      id: "cart-4",
      customer: "Tanzina Sultana",
      phone: "01567123490",
      itemsBn: "২x খাঁটি সরিষার তেল",
      itemsEn: "2x Pure Mustard Oil",
      total: 1980,
      timeBn: "৫ ঘণ্টা আগে",
      timeEn: "5 hours ago",
      status: "pending"
    }
  ]);

  // Modern Invoice System states
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // WEBSITE CUSTOMIZER DYNAMIC STATES (PREMIUM MANAGEMENT SYSTEM)
  const [csShopName, setCsShopName] = useState(activeTenant.shopName);
  const [csShopNameBn, setCsShopNameBn] = useState(activeTenant.shopNameBn);
  const [csTagline, setCsTagline] = useState(activeTenant.tagline);
  const [csTaglineBn, setCsTaglineBn] = useState(activeTenant.taglineBn);
  const [csPhone, setCsPhone] = useState(activeTenant.phone);
  const [csEmail, setCsEmail] = useState(activeTenant.email);
  const [csAddress, setCsAddress] = useState(activeTenant.address);
  const [csAddressBn, setCsAddressBn] = useState(activeTenant.addressBn);
  const [csWhatsappNumber, setCsWhatsappNumber] = useState(activeTenant.whatsappNumber);
  const [csPrimaryColor, setCsPrimaryColor] = useState(activeTenant.primaryColor);
  const [csHoverColor, setCsHoverColor] = useState(activeTenant.hoverColor);
  const [csBgLightColor, setCsBgLightColor] = useState(activeTenant.bgLightColor);
  const [csLogoUrl, setCsLogoUrl] = useState(activeTenant.logoUrl || "");

  // Dynamic slides customizer state
  const defaultSlides = activeTenant.slides || [
    {
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
      title: "Exclusive Premium T-Shirts Collection",
      titleBn: "এক্সক্লুসিভ প্রিমিয়াম টি-শার্ট কালেকশন",
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
      titleBn: "স্মার্ট প্রিমিয়াম স্পোর্টস ঘড়ি ও ট্র্যাকার",
      subtitle: "Monitor health and styles on the go.",
      subtitleBn: "আপনার স্বাস্থ্য ও দৈনন্দিন লাইফস্টাইল ট্র্যাক করুন প্রফেশনালি।"
    }
  ];

  const [csSlides, setCsSlides] = useState(defaultSlides);
  const [csMenuItems, setCsMenuItems] = useState<MenuItemConfig[]>(activeTenant.menuItems || DEFAULT_MENU_ITEMS);

  // Sync state when activeTenant changes (important when switching presets or resetting)
  React.useEffect(() => {
    setCsShopName(activeTenant.shopName);
    setCsShopNameBn(activeTenant.shopNameBn);
    setCsTagline(activeTenant.tagline);
    setCsTaglineBn(activeTenant.taglineBn);
    setCsPhone(activeTenant.phone);
    setCsEmail(activeTenant.email);
    setCsAddress(activeTenant.address);
    setCsAddressBn(activeTenant.addressBn);
    setCsWhatsappNumber(activeTenant.whatsappNumber);
    setCsPrimaryColor(activeTenant.primaryColor);
    setCsHoverColor(activeTenant.hoverColor);
    setCsBgLightColor(activeTenant.bgLightColor);
    setCsLogoUrl(activeTenant.logoUrl || "");
    setCsSlides(activeTenant.slides || defaultSlides);
    setCsMenuItems(activeTenant.menuItems || DEFAULT_MENU_ITEMS);
  }, [activeTenant]);

  const workspaceRef = React.useRef<HTMLDivElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const requestDeletion = (titleBn: string, titleEn: string, msgBn: string, msgEn: string, onConfirm: () => void) => {
    setDeleteConfirm({
      title: language === 'bn' ? titleBn : titleEn,
      message: language === 'bn' ? msgBn : msgEn,
      onConfirm
    });
  };

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
  });

  const [stickyTop, setStickyTop] = useState(140);
  const [isDesktop, setIsDesktop] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
  });
  const [isNavbarSticky, setIsNavbarSticky] = useState(() => {
    return typeof window !== "undefined" ? window.scrollY > 150 : false;
  });
  const [isTransitioningTop, setIsTransitioningTop] = useState(false);

  React.useEffect(() => {
    let prevSticky = typeof window !== "undefined" ? window.scrollY > 150 : false;
    let transitionTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (typeof window === "undefined" || window.innerWidth < 1024) return;
      
      const scrollY = window.scrollY;
      const headerEl = document.getElementById("gadget-bazar-header");
      
      let computedTop = 140;
      const isStickyMode = scrollY > 150;
      
      if (isStickyMode) {
        computedTop = 52; // Sticky Navbar bottom offset
      } else {
        if (headerEl) {
          const headerRect = headerEl.getBoundingClientRect();
          computedTop = headerRect.bottom;
        } else {
          const hasBanner = document.getElementById("dismiss-eid-banner") !== null;
          const fallbackHeaderHeight = hasBanner ? 144 : 100;
          computedTop = fallbackHeaderHeight - scrollY;
        }
      }
      setStickyTop(computedTop);

      const currentSticky = scrollY > 150;
      if (currentSticky !== prevSticky) {
        prevSticky = currentSticky;
        setIsNavbarSticky(currentSticky);
        setIsTransitioningTop(true);
        
        if (transitionTimer) clearTimeout(transitionTimer);
        transitionTimer = setTimeout(() => {
          setIsTransitioningTop(false);
        }, 800);
      }
    };

    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    
    // Run initial offset positioning calculations
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, []);

  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Custom expandable submenu states for Refund, Category, Brands, In-house and Vendors
  const [refundsExpanded, setRefundsExpanded] = useState(false);
  const [refundStatusFilter, setRefundStatusFilter] = useState<string>('all');

  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [categorySubTab, setCategorySubTab] = useState<string>('all');

  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const [brandsSubTab, setBrandsSubTab] = useState<string>('all');

  const [inhouseExpanded, setInhouseExpanded] = useState(false);
  const [inhouseSubTab, setInhouseSubTab] = useState<string>('all');

  const [vendorExpanded, setVendorExpanded] = useState(false);
  const [vendorSubTab, setVendorSubTab] = useState<string>('all');

  const [sidebarMoreExpanded, setSidebarMoreExpanded] = useState(false);

  // Dynamic state trackers and sub-menus for Offers, Notifications, Sales Report, Customers, and Sellers
  const [offersDealsExpanded, setOffersDealsExpanded] = useState(false);
  const [offersDealsSubTab, setOffersDealsSubTab] = useState<string>('coupon');

  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [notificationsSubTab, setNotificationsSubTab] = useState<string>('send');

  const [salesReportExpanded, setSalesReportExpanded] = useState(false);
  const [salesReportSubTab, setSalesReportSubTab] = useState<string>('earning');

  const [customersExpanded, setCustomersExpanded] = useState(false);
  const [customersSubTab, setCustomersSubTab] = useState<string>('list');

  const [sellersExpanded, setSellersExpanded] = useState(false);
  const [sellersSubTab, setSellersSubTab] = useState<string>('list');

  const [deliveryManExpanded, setDeliveryManExpanded] = useState(false);
  const [deliveryManSubTab, setDeliveryManSubTab] = useState<string>('list');

  const [employeesExpanded, setEmployeesExpanded] = useState(false);
  const [employeesSubTab, setEmployeesSubTab] = useState<string>('list');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Smooth scroll to the main active view container's header anchor
  React.useEffect(() => {
    const handleScrollTransition = () => {
      const parent = document.getElementById("admin-workspace-scroll-container");
      const anchor = document.getElementById("admin-main-content-anchor");
      
      if (parent && anchor) {
        const parentRect = parent.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        const relativeTop = anchorRect.top - parentRect.top;
        
        // Scroll the right content panel smoothly so the new active tab begins exactly at the top of view
        parent.scrollTo({
          top: parent.scrollTop + relativeTop - 12,
          behavior: "smooth"
        });
      } else {
        const anchor = document.getElementById("admin-main-content-anchor");
        if (anchor) {
          anchor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    const timer = setTimeout(handleScrollTransition, 80);
    return () => clearTimeout(timer);
  }, [
    activeTab, 
    categorySubTab, 
    brandsSubTab, 
    inhouseSubTab, 
    vendorSubTab, 
    offersDealsSubTab, 
    notificationsSubTab, 
    salesReportSubTab, 
    customersSubTab, 
    sellersSubTab, 
    deliveryManSubTab, 
    employeesSubTab,
    editingProduct,
    isAddingNew
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // POS State
  const [posCart, setPosCart] = useState<{product: Product, quantity: number}[]>([]);
  const [posCustomerName, setPosCustomerName] = useState("dipu");
  const [posCustomerPhone, setPosCustomerPhone] = useState("01715566778");
  const [posPaymentMethod, setPosPaymentMethod] = useState("bKash Premium Wallet");
  const [posSuccessMsg, setPosSuccessMsg] = useState("");

  // Categories & Brands list state for interactive forms
  const [categoryList, setCategoryList] = useState<string[]>(["tshirt", "laptop", "appliances", "gadgets", "watches"]);
  const [newCatName, setNewCatName] = useState("");
  const [subCategoryList, setSubCategoryList] = useState<string[]>(["graphic-tshirt", "gaming-laptop", "split-ac", "smartwatches"]);
  const [newSubCatName, setNewSubCatName] = useState("");
  const [subSubCategoryList, setSubSubCategoryList] = useState<string[]>(["amd-gaming-laptop", "dual-inverter-split-ac", "gps-active-smartwatch"]);
  const [newSubSubCatName, setNewSubSubCatName] = useState("");
  const [brandList, setBrandList] = useState<string[]>(["Antec", "Gamdias", "MSI", "Walton", "Gree", "Polo Ralph", "Xiaomi"]);
  const [newBrandName, setNewBrandName] = useState("");

  // System Messages Feedback Queue
  const [feedbackMessages, setFeedbackMessages] = useState([
    { id: 1, name: "Shafiul Islam", req: "Interested in custom apparel sizing limits for corporate bulk orders.", date: "May 30, 2026", status: "unread" },
    { id: 2, name: "Dr. Ahmed", req: "Need formal quotation for Gazipur AC units setup on high rise diagnostic lab.", date: "May 29, 2026", status: "replied" }
  ]);
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState<number | null>(null);

  // Success notify
  const [successMsg, setSuccessMsg] = useState("");

  // Supplier lists
  const [suppliersList, setSuppliersList] = useState([
    { id: "SUP-901", name: "Fashion Fabrics Ltd", phone: "01712345678", rating: 4.9, active: true },
    { id: "SUP-902", name: "Apex Tech Distributors", phone: "01815554443", rating: 4.7, active: true },
    { id: "SUP-903", name: "Universal Home Appliances", phone: "01912888222", rating: 4.5, active: false }
  ]);

  // Delivery man registers
  const [deliveryMenList, setDeliveryMenList] = useState([
    { id: "DM-101", name: "Sajid Rahman", phone: "01712233445", email: "sajid.courier@nabik.com", zone: "Dhaka (Gulshan, Banani)", status: "Active", vehicle: "Motorcycle", balance: 4500 },
    { id: "DM-102", name: "Kamrul Islam", phone: "01915566778", email: "kamrul@nabik.com", zone: "Dhaka (Mirpur, Uttara)", status: "Active", vehicle: "Bicycle", balance: 3200 },
    { id: "DM-103", name: "Tanveer Hasan", phone: "01518899001", email: "tanveer@nabik.com", zone: "Chittagong Central", status: "Inactive", vehicle: "Covered Van", balance: 0 }
  ]);

  const [deliveryWithdrawRequests, setDeliveryWithdrawRequests] = useState([
    { id: "DWR-801", name: "Sajid Rahman", amount: 3000, method: "bKash", account: "01712233445", date: "May 30, 2026", status: "Pending" },
    { id: "DWR-802", name: "Kamrul Islam", amount: 2000, method: "Rocket", account: "01915566778", date: "May 29, 2026", status: "Approved" }
  ]);

  // Delivery Man Add New Form State
  const [newDmName, setNewDmName] = useState("");
  const [newDmPhone, setNewDmPhone] = useState("");
  const [newDmEmail, setNewDmEmail] = useState("");
  const [newDmZone, setNewDmZone] = useState("Dhaka (Gulshan, Banani)");
  const [newDmVehicle, setNewDmVehicle] = useState("Motorcycle");

  // Delivery-man Chat state
  const [dmChatId, setDmChatId] = useState("DM-101");
  const [dmChatMessages, setDmChatMessages] = useState<{[key: string]: {sender: "admin" | "dm", text: string, time: string}[]}>({
    "DM-101": [
      { sender: "dm", text: "Assalamu Alaikum sir, Mirpur package assigned ta deliver kore diyechi.", time: "11:30 AM" },
      { sender: "admin", text: "Walaikum Assalamu Sajid. Great work! Please upload the signature signoff in the app.", time: "11:32 AM" },
      { sender: "dm", text: "Ji diyechi sir. Withdrawal request pathiyechi 3000 BDT er jonno.", time: "11:35 AM" }
    ],
    "DM-102": [
      { sender: "dm", text: "Sir, Banani route clear ache, next batch distribution ready?", time: "09:15 AM" },
      { sender: "admin", text: "Yes Kamrul, the packages are already at Hub-A. Please collect them.", time: "09:20 AM" }
    ],
    "DM-103": [
      { sender: "dm", text: "Chittagong heavy rain block, express delivery 1 day delay hobe.", time: "Yesterday" },
      { sender: "admin", text: "Understood Tanveer. Stay safe and notify client accordingly.", time: "Yesterday" }
    ]
  });
  const [newDmChatMsgText, setNewDmChatMsgText] = useState("");

  // Employee registers
  const [employeeRoles, setEmployeeRoles] = useState([
    { id: "ROLE-1", name: "Master Admin", permissions: ["Products", "Orders", "Users", "Payouts", "Settings"], count: 1 },
    { id: "ROLE-2", name: "Support Agent", permissions: ["Orders", "Tickets", "Chat"], count: 2 },
    { id: "ROLE-3", name: "Delivery Supervisor", permissions: ["Delivery-man", "Orders"], count: 1 }
  ]);

  const [employeesList, setEmployeesList] = useState([
    { id: "EMP-001", name: "Jamal Uddin Chowdhury", email: "jamaluddinkh3424@gmail.com", role: "Master Admin", status: "Active" },
    { id: "EMP-002", name: "Nibiz IT support team", email: "support@nibiz.com", role: "Support Agent", status: "Active" },
    { id: "EMP-003", name: "Rashedul Amin", email: "rashed@nabikbazar.com", role: "Delivery Supervisor", status: "Active" }
  ]);

  // Employee role form state
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);

  // Employee form state
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("Support Agent");

  // Affiliate partners
  const [affiliatesList, setAffiliatesList] = useState([
    { name: "Anisur Rahman", code: "NABIK-ANIS", clicks: 504, rate: 10, totalPayout: 4200 },
    { name: "Sumaiya Akhter", code: "NABIK-SUMI", clicks: 1205, rate: 12, totalPayout: 14850 }
  ]);

  // Purchase lists (wholesale)
  const [procurementsList, setProcurementsList] = useState([
    { date: "30 May 2026", desc: "Redmi Powerbanks warehouse refill", qty: 250, costBDT: 187500 },
    { date: "24 May 2026", desc: "Apex T-shirts bulk restock", qty: 500, costBDT: 45000 }
  ]);

  // Refund Claims
  const [refundClaims, setRefundClaims] = useState([
    { id: "REF-001", orderId: "NABIK-VIP-9015", name: "Rashedul Bari", refundBDT: 1540, reason: "Defective stitching", status: "pending" },
    { id: "REF-002", orderId: "NABIK-VIP-4432", name: "Laila Farzana", refundBDT: 3450, reason: "Wrong size shipped", status: "approved" }
  ]);

  // Product Attribute definitions
  const [attributesList, setAttributesList] = useState([
    { category: "T-Shirt", material: "100% Ring Spun Cotton", sizes: "M, L, XL, XXL", density: "180 GSM" },
    { category: "Laptop", material: "Aluminium CNC Chassis", sizes: "13-inch, 15-inch", density: "IPS Liquid-Retina" }
  ]);

  // Vendor lists
  const [vendorsList, setVendorsList] = useState([
    { name: "Zaman Tech Store", productsCount: 140, commissionPercent: 8, rating: 4.6, status: 'active' },
    { name: "Sultana Fashion Hub", productsCount: 88, commissionPercent: 10, rating: 4.8, status: 'active' }
  ]);

  const [vendorProducts, setVendorProducts] = useState([
    { id: "VP-201", vendorName: "Zaman Tech Store", productName: "OnePlus Nord CE 3 Lite", priceBDT: 28900, status: "new-requests" },
    { id: "VP-202", vendorName: "Sultana Fashion Hub", productName: "Premium Silk Georgette Saree", priceBDT: 6500, status: "approved" },
    { id: "VP-203", vendorName: "Zaman Tech Store", productName: "Anker USB-C PowerPort III", priceBDT: 1450, status: "approved" },
    { id: "VP-204", vendorName: "Sultana Fashion Hub", productName: "Linen Summer Shalwar Kameez", priceBDT: 3200, status: "updated-requests" },
    { id: "VP-205", vendorName: "Sultana Fashion Hub", productName: "Polyester Sweat-proof Joggers", priceBDT: 1500, status: "denied" }
  ]);

  // Blog posts lists
  const [blogPosts, setBlogPosts] = useState([
    { title: "Nabik Bazar Summer Collection 2026", writer: "Editor-in-Chief", category: "Fashion & Styles", date: "May 30, 2026", body: "Check out the newly updated premium T-Shirt stocks from our brand with custom fits and sweat-proof designs." }
  ]);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogCategory, setNewBlogCategory] = useState("Fashion");
  const [newBlogContent, setNewBlogContent] = useState("");

  // Deals / Coupon setups
  const [couponCodes, setCouponCodes] = useState([
    { code: "NABIK50", discountPercent: 15, validity: "June 25, 2026" },
    { code: "FESTIVE250", discountPercent: 20, validity: "July 12, 2026" }
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);

  // Offers & Deals extra databases
  const [flashDealsList, setFlashDealsList] = useState([
    { id: "FD-401", title: "Eid Exclusive Mega Storm", discountPercent: 30, duration: "24 Hours Left", status: "Active" },
    { id: "FD-402", title: "Boishakhi Clearance Sale", discountPercent: 45, duration: "Expired", status: "Closed" },
    { id: "FD-403", title: "Midnight Super Lightning Deals", discountPercent: 55, duration: "Starts in 6 hours", status: "Upcoming" }
  ]);
  const [dealOfTheDayObj, setDealOfTheDayObj] = useState({
    productId: "T12",
    productName: "Razer BlackWidow Elite Clicky Special",
    originalPrice: 11500,
    dealPrice: 8900,
    timeLeft: "06:21:44",
    purchasesToday: 18
  });
  const [featuredDealsList, setFeaturedDealsList] = useState([
    { productId: "T39", productName: "Razer BlackWidow Keyboard", featuredStatus: "Featured", discountAllowed: 10 },
    { productId: "T40", productName: "Premium Royal Linen Shirt", featuredStatus: "Featured", discountAllowed: 15 },
    { productId: "T11", productName: "Apex Comfort Knit T-Shirt", featuredStatus: "Draft", discountAllowed: 5 }
  ]);

  // Notifications extra lists
  const [newPushChime, setNewPushChime] = useState("Standard Modern Chime");
  const [newPushBadge, setNewPushBadge] = useState(1);
  const [newPushDeepLink, setNewPushDeepLink] = useState("/promos/eid-bash");
  const [pushNotificationHistory, setPushNotificationHistory] = useState([
    { id: 1, title: "🚀 15% Cashback Reload Special!", message: "Reload your Nabik Wallet via bKash and get 15% instant bonus credits.", timestamp: "30 May 2026, 12:45 PM", badgeCount: 1, chime: "Standard Modern Chime", deepLink: "/profile/wallet" },
    { id: 2, title: "📦 Order Shipped: NABIK-VIP-9012", message: "Congratulations! Your order consisting of Premium Linen Cotton Shirts has cleared warehouse security.", timestamp: "29 May 2026, 09:12 AM", badgeCount: 0, chime: "Soft Double Echo", deepLink: "/profile/orders" }
  ]);
  const [newPushTitle, setNewPushTitle] = useState("");
  const [newPushMessage, setNewPushMessage] = useState("");

  // Sales and Transaction ledger subtest systems 
  const [affiliateTransactions, setAffiliateTransactions] = useState([
    { id: "AFF-901", influencer: "Sumaiya_Haiz_Vlog", code: "SUMAIYA10", salesCount: 42, payoutsPay: 5460, status: "Transferred" },
    { id: "AFF-902", influencer: "Nibir_The_Tech_King", code: "TECHKING", salesCount: 19, payoutsPay: 2180, status: "Processing" }
  ]);
  const [depositLogs, setDepositLogs] = useState([
    { id: "DEP-802", bank: "Dutch-Bangla Bank (Agent Banking)", account: "******8042", amount: 154000, date: "29 May 2026", status: "Completed" },
    { id: "DEP-803", bank: "City Bank Corporate Transfer", account: "******1102", amount: 480000, date: "28 May 2026", status: "Completed" }
  ]);
  const [expenseLedger, setExpenseLedger] = useState([
    { id: "EXP-101", desc: "AWS Serverless Instance Rent & Cloudflare Pro Plan", category: "Infrastructure", amount: 18450, date: "29 May 2026" },
    { id: "EXP-102", desc: "Branded eco-friendly paper packaging materials bag production", category: "Operations", amount: 32000, date: "25 May 2026" },
    { id: "EXP-103", desc: "Bicycle Courier delivery fuel subsidies", category: "Logistics", amount: 8500, date: "24 May 2026" }
  ]);

  // Customers extra systems
  const [customerReviews, setCustomerReviews] = useState([
    { id: "REV-901", customerName: "Asif Mahmood", product: "Premium Cotton Slim T-Shirt", rating: 5, comment: "চমৎকার গায়ের ফিটিং ও কালার! অতি দ্রুত ডেলিভারি পেয়েছি। ধন্যবাদ নবিক বাজার!", status: "Approved" },
    { id: "REV-902", customerName: "Tanzina Shati", product: "Razer BlackWidow Keyboard", rating: 4, comment: "কীবোর্ড অসাধারণ! ব্যাকলাইট খুবি সুন্দর। তবে শিপিং চার্জ একটু বেশি মনে হলো।", status: "Pending Reply" }
  ]);
  const [customerReplies, setCustomerReplies] = useState<{[key: string]: string}>({});
  const [walletBonusCampaigns, setWalletBonusCampaigns] = useState([
    { id: "BON-501", title: "BKASH Reload Match", triggerMinBDT: 1500, bonusPercent: 12, validity: "Active" },
    { id: "BON-502", title: "NAGAD First Deposit Festival", triggerMinBDT: 1000, bonusPercent: 15, validity: "Expired" }
  ]);
  const [newBonusTitle, setNewBonusTitle] = useState("");
  const [newBonusMin, setNewBonusMin] = useState(1500);
  const [newBonusPct, setNewBonusPct] = useState(10);

  // Sellers extra systems
  const [newSellerName, setNewSellerName] = useState("");
  const [newSellerLicense, setNewSellerLicense] = useState("");
  const [newSellerCommission, setNewSellerCommission] = useState(10);
  const [newSellerEmail, setNewSellerEmail] = useState("");
  
  const [withdrawRequests, setWithdrawRequests] = useState([
    { id: "WD-112", sellerName: "Zaman Tech Store", amountBDT: 45000, gateway: "DBBL EFT", requestDate: "30 May 2026", status: "Pending" },
    { id: "WD-113", sellerName: "Sultana Fashion Hub", amountBDT: 18000, gateway: "bKash Premium Wallet", requestDate: "29 May 2026", status: "Approved" }
  ]);
  const [withdrawalMethodsList, setWithdrawalMethodsList] = useState([
    { name: "Dutch-Bangla Bank C-EFT", processingDays: "2-3 business days", status: "Operational" },
    { name: "bKash Instant Merchant Cashbox", processingDays: "Immediate transfer", status: "Operational" },
    { name: "Nagad Business Channel", processingDays: "Immediate transfer", status: "Operational" }
  ]);

  // Scheduled Alerts Notifications
  const [adminNotifications, setAdminNotifications] = useState([
    { id: 1, title: "Summer Flash Sale Active!", target: "All App Users", scheduled: "June 1, 2026", icon: "🔥" }
  ]);
  const [newNotifTitle, setNewNotifTitle] = useState("");
  const [newNotifTarget, setNewNotifTarget] = useState("All App Users");

  // Announcements Marquees
  const [marquees, setMarquees] = useState(() => {
    const savedText = localStorage.getItem("gadget_bazar_marquee_text");
    return [
      { announcement: savedText || "Eid Offer Discount Price Coming Soon" }
    ];
  });
  const [newMarqueeText, setNewMarqueeText] = useState("");
  const [isMarqueeEnabled, setIsMarqueeEnabled] = useState(() => {
    return localStorage.getItem("gadget_bazar_marquee_enabled") !== "false";
  });

  // Customer Management
  const [customersList, setCustomersList] = useState([
    { name: "Al-Amin Chowdhury", email: "alaminchowdhury@gmail.com", totalOrders: 14, balanceBDT: 12500, active: true },
    { name: "Nabila Tabassum", email: "nabilatab@yahoo.com", totalOrders: 8, balanceBDT: 6200, active: true }
  ]);

  // Support Tickets
  const [supportTickets, setSupportTickets] = useState([
    { id: "TCK-809", sender: "Ruhul Amin", issue: "Payment processed but transaction status states pending", priority: "high", status: "open" },
    { id: "TCK-810", sender: "Fouzia Haq", issue: "Courier service delayed delivery in Chittagong region", priority: "medium", status: "in-progress" }
  ]);
  const [newTicketReply, setNewTicketReply] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Simulated live counter boosts based on session events
  const stats = useMemo(() => {
    const liveSellCount = orders.length;
    const itemTotalBDT = orders.reduce((sum, o) => sum + o.totalBDT, 0);

    return {
      totalSale: BASE_STATS.totalSale + liveSellCount,
      totalStores: BASE_STATS.totalStores,
      totalProducts: BASE_STATS.totalProducts + products.length - 8,
      totalCustomers: BASE_STATS.totalCustomers + Math.min(liveSellCount, 5),
      pending: BASE_STATS.pending + orders.filter(o => o.status === 'placed').length,
      confirmed: BASE_STATS.confirmed + orders.filter(o => o.status === 'processing').length,
      packaging: BASE_STATS.packaging + orders.filter(o => o.status === 'shipped').length,
      outForDelivery: BASE_STATS.outForDelivery,
      delivered: BASE_STATS.delivered + orders.filter(o => o.status === 'delivered').length,
      canceled: BASE_STATS.canceled,
      returned: BASE_STATS.returned,
      failed: BASE_STATS.failed,
      inHouseEarning: BASE_STATS.inHouseEarning + itemTotalBDT,
      commissionEarned: BASE_STATS.commissionEarned + (itemTotalBDT * 0.05),
      deliveryChargeEarned: BASE_STATS.deliveryChargeEarned + (liveSellCount * 60)
    };
  }, [orders, products]);

  // Handle Mock Order Injector from screenshot banner
  const handleSimulateOrder = () => {
    if (products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 2) + 1;

    const mockInjected: Order = {
      id: `NABIK-VIP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      items: [{ product: randomProduct, quantity: qty }],
      totalBDT: randomProduct.priceBDT * qty,
      totalUSD: randomProduct.priceUSD * qty,
      customerInfo: {
        name: ["dipu", "Md", "Abidul", "Dulal", "Masuk"][Math.floor(Math.random() * 5)],
        email: "client@ecommatrix.xyz",
        phone: "01724" + Math.floor(100000 + Math.random() * 900000),
        address: "Banani Elite Residential Ave, Dhaka",
        paymentMethod: ["bKash Premium Wallet", "Nagad VIP", "Cash On Delivery"][Math.floor(Math.random() * 3)],
        paymentStatus: "paid"
      },
      status: 'placed',
      estimatedDelivery: "24-48 Business Hours",
      timestamp: Date.now()
    };

    setOrders(prev => [mockInjected, ...prev]);
    setProducts(prev => prev.map(p => p.id === randomProduct.id ? { ...p, stock: Math.max(0, p.stock - qty) } : p));
    setSuccessMsg(language === 'bn' ? "অর্ডার ডেমো সফলভাবে ইনজেক্ট করা হয়েছে!" : "Demo order injected successfully into database!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // Adjust stock values live
  const updateProductStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  // Save new or update product specifications
  const [formProduct, setFormProduct] = useState({
    name: "", nameBn: "", category: "tshirt" as Category, priceBDT: 150, priceUSD: 1.5, stock: 10, image: ""
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name || !formProduct.priceBDT) return;

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: formProduct.name,
        nameBn: formProduct.nameBn || formProduct.name,
        category: formProduct.category,
        priceBDT: Number(formProduct.priceBDT),
        priceUSD: Number(formProduct.priceUSD),
        stock: Number(formProduct.stock),
        image: formProduct.image || p.image
      } : p));
      setSuccessMsg("Product specification has been adjusted.");
    } else {
      const newlyBorn: Product = {
        id: `prod-${Date.now()}`,
        name: formProduct.name,
        nameBn: formProduct.nameBn || formProduct.name,
        category: formProduct.category,
        description: "Premium catalog in-bound release.",
        descriptionBn: "প্রিমিয়াম আধুনিক পণ্য শ্রেণীবিভুক্ত স্টক পণ্য।",
        priceBDT: Number(formProduct.priceBDT),
        priceUSD: Number(formProduct.priceUSD),
        image: formProduct.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        rating: 4.8,
        reviewsCount: 1,
        stock: Number(formProduct.stock),
        features: ["Studio high quality standard finish"],
        featuresBn: ["স্টুডিও প্রিমিয়াম মানসম্পন্ন নিখুঁত ফিনিশিং"]
      };
      setProducts(prev => [newlyBorn, ...prev]);
      setSuccessMsg("Bespoke product added successfully.");
    }

    setFormProduct({ name: "", nameBn: "", category: "tshirt", priceBDT: 150, priceUSD: 1.5, stock: 10, image: "" });
    setEditingProduct(null);
    setIsAddingNew(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // POS Checkout trigger
  const handlePOSCheckout = () => {
    if (posCart.length === 0) return;
    const bdtTotal = posCart.reduce((sum, item) => sum + item.product.priceBDT * item.quantity, 0);
    const usdTotal = posCart.reduce((sum, item) => sum + item.product.priceUSD * item.quantity, 0);

    const posOrder: Order = {
      id: `NABIK-POS-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: posCart,
      totalBDT: bdtTotal,
      totalUSD: usdTotal,
      customerInfo: {
        name: posCustomerName,
        email: "cashier-pos@ecommatrix.xyz",
        phone: posCustomerPhone,
        address: "Over the counter cash register receipt",
        paymentMethod: posPaymentMethod,
        paymentStatus: "paid"
      },
      status: 'delivered',
      estimatedDelivery: "Handed over instantly"
    };

    setOrders(prev => [posOrder, ...prev]);
    setPosCart([]);
    setPosSuccessMsg(language === 'bn' ? "POS ক্যাশ ইনভয়েস সফলভাবে সম্পন্ন হয়েছে!" : "POS cash transaction logged successfully!");
    setTimeout(() => setPosSuccessMsg(""), 4000);
  };

  // Simulated month revenue arrays for visual barcharts
  const monthlyRevenueData = [
    { name: "Jan", inHouse: 65000, vendor: 1200, commission: 200 },
    { name: "Feb", inHouse: 120000, vendor: 1800, commission: 410 },
    { name: "Mar", inHouse: 175000, vendor: 3500, commission: 937 },
    { name: "Apr", inHouse: 10000, vendor: 900, commission: 150 },
    { name: "May", inHouse: 2000, vendor: 800, commission: 100 },
    { name: "Jun", inHouse: 1500, vendor: 100, commission: 50 },
    { name: "Jul", inHouse: 4000, vendor: 200, commission: 80 },
    { name: "Aug", inHouse: 3500, vendor: 150, commission: 70 },
    { name: "Sep", inHouse: 6000, vendor: 400, commission: 120 },
    { name: "Oct", inHouse: 5000, vendor: 300, commission: 110 },
    { name: "Nov", inHouse: 9000, vendor: 500, commission: 180 },
    { name: "Dec", inHouse: 15000, vendor: 1100, commission: 320 }
  ];

  return (
    <div className="min-h-[550px] lg:min-h-[650px] bg-[#f8f9fc] flex text-zinc-800 font-sans" id="master-admin-root">
      
      {/* Mobile Sidebar Backdrop Overlay - Closes sidebar when clicking outside on smaller screens */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-[1010] transition-opacity duration-300 cursor-pointer"
          id="sidebar-mobile-overlay-backdrop"
        />
      )}

      {/* LEFT SIDEBAR (NABIK BAZAR THEME) */}
      <aside 
        className={`bg-[#063b6d] text-white flex flex-col shrink-0 custom-sidebar-scrollbar overflow-y-auto z-[1020] lg:z-30 fixed left-0 top-0 h-screen lg:sticky select-none ${
          sidebarOpen ? 'w-64 translate-x-0 shadow-2xl lg:shadow-none font-bold' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-16'
        }`}
        style={{
          top: isDesktop ? `${stickyTop}px` : undefined,
          height: isDesktop ? `calc(100vh - ${stickyTop}px)` : undefined,
          maxHeight: isDesktop ? `calc(100vh - ${stickyTop}px)` : undefined,
          minHeight: isDesktop ? `calc(100vh - ${stickyTop}px)` : undefined,
          transition: isTransitioningTop 
            ? 'top 700ms cubic-bezier(0.16, 1, 0.3, 1), height 700ms cubic-bezier(0.16, 1, 0.3, 1), max-height 700ms cubic-bezier(0.16, 1, 0.3, 1), min-height 700ms cubic-bezier(0.16, 1, 0.3, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        id="side-bar-navigation"
      >
        {/* Branding Title */}
        <div className="p-4 border-b border-[#0c4a85] flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <div className="h-8 w-8 bg-[#f58220] rounded-lg flex items-center justify-center font-black text-white text-md">GB</div>
            {sidebarOpen && (
              <div className="text-left font-black tracking-wide leading-none">
                <span className="text-[#f58220] text-[13px] block">GADGET</span>
                <span className="text-white text-[11px] block text-opacity-80">BAZAR</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-300 hover:text-white p-1 hover:bg-[#0c4a85] rounded cursor-pointer lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sidebar Search */}
        {sidebarOpen && (
          <div className="p-3 bg-[#05325d]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-zinc-300" size={12} />
              <input 
                type="text" 
                placeholder="Search menu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a457c] border border-[#0d5395] rounded-md text-xs pl-8 pr-2.5 py-1.5 text-zinc-200 placeholder-zinc-300 pointer-events-auto focus:outline-none focus:ring-1 focus:ring-[#f58220]"
              />
            </div>
          </div>
        )}

        {/* Navigation Categories Map */}
        <nav className="flex-1 px-2.5 py-3 space-y-4">
          
          {/* Main Items Section (Unlabeled) */}
          <div className="space-y-1">
            {(!searchQuery || "dashboard".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition duration-155 border-0 ${activeTab === 'dashboard' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <Store size={15} className={activeTab === 'dashboard' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Dashboard</span>}
              </button>
            )}
            
            {(!searchQuery || "suppliers".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('suppliers')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition duration-155 border-0 ${activeTab === 'suppliers' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <ShoppingBag size={15} className={activeTab === 'suppliers' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Suppliers</span>}
              </button>
            )}

            {(!searchQuery || "pos".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('pos')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition duration-155 border-0 ${activeTab === 'pos' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <ShoppingBag size={15} className={activeTab === 'pos' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>POS</span>}
              </button>
            )}

            {(!searchQuery || "affiliate".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('affiliate')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition duration-155 border-0 ${activeTab === 'affiliate' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <User size={15} className={activeTab === 'affiliate' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Affiliate</span>}
              </button>
            )}

            {(!searchQuery || "purchase list".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('purchase-list')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition duration-155 border-0 ${activeTab === 'purchase-list' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <ShoppingBag size={15} className={activeTab === 'purchase-list' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Purchase List</span>}
              </button>
            )}
          </div>

          {/* ORDER MANAGEMENT Category */}
          <div className="space-y-1">
            {sidebarOpen && (!searchQuery || ["order", "refund", "management"].some(k => "order management".includes(searchQuery.toLowerCase()) || "orders".includes(searchQuery.toLowerCase()) || "refund requests".includes(searchQuery.toLowerCase()))) && (
              <span className="block px-3 text-[10px] font-black tracking-widest text-[#a1c2ff]/80 uppercase mb-2 mt-4 select-none">
                Order Management
              </span>
            )}

            {(!searchQuery || "orders".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('orders');
                    setOrdersExpanded(!ordersExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'orders' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart size={15} className={activeTab === 'orders' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Orders</span>}
                  </div>
                  {sidebarOpen && (
                    <div className="flex items-center space-x-1.5">
                      <ChevronDown 
                        size={11} 
                        className={`text-zinc-400 opacity-60 transition-transform duration-200 ${ordersExpanded ? 'rotate-180' : ''}`} 
                      />
                    </div>
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {ordersExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left" id="orders-submenu">
                        {[
                          { label: "All", status: "all", count: stats.pending + stats.confirmed + stats.packaging + stats.outForDelivery + stats.delivered + stats.canceled + stats.returned + stats.failed, colorClass: "bg-[#052b52] text-teal-300" },
                          { label: "Pending", status: "pending", count: stats.pending, colorClass: "bg-[#052b52] text-[#4facff]" },
                          { label: "Confirmed", status: "confirmed", count: stats.confirmed, colorClass: "bg-[#052b52] text-teal-300" },
                          { label: "Packaging", status: "packaging", count: stats.packaging, colorClass: "bg-amber-950/40 text-amber-300" },
                          { label: "Out for delivery", status: "out_for_delivery", count: stats.outForDelivery, colorClass: "bg-[#052b52] text-[#4facff]" },
                          { label: "Delivered", status: "delivered", count: stats.delivered, colorClass: "bg-[#052b52] text-emerald-300" },
                          { label: "Returned", status: "returned", count: stats.returned, colorClass: "bg-rose-950/40 text-rose-300" },
                          { label: "Failed to Deliver", status: "failed", count: stats.failed, colorClass: "bg-rose-950/40 text-rose-300" },
                          { label: "Canceled", status: "canceled", count: stats.canceled, colorClass: "bg-rose-950/40 text-rose-300" }
                        ].map((item) => {
                          const isActive = orderStatusFilter === item.status && activeTab === 'orders';
                          return (
                            <button
                              key={item.status}
                              id={`orders-submenu-${item.status}`}
                              onClick={() => {
                                setActiveTab('orders');
                                setOrderStatusFilter(item.status);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-green-400 font-black' 
                                  : 'text-zinc-100 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                                <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                              </div>
                              {item.count !== undefined && (
                                <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-mono font-black ${
                                  isActive ? 'bg-[#f58220] text-white' : item.colorClass
                                }`}>
                                  {item.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "refund requests".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('refund-requests');
                    setRefundsExpanded(!refundsExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'refund-requests' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Receipt size={15} className={activeTab === 'refund-requests' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Refund Requests</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${refundsExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {refundsExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left" id="refund-submenu">
                        {[
                          { label: "All", status: "all", count: refundClaims.length, colorClass: "bg-[#052b52] text-teal-300" },
                          { label: "Pending", status: "pending", count: refundClaims.filter(c => c.status === "pending").length, colorClass: "bg-[#052b52] text-[#4facff]" },
                          { label: "Approved", status: "approved", count: refundClaims.filter(c => c.status === "approved").length, colorClass: "bg-[#052b52] text-teal-300" },
                          { label: "Refunded", status: "refunded", count: refundClaims.filter(c => c.status === "refunded").length, colorClass: "bg-[#052b52] text-emerald-300" },
                          { label: "Rejected", status: "rejected", count: refundClaims.filter(c => c.status === "declined").length, colorClass: "bg-rose-950/40 text-rose-300" }
                        ].map((item) => {
                          const isActive = refundStatusFilter === item.status && activeTab === 'refund-requests';
                          return (
                            <button
                              key={item.status}
                              id={`refund-submenu-${item.status}`}
                              onClick={() => {
                                setActiveTab('refund-requests');
                                setRefundStatusFilter(item.status);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-green-405 text-green-400 font-black' 
                                  : 'text-zinc-100 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                                <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                              </div>
                              {item.count !== undefined && (
                                <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-mono font-black ${
                                  isActive ? 'bg-[#f58220] text-white' : item.colorClass
                                }`}>
                                  {item.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "fraud protection".includes(searchQuery.toLowerCase()) || "blacklist".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('fraud-protection')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition duration-155 border-0 ${
                  activeTab === 'fraud-protection' 
                    ? 'bg-[#0a457c] text-white' 
                    : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                }`}
              >
                <ShieldCheck size={15} className={activeTab === 'fraud-protection' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Fraud Protection</span>}
                {sidebarOpen && (
                  <span className="bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded ml-auto">
                    LIVE
                  </span>
                )}
              </button>
            )}
          </div>

          {/* PRODUCT MANAGEMENT Category */}
          <div className="space-y-1">
            {sidebarOpen && (!searchQuery || ["product", "category", "brand", "attribute", "house", "vendor", "management"].some(k => "product management".includes(searchQuery.toLowerCase()) || "category setup".includes(searchQuery.toLowerCase()) || "brands".includes(searchQuery.toLowerCase()) || "product attributes".includes(searchQuery.toLowerCase()) || "in-house products".includes(searchQuery.toLowerCase()) || "vendor products".includes(searchQuery.toLowerCase()))) && (
              <span className="block px-3 text-[10px] font-black tracking-widest text-[#a1c2ff]/80 uppercase mb-2 mt-4 select-none">
                Product Management
              </span>
            )}

            {(!searchQuery || "category setup".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('category-setup');
                    setCategoryExpanded(!categoryExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'category-setup' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Settings size={15} className={activeTab === 'category-setup' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Category Setup</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${categoryExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {categoryExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left" id="category-submenu">
                        {[
                          { label: "Categories", status: "all" },
                          { label: "Sub Categories", status: "sub-categories" },
                          { label: "Sub Sub Categories", status: "sub-sub-categories" }
                        ].map((item) => {
                          const isActive = categorySubTab === item.status && activeTab === 'category-setup';
                          return (
                            <button
                              key={item.status}
                              id={`category-submenu-${item.status}`}
                              onClick={() => {
                                setActiveTab('category-setup');
                                setCategorySubTab(item.status);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-green-405 text-green-400 font-black' 
                                  : 'text-zinc-100 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                                <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "brands".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('brands');
                    setBrandsExpanded(!brandsExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'brands' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Star size={15} className={activeTab === 'brands' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Brands</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${brandsExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {brandsExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left" id="brands-submenu">
                        {[
                          { label: "Add new", status: "add" },
                          { label: "List", status: "list" }
                        ].map((item) => {
                          const isActive = brandsSubTab === item.status && activeTab === 'brands';
                          return (
                            <button
                              key={item.status}
                              id={`brands-submenu-${item.status}`}
                              onClick={() => {
                                setActiveTab('brands');
                                setBrandsSubTab(item.status);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-green-405 text-green-400 font-black' 
                                  : 'text-zinc-100 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                                <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "product attributes".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('product-attributes')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'product-attributes' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <Layers size={15} className={activeTab === 'product-attributes' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Product Attributes</span>}
              </button>
            )}

            {(!searchQuery || "in-house products".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('in-house');
                    setInhouseExpanded(!inhouseExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'in-house' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Store size={15} className={activeTab === 'in-house' ? 'text-white' : 'text-zinc-350'} />
                    {sidebarOpen && <span>In-house Products</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${inhouseExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {inhouseExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left" id="inhouse-submenu">
                        {[
                          { label: "Product List", status: "list" },
                          { label: "Add New Product", status: "add" },
                          { label: "Bulk import", status: "bulk" }
                        ].map((item) => {
                          const isActive = inhouseSubTab === item.status && activeTab === 'in-house';
                          return (
                            <button
                              key={item.status}
                              id={`inhouse-submenu-${item.status}`}
                              onClick={() => {
                                setActiveTab('in-house');
                                setInhouseSubTab(item.status);
                                if (item.status === 'add') {
                                  setIsAddingNew(true);
                                } else {
                                  setIsAddingNew(false);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-green-405 text-green-400 font-black' 
                                  : 'text-zinc-100 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                                <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "vendor products".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('vendor-products');
                    setVendorExpanded(!vendorExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'vendor-products' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Radio size={15} className={activeTab === 'vendor-products' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Vendor products</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${vendorExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {vendorExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left" id="vendor-submenu">
                        {[
                          { label: "New Products Requests", status: "new-requests" },
                          { label: "Product Updated Requests", status: "updated-requests" },
                          { label: "Approved Products", status: "approved" },
                          { label: "Denied Products", status: "denied" }
                        ].map((item) => {
                          const isActive = vendorSubTab === item.status && activeTab === 'vendor-products';
                          return (
                            <button
                              key={item.status}
                              id={`vendor-submenu-${item.status}`}
                              onClick={() => {
                                setActiveTab('vendor-products');
                                setVendorSubTab(item.status);
                              }}
                              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-green-405 text-green-400 font-black' 
                                  : 'text-zinc-100 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                                <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Collapsible Secondary Sidebar Categories */}
          <AnimatePresence initial={false}>
            {(sidebarMoreExpanded || searchQuery !== '') && (
              <motion.div
                key="collapsible-secondary-sidebar-group"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden space-y-4"
              >
              {/* BLOG MANAGEMENT Category */}
              <div className="space-y-1">
            {sidebarOpen && (!searchQuery || ["blog", "management"].some(k => "blog management".includes(searchQuery.toLowerCase()) || "blog".includes(searchQuery.toLowerCase()))) && (
              <span className="block px-3 text-[10px] font-black tracking-widest text-[#a1c2ff]/80 uppercase mb-2 mt-4 select-none">
                Blog Management
              </span>
            )}

            {(!searchQuery || "blog".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('blog')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'blog' ? 'bg-[#0a457c] text-green-400 border-l-4 border-green-400 pl-2' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <BookOpen size={15} className={activeTab === 'blog' ? 'text-green-405 text-green-400' : 'text-zinc-300'} />
                {sidebarOpen && <span>Blog</span>}
              </button>
            )}
          </div>

          {/* PROMOTION MANAGEMENT Category */}
          <div className="space-y-1">
            {sidebarOpen && (!searchQuery || ["promo", "banner", "offer", "deal", "notification", "announcement"].some(k => "promotion management".includes(searchQuery.toLowerCase()) || "banners".includes(searchQuery.toLowerCase()) || "offers & deals".includes(searchQuery.toLowerCase()) || "notifications".includes(searchQuery.toLowerCase()) || "announcements".includes(searchQuery.toLowerCase()))) && (
              <span className="block px-3 text-[10px] font-black tracking-widest text-[#a1c2ff]/80 uppercase mb-2 mt-4 select-none">
                Promotion Management
              </span>
            )}

            {(!searchQuery || "banners".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('banners')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'banners' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <Layers size={15} className={activeTab === 'banners' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Banners</span>}
              </button>
            )}

            {(!searchQuery || "offers & deals".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('offers-deals');
                    setOffersDealsExpanded(!offersDealsExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'offers-deals' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-255 text-zinc-110 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Ticket size={15} className={activeTab === 'offers-deals' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Offers & Deals</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${offersDealsExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {offersDealsExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left">
                        {[
                          { label: "Coupon", status: "coupon" },
                          { label: "Flash Deals", status: "flash-deals" },
                          { label: "Deal of the day", status: "deal-of-the-day" },
                          { label: "Featured Deal", status: "featured-deal" }
                        ].map((item) => {
                          const isActive = offersDealsSubTab === item.status && activeTab === 'offers-deals';
                          return (
                            <button
                              key={item.status}
                              onClick={() => {
                                setActiveTab('offers-deals');
                                setOffersDealsSubTab(item.status);
                              }}
                              className={`w-full flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-[#a4f6a5] text-green-400 font-black' 
                                  : 'text-zinc-200 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                              <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "notifications".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('notifications');
                    setNotificationsExpanded(!notificationsExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'notifications' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-255 text-zinc-110 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Bell size={15} className={activeTab === 'notifications' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Notifications</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${notificationsExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {notificationsExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left">
                        {[
                          { label: "Send Notification", status: "send", icon: "📢" },
                          { label: "Push notification", status: "push", icon: "📱" },
                          { label: "SMS Notifications", status: "sms", icon: "💬" }
                        ].map((item) => {
                          const isActive = notificationsSubTab === item.status && activeTab === 'notifications';
                          return (
                            <button
                              key={item.status}
                              onClick={() => {
                                setActiveTab('notifications');
                                setNotificationsSubTab(item.status);
                              }}
                              className={`w-full flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-[#a4f6a5] text-green-400 font-black' 
                                  : 'text-zinc-200 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <span className="text-[11px] opacity-90">{item.icon}</span>
                              <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "announcements".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('announcements')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'announcements' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <Megaphone size={15} className={activeTab === 'announcements' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Announcements</span>}
              </button>
            )}
          </div>

          {/* HELP & SUPPORT Category */}
          <div className="space-y-1">
            {sidebarOpen && (!searchQuery || ["help", "support", "message", "ticket"].some(k => "help & support".includes(searchQuery.toLowerCase()) || "messages".includes(searchQuery.toLowerCase()) || "support ticket".includes(searchQuery.toLowerCase()))) && (
              <span className="block px-3 text-[10px] font-black tracking-widest text-[#a1c2ff]/80 uppercase mb-2 mt-4 select-none">
                Help & Support
              </span>
            )}

            {(!searchQuery || "messages".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'messages' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare size={15} className={activeTab === 'messages' ? 'text-white' : 'text-zinc-300'} />
                  {sidebarOpen && <span>Messages</span>}
                </div>
                {sidebarOpen && <span className="h-2 w-2 rounded-full bg-rose-500 mr-1 animate-pulse" />}
              </button>
            )}

            {(!searchQuery || "support ticket".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('support-ticket')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'support-ticket' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle size={15} className={activeTab === 'support-ticket' ? 'text-white' : 'text-zinc-300'} />
                  {sidebarOpen && <span>Support Ticket</span>}
                </div>
                {sidebarOpen && <span className="h-2 w-2 rounded-full bg-rose-500 mr-1 animate-pulse" />}
              </button>
            )}
          </div>

          {/* REPORTS & ANALYSIS Category */}
          <div className="space-y-1">
            {sidebarOpen && (!searchQuery || ["report", "analysis", "sales", "bank", "cash", "transaction"].some(k => "reports & analysis".includes(searchQuery.toLowerCase()) || "sales & transaction report".includes(searchQuery.toLowerCase()) || "bank & cash".includes(searchQuery.toLowerCase()) || "product report".includes(searchQuery.toLowerCase()) || "order report".includes(searchQuery.toLowerCase()))) && (
              <span className="block px-3 text-[10px] font-black tracking-widest text-[#a1c2ff]/80 uppercase mb-2 mt-4 select-none">
                Reports & Analysis
              </span>
            )}

            {(!searchQuery || "sales & transaction report".includes(searchQuery.toLowerCase()) || "bank & cash".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('sales-report');
                    setSalesReportExpanded(!salesReportExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'sales-report' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-255 text-zinc-110 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 size={15} className={activeTab === 'sales-report' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span className="text-left font-sans block truncate max-w-[140px]">Sales & Transaction Report</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 shrink-0 ${salesReportExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {salesReportExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left">
                        {[
                          { label: "Earning Reports", status: "earning" },
                          { label: "Inhouse Sales", status: "inhouse" },
                          { label: "Seller Sales", status: "seller" },
                          { label: "Transaction Report", status: "transaction" },
                          { label: "Affiliate transaction", status: "affiliate" },
                          { label: "Deposite", status: "deposite" },
                          { label: "Expense", status: "expense" },
                          { label: "Balance Sheet", status: "balance-sheet" },
                          { label: "Gross Profit", status: "gross-profit" }
                        ].map((item) => {
                          const isActive = salesReportSubTab === item.status && activeTab === 'sales-report';
                          return (
                            <button
                              key={item.status}
                              onClick={() => {
                                setActiveTab('sales-report');
                                setSalesReportSubTab(item.status);
                              }}
                              className={`w-full flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-[#a4f6a5] text-green-400 font-black' 
                                  : 'text-zinc-200 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                              <span className={isActive ? 'text-green-400 text-left' : 'text-zinc-100 text-left'}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "product report".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('product-report')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'product-report' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <BarChart3 size={15} className={activeTab === 'product-report' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Product Report</span>}
              </button>
            )}

            {(!searchQuery || "order report".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('order-report')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'order-report' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <TrendingUp size={15} className={activeTab === 'order-report' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Order Report</span>}
              </button>
            )}
          </div>

          {/* USER MANAGEMENT Category */}
          <div className="space-y-1">
            {sidebarOpen && (!searchQuery || ["user", "management", "customer", "seller", "delivery", "employee", "subscriber"].some(k => "user management".includes(searchQuery.toLowerCase()) || "customers".includes(searchQuery.toLowerCase()) || "sellers".includes(searchQuery.toLowerCase()) || "delivery-man".includes(searchQuery.toLowerCase()) || "employees".includes(searchQuery.toLowerCase()) || "subscribers".includes(searchQuery.toLowerCase()))) && (
              <span className="block px-3 text-[10px] font-black tracking-widest text-[#a1c2ff]/80 uppercase mb-2 mt-4 select-none">
                User Management
              </span>
            )}

            {(!searchQuery || "customers".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('customers');
                    setCustomersExpanded(!customersExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'customers' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-255 text-zinc-110 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users size={15} className={activeTab === 'customers' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Customers</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${customersExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {customersExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left">
                        {[
                          { label: "Customer List", status: "list" },
                          { label: "Customer Reviews", status: "reviews" },
                          { label: "Wallet", status: "wallet" },
                          { label: "Wallet Bonus Setup", status: "bonus" },
                          { label: "Loyalty Points", status: "loyalty" }
                        ].map((item) => {
                          const isActive = customersSubTab === item.status && activeTab === 'customers';
                          return (
                            <button
                              key={item.status}
                              onClick={() => {
                                setActiveTab('customers');
                                setCustomersSubTab(item.status);
                              }}
                              className={`w-full flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-[#a4f6a5] text-green-400 font-black' 
                                  : 'text-zinc-200 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                              <span className={isActive ? 'text-green-400' : 'text-zinc-100'}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "sellers".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('sellers');
                    setSellersExpanded(!sellersExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'sellers' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-255 text-zinc-110 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users size={15} className={activeTab === 'sellers' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Sellers</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${sellersExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {sellersExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left">
                        {[
                          { label: "Add New Seller", status: "add" },
                          { label: "Seller List", status: "list" },
                          { label: "Withdraws", status: "withdraws" },
                          { label: "Withdrawal Methods", status: "methods" }
                        ].map((item) => {
                          const isActive = sellersSubTab === item.status && activeTab === 'sellers';
                          return (
                            <button
                              key={item.status}
                              onClick={() => {
                                setActiveTab('sellers');
                                setSellersSubTab(item.status);
                              }}
                              className={`w-full flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-[#a4f6a5] text-green-400 font-black' 
                                  : 'text-zinc-200 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                              <span className={isActive ? 'text-green-400 text-left' : 'text-zinc-100 text-left'}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "delivery-man".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('delivery-man');
                    setDeliveryManExpanded(!deliveryManExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'delivery-man' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <User size={15} className={activeTab === 'delivery-man' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Delivery-man</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${deliveryManExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {deliveryManExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left">
                        {[
                          { label: "Add new", status: "add" },
                          { label: "List", status: "list" },
                          { label: "Chat", status: "chat" },
                          { label: "Withdraws", status: "withdraws" },
                          { label: "Emergency Contact", status: "emergency" }
                        ].map((item) => {
                          const isActive = deliveryManSubTab === item.status && activeTab === 'delivery-man';
                          return (
                            <button
                              key={item.status}
                              onClick={() => {
                                setDeliveryManSubTab(item.status);
                                setActiveTab('delivery-man');
                              }}
                              className={`w-full flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-green-400 font-black' 
                                  : 'text-zinc-200 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                              <span className={isActive ? 'text-green-400 text-left' : 'text-zinc-100 text-left'}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "employees".includes(searchQuery.toLowerCase())) && (
              <>
                <button 
                  onClick={() => {
                    setActiveTab('employees');
                    setEmployeesExpanded(!employeesExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${
                    activeTab === 'employees' 
                      ? 'bg-[#0a457c] text-white' 
                      : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <User size={15} className={activeTab === 'employees' ? 'text-white' : 'text-zinc-300'} />
                    {sidebarOpen && <span>Employees</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown 
                      size={11} 
                      className={`text-zinc-400 opacity-60 transition-transform duration-200 ${employeesExpanded ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {employeesExpanded && sidebarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 mt-1 space-y-1 text-left">
                        {[
                          { label: "Employee Role Setup", status: "role-setup" },
                          { label: "Employees", status: "list" }
                        ].map((item) => {
                          const isActive = employeesSubTab === item.status && activeTab === 'employees';
                          return (
                            <button
                              key={item.status}
                              onClick={() => {
                                setEmployeesSubTab(item.status);
                                setActiveTab('employees');
                              }}
                              className={`w-full flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 border-0 ${
                                isActive 
                                  ? 'bg-[#0a457c] text-green-400 font-black' 
                                  : 'text-zinc-200 hover:bg-[#0a457c]/40 hover:text-white'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 text-green-400' : 'bg-sky-400/50'}`} />
                              <span className={isActive ? 'text-green-400 text-left' : 'text-zinc-100 text-left'}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(!searchQuery || "courier".includes(searchQuery.toLowerCase()) || "কুরিয়ার".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('courier')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'courier' ? 'bg-[#f58220] text-white font-black' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <Truck size={15} className={activeTab === 'courier' ? 'text-white font-black' : 'text-zinc-300'} />
                {sidebarOpen && <span>{language === 'bn' ? 'কুরিয়ার ইন্টিগ্রেশন' : 'Courier Integration'}</span>}
              </button>
            )}

            {(!searchQuery || "pixel".includes(searchQuery.toLowerCase()) || "gtm".includes(searchQuery.toLowerCase()) || "ট্যাগ".includes(searchQuery.toLowerCase()) || "পিক্সেল".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('pixel-gtm')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'pixel-gtm' ? 'bg-[#f58220] text-white font-black' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <Code size={15} className={activeTab === 'pixel-gtm' ? 'text-white font-black' : 'text-zinc-300'} />
                {sidebarOpen && <span>{language === 'bn' ? 'পিক্সেল ও জিটিএম' : 'Pixel & GTM Tracking'}</span>}
              </button>
            )}

            {(!searchQuery || "design".includes(searchQuery.toLowerCase()) || "customize".includes(searchQuery.toLowerCase()) || "ডিজাইন".includes(searchQuery.toLowerCase()) || "কাস্টমাইজ".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('web-design')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'web-design' ? 'bg-[#f58220] text-white font-black' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <Store size={15} className={activeTab === 'web-design' ? 'text-white font-black animate-pulse' : 'text-zinc-300'} />
                {sidebarOpen && <span>{language === 'bn' ? 'ডিজাইন ও কাস্টমাইজ' : 'Design & Theme Settings'}</span>}
              </button>
            )}

            {(!searchQuery || "subscribers".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => setActiveTab('subscribers')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition ${activeTab === 'subscribers' ? 'bg-[#f58220] text-white' : 'text-zinc-250 text-zinc-100 hover:bg-[#0a457c] hover:text-white'}`}
              >
                <User size={15} className={activeTab === 'subscribers' ? 'text-white' : 'text-zinc-300'} />
                {sidebarOpen && <span>Subscribers</span>}
              </button>
            )}

            {isResellerFeatureUnlocked() && (!searchQuery || "reseller panel".includes(searchQuery.toLowerCase()) || "রিসেলার প্যানেল".includes(searchQuery.toLowerCase())) && (
              <button 
                onClick={() => {
                  const event = new CustomEvent("open-reseller-panel");
                  window.dispatchEvent(event);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold border-0 transition text-zinc-100 bg-amber-600/20 hover:bg-amber-650 hover:text-white cursor-pointer border-l-2 border-amber-500"
              >
                <Settings size={15} className="text-amber-400 animate-spin duration-[10s]" />
                {sidebarOpen && <span>{language === 'bn' ? 'রিসেলার প্যানেল' : 'Reseller Panel'}</span>}
              </button>
            )}
          </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TOGGLE SEE MORE BUTTON - NABIK BAZAR CUSTOM COMPACT */}
          {searchQuery === '' && (
            <button
              onClick={() => setSidebarMoreExpanded(!sidebarMoreExpanded)}
              className="w-full flex items-center justify-between px-3 py-2.5 mt-4 rounded-lg text-xs font-black border-0 bg-[#0a457c]/40 hover:bg-[#0c4a85] text-[#f58220] hover:text-white cursor-pointer select-none transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
              id="sidebar-more-toggle-btn"
            >
              <div className="flex items-center space-x-3">
                <ChevronDown 
                  size={14} 
                  className={`text-[#f58220] transition-transform duration-250 ease-out ${sidebarMoreExpanded ? 'rotate-180' : ''}`} 
                />
                {sidebarOpen && (
                  <span>
                    {sidebarMoreExpanded 
                      ? (language === 'bn' ? 'কম দেখুন' : 'See Less')
                      : (language === 'bn' ? 'আরো দেখুন' : 'See More')
                    }
                  </span>
                )}
              </div>
              {sidebarOpen && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f58220] text-white font-mono font-black shadow-sm transition-transform duration-200">
                  {sidebarMoreExpanded ? 'Collapse' : '+9'}
                </span>
              )}
            </button>
          )}

        </nav>

        {/* Sidebar Info Footer */}
        {sidebarOpen && (
          <div className="p-3 bg-[#042d54] text-center text-[10px] text-zinc-400">
            <span>Server: 🟢 Online Active</span>
          </div>
        )}
      </aside>

      {/* RIGHT WORKSPACE */}
      <div 
        ref={workspaceRef}
        id="admin-workspace-scroll-container" 
        className="flex-1 flex flex-col min-w-0 overflow-y-auto"
      >
        
        {/* TOP NAVBAR */}
        <header className="relative bg-white border-b border-zinc-200 h-16 px-2.5 sm:px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-zinc-600 hover:text-zinc-900 p-2 hover:bg-zinc-100 rounded-lg cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="text-zinc-400 text-xs hidden sm:block">
              Time: {new Date().toLocaleDateString()} (BST) • Portal v3.82
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-5 text-sm">
            {/* Interactive Language Selection Button (Direct Toggle) */}
            <div className="relative">
              <button 
                onClick={() => {
                  const nextLang = language === 'en' ? 'bn' : 'en';
                  setLanguage(nextLang);
                  const msg = nextLang === 'bn' ? "ভাষা পরিবর্তন করে বাংলায় করা হয়েছে!" : "Language switched to English!";
                  const event = new CustomEvent("app-toast", { detail: msg });
                  window.dispatchEvent(event);
                  
                  // Close other dropdowns
                  setMessagesDropdownOpen(false);
                  setCartsDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-1.5 hover:bg-zinc-100 rounded-full transition cursor-pointer border-0 bg-transparent flex items-center justify-center text-zinc-600 hover:text-[#063b6d]"
                title={language === 'bn' ? "ভাষা সিলেক্ট করুন (ইংলিশ/বাংলা)" : "Toggle Language (English/Bangla)"}
              >
                <Globe className="h-5 w-5" />
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-[#063b6d] text-white font-extrabold px-1.2 rounded-full uppercase scale-90 leading-none">
                  {language}
                </span>
              </button>
            </div>

            {/* Interactive Messages Dropdown */}
            <div className="sm:relative" ref={messagesContainerRef}>
              <button 
                onClick={() => {
                  setMessagesDropdownOpen(!messagesDropdownOpen);
                  setCartsDropdownOpen(false);
                  setProfileDropdownOpen(false);
                  setAdminBellDropdownOpen(false);
                }}
                className="relative p-1.5 hover:bg-zinc-100 rounded-full transition cursor-pointer border-0 bg-transparent flex items-center justify-center"
              >
                <Mail className="text-zinc-600 hover:text-[#063b6d] h-5 w-5" />
                {clientInquiries.filter(m => !m.resolved).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                    {clientInquiries.filter(m => !m.resolved).length}
                  </span>
                )}
              </button>

              {messagesDropdownOpen && (
                <div className="absolute top-[64px] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 mt-3 sm:mt-4 w-auto sm:w-80 max-w-none sm:max-w-[340px] bg-white border border-zinc-200 rounded-2xl shadow-2xl py-3.5 px-4 z-[9999] text-left font-sans animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100 mb-2.5">
                    <span className="text-xs font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
                      <Mail size={13} className="text-blue-600" />
                      <span>{language === 'bn' ? `গ্রাহক বার্তা (${clientInquiries.filter(m => !m.resolved).length})` : `Inquiries (${clientInquiries.filter(m => !m.resolved).length})`}</span>
                    </span>
                    {clientInquiries.filter(m => !m.resolved).length > 0 && (
                      <button 
                        onClick={() => {
                          setClientInquiries(clientInquiries.map(m => ({ ...m, resolved: true })));
                          const event = new CustomEvent("app-toast", { detail: language === 'bn' ? "সব বার্তা সমাধান করা হয়েছে!" : "All messages resolved!" });
                          window.dispatchEvent(event);
                        }}
                        className="bg-transparent border-0 text-[10px] text-zinc-400 hover:text-blue-600 font-extrabold uppercase cursor-pointer"
                      >
                        {language === 'bn' ? "সব সমাধান" : "Resolve All"}
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 custom-sidebar-scrollbar">
                    {clientInquiries.filter(m => !m.resolved).length === 0 ? (
                      <div className="py-6 text-center text-zinc-400 space-y-1">
                        <span className="text-lg">📬</span>
                        <p className="text-[11px] font-bold">{language === 'bn' ? "কোনো নতুন বার্তা নেই" : "No new messages"}</p>
                        <p className="text-[9px] text-zinc-400 max-w-[200px] mx-auto leading-normal">{language === 'bn' ? "সবগুলো গ্রাহক বার্তা সফলভাবে সমাধান করা হয়েছে।" : "All customer inquiries have been fully answered."}</p>
                      </div>
                    ) : (
                      clientInquiries.filter(m => !m.resolved).map((msg) => (
                        <div key={msg.id} className="bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-100 rounded-xl p-3 space-y-2 transition duration-150 text-xs">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className="w-6.5 h-6.5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black shrink-0">
                                {msg.avatar}
                              </div>
                              <span className="text-xs font-extrabold text-zinc-800">{msg.sender}</span>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-400 font-mono bg-zinc-200/50 px-1.5 py-0.5 rounded-sm shrink-0">
                              {language === 'bn' ? msg.timeBn : msg.timeEn}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 bg-white border border-zinc-100 p-2 rounded-lg font-medium leading-relaxed">
                            {language === 'bn' ? msg.textBn : msg.textEn}
                          </p>
                          <div className="flex items-center justify-end gap-1.5 pt-0.5">
                            <a 
                              href={`https://wa.me/01784905075?text=${encodeURIComponent(`Dear ${msg.sender}, thank you for your query about: ${language === 'bn' ? msg.textBn : msg.textEn}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2.5 py-1 font-bold no-underline"
                            >
                              💬 WhatsApp
                            </a>
                            <button 
                              onClick={() => {
                                setClientInquiries(clientInquiries.map(m => m.id === msg.id ? { ...m, resolved: true } : m));
                                const event = new CustomEvent("app-toast", { detail: language === 'bn' ? "বার্তা সমাধান করা হয়েছে!" : "Message resolved successfully!" });
                                window.dispatchEvent(event);
                              }}
                              className="text-[10px] bg-zinc-200 hover:bg-blue-600 hover:text-white text-zinc-700 rounded-lg px-2.5 py-1 font-bold cursor-pointer border-0 transition"
                            >
                              ✔️ {language === 'bn' ? 'সমাধান' : 'Resolve'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Interactive Shopping Cart / Abandoned Sessions Recovery Dropdown */}
            <div className="sm:relative" ref={cartsContainerRef}>
              <button 
                onClick={() => {
                  setCartsDropdownOpen(!cartsDropdownOpen);
                  setMessagesDropdownOpen(false);
                  setProfileDropdownOpen(false);
                  setAdminBellDropdownOpen(false);
                }}
                className="relative p-1.5 hover:bg-zinc-100 rounded-full transition cursor-pointer border-0 bg-transparent flex items-center justify-center"
              >
                <ShoppingCart className="text-zinc-600 hover:text-[#063b6d] h-5 w-5" />
                {(52 - abandonedCarts.filter(c => c.status === 'recovered').length) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyan-600 text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                    {52 - abandonedCarts.filter(c => c.status === 'recovered').length}
                  </span>
                )}
              </button>

              {cartsDropdownOpen && (
                <div className="absolute top-[64px] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 mt-3 sm:mt-4 w-auto sm:w-85 max-w-none sm:max-w-[340px] bg-white border border-zinc-200 rounded-2xl shadow-2xl py-3.5 px-4 z-[9999] text-left font-sans animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100 mb-2.5">
                    <span className="text-xs font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
                      <ShoppingCart size={13} className="text-cyan-600" />
                      <span>{language === 'bn' ? `পরিত্যক্ত কার্ট (${52 - abandonedCarts.filter(c => c.status === 'recovered').length})` : `Abandoned Carts (${52 - abandonedCarts.filter(c => c.status === 'recovered').length})`}</span>
                    </span>
                    <button 
                      onClick={() => {
                        const event = new CustomEvent("app-toast", { detail: language === 'bn' ? "সকল পরিত্যক্ত কার্ট প্রসেস করা হচ্ছে..." : "Processing recovery queues..." });
                        window.dispatchEvent(event);
                      }}
                      className="bg-transparent border-0 text-[10px] text-zinc-400 hover:text-cyan-600 font-extrabold uppercase cursor-pointer"
                    >
                      {language === 'bn' ? "রিকভারি ট্র্যাকার" : "Recovery Sync"}
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 custom-sidebar-scrollbar">
                    {/* List active target rows */}
                    {abandonedCarts.filter(c => c.status !== 'recovered').map((cart) => {
                      const totalText = currency === 'BDT' ? `৳${cart.total.toLocaleString()}` : `$${(cart.total / 120).toFixed(1)}`;
                      return (
                        <div key={cart.id} className="border border-zinc-150 rounded-xl p-3 space-y-2 bg-zinc-50/55 hover:bg-cyan-50/10 transition text-xs">
                          <div className="flex justify-between items-start">
                            <div className="text-left">
                              <span className="text-xs font-extrabold text-zinc-800 block leading-tight">{cart.customer}</span>
                              <span className="text-[9.5px] font-bold text-zinc-400 font-mono block mt-0.5">{cart.phone} • {language === 'bn' ? cart.timeBn : cart.timeEn}</span>
                            </div>
                            <span className="text-xs font-black text-cyan-600 font-mono bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-lg shrink-0">
                              {totalText}
                            </span>
                          </div>

                          <div className="bg-white border border-zinc-100 p-2 rounded-lg space-y-1">
                            <span className="text-[9.5px] uppercase font-black tracking-wider text-zinc-400 block">{language === 'bn' ? "আইটেমসমূহ:" : "Items Proposed:"}</span>
                            <span className="text-xs font-bold text-zinc-700 block truncate">{language === 'bn' ? cart.itemsBn : cart.itemsEn}</span>
                          </div>

                          <div className="flex justify-end gap-1.5 pt-0.5">
                            <button 
                              onClick={() => {
                                setAbandonedCarts(abandonedCarts.map(c => c.id === cart.id ? { ...c, status: "reminded" } : c));
                                const event = new CustomEvent("app-toast", { detail: language === 'bn' ? `সফলভাবে রিমাইন্ডার SMS পাঠানো হয়েছে ${cart.customer} কে!` : `Reminder notification SMS sent to ${cart.customer}!` });
                                window.dispatchEvent(event);
                              }}
                              className={`text-[10px] rounded-lg px-2.5 py-1 font-bold cursor-pointer border-0 transition ${cart.status === 'reminded' ? 'bg-[#063b6d] text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                            >
                              {cart.status === 'reminded' ? (language === 'bn' ? "🔔 রিমাইন্ডার প্রেরিত" : "🔔 Sent Again") : (language === 'bn' ? "📣 রিমাইন্ডার SMS" : "📣 Send SMS")}
                            </button>
                            <button 
                              onClick={() => {
                                setAbandonedCarts(abandonedCarts.map(c => c.id === cart.id ? { ...c, status: "recovered" } : c));
                                const event = new CustomEvent("app-toast", { detail: language === 'bn' ? `কার্টটি সফলভাবে রিকভারড চিহ্নিত হয়েছে!` : `Cart marked as recovered successfully!` });
                                window.dispatchEvent(event);
                              }}
                              className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2.5 py-1 font-bold cursor-pointer border-0 transition"
                            >
                              🟢 {language === 'bn' ? 'রিকভারড' : 'Recovered'}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Placeholder static counts indicator */}
                    <div className="text-center py-2 border-t border-dashed border-zinc-150 mt-2">
                      <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">
                        {language === 'bn' ? `+৪৮টি অবশিষ্ট পরিত্যক্ত সেশন ব্যাকগ্রাউন্ডে সংরক্ষিত` : `+48 older abandoned checkout logs archived`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Order Notification Bell on Admin Panel */}
            <div 
              ref={bellContainerRef}
              onMouseEnter={() => setAdminBellDropdownOpen(true)}
              onMouseLeave={() => setAdminBellDropdownOpen(false)}
              onClick={() => {
                setAdminBellDropdownOpen(!adminBellDropdownOpen);
                setMessagesDropdownOpen(false);
                setCartsDropdownOpen(false);
                setProfileDropdownOpen(false);
              }}
              className="flex items-center cursor-pointer select-none group sm:relative py-2"
              id="admin-realtime-notifications-bell"
            >
              <div className="relative p-2 rounded-full hover:bg-zinc-100 transition duration-150">
                <Bell size={20} className={`${unreadNotifications.length > 0 ? "text-[#f58220] animate-bounce" : "text-[#f58220]"} stroke-[2.2px] group-hover:scale-110 transition-transform`} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-extrabold text-[9px] h-4 w-4 rounded-full flex items-center justify-center shadow animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </div>

              {/* Admin Notification dropdown panel */}
              {adminBellDropdownOpen && (
                <div 
                  className="absolute top-[64px] sm:top-full left-4 right-4 sm:left-auto sm:right-[-8px] pt-3 sm:pt-4 w-auto sm:w-80 max-w-none sm:max-w-[340px] h-auto z-[9990]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white text-zinc-850 rounded-2xl shadow-2xl border border-zinc-200 py-3.5 px-4 text-left font-sans animate-in fade-in slide-in-from-top-3 duration-200 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                      <span className="text-xs font-black text-zinc-800 tracking-tight flex items-center gap-1.5">
                        <Bell size={13} className="text-[#f58220]" />
                        <span>{language === 'bn' ? `রিয়েল-টাইম নোটিফিকেশন (${unreadNotifications.length})` : `Live Alerts (${unreadNotifications.length})`}</span>
                      </span>
                      {unreadNotifications.length > 0 && (
                        <button 
                          onClick={() => setUnreadNotifications && setUnreadNotifications([])}
                          className="bg-transparent border-0 text-[10px] text-zinc-500 hover:text-[#f58220] font-black uppercase cursor-pointer"
                        >
                          {language === 'bn' ? "সব পঠিত" : "Clear All"}
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                      {unreadNotifications.length === 0 ? (
                        <div className="py-6 text-center space-y-1.5 text-zinc-400">
                          <span className="text-xl font-bold">🔔</span>
                          <p className="text-[11px] font-bold">
                            {language === 'bn' ? "নতুন কোনো অনলাইন অর্ডার নেই" : "No new online orders right now"}
                          </p>
                          <p className="text-[9px] text-zinc-400 max-w-[200px] mx-auto leading-relaxed">
                            {language === 'bn' ? "গ্রাহকেরা অর্ডার করলে এইখানে সাথে সাথে অ্যালার্ট বাজবে।" : "New client orders will trigger live auditory alert bells here."}
                          </p>
                        </div>
                      ) : (
                        unreadNotifications.map((order: any) => {
                          const orderAmt = currency === 'BDT' ? `৳${order.totalBDT.toLocaleString()}` : `$${order.totalUSD}`;
                          return (
                            <div key={order.id} className="bg-amber-50/40 hover:bg-amber-50 border border-amber-100/55 rounded-xl p-3 space-y-2.5 transition">
                              <div className="flex justify-between items-start gap-1">
                                <div className="text-left space-y-0.5">
                                  <strong className="text-xs text-zinc-900 block font-sans truncate max-w-[140px]">{order.customerInfo.name}</strong>
                                  <span className="text-[9.5px] text-zinc-400 font-mono block">{order.id} | {order.date}</span>
                                </div>
                                <span className="text-xs font-black font-mono text-[#f58220] shrink-0">{orderAmt}</span>
                              </div>

                              {/* Customer contact shortcut info layout */}
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span className="text-zinc-500 truncate max-w-[120px] font-mono font-semibold">{order.customerInfo.phone}</span>
                                <div className="flex items-center gap-1.5 font-bold">
                                  {/* Direct WhatsApp trigger button */}
                                  <a 
                                    href={`https://wa.me/${order.customerInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Assalamu Alaikum, I am the admin. I received your order ${order.id} and am checking to confirm it!`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded px-2 py-1 text-[9px] font-black uppercase whitespace-nowrap no-underline flex items-center justify-center cursor-pointer border-0"
                                    title="Contact on WhatsApp"
                                  >
                                    💬 WhatsApp
                                  </a>

                                  <button
                                    onClick={() => {
                                      setSelectedInvoiceOrder(order);
                                      setIsInvoiceModalOpen(true);
                                    }}
                                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded px-2 py-1 text-[9px] cursor-pointer font-black uppercase border-0 flex items-center justify-center"
                                  >
                                    Invoice 🖨️
                                  </button>
                                </div>
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

            {/* Profile badge */}
            <div className="sm:relative pl-1.5 sm:pl-2 border-l border-zinc-200" ref={profileContainerRef}>
              <button 
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setMessagesDropdownOpen(false);
                  setCartsDropdownOpen(false);
                }}
                className="flex items-center space-x-1.5 text-left border-0 bg-transparent hover:bg-zinc-50 rounded-xl p-1 -m-1 transition cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#063b6d] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  GB
                </div>
                <div className="text-left hidden md:block leading-none">
                  <span className="text-xs font-black text-zinc-900 block">Gadget Bazar</span>
                  <span className="text-[9px] font-semibold text-zinc-400 block mt-0.5">Master Admin</span>
                </div>
                <ChevronDown size={14} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute top-[64px] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 mt-3 sm:mt-4 w-auto sm:w-56 max-w-none sm:max-w-none bg-white border border-zinc-200 rounded-2xl shadow-2xl py-2 z-[9999] text-left font-sans animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-zinc-100 mb-1.5">
                    <p className="text-xs font-extrabold text-zinc-800 leading-tight">Gadget Bazar Admin</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-0.5">settlementregister@gmail.com</p>
                  </div>

                  <div className="space-y-0.5 px-1">
                    <button 
                      onClick={() => {
                        setActiveTab('dashboard');
                        setProfileDropdownOpen(false);
                        const event = new CustomEvent("app-toast", { detail: language === 'bn' ? "ড্যাশবোর্ডে আপনাকে স্বাগতম!" : "Switched to dashboard view" });
                        window.dispatchEvent(event);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 rounded-lg border-0 bg-transparent cursor-pointer flex items-center gap-2"
                    >
                      <span>📊</span>
                      <span>{language === 'bn' ? "ড্যাশবোর্ড ওভারভিউ" : "Dashboard Overview"}</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        const event = new CustomEvent("app-toast", { detail: language === 'bn' ? "সেলার প্রোফাইল সেটিংস লোড হচ্ছে..." : "Loading Master Admin settings..." });
                        window.dispatchEvent(event);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 rounded-lg border-0 bg-transparent cursor-pointer flex items-center gap-2"
                    >
                      <span>⚙️</span>
                      <span>{language === 'bn' ? "প্রোফাইল ও সেটিংস" : "Profile & Settings"}</span>
                    </button>

                    <button 
                      onClick={() => {
                        const event = new CustomEvent("app-toast", { detail: language === 'bn' ? "লাইভ স্টোর ভিউ লোড হচ্ছে..." : "Redirection to live storefront..." });
                        window.dispatchEvent(event);
                        setProfileDropdownOpen(false);
                        const shopBtn = document.querySelector('[id*="back-to-shop-button"]') || document.querySelector('button[id*="store"]');
                        if (shopBtn) (shopBtn as HTMLButtonElement).click();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-extrabold text-[#f58220] hover:bg-orange-50/50 rounded-lg border-0 bg-transparent cursor-pointer flex items-center gap-2"
                    >
                      <span>🛒</span>
                      <span>{language === 'bn' ? "লাইভ কাস্টমার স্টোর" : "Live Customer Store"}</span>
                    </button>

                    <div className="border-t border-zinc-100 my-1 pt-1">
                      <button 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          const event = new CustomEvent("app-toast", { detail: language === 'bn' ? "সফলভাবে লগআউট করা হয়েছে!" : "Successfully logged out from session!" });
                          window.dispatchEvent(event);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-extrabold text-red-600 hover:bg-red-50 rounded-lg border-0 bg-transparent cursor-pointer flex items-center gap-2"
                      >
                        <span>🚪</span>
                        <span>{language === 'bn' ? "লগ আউট করুন" : "Logout Session"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="p-4 md:p-6 flex-1 space-y-6">

          {/* Success messages alerts */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2.5 shadow-md text-xs sm:text-sm animate-bounce" id="alert-notif-toast">
              <CheckCircle className="text-emerald-500 h-5 w-5" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* SIMULATED CLIENT DEMO INJECTOR BANNER */}
          <div className="bg-gradient-to-r from-[#063b6d] to-[#04284d] rounded-2xl p-5 border border-[#0d4f91] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg pr-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-orange-400/10 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="space-y-1 text-center md:text-left relative z-10">
              <span className="bg-[#f58220] text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
                LIvE CLIENT DEMO SIMULATOR
              </span>
              <h2 className="text-lg font-extrabold text-white">
                {language === 'bn' ? "এক ক্লিকে কাল্পনিক ট্রাফিক এবং গ্রাহক অর্ডার ইনজেক্ট করুন" : "Inject Simulated Live Traffic & Customer Transactions"}
              </h2>
              <p className="text-xs text-zinc-300 max-w-xl font-sans">
                {language === 'bn' 
                  ? "গ্রাহকদের লাইভ অ্যাক্টিভিটি, ইনভয়েস জেনারেশন এবং ড্যাশবোর্ড বার-চার্ট গতিশীলভাবে পরীক্ষা করতে টেস্ট অর্ডার ডেমো ডাটা যুক্ত করুন।" 
                  : "Perfect for testing live dashboard graphs, total earnings values, customer stats, and inventory thresholds instantly."}
              </p>
            </div>
            <button 
              onClick={handleSimulateOrder}
              className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-black uppercase tracking-wider py-2.5 px-5 rounded-xl border-0 shadow cursor-pointer relative z-10 transition duration-150 transform hover:scale-[1.02]"
            >
              {language === 'bn' ? "ডেমো অর্ডার যুক্ত করুন" : "Infect Mock Transactions"}
            </button>
          </div>

          {/* Scroll Anchor for Active Content Viewport Focus */}
          <div id="admin-main-content-anchor" className="h-0 w-0 pointer-events-none" />

          <motion.div
            key={activeTab + "_" + categorySubTab + "_" + brandsSubTab + "_" + inhouseSubTab + "_" + vendorSubTab + "_" + offersDealsSubTab + "_" + notificationsSubTab + "_" + salesReportSubTab + "_" + customersSubTab + "_" + sellersSubTab + "_" + deliveryManSubTab + "_" + employeesSubTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6 text-left"
          >

          {/* ============== TAB 1: DASHBOARD OVERVIEW ============== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6" id="overview-dashboard-panel">
              
              {/* Header Title block */}
              <div className="text-left">
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Dashboard</h1>
                <p className="text-xs text-zinc-400 font-semibold mt-0.5">Welcome message.</p>
              </div>

              {/* Business Analytics Container */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                      <BarChart3 size={14} />
                    </div>
                    <span className="font-bold text-sm text-zinc-800">Business Analytics</span>
                  </div>
                  <div className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded px-2 py-1 flex items-center space-x-1 select-none">
                    <span>Overall statistics</span>
                    <ChevronDown size={11} />
                  </div>
                </div>

                {/* 4 PRIMARY STATISTICS BOXES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
                  <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">Total Sale</span>
                      <strong className="text-xl font-bold font-mono text-zinc-805 block leading-none pt-1">{stats.totalSale}</strong>
                    </div>
                    <div className="p-3 bg-red-100/50 rounded-xl text-red-500">
                      <Coins size={22} className="stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">Total Stores</span>
                      <strong className="text-xl font-bold font-mono text-zinc-805 block leading-none pt-1">{stats.totalStores}</strong>
                    </div>
                    <div className="p-3 bg-blue-100/50 rounded-xl text-blue-500">
                      <Store size={22} className="stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">Total Products</span>
                      <strong className="text-xl font-bold font-mono text-zinc-805 block leading-none pt-1">{stats.totalProducts}</strong>
                    </div>
                    <div className="p-3 bg-orange-100/50 rounded-xl text-orange-500">
                      <ShoppingBag size={22} className="stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="bg-zinc-50 hover:bg-zinc-100/70 p-4 rounded-xl border border-zinc-100 transition flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">Total Customers</span>
                      <strong className="text-xl font-bold font-mono text-zinc-805 block leading-none pt-1">{stats.totalCustomers}</strong>
                    </div>
                    <div className="p-3 bg-teal-100/50 rounded-xl text-teal-500">
                      <Users size={22} className="stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* 8 GRID STATUS CARDS PLOTTED WITH PIXEL PRECISION */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  {[
                    { label: "Pending", val: stats.pending, bg: "bg-[#fffbf2] border-[#fdecd5]", txt: "text-zinc-700", bullet: "bg-amber-500", valClr: "text-[#1f4172]" },
                    { label: "Confirmed", val: stats.confirmed, bg: "bg-[#f5fcf8] border-[#daf2e3]", txt: "text-zinc-700", bullet: "bg-green-500", valClr: "text-[#1f4172]" },
                    { label: "Packaging", val: stats.packaging, bg: "bg-[#fef7f6] border-[#fbdcd0]", txt: "text-zinc-700", bullet: "bg-red-400", valClr: "text-red-500" },
                    { label: "Out for delivery", val: stats.outForDelivery, bg: "bg-[#f5fbfc] border-[#daf0f5]", txt: "text-zinc-700", bullet: "bg-cyan-500", valClr: "text-emerald-600" },
                    { label: "Delivered", val: stats.delivered, bg: "bg-[#f5fcf8] border-[#daf2e3]", txt: "text-zinc-700", bullet: "bg-[#f58220]", valClr: "text-blue-700" },
                    { label: "Canceled", val: stats.canceled, bg: "bg-[#fdf9f9] border-[#fbd4d4]", txt: "text-zinc-700", bullet: "bg-zinc-400", valClr: "text-red-500" },
                    { label: "Returned", val: stats.returned, bg: "bg-[#fcf8fb] border-[#f2daeb]", txt: "text-[#d1007b]", bullet: "bg-[#fa42aa]", valClr: "text-[#1f4172]" },
                    { label: "Failed to delivery", val: stats.failed, bg: "bg-[#fffcfc] border-[#fbd4d4]", txt: "text-zinc-700", bullet: "bg-red-500", valClr: "text-red-600" }
                  ].map((sub, i) => (
                    <div key={i} className={`flex items-center justify-between px-3.5 py-3 ${sub.bg} border rounded-lg shadow-2xs`}>
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${sub.bullet}`} />
                        <span className={`text-[11.5px] font-bold ${sub.txt}`}>{sub.label}</span>
                      </div>
                      <strong className={`text-sm font-black font-sans ${sub.valClr}`}>{sub.val}</strong>
                    </div>
                  ))}
                </div>

              </div>

              {/* ADMIN WALLET LAYOUT CONTRASTS */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-left space-y-4">
                <div className="flex items-center space-x-2 pb-1 border-b border-zinc-100">
                  <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                    <Coins size={14} />
                  </div>
                  <span className="font-bold text-sm text-zinc-800">Admin Wallet</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left big block (col-span-5) */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-[#063b6d] to-[#04213f] rounded-xl p-6 text-white flex flex-col justify-between shadow-xs min-h-[160px]">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-black text-opacity-80 tracking-widest text-[#a1c2ff]">In-House Earning</span>
                        <strong className="block text-2xl font-black font-sans text-white tracking-tight mt-1">
                          ৳{stats.inHouseEarning.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-white/10 rounded-lg text-white">
                        <Coins size={20} />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-300 leading-none">Calculated dynamically based on processing invoices</p>
                  </div>

                  {/* Right small blocks (col-span-7) */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide block">Commission Earned</span>
                        <strong className="text-md font-black text-zinc-800 block">
                          ৳{stats.commissionEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <span className="p-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold">৳</span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide block">Delivery Charge Earned</span>
                        <strong className="text-md font-black text-zinc-800 block">
                          ৳{BASE_STATS.deliveryChargeEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <span className="p-2 bg-orange-50 text-orange-500 rounded-lg text-xs font-bold">🚚</span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide block">Total Tax Collected</span>
                        <strong className="text-md font-black text-zinc-800 block">
                          ৳{BASE_STATS.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <span className="p-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold">💸</span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide block">Pending Amount</span>
                        <strong className="text-md font-black text-zinc-800 block">
                          ৳{BASE_STATS.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <span className="p-2 bg-teal-50 text-teal-500 rounded-lg text-xs font-bold">⏳</span>
                    </div>

                  </div>

                </div>

              </div>

              {/* EARNING STATISTICS (RECHARTS BAR CHART REPLICATED IN PURE RICH RESPONSIVE CSS) */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-100">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                      <BarChart3 size={14} />
                    </div>
                    <span className="font-bold text-sm text-zinc-800">Earning Statistics</span>
                  </div>
                  
                  {/* Button tabs */}
                  <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs font-bold self-start">
                    <button className="px-3.5 py-1 bg-[#1f4172] text-white rounded-md border-0 uppercase text-[9.5px] font-black cursor-pointer">This Year</button>
                    <button className="px-3.5 py-1 text-zinc-500 bg-transparent hover:text-zinc-800 border-0 uppercase text-[9.5px] font-black cursor-pointer">This Month</button>
                    <button className="px-3.5 py-1 text-zinc-500 bg-transparent hover:text-zinc-800 border-0 uppercase text-[9.5px] font-black cursor-pointer">This Week</button>
                  </div>
                </div>

                {/* Color Legends */}
                <div className="flex items-center flex-wrap gap-4 text-xs font-semibold select-none pt-1">
                  <span className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
                    <span>In-house Earning</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded bg-indigo-500" />
                    <span>Vendor Earning</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded bg-orange-400" />
                    <span>Commission Earning</span>
                  </span>
                </div>

                {/* CHART CONTAINER CANVAS */}
                <div className="relative pt-6">
                  
                  {/* Floating interactive tooltip */}
                  {hoveredMonth !== null && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#063b6d] text-white px-3 py-2 rounded-lg text-[10.5px] shadow-xl border border-[#0d5395] rounded-xl flex items-center space-x-3.5 font-sans z-30 transition-all">
                      <div>
                        <strong className="block text-orange-400 uppercase tracking-wider">{monthlyRevenueData[hoveredMonth].name} Revenue</strong>
                        <span className="block text-[9.5px] text-zinc-100 mt-1">In-house: ৳{monthlyRevenueData[hoveredMonth].inHouse.toLocaleString()}</span>
                      </div>
                      <div className="border-l border-[#0d5395] pl-3">
                        <span className="block text-[9.5px]">Vendor: ৳{monthlyRevenueData[hoveredMonth].vendor.toLocaleString()}</span>
                        <span className="block text-[9.5px]">Commission: ৳{monthlyRevenueData[hoveredMonth].commission.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="h-44 w-full flex items-end justify-between font-mono font-bold text-[9.5px] text-zinc-400 relative pt-1" id="custom-recharts-bar-canvas">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-x-0 top-0 h-px bg-zinc-100 border-dashed" />
                    <div className="absolute inset-x-0 top-[25%] h-px bg-zinc-100 border-dashed" />
                    <div className="absolute inset-x-0 top-[50%] h-px bg-zinc-100 border-[#eaeaea]" />
                    <div className="absolute inset-x-0 top-[75%] h-px bg-zinc-100 border-dashed" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-zinc-350" />

                    {/* Bars Grid mapping */}
                    {monthlyRevenueData.map((data, idx) => {
                      // Calculate height ratio based on maximum sales limit (180k)
                      const maxLimit = 180000;
                      const hInHouse = Math.max(3, Math.round((data.inHouse / maxLimit) * 100));
                      // Scale vendor and commission up slightly for visibility comparison
                      const hVendor = Math.max(3, Math.round(((data.vendor * 15) / maxLimit) * 100));
                      const hCommission = Math.max(3, Math.round(((data.commission * 18) / maxLimit) * 100));

                      return (
                        <div 
                          key={idx} 
                          className="flex-1 flex flex-col items-center h-full group relative cursor-pointer pt-3"
                          onMouseEnter={() => setHoveredMonth(idx)}
                          onMouseLeave={() => setHoveredMonth(null)}
                        >
                          {/* Triple bar group */}
                          <div className="flex-1 flex items-end justify-center space-x-1.5 w-full px-1.5 md:px-3 relative z-10 h-full">
                            <div className="bg-emerald-500 rounded-t w-1.5 md:w-3 hover:opacity-85 transition-all duration-300" style={{ height: `${hInHouse}%` }} />
                            <div className="bg-indigo-500 rounded-t w-1.5 md:w-3 hover:opacity-85 transition-all duration-300" style={{ height: `${hVendor}%` }} />
                            <div className="bg-orange-400 rounded-t w-1.5 md:w-3 hover:opacity-85 transition-all duration-300" style={{ height: `${hCommission}%` }} />
                          </div>
                          <span className="text-zinc-650 tracking-wider text-[10px] mt-1.5 select-none">{data.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* THREE BOTTOM LEADERBOARDS COLUMN TRIO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Panel 1: Top Customer */}
                <div className="bg-white border rounded-xl p-4.5 shadow-xs text-left text-xs leading-normal">
                  <h3 className="font-extrabold text-zinc-900 border-b pb-2 mb-3 tracking-wide">Top Customer</h3>
                  <div className="space-y-3">
                    {[
                      { name: "dipu", ord: 4 },
                      { name: "Md", ord: 4 },
                      { name: "Abidul", ord: 3 },
                      { name: "Dulal", ord: 2 },
                      { name: "Masuk", ord: 2 }
                    ].map((cust, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-zinc-50 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-zinc-100 border text-zinc-600 rounded-full flex items-center justify-center font-bold">
                            {cust.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong className="block text-zinc-900 font-bold">{cust.name}</strong>
                            <span className="block text-[10px] text-zinc-400">VIP Customer Account</span>
                          </div>
                        </div>
                        <span className="bg-[#e2effd] text-[#1f4172] font-black text-[10px] px-2.5 py-0.5 rounded-full">Orders : {cust.ord}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 2: Popular stores */}
                <div className="bg-white border rounded-xl p-4.5 shadow-xs text-left text-xs leading-normal">
                  <h3 className="font-extrabold text-zinc-900 border-b pb-2 mb-3 tracking-wide">Most Popular Stores</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Verse Shop", hearts: 5, color: "bg-red-50 text-red-500" },
                      { name: "RSm", hearts: 4, color: "bg-blue-50 text-blue-500" },
                      { name: "Electronics", hearts: 1, color: "bg-amber-50 text-amber-500" },
                      { name: "Fashion Factory", hearts: 1, color: "bg-emerald-50 text-emerald-500" }
                    ].map((st, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-zinc-50 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 ${st.color} font-bold text-center flex items-center justify-center rounded-lg text-xs`}>
                            🏫
                          </div>
                          <strong className="text-zinc-805 font-extrabold block">{st.name}</strong>
                        </div>
                        <div className="flex items-center space-x-1 font-bold text-rose-500">
                          <Heart size={12} className="fill-rose-500 stroke-none" />
                          <span>{st.hearts}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 3: Top Selling Store */}
                <div className="bg-white border rounded-xl p-4.5 shadow-xs text-left text-xs leading-normal">
                  <h3 className="font-extrabold text-[#111111] border-b pb-2 mb-3 tracking-wide">Top Selling Store</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Fashion Factory", amount: 5415.00 },
                      { name: "RSm", amount: 1224.00 },
                      { name: "Verse Shop", amount: 350.00 },
                      { name: "bazar", amount: 0.00 },
                      { name: "Whilemina Casey", amount: 0.00 }
                    ].map((sell, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-zinc-50 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-zinc-100 border text-zinc-500 rounded-full flex items-center justify-center text-xs">
                            🖼️
                          </div>
                          <strong className="text-zinc-800 font-extrabold block">{sell.name}</strong>
                        </div>
                        <div className="flex items-center space-x-2.5">
                          <strong className="text-zinc-900 font-black font-mono">৳{sell.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                          <ShoppingCart size={13} className="text-zinc-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============== TAB 2: INTERACTIVE CUSTOMER ORDERS ============== */}
          {activeTab === 'orders' && (() => {
            const displayOrders = orders.filter(order => {
              if (orderStatusFilter === 'all') return true;
              if (orderStatusFilter === 'pending') return order.status === 'placed';
              if (orderStatusFilter === 'confirmed') return order.status === 'processing';
              if (orderStatusFilter === 'packaging') return order.status === 'shipped';
              if (orderStatusFilter === 'shipped') return order.status === 'shipped';
              if (orderStatusFilter === 'delivered') return order.status === 'delivered';
              return order.status === orderStatusFilter;
            });

            return (
              <div className="space-y-5 text-left" id="orders-registry-panel">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-905 capitalize">
                      Customer Invoices Registry - {orderStatusFilter === 'all' ? 'All' : orderStatusFilter} Status
                    </h1>
                    <p className="text-xs text-zinc-400">Track incoming client deliveries, update logistics status pipelines, and review payment types.</p>
                  </div>
                </div>

                {displayOrders.length === 0 ? (
                  <div className="bg-white border border-zinc-200 rounded-xl p-20 text-center space-y-4">
                    <div className="h-12 w-12 bg-orange-100 text-[#f58220] rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag size={22} />
                    </div>
                    <strong className="block text-zinc-700">No Orders with status '{orderStatusFilter}' found in current session.</strong>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto">Use the simulator injector trigger at the top panel or select another status filter!</p>
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-55 bg-indigo-50/20 text-indigo-900 border-b border-zinc-200 font-extrabold uppercase text-[10.5px] select-none tracking-wide">
                            <th className="px-2.5 py-3 hover:bg-indigo-50/10">Order ID</th>
                            <th className="px-2.5 py-3 hover:bg-indigo-50/10">Customer Name</th>
                            <th className="px-2.5 py-3 hover:bg-indigo-50/10">Billing Date</th>
                            <th className="px-2.5 py-3 hover:bg-indigo-50/10">Delivery Cargo Address</th>
                            <th className="px-2.5 py-3 hover:bg-indigo-50/10">Amount Billing</th>
                            <th className="px-2.5 py-3 text-center">Logistics Status</th>
                            <th className="px-2.5 py-3 text-center">Action Decision</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {displayOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-zinc-50/50 transition">
                              <td className="px-2.5 py-3 font-black text-[#f58220]">{order.id}</td>
                              <td className="px-2.5 py-3 leading-normal">
                                <strong className="block text-zinc-800 font-bold max-w-[120px] truncate" title={order.customerInfo.name}>{order.customerInfo.name}</strong>
                                <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{order.customerInfo.phone}</span>
                                {(() => {
                                  const rsk = analyzeOrderRisk(
                                    order.customerInfo.phone, 
                                    order.customerInfo.name, 
                                    order.totalBDT, 
                                    order.customerInfo.paymentMethod
                                  );
                                  if (rsk.riskScore > 30) {
                                    return (
                                      <span 
                                        className={`inline-flex items-center space-x-1 mt-1 text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded ${
                                          rsk.riskLevel === 'CRITICAL' ? 'bg-rose-50 text-red-650 border border-rose-200' :
                                          rsk.riskLevel === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                          'bg-zinc-100 text-zinc-700'
                                        }`} 
                                        title={rsk.matchedThreats.join(" | ")}
                                      >
                                        <span>⚠ {rsk.riskLevel}</span>
                                      </span>
                                    );
                                  }
                                  return (
                                    <span className="inline-flex items-center space-x-1 mt-1 text-[8.5px] text-emerald-700 font-black uppercase">
                                      <span>✓ Clean</span>
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-2.5 py-3 text-zinc-600 font-mono text-[11px] leading-relaxed max-w-[100px] break-words">{order.date}</td>
                              <td className="px-2.5 py-3">
                                <div className="max-w-[150px] truncate font-medium text-zinc-650 text-xs" title={order.customerInfo.address}>
                                  {order.customerInfo.address}
                                </div>
                              </td>
                              <td className="px-2.5 py-3">
                                <strong className="font-mono text-zinc-900 block">৳{order.totalBDT.toLocaleString()}</strong>
                                <span className="block text-[9.5px] text-zinc-400 font-medium">
                                  USD ${order.totalUSD} • {order.customerInfo.paymentMethod === 'Cash on Delivery' ? 'COD' : order.customerInfo.paymentMethod}
                                </span>
                              </td>
                              <td className="px-2.5 py-3 text-center">
                                <span className={`px-2.5 py-1 text-[10.5px] font-black uppercase rounded-full inline-block ${
                                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                  'bg-amber-50 text-amber-700 border border-[#fdecd5]'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-2.5 py-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center space-x-1">
                                  {order.status !== 'delivered' && (
                                    <button 
                                      onClick={() => {
                                        const nextStatus = order.status === 'placed' ? 'processing' : order.status === 'processing' ? 'shipped' : 'delivered';
                                        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
                                        
                                        // Trigger custom auto SMS notification
                                        if (nextStatus === 'shipped' || nextStatus === 'delivered') {
                                          triggerOrderSmsNotification(order, nextStatus);
                                        }
                                        
                                        setSuccessMsg(`Dispatched order ${order.id} to '${nextStatus}' stage.`);
                                        setTimeout(() => setSuccessMsg(""), 3050);
                                      }}
                                      className="bg-zinc-100 hover:bg-[#f58220] border hover:border-0 hover:text-white px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition text-zinc-600 shadow-sm shrink-0"
                                    >
                                      Dispatch &gt;
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setSelectedInvoiceOrder(order);
                                      setIsInvoiceModalOpen(true);
                                    }}
                                    className="bg-[#f58220]/10 hover:bg-[#f58220] border-0 hover:text-white px-2 py-1.5 rounded cursor-pointer text-[#f58220] font-black text-[9.5px] uppercase flex items-center justify-center space-x-1 transition shadow-sm shrink-0"
                                    title="Modern Invoice Generator"
                                  >
                                    <Printer size={11} />
                                    <span>{language === 'bn' ? "ইনভয়েস" : "Invoice"}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ============== TAB 3: CASHIER POS WORKSPACE (= 100% REPLICA ADVANTAGE) ============== */}
          {activeTab === 'pos' && (
            <POSManager
              products={products}
              setProducts={setProducts}
              orders={orders}
              setOrders={setOrders}
              language={language}
              currency={currency}
            />
          )}

          {/* ============== TAB 4: CATEGORY CONFIG SETUP ============== */}
          {activeTab === 'category-setup' && (
            <div className="space-y-6 text-left" id="category-panel">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-905">
                  {categorySubTab === 'sub-categories' ? 'Sub Category Setup' : 
                   categorySubTab === 'sub-sub-categories' ? 'Sub Sub Category Setup' : 
                   'Category Setup and Attributes'}
                </h1>
                <p className="text-xs text-zinc-400">
                  {categorySubTab === 'sub-categories' ? 'Configure level-2 classification options.' : 
                   categorySubTab === 'sub-sub-categories' ? 'Configure level-3 deep taxonomy filters.' : 
                   'Create global category definitions across Nabik Bazar warehouses.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Form to append category / sub / sub-sub */}
                {categorySubTab === 'sub-categories' ? (
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3.5">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Add New Active Sub Category Tag</h3>
                    
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] uppercase font-black text-zinc-400 block">Sub Category Key Slug</label>
                      <input 
                        type="text" 
                        placeholder="e.g. smart-watches" 
                        value={newSubCatName}
                        onChange={(e) => setNewSubCatName(e.target.value)}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                      />
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (!newSubCatName) return;
                        setSubCategoryList(prev => [...prev, newSubCatName.toLowerCase()]);
                        setNewSubCatName("");
                        setSuccessMsg(`Registered level-2 category '${newSubCatName}' successfully.`);
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                      className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-bold px-4 py-2 border-0 rounded cursor-pointer transition"
                    >
                      Save Sub Category
                    </button>
                  </div>
                ) : categorySubTab === 'sub-sub-categories' ? (
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3.5">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Add New Active Sub Sub Category Tag</h3>
                    
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] uppercase font-black text-zinc-400 block">Sub Sub Category Key Slug</label>
                      <input 
                        type="text" 
                        placeholder="e.g. optical-sensor-smartwatch" 
                        value={newSubSubCatName}
                        onChange={(e) => setNewSubSubCatName(e.target.value)}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                      />
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (!newSubSubCatName) return;
                        setSubSubCategoryList(prev => [...prev, newSubSubCatName.toLowerCase()]);
                        setNewSubSubCatName("");
                        setSuccessMsg(`Registered level-3 category '${newSubSubCatName}' successfully.`);
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                      className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-bold px-4 py-2 border-0 rounded cursor-pointer transition"
                    >
                      Save Sub Sub Category
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3.5">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Add New Active Category Tag</h3>
                    
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] uppercase font-black text-zinc-400 block">Category Key Slug</label>
                      <input 
                        type="text" 
                        placeholder="e.g. fashion-accessories" 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                      />
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (!newCatName) return;
                        setCategoryList(prev => [...prev, newCatName.toLowerCase()]);
                        setNewCatName("");
                        setSuccessMsg(`Registered '${newCatName}' into central catalog categories.`);
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                      className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-bold px-4 py-2 border-0 rounded cursor-pointer transition"
                    >
                      Save Category
                    </button>
                  </div>
                )}

                {/* List categories */}
                {categorySubTab === 'sub-categories' ? (
                  <div className="bg-white border rounded-xl p-5 shadow-sm text-xs">
                    <h3 className="font-extrabold text-zinc-909 border-b pb-2 mb-3">Active Sub Categories ({subCategoryList.length})</h3>
                    <div className="divide-y">
                      {subCategoryList.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5">
                          <strong className="uppercase tracking-wider font-bold text-zinc-700">{cat}</strong>
                          <span className="bg-cyan-50 text-cyan-650 px-2 py-0.5 rounded text-[10.5px]">Level-2 classification</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : categorySubTab === 'sub-sub-categories' ? (
                  <div className="bg-white border rounded-xl p-5 shadow-sm text-xs">
                    <h3 className="font-extrabold text-zinc-909 border-b pb-2 mb-3">Active Sub Sub Categories ({subSubCategoryList.length})</h3>
                    <div className="divide-y">
                      {subSubCategoryList.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5">
                          <strong className="uppercase tracking-wider font-bold text-zinc-700">{cat}</strong>
                          <span className="bg-purple-50 text-purple-650 px-2 py-0.5 rounded text-[10.5px]">Level-3 classification</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-xl p-5 shadow-sm text-xs">
                    <h3 className="font-extrabold text-zinc-909 border-b pb-2 mb-3">Active Category Tags ({categoryList.length})</h3>
                    <div className="divide-y">
                      {categoryList.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5">
                          <strong className="uppercase tracking-wider font-bold text-zinc-700">{cat}</strong>
                          <span className="bg-cyan-50 text-cyan-650 px-2 py-0.5 rounded text-[10.5px]">Warehouse active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============== TAB 5: BRANDS SETUP ============== */}
          {activeTab === 'brands' && (
            <div className="space-y-6 text-left" id="brands-panel">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-905">Brands & Seals Setup</h1>
                <p className="text-xs text-zinc-400">Configure partner company brands and manufacturing outlets.</p>
              </div>

              <div className={`grid grid-cols-1 ${(brandsSubTab === 'add' || brandsSubTab === 'list') ? '' : 'md:grid-cols-2'} gap-5 font-sans`}>
                {/* Create design brand form */}
                {(brandsSubTab === 'add' || brandsSubTab === 'all' || !brandsSubTab) && (
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3.5">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Add Registered Maker Brand</h3>
                    
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] uppercase font-black text-zinc-400 block">Brand Title Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sony" 
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                      />
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (!newBrandName) return;
                        setBrandList(prev => [...prev, newBrandName]);
                        setNewBrandName("");
                        setSuccessMsg(`Brand logo registered. Added '${newBrandName}' list.`);
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                      className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-bold px-4 py-2 border-0 rounded cursor-pointer transition text-center"
                    >
                      Submit Brand registration
                    </button>
                  </div>
                )}

                {/* List registered partner brands */}
                {(brandsSubTab === 'list' || brandsSubTab === 'all' || !brandsSubTab) && (
                  <div className="bg-white border rounded-xl p-5 shadow-sm text-xs">
                    <h3 className="font-extrabold text-[#111] border-b pb-2 mb-3">Partner Seller Brands ({brandList.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {brandList.map((brand, idx) => (
                        <div key={idx} className="border border-zinc-100 rounded-lg p-2.5 flex items-center space-x-2.5 bg-zinc-50 hover:bg-zinc-100 transition">
                          <span className="text-sm">💎</span>
                          <strong className="font-bold text-zinc-805">{brand}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============== TAB 6: IN-HOUSE PRODUCTS SPECIFICATIONS DATABASE ============== */}
          {activeTab === 'in-house' && (
            <div className="space-y-5 text-left" id="products-catalog-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-zinc-200">
                <div>
                  <h1 className="text-lg font-bold text-zinc-900 leading-tight">
                    {inhouseSubTab === 'add' ? "Register Bespoke Item Catalog" :
                     inhouseSubTab === 'bulk' ? "Bulk Inventory Import Engine" :
                     "In-house Products Warehouse Catalog"}
                  </h1>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    {inhouseSubTab === 'add' ? "Manually key-in a single high-quality product configuration with custom pricing." :
                     inhouseSubTab === 'bulk' ? "Batch upload inventory data using pasteable CSV templates or bulk JSON lines." :
                     "Quickly adjust stock units, edit premium pricing, or register custom items."}
                  </p>
                </div>
                {inhouseSubTab === 'list' && (
                  <button 
                    onClick={() => {
                      setInhouseSubTab('add');
                      setIsAddingNew(true);
                    }}
                    className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-black uppercase tracking-wider py-2.5 px-4.5 rounded-xl border-0 shadow cursor-pointer transition shrink-0"
                  >
                    Add Bespoke Item +
                  </button>
                )}
              </div>

              {/* Form block for manually adding single product */}
              {inhouseSubTab === 'add' && (
                <form onSubmit={handleCreateProduct} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4 max-w-2xl font-sans">
                  <h3 className="font-extrabold text-zinc-900 pb-1.5 border-b uppercase text-xs text-zinc-400 tracking-wider">
                    {editingProduct ? `Edit product specifications: ${editingProduct.id}` : "Register Custom Bespoke Product"}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3.5 text-xs text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">Slug Name (English)</label>
                      <input 
                        type="text" 
                        required
                        value={formProduct.name}
                        onChange={(e) => setFormProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220] bg-white text-zinc-805" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">পণ্য ক্যাটাগরি নাম (বাংলা)</label>
                      <input 
                        type="text" 
                        value={formProduct.nameBn}
                        onChange={(e) => setFormProduct(prev => ({ ...prev, nameBn: e.target.value }))}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220] bg-white text-zinc-805" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">Category Tag</label>
                      <select 
                        value={formProduct.category}
                        onChange={(e) => setFormProduct(prev => ({ ...prev, category: e.target.value as Category }))}
                        className="w-full bg-white border px-2.5 py-2 rounded focus:outline-none focus:border-[#f58220]"
                      >
                        <option value="tshirt">T-Shirt (পোশাক)</option>
                        <option value="laptop">Laptop (ল্যাপটপ)</option>
                        <option value="appliances">Appliances (গৃহস্থালী সরঞ্জাম)</option>
                        <option value="gadgets">Redmi Powerbank (গ্যাজেটস)</option>
                        <option value="watches">Smart Watch (ঘড়ি)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">Price BDT (৳)</label>
                      <input 
                        type="number" 
                        required
                        value={formProduct.priceBDT}
                        onChange={(e) => setFormProduct(prev => ({ ...prev, priceBDT: Number(e.target.value), priceUSD: Number((Number(e.target.value)/115).toFixed(2)) }))}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">Initial Stock units</label>
                      <input 
                        type="number" 
                        required
                        value={formProduct.stock}
                        onChange={(e) => setFormProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-left">
                    <label className="text-[10px] uppercase font-black text-zinc-500">Product Splash Image</label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                      <div className="md:col-span-3">
                        <input 
                          type="text" 
                          placeholder="Or paste direct image URL (https://...)" 
                          value={formProduct.image}
                          onChange={(e) => setFormProduct(prev => ({ ...prev, image: e.target.value }))}
                          className="w-full border px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#f58220] text-xs font-mono" 
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="flex items-center justify-center space-x-1.5 bg-zinc-900 hover:bg-zinc-850 text-white font-extrabold text-[11px] py-2 px-3 rounded-lg cursor-pointer transition select-none shadow text-center h-full border border-zinc-800">
                          <svg className="w-4 h-4 text-[#f58220]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                          </svg>
                          <span>{language === 'bn' ? 'ছবি আপলোড' : 'Upload File'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setFormProduct(prev => ({ ...prev, image: ev.target.result as string }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>

                    {/* Compact Drag & Drop & Upload Preview Panel */}
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setFormProduct(prev => ({ ...prev, image: ev.target.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border border-dashed border-zinc-300 rounded-xl p-4 text-center cursor-pointer hover:bg-orange-50/10 transition group"
                    >
                      {formProduct.image ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-left">
                            <img src={formProduct.image} alt="Spec file preview" className="w-12 h-12 object-cover rounded-lg border border-zinc-200" referrerPolicy="no-referrer" />
                            <div>
                              <span className="block text-[11px] font-bold text-emerald-600">✓ Image Loaded Successfully</span>
                              <span className="text-[9px] text-zinc-400 font-mono">Ready to be saved into local storage.</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormProduct(prev => ({ ...prev, image: "" }))}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-transparent border-0 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-zinc-400 py-1 flex flex-col items-center justify-center space-y-1">
                          <p className="text-[10.5px] font-bold text-zinc-600 leading-none">
                            {language === 'bn' ? 'ড্র্যাগ অ্যান্ড ড্রপ বা ফোন/পিসির ছবি এখানে ছাড়ুন' : 'Drag & Drop product image here'}
                          </p>
                          <p className="text-[9px] text-zinc-400">Supports JPEG, PNG, WEBP, or Base64 formats</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button 
                      type="submit"
                      className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-bold py-2.5 px-5 rounded-lg cursor-pointer border-0 shadow"
                    >
                      {editingProduct ? "Update Product" : "Save Specifications Spec"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setInhouseSubTab('list');
                        setEditingProduct(null);
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 border text-xs font-bold py-2.5 px-5 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Bulk inventory import utility */}
              {inhouseSubTab === 'bulk' && (
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4 font-sans max-w-3xl">
                  <div className="border bg-zinc-50/50 rounded-lg p-4 text-xs leading-relaxed text-zinc-650">
                    <h4 className="font-extrabold text-zinc-900 mb-1">💡 Excel or CSV formatting layout rules:</h4>
                    <p>Provide comma-separated values matching headings: <code className="bg-zinc-100 px-1 py-0.5 rounded text-[#f58220]">id,name,nameBn,priceBDT,category,stock,image</code></p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="text-[10px] uppercase font-black text-zinc-400 block">Copy paste raw CSV lines here</label>
                    <textarea 
                      rows={6}
                      placeholder="T39,Razer BlackWidow,রেজার ব্ল্যাকউইডো,9500,gadgets,48,https://images.unsplash.com/photo-1595225476474-87563907a212&#10;T40,Premium Royal Linen,রাজকীয় প্রিমিয়াম লিনেন,3200,tshirt,95,https://images.unsplash.com/photo-1521572267360-ee0c2909d518"
                      id="bulk-csv-textarea"
                      className="w-full font-mono border px-3 py-2 rounded focus:outline-none focus:border-[#f58220] bg-white text-zinc-800 placeholder-zinc-350"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const area = document.getElementById("bulk-csv-textarea") as HTMLTextAreaElement;
                        if (!area) return;
                        const defaultCSV = "T39,Razer BlackWidow Keyboard,রেজার কিবোর্ড,9500,gadgets,48,https://images.unsplash.com/photo-1595225476474-87563907a212\nT40,Premium Royal Linen Shirt,রাজকীয় সুতি শার্ট,3200,tshirt,95,https://images.unsplash.com/photo-1521572267360-ee0c2909d518";
                        area.value = defaultCSV;
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer"
                    >
                      Load CSV Template
                    </button>
                    <button
                      onClick={() => {
                        const area = document.getElementById("bulk-csv-textarea") as HTMLTextAreaElement;
                        if (!area || !area.value) {
                          alert("Please paste valid CSV lines first!");
                          return;
                        }
                        const lines = area.value.split("\n").filter(l => l.trim().length > 0);
                        let addedCount = 0;
                        const newProds: Product[] = [];
                        
                        lines.forEach(line => {
                          const cols = line.split(",").map(c => c.trim());
                          if (cols.length >= 5) {
                            const [id, name, nameBn, priceBDT, category, stockVal, imageVal] = cols;
                            newProds.push({
                              id: id || `T${Date.now().toString().slice(-4)}`,
                              name: name || "Unnamed Bulk Product",
                              nameBn: nameBn || "নামবিহীন পণ্য",
                              priceBDT: Number(priceBDT) || 1200,
                              priceUSD: Number(((Number(priceBDT) || 1200) / 115).toFixed(2)),
                              category: (category as Category) || "gadgets",
                              stock: Number(stockVal) || 20,
                              image: imageVal || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400",
                              rating: 4.8,
                              description: "Premium catalog bulk item.",
                              descriptionBn: "প্রিমিয়াম ক্যাটালগ বাল্ক পণ্য।",
                              reviewsCount: 15,
                              features: ["Imported quality", "High durability"],
                              featuresBn: ["আমদানিকৃত কোয়ালিটি", "উচ্চ স্থায়িত্ব"]
                            });
                            addedCount++;
                          }
                        });

                        if (newProds.length > 0) {
                          setProducts(prev => [...newProds, ...prev]);
                          setInhouseSubTab('list');
                          setSuccessMsg(`Successfully parsed and bulk-imported ${addedCount} products!`);
                          setTimeout(() => setSuccessMsg(""), 3500);
                        } else {
                          alert("Columns formatting mismatch. Check row structure.");
                        }
                      }}
                      className="bg-[#0a457c] hover:bg-[#052b52] text-white text-xs font-bold px-5 py-2.5 rounded-lg cursor-pointer border-0 shadow"
                    >
                      Process & Bulk Import
                    </button>
                  </div>
                </div>
              )}

              {/* Products Table (list selection, or standard backoff) */}
              {(inhouseSubTab === 'list' || inhouseSubTab === 'all' || !inhouseSubTab) && (
                <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-650 border-b font-extrabold uppercase text-[10.5px]">
                          <th className="p-4">Visual Thumbnail</th>
                          <th className="p-4">Specification Details</th>
                          <th className="p-4">Warehouse Category</th>
                          <th className="p-4">Premium pricing</th>
                          <th className="p-4 text-center">Remaining Stock units</th>
                          <th className="p-4 text-center">Operational Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-50/50 transition">
                            <td className="p-4 shrink-0">
                              <img src={p.image} className="w-12 h-12 object-cover border rounded-lg shadow-2xs" alt="" referrerPolicy="no-referrer" />
                            </td>
                            <td className="p-4 leading-normal">
                              <strong className="block text-zinc-900 text-sm font-bold">{p.name}</strong>
                              <span className="block text-[11px] text-zinc-400 font-mono mt-0.5">{p.id} • Rating: {p.rating} ⭐</span>
                            </td>
                            <td className="p-4">
                              <span className="bg-[#fdf3eb] text-[#f58220] px-2 py-0.5 rounded uppercase font-semibold text-[10px]">{p.category}</span>
                            </td>
                            <td className="p-4">
                              <strong className="font-mono text-zinc-800 text-sm block">৳{p.priceBDT.toLocaleString()}</strong>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">USD ${p.priceUSD}</span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center space-x-2">
                                <button 
                                  onClick={() => updateProductStock(p.id, -1)}
                                  className="bg-zinc-100 hover:bg-zinc-200 h-5 w-5 rounded font-black flex items-center justify-center cursor-pointer border-0 text-[11px]"
                                >-</button>
                                <strong className={`font-mono text-sm leading-none ${p.stock <= 5 ? "text-amber-500 font-black animate-pulse" : "text-zinc-700"}`}>
                                  {p.stock} Units
                                </strong>
                                <button 
                                  onClick={() => updateProductStock(p.id, 5)}
                                  className="bg-zinc-100 hover:bg-zinc-200 h-5 w-5 rounded font-black flex items-center justify-center cursor-pointer border-0 text-[11px]"
                                >+</button>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button 
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setFormProduct({
                                      name: p.name, nameBn: p.nameBn, category: p.category, priceBDT: p.priceBDT, priceUSD: p.priceUSD, stock: p.stock, image: p.image
                                    });
                                    setInhouseSubTab('add');
                                    setIsAddingNew(true);
                                  }}
                                  className="bg-zinc-100 hover:bg-zinc-200 p-2 rounded text-zinc-655"
                                  title="Edit Specifications"
                                >
                                  📝
                                </button>
                                <button 
                                  onClick={() => {
                                    requestDeletion(
                                      "প্রোডাক্ট ডিলিট নিশ্চিতকরণ",
                                      "Confirm Product Deletion",
                                      `আপনি কি নিশ্চিতভাবেই '${p.name}' প্রোডাক্টটি ডিলিট করতে চান?`,
                                      `Are you sure you want to permanently discard the product '${p.name}'?`,
                                      () => {
                                        setProducts(prev => prev.filter(it => it.id !== p.id));
                                        setSuccessMsg("Product registration discarded.");
                                        setTimeout(() => setSuccessMsg(""), 3000);
                                      }
                                    );
                                  }}
                                  className="bg-zinc-100 hover:bg-red-50 hover:text-red-600 p-2 rounded text-zinc-655"
                                  title="Discard"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============== TAB 7: MESSAGES & COMMUNICATIONS QUEUE ============== */}
          {activeTab === 'messages' && (
            <div className="space-y-6 text-left" id="communications-queue-panel">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-905">Customer Communications Inbox</h1>
                <p className="text-xs text-zinc-400">Review WhatsApp live desk questions, support tickets, and business queries.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
                
                {/* Mail List (col-span-7) */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="bg-white border rounded-xl p-4 shadow-2xs flex items-center justify-between select-none">
                    <span className="font-bold text-xs uppercase tracking-wide text-zinc-400">Incoming Feedbacks inbox</span>
                    <span className="bg-orange-50 text-[#f58220] font-black text-[10.5px] px-2.5 rounded-full">{feedbackMessages.length} Messages registered</span>
                  </div>

                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                    {feedbackMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`bg-white border-2 rounded-xl p-4.5 select-none transition ${replyingId === msg.id ? 'border-[#f58220]' : 'border-zinc-200 hover:border-zinc-300'}`}
                      >
                        <div className="flex justify-between items-baseline mb-1">
                          <strong className="text-zinc-[#111111] font-extrabold text-sm flex items-center space-x-1.5">
                            <span>{msg.name}</span>
                            {msg.status === 'unread' && <span className="bg-red-500 h-2 w-2 rounded-full inline-block animate-ping" />}
                          </strong>
                          <span className="text-[10px] font-mono text-zinc-400">{msg.date}</span>
                        </div>
                        <p className="text-zinc-650 text-xs leading-relaxed mt-2.5 pb-2.5 border-b border-zinc-50">{msg.req}</p>
                        
                        <div className="flex justify-between items-baseline text-[10px] text-zinc-400 pt-2.5 leading-none">
                          <span className="uppercase font-semibold tracking-wider text-teal-600 block">{msg.status} status</span>
                          <button 
                            onClick={() => {
                              setReplyingId(msg.id);
                              setReplyText("");
                            }}
                            className="text-[#f58220] hover:text-[#e07116] font-extrabold border-0 bg-transparent cursor-pointer uppercase text-[9.5px]"
                          >
                            Compose reply &gt;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Form context (col-span-12) */}
                <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-zinc-900 border-b pb-2">Communications Outbox</h3>
                  {replyingId ? (
                    <div className="space-y-4">
                      <div className="bg-zinc-50 p-3 rounded-lg text-xs leading-relaxed">
                        <strong className="block text-zinc-500 font-bold uppercase text-[9.5px] mb-1">Replying to:</strong>
                        <p className="text-zinc-800 font-medium">"{feedbackMessages.find(m => m.id === replyingId)?.req}"</p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] uppercase font-black text-zinc-400 block font-sans">Reply Message Body</label>
                        <textarea 
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type clear reply message instructions..."
                          className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220] text-xs"
                        />
                      </div>

                      <div className="flex space-x-1.5 pt-2">
                        <button 
                          onClick={() => {
                            setFeedbackMessages(prev => prev.map(m => m.id === replyingId ? { ...m, status: "replied" } : m));
                            setReplyingId(null);
                            setReplyText("");
                            setSuccessMsg("Reply dispatched successfully to client.");
                            setTimeout(() => setSuccessMsg(""), 3000);
                          }}
                          className="flex-1 bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-black uppercase py-2.5 rounded border-0 cursor-pointer text-center"
                        >
                          Send Reply Outbox
                        </button>
                        <button 
                          onClick={() => setReplyingId(null)}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-semibold px-4 rounded border"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-zinc-400 text-xs leading-relaxed font-sans">Select any customer inquiry request card from the left incoming panel to compose a detailed support response instantly.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ============== TAB: SUPPLIERS ============== */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6 text-left font-sans" id="suppliers-view-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Registered Merchandise Suppliers</h1>
                <p className="text-xs text-zinc-400">Core wholesale partners providing products and shipment raw materials.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase block font-mono">SUPPLIER DIRECTORY</span>
                  <span className="text-3xl font-black text-[#0c4a85] mt-1 block">{suppliersList.length}</span>
                  <span className="text-xs text-emerald-600 font-semibold block mt-1">🟢 100% active operational SLA status</span>
                </div>
                <div className="bg-white p-4.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase block font-mono">AVG RATING</span>
                  <span className="text-3xl font-black text-rose-500 mt-1 block">4.7 / 5.0</span>
                  <span className="text-xs text-zinc-500 block mt-1">Top metrics maintained across wholesale shipments</span>
                </div>
                <div className="bg-white p-4.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase block font-mono">Merchandise Procurements</span>
                  <span className="text-3xl font-black text-teal-600 mt-1 block">৳2,32,500</span>
                  <span className="text-xs text-zinc-500 block mt-1">Reflected directly securely in general registers</span>
                </div>
              </div>

              <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 border-b uppercase font-bold text-[10px]">
                      <th className="p-3.5">Supplier ID</th>
                      <th className="p-3.5">Partner Title</th>
                      <th className="p-3.5">Callback Line</th>
                      <th className="p-3.5">Fulfillment Score</th>
                      <th className="p-3.5">Safety Status</th>
                      <th className="p-3.5 text-center">Toggles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {suppliersList.map((sup, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50">
                        <td className="p-3.5 font-mono">{sup.id}</td>
                        <td className="p-3.5 font-bold text-zinc-800">{sup.name}</td>
                        <td className="p-3.5 font-mono">{sup.phone}</td>
                        <td className="p-3.5">⭐ {sup.rating}</td>
                        <td className="p-3.5">
                          <span className={`${sup.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'} text-[10px] px-2.5 py-0.5 rounded font-black uppercase`}>
                            {sup.active ? "Active" : "On Hold"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              setSuppliersList(prev => prev.map((s, idx) => idx === i ? { ...s, active: !s.active } : s));
                              setSuccessMsg(`Toggled status for ${sup.name}`);
                              setTimeout(() => setSuccessMsg(""), 3000);
                            }}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded py-1 px-3 border font-bold"
                          >
                            Flip Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============== TAB: AFFILIATE ============== */}
          {activeTab === 'affiliate' && (
            <div className="space-y-6 text-left font-sans" id="affiliate-view-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Affiliate Marketing Program</h1>
                <p className="text-xs text-zinc-400">Manage referral links issued to partners and track commission payouts.</p>
              </div>

              <div className="bg-white p-4.5 rounded-xl border border-zinc-200">
                <h3 className="font-extrabold text-sm mb-3">Live Partners Performance Ledger</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {affiliatesList.map((aff, i) => (
                    <div key={i} className="border p-4 rounded-xl flex items-center justify-between bg-zinc-50/30">
                      <div>
                        <strong className="block text-sm text-zinc-800 font-extrabold">{aff.name}</strong>
                        <span className="font-mono text-zinc-400 text-xs mt-0.5 block">Promo: <span className="text-[#f58220] font-bold">{aff.code}</span></span>
                        <span className="text-xs text-zinc-500 mt-1 block">Clicks tracked: <strong className="text-zinc-700">{aff.clicks}</strong></span>
                      </div>
                      <div className="text-right">
                        <strong className="block text-md font-mono text-zinc-900">৳{aff.totalPayout.toLocaleString()}</strong>
                        <span className="text-[10px] text-zinc-400 block">Commission ({aff.rate}%)</span>
                        <button
                          onClick={() => {
                            setSuccessMsg(`Simulated payout of ৳${aff.totalPayout} to ${aff.name}`);
                            setTimeout(() => setSuccessMsg(""), 3500);
                          }}
                          className="bg-[#f58220] hover:bg-[#e07116] text-white font-extrabold text-[10px] px-2.5 py-1 rounded block mt-2 border-0 cursor-pointer"
                        >
                          Invoice Payout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============== TAB: PURCHASE LIST ============== */}
          {activeTab === 'purchase-list' && (
            <div className="space-y-6 text-left font-sans" id="purchase-list-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Warehouse Purchase Logs</h1>
                <p className="text-xs text-zinc-400">Archived purchases registered with official vendor outlets for catalog items.</p>
              </div>

              <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 border-b uppercase font-bold text-[10px]">
                      <th className="p-3.5">Procurement Date</th>
                      <th className="p-3.5">Item Description</th>
                      <th className="p-3.5 text-center">Invoiced Qty</th>
                      <th className="p-3.5 text-right">Cost (BDT)</th>
                      <th className="p-3.5 text-center">Regulatory Standard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {procurementsList.map((proc, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50">
                        <td className="p-3.5 font-mono text-zinc-500">{proc.date}</td>
                        <td className="p-3.5 text-zinc-800 font-extrabold">{proc.desc}</td>
                        <td className="p-3.5 text-center font-mono">{proc.qty} Units</td>
                        <td className="p-3.5 text-right font-mono text-slate-800 font-black">৳{proc.costBDT.toLocaleString()}</td>
                        <td className="p-3.5 text-center">
                          <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-[10px] font-bold">NID APPROVES</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============== TAB: REFUND REQUESTS ============== */}
          {activeTab === 'refund-requests' && (
            <div className="space-y-6 text-left font-sans" id="refund-requests-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Customer Refund Desk</h1>
                <p className="text-xs text-zinc-400">Claims submitted by customers requesting cash-back or order replacements.</p>
              </div>

              <div className="bg-white border rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 border-b uppercase font-bold text-[10px]">
                      <th className="p-3.5">Refund ID</th>
                      <th className="p-3.5">Order Link</th>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5 text-right">Refund Amount</th>
                      <th className="p-3.5">Reason Category</th>
                      <th className="p-3.5">Fulfillment State</th>
                      <th className="p-3.5 text-center">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {refundClaims.filter(cl => {
                      if (refundStatusFilter === 'all') return true;
                      if (refundStatusFilter === 'pending') return cl.status === 'pending';
                      if (refundStatusFilter === 'approved') return cl.status === 'approved';
                      if (refundStatusFilter === 'refunded') return cl.status === 'refunded';
                      if (refundStatusFilter === 'rejected') return cl.status === 'declined' || cl.status === 'rejected';
                      return true;
                    }).map((claim, i) => (
                      <tr key={claim.id} className="hover:bg-zinc-50/50">
                        <td className="p-3.5 font-mono text-zinc-650">{claim.id}</td>
                        <td className="p-3.5 font-mono font-bold text-[#0c4a85]">{claim.orderId}</td>
                        <td className="p-3.5 text-zinc-800 font-bold">{claim.name}</td>
                        <td className="p-3.5 text-right font-mono text-zinc-900 font-bold">৳{claim.refundBDT.toLocaleString()}</td>
                        <td className="p-3.5 text-zinc-500 italic">"{claim.reason}"</td>
                        <td className="p-3.5">
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-black ${
                            claim.status === "pending" ? "bg-amber-100 text-amber-800 animate-pulse" :
                            claim.status === "approved" ? "bg-emerald-100 text-emerald-800 animate-pulse" :
                            claim.status === "refunded" ? "bg-teal-100 text-teal-800" :
                            "bg-zinc-100 text-zinc-650"
                          }`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {claim.status === "pending" ? (
                            <div className="flex justify-center space-x-1.5">
                              <button
                                onClick={() => {
                                  setRefundClaims(prev => prev.map((cl) => cl.id === claim.id ? { ...cl, status: "approved" } : cl));
                                  setSuccessMsg(`Refund of ৳${claim.refundBDT} has been processed key approved.`);
                                  setTimeout(() => setSuccessMsg(""), 3500);
                                }}
                                className="bg-[#f58220] hover:bg-[#e07116] text-white text-[10.5px] px-2 py-1 rounded font-bold border-0 cursor-pointer"
                              >
                                Approve Refund
                              </button>
                              <button
                                onClick={() => {
                                  setRefundClaims(prev => prev.map((cl) => cl.id === claim.id ? { ...cl, status: "declined" } : cl));
                                  setSuccessMsg(`Refund rejected.`);
                                  setTimeout(() => setSuccessMsg(""), 3000);
                                }}
                                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 text-[10.5px] px-2 py-1 rounded font-semibold border"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className="text-zinc-300 text-[11px]">— Resolved ({claim.status === "approved" ? "Approved" : claim.status})</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============== TAB: PRODUCT ATTRIBUTES ============== */}
          {activeTab === 'product-attributes' && (
            <div className="space-y-6 text-left font-sans" id="product-attributes-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Product Attributes Matrix</h1>
                <p className="text-xs text-zinc-400">Specifications configurations applied to merchandise collections.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributesList.map((attr, i) => (
                  <div key={i} className="bg-white border rounded-xl p-4.5 space-y-2.5">
                    <span className="bg-[#fdf3eb] text-[#f58220] px-2 py-0.5 rounded font-bold text-[10px] uppercase inline-block">
                      {attr.category} Attribute Map
                    </span>
                    <div className="divide-y divide-zinc-100 text-xs text-zinc-650">
                      <div className="flex justify-between py-2">
                        <span className="text-zinc-400">Base Material</span>
                        <strong>{attr.material}</strong>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-zinc-400">Core Sizes Options</span>
                        <strong>{attr.sizes}</strong>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-zinc-400">Physical Sizing Variant</span>
                        <strong>{attr.density}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============== TAB: VENDOR PRODUCTS ============== */}
          {activeTab === 'vendor-products' && (
            <div className="space-y-6 text-left font-sans" id="vendor-products-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">
                  {vendorSubTab === 'new-requests' ? "New Product Registration Moderation" :
                   vendorSubTab === 'updated-requests' ? "Revision Specification Auditing" :
                   vendorSubTab === 'approved' ? "Approved Partner Inventory" :
                   vendorSubTab === 'denied' ? "Denied & Flagged Submissions" :
                   "Third-party Vendor Catalog"}
                </h1>
                <p className="text-xs text-zinc-400">
                  {vendorSubTab === 'new-requests' ? "Approve or discard new vendor product submission layouts." :
                   vendorSubTab === 'updated-requests' ? "Audit revision requests and specifications details." :
                   vendorSubTab === 'approved' ? "Live validated third-party integrations dispatched directly." :
                   vendorSubTab === 'denied' ? "Flagged items violating terms of commerce." :
                   "Merchandise registered in our platform and dispatched directly by vendor partners."}
                </p>
              </div>

              {(vendorSubTab === 'all' || !vendorSubTab) ? (
                <div className="bg-white border overflow-hidden rounded-xl shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 border-b uppercase font-bold text-[10px]">
                        <th className="p-3.5">Vendor Name</th>
                        <th className="p-3.5 text-center">Listed Items Count</th>
                        <th className="p-3.5 text-center">Contract commission</th>
                        <th className="p-3.5">Partner score</th>
                        <th className="p-3.5">Safety status</th>
                        <th className="p-3.5 text-center font-sans">SLA triggers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-705">
                      {vendorsList.map((vend, i) => (
                        <tr key={i} className="hover:bg-zinc-50/50">
                          <td className="p-3.5 text-zinc-850 font-extrabold">{vend.name}</td>
                          <td className="p-3.5 text-center font-mono">{vend.productsCount} products</td>
                          <td className="p-3.5 text-center font-mono font-bold text-teal-600">{vend.commissionPercent}% flat per sale</td>
                          <td className="p-3.5">⭐ {vend.rating} / 5.0</td>
                          <td className="p-3.5">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              vend.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'
                            }`}>
                              {vend.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                setVendorsList(prev => prev.map((v, idx) => idx === i ? { ...v, status: v.status === 'active' ? 'suspended' : 'active' } : v));
                                setSuccessMsg(`Toggled status lock for ${vend.name}`);
                                setTimeout(() => setSuccessMsg(""), 3000);
                              }}
                              className="bg-zinc-100 hover:bg-zinc-200 border py-1 px-2.5 rounded font-bold text-zinc-700 cursor-pointer"
                            >
                              Flip Suspend state
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white border overflow-hidden rounded-xl shadow-2xs p-5 space-y-4">
                  <h3 className="font-extrabold text-[#111] uppercase tracking-wider text-xs border-b pb-2 mb-3">
                    Submissions Directory ({vendorProducts.filter(p => p.status === vendorSubTab).length})
                  </h3>
                  {vendorProducts.filter(p => p.status === vendorSubTab).length === 0 ? (
                    <p className="text-xs text-zinc-400 py-6 text-center">No catalog entries match this filter.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-zinc-50 border-b font-extrabold uppercase text-[10px] text-zinc-500">
                            <th className="p-3">ID</th>
                            <th className="p-3">Proposed Product Name</th>
                            <th className="p-3">Partner Seller</th>
                            <th className="p-3">Proposed pricing</th>
                            <th className="p-3 text-center">Moderation Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-zinc-705">
                          {vendorProducts.filter(p => p.status === vendorSubTab).map((prod) => (
                            <tr key={prod.id} className="hover:bg-zinc-50/50">
                              <td className="p-3 font-mono">{prod.id}</td>
                              <td className="p-3 font-bold text-zinc-900">{prod.productName}</td>
                              <td className="p-3 text-zinc-600">{prod.vendorName}</td>
                              <td className="p-3 font-mono font-bold">৳{prod.priceBDT.toLocaleString()}</td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  {prod.status !== 'approved' && (
                                    <button
                                      onClick={() => {
                                        setVendorProducts(prev => prev.map(p => p.id === prod.id ? { ...p, status: 'approved' } : p));
                                        setSuccessMsg(`Approved '${prod.productName}'! Item is now live.`);
                                        setTimeout(() => setSuccessMsg(""), 3000);
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded text-[11px] border-0 cursor-pointer"
                                    >
                                      Approve Entry
                                    </button>
                                  )}
                                  {prod.status !== 'denied' && (
                                    <button
                                      onClick={() => {
                                        setVendorProducts(prev => prev.map(p => p.id === prod.id ? { ...p, status: 'denied' } : p));
                                        setSuccessMsg(`Rejected specifications for '${prod.productName}'.`);
                                        setTimeout(() => setSuccessMsg(""), 3000);
                                      }}
                                      className="bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 font-bold py-1 px-2.5 rounded text-[11px] border cursor-pointer"
                                    >
                                      Reject Catalog
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      requestDeletion(
                                        "সাবমিশন ডিলিট নিশ্চিতকরণ",
                                        "Trash Submission Entry",
                                        `আপনি কি নিশ্চিতভাবেই সাবমিশন ID ${prod.id} ডিলিট করতে চান?`,
                                        `Are you sure you want to trash vendor submission entry ${prod.id}?`,
                                        () => {
                                          setVendorProducts(prev => prev.filter(p => p.id !== prod.id));
                                          setSuccessMsg("Vendor submission trashed.");
                                          setTimeout(() => setSuccessMsg(""), 3000);
                                        }
                                      );
                                    }}
                                    className="text-zinc-400 hover:text-red-650 p-1 cursor-pointer bg-transparent border-0"
                                    title="Trash"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============== TAB: BLOG ============== */}
          {activeTab === 'blog' && (
            <div className="space-y-6 text-left font-sans" id="blog-workspace-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Corporate Blog & Bulletins</h1>
                <p className="text-xs text-zinc-400">Post news bulletins, launch announcements, or premium styles catalog reviews.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Compose Form */}
                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-1.5">Compose Blog Bulletin</h3>
                  
                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] uppercase font-black text-zinc-400 block">Article Heading</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Navigating Summer Fits" 
                      value={newBlogTitle}
                      onChange={(e) => setNewBlogTitle(e.target.value)}
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] uppercase font-black text-zinc-400 block">Classification Tag category</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Corporate, Styles" 
                      value={newBlogCategory}
                      onChange={(e) => setNewBlogCategory(e.target.value)}
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] uppercase font-black text-zinc-400 block">Bulletin content</label>
                    <textarea 
                      rows={4}
                      placeholder="Type details review..." 
                      value={newBlogContent}
                      onChange={(e) => setNewBlogContent(e.target.value)}
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!newBlogTitle || !newBlogContent) return;
                      setBlogPosts(prev => [
                        { title: newBlogTitle, writer: "Platform Admin", category: newBlogCategory, date: "Today", body: newBlogContent },
                        ...prev
                      ]);
                      setNewBlogTitle("");
                      setNewBlogContent("");
                      setSuccessMsg("Corporate blog bulletin dispatched live!");
                      setTimeout(() => setSuccessMsg(""), 3500);
                    }}
                    className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-black uppercase py-2.5 px-4 rounded-xl border-0 shadow cursor-pointer border-none"
                  >
                    Publish Post live
                  </button>
                </div>

                {/* Published List previews */}
                <div className="space-y-4 font-sans text-left">
                  <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide pb-1">Published Bulletins ({blogPosts.length})</h3>
                  {blogPosts.map((post, i) => (
                    <div key={i} className="bg-white border rounded-xl p-4.5 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <strong className="text-zinc-800 text-sm font-bold block">{post.title}</strong>
                        <span className="text-[9.5px] font-bold text-[#f58220] uppercase bg-[#fdf3eb] px-2 py-0.5 rounded">{post.category}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 block">Written by {post.writer} • {post.date}</span>
                      <p className="text-xs text-zinc-600 leading-relaxed pt-1.5 border-t border-zinc-50">{post.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============== TAB: BANNERS ============== */}
          {activeTab === 'banners' && (
            <div className="space-y-6 text-left font-sans" id="banners-desk-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Splash Advertisement Banners</h1>
                <p className="text-xs text-zinc-400">Manage promotional slider carousels displayed to customers at shop indexes.</p>
              </div>

              <div className="bg-white border p-5 rounded-xl text-left max-w-xl shadow-xs space-y-4">
                <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Active Promotional Campaign Banners</h3>
                
                <div className="border border-dashed rounded-lg p-3 bg-zinc-50 text-xs flex items-center justify-between">
                  <div>
                    <strong className="block text-zinc-800 font-bold">1. Nabik Bazar Summer Extravaganza</strong>
                    <span className="text-zinc-400 font-normal">Trigger link: <span className="text-[#f58220] underline">/collections/spring-summer</span></span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">ONLINE</span>
                </div>

                <div className="border border-dashed rounded-lg p-3 bg-zinc-50 text-xs flex items-center justify-between">
                  <div>
                    <strong className="block text-zinc-800 font-bold">2. bKash Premium Wallet cashbacks rebate banner</strong>
                    <span className="text-zinc-400 font-normal">Trigger link: <span className="text-[#f58220] underline">/checkout?promo=NABIK50</span></span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">ONLINE</span>
                </div>

                <button
                  onClick={() => {
                    setSuccessMsg("Banner configurations recalculated successfully.");
                    setTimeout(() => setSuccessMsg(""), 3000);
                  }}
                  className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-bold py-2.5 px-4 rounded border-0 cursor-pointer"
                >
                  Reload Slider Matrices
                </button>
              </div>
            </div>
          )}

          {/* ============== TAB: OFFERS & DEALS ============== */}
          {activeTab === 'offers-deals' && (
            <div className="space-y-6 text-left font-sans" id="offers-deals-panel">
              {/* Context Header */}
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">
                  {offersDealsSubTab === 'coupon' ? "Coupon & Promotional Offers" :
                   offersDealsSubTab === 'flash-deals' ? "Flash Sale Campaigns Workspace" :
                   offersDealsSubTab === 'deal-of-the-day' ? "Deal of the Day Specifications" :
                   "Featured Partner Curations"}
                </h1>
                <p className="text-xs text-zinc-400">
                  {offersDealsSubTab === 'coupon' ? "Define price reductions and coupons applied dynamically at customer checkout fields." :
                   offersDealsSubTab === 'flash-deals' ? "Manage high-urgency flash sale storms, duration countdown blocks, and clearance metrics." :
                   offersDealsSubTab === 'deal-of-the-day' ? "Designate specific high-tier items as the daily star attraction with visual discount tiers." :
                   "Spotlight strategic curated merchant products across responsive buyer grid layouts."}
                </p>
              </div>

              {/* TAB 1: Coupons */}
              {offersDealsSubTab === 'coupon' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Coupon composition */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Write Coupon Spec</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-400 block">Promo Code String</label>
                        <input 
                          type="text" 
                          placeholder="e.g. FLASH25" 
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value)}
                          className="w-full border px-2.5 py-1.5 rounded focus:outline-none focus:border-[#f58220]" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-400 block">Discount Percent %</label>
                        <input 
                          type="number" 
                          value={newCouponDiscount}
                          onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                          className="w-full border px-2.5 py-1.5 rounded focus:outline-none focus:border-[#f58220]" 
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!newCouponCode) return;
                        setCouponCodes(prev => [...prev, { code: newCouponCode.toUpperCase(), discountPercent: newCouponDiscount, validity: "July 31, 2026" }]);
                        setNewCouponCode("");
                        setSuccessMsg(`Promo Code ${newCouponCode.toUpperCase()} compiled successfully!`);
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                      className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-black py-2.5 px-4 rounded-xl border-none cursor-pointer uppercase"
                    >
                      Lock Promo coupon in Register
                    </button>
                  </div>

                  {/* Listing Coupons */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3.5 text-left">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Active Codes Registered</h3>
                    <div className="divide-y text-xs font-sans">
                      {couponCodes.map((coup, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5">
                          <div>
                            <strong className="text-zinc-800 font-mono block text-sm">{coup.code}</strong>
                            <span className="text-zinc-400 text-[11px] block mt-0.5">Expires: {coup.validity}</span>
                          </div>
                          <div className="text-right flex items-center space-x-2">
                            <span className="bg-emerald-50 text-emerald-700 font-black text-xs px-2 py-0.5 rounded">{coup.discountPercent}% OFF checkout</span>
                            <button
                              onClick={() => {
                                requestDeletion(
                                  "কুপন কোড ডিলিট নিশ্চিতকরণ",
                                  "Confirm Coupon Deletion",
                                  `আপনি কি নিশ্চিতভাবেই কুপন কোড '${coup.code}' ডিলিট করতে চান?`,
                                  `Are you sure you want to permanently purge coupon code '${coup.code}'?`,
                                  () => {
                                    setCouponCodes(prev => prev.filter((_, idx) => idx !== i));
                                    setSuccessMsg("Coupon record purged.");
                                    setTimeout(() => setSuccessMsg(""), 2000);
                                  }
                                );
                              }}
                              className="text-zinc-400 hover:text-red-500 bg-transparent border-0 cursor-pointer p-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Flash Deals */}
              {offersDealsSubTab === 'flash-deals' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Create campaign */}
                  <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4 md:col-span-1">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Create Flash Campaign</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Campaign Title</label>
                        <input 
                          type="text" 
                          id="new-flash-title"
                          placeholder="e.g. Monsoon Midnight Magic"
                          className="w-full border p-2 rounded focus:border-[#f58220] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Deduction Index (%)</label>
                        <input 
                          type="number" 
                          id="new-flash-pct"
                          defaultValue={40}
                          className="w-full border p-2 rounded focus:border-[#f58220] focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Window Duration</label>
                        <input 
                          type="text" 
                          id="new-flash-duration"
                          placeholder="e.g. 12 Hours Left"
                          className="w-full border p-2 rounded focus:border-[#f58220] focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const titleEl = document.getElementById("new-flash-title") as HTMLInputElement;
                        const pctEl = document.getElementById("new-flash-pct") as HTMLInputElement;
                        const durEl = document.getElementById("new-flash-duration") as HTMLInputElement;
                        if (!titleEl?.value) return;
                        setFlashDealsList(prev => [
                          ...prev,
                          {
                            id: `FD-${Date.now().toString().slice(-3)}`,
                            title: titleEl.value,
                            discountPercent: Number(pctEl?.value) || 25,
                            duration: durEl?.value || "Active Now",
                            status: "Active"
                          }
                        ]);
                        titleEl.value = "";
                        setSuccessMsg("Monolithic flash storm registered live!");
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                      className="w-full bg-[#0a457c] hover:bg-[#073259] text-white text-xs font-bold py-2 px-3 rounded-lg border-0 cursor-pointer"
                    >
                      Deploy Storm Live
                    </button>
                  </div>

                  {/* Flash Deals campaigns lists */}
                  <div className="bg-white border rounded-xl p-4 shadow-sm md:col-span-2 space-y-3">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Active Flash Campaigns Directory</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-zinc-50 border-b text-[10px] text-zinc-500 font-extrabold uppercase">
                            <th className="p-2">ID</th>
                            <th className="p-2">Campaign Heading</th>
                            <th className="p-2 text-center">Avg Reduction</th>
                            <th className="p-2">Time Bounds</th>
                            <th className="p-2 text-center">Status</th>
                            <th className="p-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {flashDealsList.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-zinc-50/50">
                              <td className="p-2 font-mono text-zinc-400">{campaign.id}</td>
                              <td className="p-2 font-bold text-zinc-800">{campaign.title}</td>
                              <td className="p-2 text-center font-mono font-black text-rose-500">{campaign.discountPercent}% OFF</td>
                              <td className="p-2 text-zinc-600 font-mono text-[10.5px]">{campaign.duration}</td>
                              <td className="p-2 text-center">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                  campaign.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                                  campaign.status === 'Upcoming' ? 'bg-amber-50 text-amber-700' :
                                  'bg-zinc-150 text-zinc-500'
                                }`}>
                                  {campaign.status}
                                </span>
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => {
                                    setFlashDealsList(prev => prev.map(c => c.id === campaign.id ? { ...c, status: c.status === 'Active' ? 'Closed' : 'Active' } : c));
                                    setSuccessMsg(`Toggled campaign status state.`);
                                    setTimeout(() => setSuccessMsg(""), 2000);
                                  }}
                                  className="bg-zinc-50 border hover:bg-zinc-200 py-1 px-2 rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Flip Status
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Deal of the day */}
              {offersDealsSubTab === 'deal-of-the-day' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Select product deal of the day */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Modify Daily Star Deal</h3>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-400 block">Choose Store Product (ID)</label>
                        <select 
                          value={dealOfTheDayObj.productId}
                          onChange={(e) => {
                            const pId = e.target.value;
                            const pr = products.find(p => p.id === pId) || products[0];
                            if (pr) {
                              setDealOfTheDayObj(prev => ({
                                ...prev,
                                productId: pr.id,
                                productName: pr.name,
                                originalPrice: pr.priceBDT,
                                dealPrice: Math.round(pr.priceBDT * 0.7)
                              }));
                            }
                          }}
                          className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>[{p.id}] {p.name} - ৳{p.priceBDT.toLocaleString()}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-zinc-400 block">Regular Price</label>
                          <input 
                            type="number"
                            disabled
                            value={dealOfTheDayObj.originalPrice}
                            className="w-full border p-2 rounded bg-zinc-50 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-zinc-400 block">Promo Deal Price (৳)</label>
                          <input 
                            type="number"
                            value={dealOfTheDayObj.dealPrice}
                            onChange={(e) => setDealOfTheDayObj(prev => ({ ...prev, dealPrice: Number(e.target.value) }))}
                            className="w-full border p-2 rounded font-mono text-rose-500 font-extrabold focus:border-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-zinc-400 block">Timer Countdown Remaining</label>
                          <input 
                            type="text"
                            value={dealOfTheDayObj.timeLeft}
                            onChange={(e) => setDealOfTheDayObj(prev => ({ ...prev, timeLeft: e.target.value }))}
                            className="w-full border p-2 rounded font-mono text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-zinc-400 block">Purchased Count Target</label>
                          <input 
                            type="number"
                            value={dealOfTheDayObj.purchasesToday}
                            onChange={(e) => setDealOfTheDayObj(prev => ({ ...prev, purchasesToday: Number(e.target.value) }))}
                            className="w-full border p-2 rounded font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSuccessMsg("Star Deal of the Day metrics synchronized successfully!");
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl border-none cursor-pointer text-xs"
                    >
                      Authorize Daily Deal modifications
                    </button>
                  </div>

                  {/* Customer display preview */}
                  <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    {/* Glow pattern background */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl" />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="bg-amber-400 text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full animate-bounce">
                          ⚡ DEAL OF THE DAY
                        </span>
                        <span className="text-zinc-400 font-mono text-xs">TIMER: {dealOfTheDayObj.timeLeft}</span>
                      </div>

                      <div className="pt-2">
                        <h4 className="text-lg font-extrabold leading-tight text-white line-clamp-2">{dealOfTheDayObj.productName}</h4>
                        <span className="text-zinc-400 font-mono text-xs">Item Reference code: {dealOfTheDayObj.productId}</span>
                      </div>

                      <div className="flex items-baseline space-x-3 pt-3">
                        <strong className="text-3xl font-black text-[#a4f6a5] font-mono">৳{dealOfTheDayObj.dealPrice.toLocaleString()}</strong>
                        <span className="text-zinc-500 line-through text-sm font-mono">৳{dealOfTheDayObj.originalPrice.toLocaleString()}</span>
                        <span className="text-amber-400 text-xs font-bold font-mono">
                          ({Math.round(((dealOfTheDayObj.originalPrice - dealOfTheDayObj.dealPrice) / dealOfTheDayObj.originalPrice) * 100)}% Discount)
                        </span>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono mb-1">
                          <span>Capacity claim progress</span>
                          <span className="text-yellow-400 font-bold">{dealOfTheDayObj.purchasesToday} Purchased Today</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(dealOfTheDayObj.purchasesToday / 50) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800/80 pt-4 mt-6 text-center">
                      <p className="text-[10px] text-zinc-500 font-sans">
                        Live Preview representation of the sticky floating banner displayed to all visitors accessing Nabik Bazar in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Featured Deal */}
              {offersDealsSubTab === 'featured-deal' && (
                <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Spotlight Curated Featured Integrations</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-zinc-50 border-b text-[10px] text-zinc-500 font-extrabold uppercase">
                          <th className="p-3">Ref ID</th>
                          <th className="p-3">Product Catalog Asset</th>
                          <th className="p-3 text-center">Showcase Mode</th>
                          <th className="p-3 text-center">Checkout Reduction Allowed</th>
                          <th className="p-3 text-center">SLA priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {featuredDealsList.map((item, i) => (
                          <tr key={i} className="hover:bg-zinc-50/50">
                            <td className="p-3 font-mono text-zinc-500">{item.productId}</td>
                            <td className="p-3 font-bold text-zinc-800">{item.productName}</td>
                            <td className="p-3 text-center">
                              <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                item.featuredStatus === 'Featured' ? 'bg-[#0a457c]/10 text-[#0a457c]' : 'bg-zinc-100 text-zinc-400'
                              }`}>
                                {item.featuredStatus}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-emerald-600">Extra -{item.discountAllowed}% Off</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setFeaturedDealsList(prev => prev.map((f, idx) => idx === i ? { ...f, featuredStatus: f.featuredStatus === 'Featured' ? 'Draft' : 'Featured' } : f));
                                  setSuccessMsg("Updated spotlight priority bindings.");
                                  setTimeout(() => setSuccessMsg(""), 2000);
                                }}
                                className="bg-zinc-100 hover:bg-zinc-200 border py-1 px-3.5 rounded font-black cursor-pointer text-zinc-700"
                              >
                                Toggle Showcase
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============== TAB: NOTIFICATIONS ============== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 text-left font-sans" id="notifications-panel">
              {/* Tab Label Header */}
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">
                  {notificationsSubTab === 'send' ? "Broadcast Alert Dispatcher" : "Smart Push Notification Management DB"}
                </h1>
                <p className="text-xs text-zinc-400">
                  {notificationsSubTab === 'send' ? "Formulate scheduled push broadcasts and general alerts dispatched to browser client pools." :
                   "Configure native smartphone push notification hooks, badge indicators, deep-link triggers, and chime sound files."}
                </p>
              </div>

              {/* Subtab Contents - Send Notification */}
              {notificationsSubTab === 'send' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Composition */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Schedule Broadcast notification</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-400 block">Alert Title Heading</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Flash sales expiring in 2 hours!" 
                          value={newNotifTitle}
                          onChange={(e) => setNewNotifTitle(e.target.value)}
                          className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-zinc-400 block">Target Customer demographic</label>
                        <input 
                          type="text" 
                          placeholder="All App Users" 
                          value={newNotifTarget}
                          onChange={(e) => setNewNotifTarget(e.target.value)}
                          className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220]" 
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!newNotifTitle) return;
                        setAdminNotifications(prev => [
                          ...prev,
                          { id: Date.now(), title: newNotifTitle, target: newNotifTarget || "All Users", scheduled: "Instant Broadcast", icon: "🔔" }
                        ]);
                        setNewNotifTitle("");
                        setSuccessMsg("Critical mobile push notice dispatched!");
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                      className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-black uppercase py-2.5 px-4.5 rounded-xl border-none cursor-pointer shadow"
                    >
                      Broadcast live alert now
                    </button>
                  </div>

                  {/* Archives */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3 font-sans text-left">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Sent Broadcast logs</h3>
                    <div className="space-y-2.5">
                      {adminNotifications.map((notif, i) => (
                        <div key={i} className="border rounded-lg p-3.5 bg-zinc-50/50 flex items-start justify-between text-xs leading-normal">
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{notif.icon}</span>
                            <div>
                              <strong className="text-zinc-800 font-bold block">{notif.title}</strong>
                              <span className="text-[10.5px] text-zinc-400 block mt-0.5">Demography: {notif.target} • {notif.scheduled}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              requestDeletion(
                                "নোটিফিকেশন ডিলিট নিশ্চিতকরণ",
                                "Confirm Broadcast Deletion",
                                `আপনি কি নিশ্চিতভাবেই নোটিফিকেশন '${notif.title}' ডিলিট করতে চান?`,
                                `Are you sure you want to delete the broadcast log for '${notif.title}'?`,
                                () => {
                                  setAdminNotifications(prev => prev.filter(n => n.id !== notif.id));
                                  setSuccessMsg("Broadcast log deleted.");
                                  setTimeout(() => setSuccessMsg(""), 2000);
                                }
                              );
                            }}
                            className="bg-transparent border-0 hover:text-red-500 font-bold text-zinc-400 cursor-pointer text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab Contents - Push notification */}
              {notificationsSubTab === 'push' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Smartphone preview pane */}
                  <div className="lg:col-span-4 bg-zinc-950 text-white rounded-[40px] p-6 shadow-2xl border-[12px] border-zinc-800 h-[480px] flex flex-col justify-between relative overflow-hidden font-sans">
                    {/* Speaker sensor notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-800 w-28 h-5 rounded-b-2xl z-10 flex items-center justify-around px-4">
                      <span className="w-10 h-1 bg-zinc-950 rounded" />
                      <span className="w-2.5 h-2.5 bg-lens rounded-full bg-indigo-900 border" />
                    </div>

                    <div className="pt-6 space-y-3.5">
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono px-1">
                        <span>NABIK NET</span>
                        <span>04:21 PM • 100% 🔋</span>
                      </div>

                      {/* Floating push preview */}
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-2 relative text-left">
                        <div className="flex justify-between items-center text-[9px] text-amber-400 font-bold tracking-widest uppercase">
                          <span>⛵ nabiK bazar push</span>
                          <span>now</span>
                        </div>
                        <div>
                          <h4 className="text-[12px] font-black tracking-tight leading-snug">
                            {newPushTitle || "🎉 Eid Super Ultimate Reload Bonus!"}
                          </h4>
                          <p className="text-[10px] text-zinc-300 leading-normal line-clamp-2 mt-0.5">
                            {newPushMessage || "Send any amount to your cashbag wallet and unlock immediate 25% extra match credits now."}
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[9px] text-zinc-400">
                          <span>🔗 path: {newPushDeepLink}</span>
                          <span>🔉 sound: {newPushChime}</span>
                        </div>
                        {newPushBadge > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-zinc-950">
                            {newPushBadge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pb-3 text-center">
                      <span className="w-16 h-1 bg-zinc-600 rounded-full inline-block" />
                      <p className="text-[9px] text-zinc-500 font-mono mt-2">Live Smartphone UI Emulation Simulator</p>
                    </div>
                  </div>

                  {/* Settings and history log */}
                  <div className="lg:col-span-8 space-y-5">
                    <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Push parameters composer</h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Alert Title</label>
                          <input 
                            type="text" 
                            placeholder="🚀 Flash Special Promo!"
                            value={newPushTitle}
                            onChange={(e) => setNewPushTitle(e.target.value)}
                            className="w-full border p-2 rounded focus:outline-none focus:border-[#f58220]"
                          />
                        </div>

                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Short Push Message Text</label>
                          <textarea
                            rows={2}
                            placeholder="Type a highly engaging prompt..."
                            value={newPushMessage}
                            onChange={(e) => setNewPushMessage(e.target.value)}
                            className="w-full border p-2 rounded focus:outline-none focus:border-[#f58220] font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Deep Link Target</label>
                          <input 
                            type="text" 
                            value={newPushDeepLink}
                            onChange={(e) => setNewPushDeepLink(e.target.value)}
                            className="w-full border p-2 rounded font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Smartphone Chime Sound</label>
                          <select 
                            value={newPushChime} 
                            onChange={(e) => setNewPushChime(e.target.value)}
                            className="w-full border p-2 rounded"
                          >
                            <option>Standard Modern Chime</option>
                            <option>Soft Double Echo</option>
                            <option>Silent Low Vibration Only</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Red App Badge Count</label>
                          <input 
                            type="number" 
                            value={newPushBadge}
                            onChange={(e) => setNewPushBadge(Number(e.target.value))}
                            className="w-full border p-2 rounded font-mono"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              if (!newPushTitle || !newPushMessage) return;
                              setPushNotificationHistory(prev => [
                                {
                                  id: Date.now(),
                                  title: newPushTitle,
                                  message: newPushMessage,
                                  timestamp: "Just Now",
                                  badgeCount: newPushBadge,
                                  chime: newPushChime,
                                  deepLink: newPushDeepLink
                                },
                                ...prev
                              ]);
                              setNewPushTitle("");
                              setNewPushMessage("");
                              setSuccessMsg("Native push ticket committed to Google GCM & Apple APNs pools!");
                              setTimeout(() => setSuccessMsg(""), 3500);
                            }}
                            className="w-full bg-[#0a457c] hover:bg-[#073259] text-white text-xs font-black uppercase py-2.5 rounded-lg border-0 cursor-pointer shadow"
                          >
                            Transmit Push Alert
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Historical logs */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3 text-xs">
                      <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Native Push Logs history</h3>
                      <div className="divide-y">
                        {pushNotificationHistory.map((item) => (
                          <div key={item.id} className="py-3 first:pt-0 last:pb-0 text-left space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                              <span className="font-mono text-[#0a457c]">APNS-GCM-TICKET-{item.id}</span>
                              <span>{item.timestamp}</span>
                            </div>
                            <h4 className="font-black text-zinc-900">{item.title}</h4>
                            <p className="text-zinc-500 leading-normal">{item.message}</p>
                            <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                              <span className="bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded font-mono font-bold">DeepLink: {item.deepLink}</span>
                              <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold font-mono">Sound: {item.chime}</span>
                              {item.badgeCount > 0 && <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded">Badges: {item.badgeCount}</span>}
                              <button
                                onClick={() => {
                                  requestDeletion(
                                    "নোটিফিকেশন লগ ডিলিট নিশ্চিতকরণ",
                                    "Confirm Push Log Deletion",
                                    `আপনি কি নিশ্চিতভাবেই পুশ নোটিফিকেশন লগ ${item.id} ডিলিট করতে চান?`,
                                    `Are you sure you want to delete push dispatch log APNS-GCM-TICKET-${item.id}?`,
                                    () => {
                                      setPushNotificationHistory(prev => prev.filter(t => t.id !== item.id));
                                      setSuccessMsg("Push dispatch ticket removed from directory.");
                                      setTimeout(() => setSuccessMsg(""), 2000);
                                    }
                                  );
                                }}
                                className="text-red-500 hover:underline bg-transparent border-0 cursor-pointer p-0 ml-auto font-sans"
                              >
                                Delete Log
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab Contents - SMS Gateway Notification System */}
              {notificationsSubTab === 'sms' && (
                <SmsNotificationSystem language={language} />
              )}
            </div>
          )}

          {/* ============== TAB: FRAUD PROTECTION ============== */}
          {activeTab === 'fraud-protection' && (
            <div className="space-y-6">
              <FraudProtectionSystem language={language} />
            </div>
          )}

          {/* ============== TAB: ANNOUNCEMENTS ============== */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 text-left font-sans" id="announcements-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Marquee Banner Announcements</h1>
                <p className="text-xs text-zinc-400">Configure scrolling text marquees displayed on active buyer indexes.</p>
              </div>

              <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 max-w-xl">
                <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Active Marquee announcement text</h3>
                <div className="divide-y text-xs">
                  {marquees.map((mq, i) => (
                    <div key={i} className="py-2 flex items-center justify-between">
                      <span className="text-zinc-700 italic">"{mq.announcement}"</span>
                      <span className={`${isMarqueeEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400'} px-2 py-0.5 rounded text-[10px] font-bold`}>
                        {isMarqueeEnabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Marquee Banner Toggle Switch */}
                <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-805">অফার বার অন/অফ করুন (Toggle Banner Visibility)</h4>
                    <p className="text-[10px] text-zinc-405 leading-relaxed">সুইচ অফ করলে হোমপেজে অফার বারটি পুরোপুরি হাইড হয়ে যাবে।</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isMarqueeEnabled;
                      setIsMarqueeEnabled(nextState);
                      localStorage.setItem("gadget_bazar_marquee_enabled", String(nextState));
                      window.dispatchEvent(new Event("storage"));
                      setSuccessMsg(`Marquee banner ${nextState ? "enabled" : "disabled"} successfully.`);
                      setTimeout(() => setSuccessMsg(""), 3000);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none border-0 ${
                      isMarqueeEnabled ? 'bg-[#f58220]' : 'bg-zinc-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isMarqueeEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2 pt-3 border-t">
                  <label className="text-[10px] uppercase font-black text-zinc-400 block">Edit Announcement Text</label>
                  <input 
                    type="text" 
                    placeholder="Enter scrolling announcement text..."
                    value={newMarqueeText}
                    onChange={(e) => setNewMarqueeText(e.target.value)}
                    className="w-full border px-3 py-2 text-xs rounded focus:outline-none focus:border-[#f58220]" 
                  />
                  <button
                    onClick={() => {
                      if (!newMarqueeText) return;
                      setMarquees([{ announcement: newMarqueeText }]);
                      localStorage.setItem("gadget_bazar_marquee_text", newMarqueeText);
                      window.dispatchEvent(new Event("storage"));
                      setNewMarqueeText("");
                      setSuccessMsg("Public home marquee adjusted successfully.");
                      setTimeout(() => setSuccessMsg(""), 3000);
                    }}
                    className="bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-bold py-2 px-4 rounded border-0 cursor-pointer"
                  >
                    Adjust Ticker live
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============== TAB: SUPPORT TICKET ============== */}
          {activeTab === 'support-ticket' && (
            <div className="space-y-6 text-left font-sans" id="support-ticket-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Customer Support Tickets</h1>
                <p className="text-xs text-zinc-400">Resolve raised inquiries and critical merchant transaction claims.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Tickets grid table */}
                <div className="lg:col-span-7 bg-white border rounded-xl shadow-xs overflow-hidden font-sans">
                  <div className="bg-zinc-50 border-b p-3.5 flex justify-between select-none">
                    <span className="uppercase text-[10px] font-black tracking-widest text-zinc-400 font-bold">Incoming Claims</span>
                    <span className="bg-[#fdf3eb] text-[#f58220] font-bold text-[10.5px] px-2 rounded-full">{supportTickets.length} active logs</span>
                  </div>

                  <div className="divide-y">
                    {supportTickets.map((tck, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setSelectedTicketId(tck.id);
                          setNewTicketReply("");
                        }}
                        className={`p-4.5 cursor-pointer hover:bg-zinc-50 transition text-left space-y-2 block ${selectedTicketId === tck.id ? 'bg-[#fdf3eb]/30 border-l-4 border-[#f58220]' : ''}`}
                      >
                        <div className="flex justify-between items-baseline">
                          <strong className="text-sm text-zinc-800 font-extrabold">{tck.sender}</strong>
                          <span className="text-[10px] font-mono text-zinc-400">{tck.id}</span>
                        </div>
                        <p className="text-xs text-zinc-650 leading-relaxed font-sans">{tck.issue}</p>
                        <div className="flex items-center space-x-2 text-[10.5px]">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tck.priority === 'high' ? 'bg-red-50 text-red-650' : 'bg-zinc-50 text-zinc-450'
                          }`}>
                            {tck.priority} Priority
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-zinc-400 font-medium">Status: <strong className="text-zinc-600 capitalize">{tck.status}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution panel Form */}
                <div className="lg:col-span-5 bg-white border rounded-xl p-5 shadow-sm space-y-4 text-left font-sans">
                  <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Support Ticket resolution desk</h3>
                  {selectedTicketId ? (
                    <div className="space-y-4">
                      <div className="bg-zinc-50 p-3.5 rounded-lg text-xs leading-relaxed space-y-1">
                        <span className="text-[9.5px] uppercase font-black text-zinc-400 font-mono">Inquiry ID: {selectedTicketId}</span>
                        <p className="text-zinc-800 font-semibold italic">"{supportTickets.find(t => t.id === selectedTicketId)?.issue}"</p>
                      </div>

                      <div className="space-y-1.5 text-xs text-left">
                        <label className="text-[10px] uppercase font-black text-zinc-400 block pb-1">Response Message Body</label>
                        <textarea 
                          rows={4}
                          value={newTicketReply}
                          onChange={(e) => setNewTicketReply(e.target.value)}
                          placeholder="Type specific customer response and troubleshooting logs..."
                          className="w-full border px-3 py-2 rounded focus:outline-none focus:border-[#f58220] block text-xs"
                        />
                      </div>

                      <div className="flex space-x-1.5 pt-2">
                        <button
                          onClick={() => {
                            setSupportTickets(prev => prev.map(t => t.id === selectedTicketId ? { ...t, status: "resolved" } : t));
                            setSelectedTicketId(null);
                            setSuccessMsg("Dispatched solution to customer successfully.");
                            setTimeout(() => setSuccessMsg(""), 3000);
                          }}
                          className="flex-1 bg-[#f58220] hover:bg-[#e07116] text-white text-xs font-black py-2 rounded-xl cursor-pointer border-none uppercase text-center"
                        >
                          Resolve & close Ticket
                        </button>
                        <button
                          onClick={() => setSelectedTicketId(null)}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-650 text-xs font-bold px-4 rounded border-none cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-400 text-xs">
                      <p className="leading-relaxed">Select any customer support ticket from the left queue to resolve the claim.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============== TAB: SALES & TRANSACTION REPORT ============== */}
          {activeTab === 'sales-report' && (
            <div className="space-y-6 text-left font-sans" id="sales-report-view">
              {/* Main Header */}
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">
                  {salesReportSubTab === 'earning' ? "Earning Reports Ledger" :
                   salesReportSubTab === 'inhouse' ? "Direct In-house Sales Registry" :
                   salesReportSubTab === 'seller' ? "Partner Sellers Commercial Performance" :
                   salesReportSubTab === 'transaction' ? "General Payment Gateway Transactions" :
                   salesReportSubTab === 'affiliate' ? "Affiliate & Influencer Payout Ledger" :
                   salesReportSubTab === 'deposite' ? "Bank Deposit & Escrow Sweeps Log" :
                   salesReportSubTab === 'expense' ? "Operating Expenses (OPEX) Ledger" :
                   salesReportSubTab === 'balance-sheet' ? "Platform Asset & Liabilities Balance Sheet" :
                   "Gross Profit Analysis"}
                </h1>
                <p className="text-xs text-zinc-400">
                  {salesReportSubTab === 'earning' ? "Review compiled platform earnings, delivery parameters, and central tax metrics." :
                   salesReportSubTab === 'inhouse' ? "Audit commercial lines directly dispatched via the Nabik Bazar central fulfillment hubs." :
                   salesReportSubTab === 'seller' ? "Track total sales margins, contract commissions, and ratings for partner vendors." :
                   salesReportSubTab === 'transaction' ? "View full transaction tickets cleared via bKash, DBBL, Nagad, and retail POS gateways." :
                   salesReportSubTab === 'affiliate' ? "Monitor custom promoter codes, influencer commission brackets, and current payout schedules." :
                   salesReportSubTab === 'deposite' ? "Audit physical transfers and security clearances of escrow holdings back to retail bank vaults." :
                   salesReportSubTab === 'expense' ? "Track server, operations, packaging bag material production, and courier fuel subsidies expenses." :
                   salesReportSubTab === 'balance-sheet' ? "Aggregated balance statement outlining cash reserves, liabilities, and retained capital indices." :
                   "Profitability metrics, cost of goods calculations, and real gross margin ratios."}
                </p>
              </div>

              {/* TAB 1: Earning Reports */}
              {salesReportSubTab === 'earning' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border bg-white rounded-xl shadow-xs">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">In-house Gross</span>
                      <strong className="text-xl text-zinc-800 font-mono mt-1 block">৳{stats.inHouseEarning.toLocaleString()}</strong>
                      <span className="text-[9px] text-emerald-600 block mt-1">▲ FY26 Target Matched</span>
                    </div>
                    <div className="p-4 border bg-white rounded-xl shadow-xs">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Commissions Cleared</span>
                      <strong className="text-xl text-teal-600 font-mono mt-1 block">৳{stats.commissionEarned.toLocaleString()}</strong>
                      <span className="text-[9px] text-teal-600 block mt-1">Flat contract fee</span>
                    </div>
                    <div className="p-4 border bg-white rounded-xl shadow-xs">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Shipping Surcharge</span>
                      <strong className="text-xl text-rose-500 font-mono mt-1 block">৳{stats.deliveryChargeEarned.toLocaleString()}</strong>
                      <span className="text-[9px] text-zinc-400 block mt-1">Courier allocation fund</span>
                    </div>
                    <div className="p-4 border bg-white rounded-xl shadow-xs">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Regulatory VAT/Tax</span>
                      <strong className="text-xl text-zinc-500 font-mono mt-1 block">৳{(stats.inHouseEarning * 0.05).toLocaleString()}</strong>
                      <span className="text-[9px] text-zinc-400 block mt-1">5% local tax withholding</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-5 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-xs text-zinc-400 tracking-wider uppercase">Annualized Earning Flow Trends</h3>
                    <div className="grid grid-cols-6 gap-2 pt-2 text-center text-[11px] font-mono">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((mon, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-24 bg-zinc-50 rounded-lg flex items-end justify-center overflow-hidden">
                            <div className="bg-[#0a457c] w-full rounded-t-sm" style={{ height: `${30 + i * 12}%` }} />
                          </div>
                          <span className="block font-bold text-zinc-500">{mon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Inhouse Sales */}
              {salesReportSubTab === 'inhouse' && (
                <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
                  <div className="bg-zinc-50/80 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="text-xs font-black text-zinc-550 uppercase tracking-wider">Platform Internal Catalog Sales Log</h3>
                    <span className="bg-teal-50 text-teal-700 text-[10px] font-bold py-0.5 px-2 rounded-full">Fulfilled by Nabik Bazar</span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 uppercase font-black text-[9px] border-b">
                        <th className="p-3">Reference ID</th>
                        <th className="p-3">Inhouse product Item</th>
                        <th className="p-3">Dispatch Hub</th>
                        <th className="p-3">Clearance amount</th>
                        <th className="p-3">SLA Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {products.slice(0, 4).map((p, i) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50">
                          <td className="p-3 font-mono text-zinc-450">IN-HSE-{p.id}</td>
                          <td className="p-3 font-bold text-zinc-800">{p.name}</td>
                          <td className="p-3 font-mono">DHAKA CENTRAL HUB</td>
                          <td className="p-3 font-bold font-mono text-zinc-800">৳{p.priceBDT.toLocaleString()}</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                              Dispatched
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: Seller Sales */}
              {salesReportSubTab === 'seller' && (
                <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
                  <div className="bg-zinc-50/80 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="text-xs font-black text-zinc-550 uppercase tracking-wider">Partner Commissions & SLA performance</h3>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 uppercase font-black text-[9px] border-b">
                        <th className="p-3">Vendor Name</th>
                        <th className="p-3 text-center">Listed Catalog items</th>
                        <th className="p-3 text-center">Commission Earned</th>
                        <th className="p-3">Trust Rating Score</th>
                        <th className="p-3 text-center">Commission action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {vendorsList.map((vend, i) => (
                        <tr key={i} className="hover:bg-zinc-50/50">
                          <td className="p-3 font-bold text-zinc-800">{vend.name}</td>
                          <td className="p-3 text-center font-mono">{vend.productsCount} SKUs</td>
                          <td className="p-3 text-center font-mono font-black text-rose-500">
                            ৳{Math.round(vend.productsCount * 3500 * (vend.commissionPercent / 100)).toLocaleString()}
                          </td>
                          <td className="p-3">⭐ {vend.rating} / 5.0 Rating</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setVendorsList(prev => prev.map((v, idx) => idx === i ? { ...v, commissionPercent: v.commissionPercent + 1 } : v));
                                setSuccessMsg(`Incremented commission slice for ${vend.name}`);
                                setTimeout(() => setSuccessMsg(""), 2000);
                              }}
                              className="bg-zinc-100 hover:bg-zinc-200 border py-1 px-2.5 rounded text-[10.5px] font-bold text-zinc-700 cursor-pointer"
                            >
                              +1% Commission
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: Transaction Report */}
              {salesReportSubTab === 'transaction' && (
                <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
                  <div className="bg-zinc-50/80 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="text-xs font-black text-zinc-550 uppercase tracking-wider">Cleared Payment Tickets</h3>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 uppercase font-black text-[9px] border-b">
                        <th className="p-3">Invoice / TXN ID</th>
                        <th className="p-3">Payer Account Info</th>
                        <th className="p-3">Gateway Method</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Net Cleared Amount</th>
                        <th className="p-3">Regulatory Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-50/50">
                          <td className="p-3 font-mono text-[#0a457c] font-black">TXN-NBK-{ord.id}</td>
                          <td className="p-3">
                            <span className="block font-bold">{ord.customerInfo.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">{ord.customerInfo.phone}</span>
                          </td>
                          <td className="p-3 font-sans text-[11px] font-bold">{ord.customerInfo.paymentMethod}</td>
                          <td className="p-3 text-zinc-500 font-mono text-[10.5px]">{ord.date}</td>
                          <td className="p-3 font-mono font-black text-emerald-600">৳{ord.totalBDT.toLocaleString()}</td>
                          <td className="p-3">
                            <span className="bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                              Passed BSEC
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 5: Affiliate transaction */}
              {salesReportSubTab === 'affiliate' && (
                <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
                  <div className="bg-zinc-50/80 px-4 py-3 border-b flex justify-between items-center">
                    <h3 className="text-xs font-black text-zinc-550 uppercase tracking-wider">Influencer Promotional referral logs</h3>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 uppercase font-black text-[9px] border-b">
                        <th className="p-3">Affiliate ID</th>
                        <th className="p-3">Promoter / Profile</th>
                        <th className="p-3">Custom Code Tag</th>
                        <th className="p-3 text-center">Referral Sales Count</th>
                        <th className="p-3">Owed Commision BDT</th>
                        <th className="p-3">SLA Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {affiliateTransactions.map((aff) => (
                        <tr key={aff.id} className="hover:bg-zinc-50/50">
                          <td className="p-3 font-mono text-zinc-400">{aff.id}</td>
                          <td className="p-3 font-black text-zinc-800">@{aff.influencer}</td>
                          <td className="p-3 font-mono font-bold text-[#0a457c]">{aff.code}</td>
                          <td className="p-3 text-center font-mono">{aff.salesCount} conversions</td>
                          <td className="p-3 font-mono font-bold text-teal-600">৳{aff.payoutsPay.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                              aff.status === 'Transferred' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {aff.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 6: Deposite */}
              {salesReportSubTab === 'deposite' && (
                <div className="space-y-4">
                  <div className="bg-white border rounded-xl p-5 shadow-xs text-left max-w-xl space-y-4">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wider pb-1 border-b">Integrated Platform Liquid Accounts</h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg text-xs leading-none">
                        <div>
                          <strong className="block text-zinc-800 text-sm font-bold">1. Dutch-Bangla Bank (Agent Banking)</strong>
                          <span className="text-zinc-400 font-mono text-[10px] block mt-1">Acct Ending: ******8042</span>
                        </div>
                        <span className="font-mono font-bold text-zinc-800 text-sm">৳5,54,500</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg text-xs leading-none">
                        <div>
                          <strong className="block text-zinc-800 text-sm font-bold">2. bKash Premium Merchant Account</strong>
                          <span className="text-zinc-400 font-mono text-[10px] block mt-1">Wallet No: 0171****884</span>
                        </div>
                        <span className="font-mono font-bold text-[#f58220] text-sm">৳84,200</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSuccessMsg("Synced financial values with central databases successfully.");
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                      className="bg-[#0a457c] hover:bg-[#073259] text-white text-xs font-bold py-2 px-4 rounded border-none cursor-pointer w-full text-center uppercase"
                    >
                      Sync Bank Ledgers live
                    </button>
                  </div>

                  {/* Vault settlement history */}
                  <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
                    <div className="bg-zinc-50 px-4 py-2 border-b">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase">Recent Capital Settlement logs</h4>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 uppercase font-black text-[9px] border-b">
                          <th className="p-3">Sweep File ID</th>
                          <th className="p-3">Counterparty Bank</th>
                          <th className="p-3">Target Account Number</th>
                          <th className="p-3">Amount Swapped</th>
                          <th className="p-3">Settlement Date</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-zinc-700">
                        {depositLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-50/50">
                            <td className="p-3 font-mono text-zinc-400">{log.id}</td>
                            <td className="p-3 font-bold text-zinc-800">{log.bank}</td>
                            <td className="p-3 font-mono text-zinc-400">{log.account}</td>
                            <td className="p-3 font-mono font-black text-[#0a457c]">৳{log.amount.toLocaleString()}</td>
                            <td className="p-3 text-zinc-500 font-mono text-[10.5px]">{log.date}</td>
                            <td className="p-3">
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: Expense */}
              {salesReportSubTab === 'expense' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* File expense */}
                  <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4 md:col-span-1">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">File Operating Expense</h3>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Expense Description</label>
                        <input 
                          type="text" 
                          id="exp-desc-input"
                          placeholder="e.g. Cardboard parcel carton custom boxes"
                          className="w-full border p-2 rounded focus:outline-none focus:border-[#f58220]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Deduction category</label>
                        <select id="exp-cat-input" className="w-full border p-2 rounded">
                          <option>Infrastructure</option>
                          <option>Operations</option>
                          <option>Logistics</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Billing Amount (BDT)</label>
                        <input 
                          type="number" 
                          id="exp-amt-input"
                          defaultValue={5000}
                          className="w-full border p-2 rounded focus:outline-none focus:border-[#f58220] font-mono font-bold text-red-600"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const dEl = document.getElementById("exp-desc-input") as HTMLInputElement;
                        const cEl = document.getElementById("exp-cat-input") as HTMLSelectElement;
                        const aEl = document.getElementById("exp-amt-input") as HTMLInputElement;
                        if (!dEl?.value) return;

                        setExpenseLedger(prev => [
                          {
                            id: `EXP-${Date.now().toString().slice(-3)}`,
                            desc: dEl.value,
                            category: cEl.value,
                            amount: Number(aEl.value) || 0,
                            date: "30 May 2026"
                          },
                          ...prev
                        ]);

                        dEl.value = "";
                        setSuccessMsg("Expense voucher uploaded to financial repository.");
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg border-0 cursor-pointer text-xs uppercase"
                    >
                      Authorize Expense Voucher
                    </button>
                  </div>

                  {/* Financial journal of expenses */}
                  <div className="bg-white border rounded-xl shadow-xs md:col-span-2 overflow-hidden text-xs">
                    <div className="bg-zinc-50/80 px-4 py-3 border-b">
                      <h3 className="text-xs font-black text-zinc-550 uppercase tracking-wider">Debit Expense Journal</h3>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 uppercase font-black text-[9px] border-b">
                          <th className="p-3">Reference</th>
                          <th className="p-3">Allocation Description</th>
                          <th className="p-3">Budget Category</th>
                          <th className="p-3">Deduction Amount</th>
                          <th className="p-3">Filing Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-zinc-700">
                        {expenseLedger.map((exp) => (
                          <tr key={exp.id} className="hover:bg-zinc-50/50">
                            <td className="p-3 font-mono text-zinc-400">{exp.id}</td>
                            <td className="p-3 font-bold text-zinc-800">{exp.desc}</td>
                            <td className="p-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                exp.category === 'Infrastructure' ? 'bg-indigo-50 text-indigo-700' :
                                exp.category === 'Logistics' ? 'bg-amber-50 text-amber-700' :
                                'bg-zinc-100 text-zinc-650'
                              }`}>
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-black text-rose-500">-৳{exp.amount.toLocaleString()}</td>
                            <td className="p-3 text-zinc-500 font-mono text-[10.5px]">{exp.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: Balance Sheet */}
              {salesReportSubTab === 'balance-sheet' && (
                <div className="space-y-6">
                  {/* Aggregated platform reserves */}
                  <div className="bg-white border rounded-xl shadow-xs overflow-hidden p-5 text-sm space-y-4">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-widest border-b pb-2">Central Balance Sheet Formulation</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Assets Column */}
                      <div className="space-y-2 border-r pr-6 last:border-0 last:pr-0">
                        <h4 className="font-black text-zinc-800 border-b pb-1 text-xs uppercase text-emerald-600">Liquid Assets (Committed Reserves)</h4>
                        <div className="flex justify-between py-1 border-b">
                          <span>Dutch Bangla Bank Holdings</span>
                          <span className="font-mono font-bold">৳5,54,500</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>bKash Merchant Accounts liquidity</span>
                          <span className="font-mono font-bold">৳84,200</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Fulfillment Warehousing Stocks Valuation</span>
                          <span className="font-mono font-bold">৳15,42,800</span>
                        </div>
                        <div className="flex justify-between py-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 rounded">
                          <span>Total platform wealth Assets</span>
                          <span className="font-mono">৳21,81,500</span>
                        </div>
                      </div>

                      {/* Liabilities Column */}
                      <div className="space-y-2">
                        <h4 className="font-black text-zinc-800 border-b pb-1 text-xs uppercase text-rose-600 font-sans">Corporate Liabilities & Liabilities</h4>
                        <div className="flex justify-between py-1 border-b">
                          <span>Vendor Escrow payouts owed</span>
                          <span className="font-mono font-bold">৳45,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Outstanding Affiliate influencer payout logs</span>
                          <span className="font-mono font-bold">৳2,180</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Accrued regulatory 5% VAT obligations</span>
                          <span className="font-mono font-bold">৳28,450</span>
                        </div>
                        <div className="flex justify-between py-1.5 font-bold text-rose-700 bg-rose-50 px-2 rounded">
                          <span>Owed central Liabilities balance</span>
                          <span className="font-mono">৳75,630</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-6 bg-zinc-50 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <strong className="text-zinc-800 text-sm font-black block font-sans">Retained Capital Stock Net Valuation (Assets - Liabilities)</strong>
                        <span className="text-zinc-400 text-[10.5px]">Compliant with BSEC and central bank ledger guidelines.</span>
                      </div>
                      <span className="font-mono font-black text-xl text-[#0a457c]">৳{(2181500 - 75630).toLocaleString()} BDT</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: Gross Profit */}
              {salesReportSubTab === 'gross-profit' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-zinc-700 font-sans">
                  {/* Analysis statistics */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-wide border-b pb-2">Gross profitability breakdown matrix</h3>
                    
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span>Direct Inhouse gross sales cleared</span>
                        <span className="font-mono font-bold text-zinc-800">৳{stats.inHouseEarning.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span>Cost of Goods Sold (Internal fulfillment purchase expense - COGS)</span>
                        <span className="font-mono text-rose-500 font-bold">-৳{Math.round(stats.inHouseEarning * 0.65).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Direct platform gross profit on internal sales</span>
                        <span className="font-mono font-extrabold text-teal-600">৳{Math.round(stats.inHouseEarning * 0.35).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed">
                        <span>Contract Vendor Commission Profits</span>
                        <span className="font-mono text-zinc-800 font-bold">৳{stats.commissionEarned.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span>Central Operational overhead (OPEX server/bag production)</span>
                        <span className="font-mono text-rose-500 font-bold">-৳{(expenseLedger.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}</span>
                      </div>
                      
                      <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg flex justify-between items-center font-bold text-sm">
                        <span>Corporate Net Operating EBITDA profit BDT</span>
                        <span className="font-mono">৳{(Math.round(stats.inHouseEarning * 0.35) + stats.commissionEarned - expenseLedger.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profitability progress bars */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-widest border-b pb-2">Corporate Efficiency Indexes</h3>
                    
                    <div className="space-y-4 pt-1">
                      <div>
                        <div className="flex justify-between font-mono text-[10.5px] text-zinc-650 font-bold mb-1">
                          <span>Central Profit Margin Ratio (35% standard threshold)</span>
                          <span className="text-emerald-600">35.21% Performance</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: "35% "}} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-mono text-[10.5px] text-zinc-650 font-bold mb-1">
                          <span>Operational OPEX efficiency margin (Lower is healthier)</span>
                          <span className="text-[#0a457c]">14.12% Allocation</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#0a457c] h-full rounded-full" style={{ width: "14% "}} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-mono text-[10.5px] text-zinc-650 font-bold mb-1">
                          <span>Central Reserves liquidity growth velocity month-on-month</span>
                          <span className="text-teal-650 font-black">▲ 18% Surplus</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full rounded-full" style={{ width: "72% "}} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============== TAB: PRODUCT REPORT ============== */}
          {activeTab === 'product-report' && (
            <div className="space-y-6 text-left font-sans" id="product-report-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Commercial Product report</h1>
                <p className="text-xs text-zinc-400 font-sans">Summary reports detailing inventory valuations and fast-selling product items metrics.</p>
              </div>

              <div className="bg-white border rounded-xl p-5 shadow-sm text-xs space-y-4">
                <h3 className="font-extrabold text-sm border-b pb-2">Valuations breakdown matrix</h3>
                <div className="divide-y divide-zinc-100 text-zinc-600 font-medium">
                  <div className="flex justify-between py-2.5">
                    <span>Total Unique SKUs in Database</span>
                    <strong className="font-mono">{products.length} catalog items</strong>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span>In-House Inventory Valuation (BDT)</span>
                    <strong className="font-mono text-zinc-800 text-sm">৳{products.reduce((sum, p) => sum + (p.priceBDT * p.stock), 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span>Average rating rating</span>
                    <strong className="font-mono text-zinc-800 font-bold">4.82 ⭐ out of 5.0 rating score</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============== TAB: ORDER REPORT ============== */}
          {activeTab === 'order-report' && (
            <div className="space-y-6 text-left font-sans" id="order-report-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Customer Order analytics reports</h1>
                <p className="text-xs text-zinc-400 font-sans">Track and download comprehensive analytics reports containing success rate metrics.</p>
              </div>

              <div className="bg-white border rounded-xl p-5 shadow-sm text-xs space-y-4">
                <h3 className="font-extrabold text-sm border-b pb-2">Order Analytics breakdown matrix</h3>
                <div className="divide-y divide-zinc-100 text-zinc-600 font-medium">
                  <div className="flex justify-between py-2.5">
                    <span>Total Orders Logged</span>
                    <strong className="font-mono text-zinc-805">{stats.totalSale}</strong>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span>Delivered and Completed Transactions</span>
                    <strong className="font-mono text-emerald-600">{stats.delivered} orders dispatched</strong>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span>Total In-flight pending processes</span>
                    <strong className="font-mono text-amber-500">{stats.pending} in-flight pipeline</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============== TAB: CUSTOMERS ============== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 text-left font-sans" id="customers-view-panel">
              {/* Header Label depending on subtab */}
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">
                  {customersSubTab === 'list' ? "Registered Customers Directory" :
                   customersSubTab === 'review' ? "Customer Product Reviews & Moderation" :
                   "Customer Wallet & Credit Bonuses"}
                </h1>
                <p className="text-xs text-zinc-400">
                  {customersSubTab === 'list' ? "Search, monitor, and suspend client authentication pools registered on the application." :
                   customersSubTab === 'review' ? "View ratings, customer textual testimonials, and toggle safe-filtering protocols." :
                   "Disburse target store bonus balances and audit individual client wallet ledgers."}
                </p>
              </div>

              {/* SUBTAB Content - list */}
              {customersSubTab === 'list' && (
                <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 border-b uppercase font-bold text-[10px]">
                        <th className="p-3.5">Full Name</th>
                        <th className="p-3.5">Email Callback</th>
                        <th className="p-3.5 text-center">Invoiced Orders Count</th>
                        <th className="p-3.5 text-right">Acct balance</th>
                        <th className="p-3.5 text-center">Safety Status</th>
                        <th className="p-3.5 text-center">Lock operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {customersList.map((cust, i) => (
                        <tr key={i} className="hover:bg-zinc-50/50">
                          <td className="p-3.5 text-zinc-800 font-extrabold">{cust.name}</td>
                          <td className="p-3.5 font-mono">{cust.email}</td>
                          <td className="p-3.5 text-center font-mono">{cust.totalOrders} purchased</td>
                          <td className="p-3.5 text-right font-mono font-bold">৳{cust.balanceBDT.toLocaleString()}</td>
                          <td className="p-3.5 text-center">
                            <span className={`${cust.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'} text-[10px] px-2.5 py-0.5 rounded font-black`}>
                              {cust.active ? "AUTHORIZED" : "SUSPEND_LOCK"}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                setCustomersList(prev => prev.map((c, idx) => idx === i ? { ...c, active: !c.active } : c));
                                setSuccessMsg(`Toggled authentication for ${cust.name}`);
                                setTimeout(() => setSuccessMsg(""), 3000);
                              }}
                              className="bg-zinc-100 hover:bg-zinc-200 border py-1 px-3 text-zinc-700 rounded font-semibold text-[11px]"
                            >
                              Toggle Ban Lock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBTAB Content - review */}
              {customersSubTab === 'review' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customerReviews.map((rev) => (
                      <div key={rev.id} className="bg-white border rounded-xl p-4 shadow-xs space-y-2 text-xs relative text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="block text-zinc-900">{rev.customerName}</strong>
                            <span className="text-[10px] text-zinc-400">Target Product: {rev.product}</span>
                          </div>
                          <div className="text-amber-500 font-bold">{"⭐".repeat(rev.rating)}</div>
                        </div>
                        <p className="text-zinc-650 leading-relaxed italic bg-zinc-50 p-2.5 rounded-lg border">
                          "{rev.comment}"
                        </p>
                        <div className="flex justify-between items-center text-[10.5px] pt-1 border-t">
                          <span className={`font-bold uppercase ${
                            rev.status === 'Approved' ? 'text-teal-600' : 'text-amber-600'
                          }`}>
                            {rev.status === 'Approved' ? "● Live on Site" : "● Staged for QC"}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setCustomerReviews(prev => prev.map(r => r.id === rev.id ? { ...r, status: r.status === 'Approved' ? 'Pending' : 'Approved' } : r));
                                setSuccessMsg(`Review approval status toggled for item ID: ${rev.id}`);
                                setTimeout(() => setSuccessMsg(""), 2000);
                              }}
                              className="text-zinc-750 hover:bg-zinc-100 font-bold px-2 py-1 rounded border cursor-pointer"
                            >
                              {rev.status === 'Approved' ? "Stage" : "Approve"}
                            </button>
                            <button
                              onClick={() => {
                                requestDeletion(
                                  "রিভিউ ডিলিট নিশ্চিতকরণ",
                                  "Confirm Review Deletion",
                                  `আপনি কি নিশ্চিতভাবেই গ্রাহক '${rev.reviewer}' এর রিভিউটি ডিলিট করতে চান?`,
                                  `Are you sure you want to permanently delete user review by ${rev.reviewer}?`,
                                  () => {
                                    setCustomerReviews(prev => prev.filter(r => r.id !== rev.id));
                                    setSuccessMsg("Review permanently deleted.");
                                    setTimeout(() => setSuccessMsg(""), 2000);
                                  }
                                );
                              }}
                              className="text-red-500 hover:bg-red-50 font-bold px-2 py-1 rounded border border-red-200 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB Content - wallet-bonus */}
              {customersSubTab === 'wallet-bonus' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white border rounded-xl p-5 shadow-xs text-xs space-y-4 md:col-span-1">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-widest border-b pb-2">Load direct Wallet Bonus</h3>
                    
                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Target Customer Profile</label>
                        <select id="bonus-cust-select" className="w-full border p-2 rounded">
                          {customersList.map((c, i) => (
                            <option key={i} value={c.email}>{c.name} ({c.email})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Select Bonus Package</label>
                        <select id="bonus-pkg-select" className="w-full border p-2 rounded font-sans">
                          {walletBonusCampaigns.map((offer) => {
                            const bonusAmt = Math.round(offer.triggerMinBDT * (offer.bonusPercent / 100));
                            return (
                              <option key={offer.id} value={bonusAmt}>
                                {offer.title} (+৳{bonusAmt})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          const cEl = document.getElementById("bonus-cust-select") as HTMLSelectElement;
                          const pEl = document.getElementById("bonus-pkg-select") as HTMLSelectElement;
                          if (!cEl || !pEl) return;

                          const email = cEl.value;
                          const bonusAmount = Number(pEl.value) || 0;

                          setCustomersList(prev => prev.map(c => c.email === email ? { ...c, balanceBDT: c.balanceBDT + bonusAmount } : c));
                          setSuccessMsg(`Disbursed BDT ${bonusAmount} bonus to target customer!`);
                          setTimeout(() => setSuccessMsg(""), 3500);
                        }}
                        className="w-full bg-[#0a457c] hover:bg-[#073259] text-white font-black py-2.5 rounded-lg border-0 cursor-pointer text-xs uppercase"
                      >
                        Grant wallet bonus
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-5 shadow-xs text-xs md:col-span-2 space-y-3">
                    <h3 className="font-extrabold text-xs text-zinc-400 uppercase tracking-widest border-b pb-2">Active Wallet Promo Packages list</h3>
                    <div className="divide-y space-y-3">
                      {walletBonusCampaigns.map((offer) => {
                        const bonusAmt = Math.round(offer.triggerMinBDT * (offer.bonusPercent / 100));
                        return (
                          <div key={offer.id} className="pt-3 first:pt-0 text-left flex justify-between items-center">
                            <div>
                              <strong className="block font-bold text-zinc-900">{offer.title} ({offer.bonusPercent}% Match)</strong>
                              <p className="text-zinc-450 text-[10.5px] mt-0.5">Applies when users complete wallet top-ups through our payment partners.</p>
                            </div>
                            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                              +৳{bonusAmt.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============== TAB: SELLERS ============== */}
          {activeTab === 'sellers' && (
            <div className="space-y-6 text-left font-sans" id="sellers-tab-view">
              {/* Header depending on active sub-tab */}
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">
                  {sellersSubTab === 'list' ? "Third-Party Store Sellers Directory" : "Escrow Withdrawals & Payout Requests"}
                </h1>
                <p className="text-xs text-zinc-400">
                  {sellersSubTab === 'list' ? "Index of third-party shop sellers operating under commission models on Nabik Bazar." :
                   "Approve bank transfers and reconcile escrow request tickets issued by partner vendors."}
                </p>
              </div>

              {/* SUBTAB - list */}
              {sellersSubTab === 'list' && (
                <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-zinc-50/80 px-4 py-3 border-b flex justify-between items-center select-none">
                    <h3 className="text-xs font-black text-zinc-550 uppercase tracking-wider">Approved Platform Store Vendors</h3>
                    <span className="text-[10px] text-zinc-400 font-mono font-bold">Total: {vendorsList.length} Stores</span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 uppercase font-black text-[9px] border-b">
                        <th className="p-3.5">Store / Business Name</th>
                        <th className="p-3.5">Assigned License No</th>
                        <th className="p-3.5 text-center">Listed Catalog Items</th>
                        <th className="p-3.5 text-center">Commission Percentage</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {vendorsList.map((vend, i) => (
                        <tr key={i} className="hover:bg-zinc-50/50">
                          <td className="p-3.5 font-bold text-zinc-900">{vend.name}</td>
                          <td className="p-3.5 font-mono text-zinc-400">SELL-BD-{(8092 + i * 17)}</td>
                          <td className="p-3.5 text-center font-mono font-bold">{vend.productsCount} SKUs</td>
                          <td className="p-3.5 text-center font-mono font-black text-teal-600">{vend.commissionPercent}%</td>
                          <td className="p-3.5">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded">
                              APPROVED
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                setSuccessMsg(`Triggered audit report for store: ${vend.name}`);
                                setTimeout(() => setSuccessMsg(""), 3000);
                              }}
                              className="bg-zinc-50 hover:bg-zinc-100 border py-1 px-3 rounded text-[11px] font-semibold text-zinc-700 cursor-pointer"
                            >
                              Audit Catalog
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBTAB - withdraw */}
              {sellersSubTab === 'withdraw' && (
                <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-zinc-50/80 px-4 py-3 border-b flex justify-between items-center select-none">
                    <h3 className="text-xs font-black text-zinc-550 uppercase tracking-wider">Vendor Escrow Claim Tickets</h3>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 uppercase font-black text-[9px] border-b">
                        <th className="p-3.5">Request Reference</th>
                        <th className="p-3.5">Target Store Name</th>
                        <th className="p-3.5">Destination Bank Channel / Gateway</th>
                        <th className="p-3.5">Request Date</th>
                        <th className="p-3.5 text-right font-bold">Withdraw Amount</th>
                        <th className="p-3.5 text-center">Payout Status</th>
                        <th className="p-3.5 text-center">Payout settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {withdrawRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-zinc-50/50">
                          <td className="p-3.5 font-mono text-zinc-400">{req.id}</td>
                          <td className="p-3.5 font-bold text-zinc-900">{req.sellerName}</td>
                          <td className="p-3.5 leading-normal">
                            <span className="block font-bold">{req.gateway}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">Acct: Premium Vendor Route</span>
                          </td>
                          <td className="p-3.5 text-zinc-500 font-mono text-[10.5px]">{req.requestDate}</td>
                          <td className="p-3.5 text-right font-mono font-extrabold text-[#0a457c]">৳{req.amountBDT.toLocaleString()}</td>
                          <td className="p-3.5 text-center">
                            <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                              req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {req.status !== 'Approved' ? (
                              <button
                                onClick={() => {
                                  setWithdrawRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "Approved" } : r));
                                  setSuccessMsg("Dispatched electronic clearing instruction to banking routing gateway.");
                                  setTimeout(() => setSuccessMsg(""), 3500);
                                }}
                                className="bg-[#0a457c] hover:bg-[#073259] text-white py-1 px-3 rounded text-[11px] font-black uppercase border-0 cursor-pointer shadow-sm"
                              >
                                Approve Payout
                              </button>
                            ) : (
                              <span className="text-[10.5px] text-zinc-400 font-bold">✓ Cleared</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeTab === 'delivery-man' && (
            <div className="space-y-6 text-left font-sans" id="delivery-man-view">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Dispatched Delivery Agents & Couriers</h1>
                <p className="text-xs text-zinc-400 font-sans">Active shipping couriers and independent riders responsible for door-to-door catalog delivery.</p>
              </div>

              {/* Delivery-man Sub-Tabs Navigation */}
              <div className="flex border-b border-zinc-200 pb-px space-x-6 overflow-x-auto select-none">
                {[
                  { id: "list", label: "Agent List" },
                  { id: "add", label: "Add Courier" },
                  { id: "chat", label: "Live Chat with Riders" },
                  { id: "withdraws", label: "Withdraw Requests" },
                  { id: "emergency", label: "Emergency Help Desk" }
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setDeliveryManSubTab(tb.id)}
                    className={`py-2 px-1 text-xs font-bold transition-all duration-150 border-b-2 bg-transparent cursor-pointer relative ${
                      deliveryManSubTab === tb.id 
                        ? 'border-[#0a457c] text-[#0a457c]' 
                        : 'border-transparent text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {tb.label}
                    {tb.id === 'withdraws' && deliveryWithdrawRequests.filter(r => r.status === 'Pending').length > 0 && (
                      <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] px-1.5 rounded-full font-sans font-black scale-90 animate-pulse">
                        {deliveryWithdrawRequests.filter(r => r.status === 'Pending').length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* SUB TAB: LIST */}
              {deliveryManSubTab === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white px-4 py-3 border rounded-xl shadow-2xs">
                    <span className="text-[11.5px] text-zinc-500 font-medium">Showing active independent riders across divisions</span>
                    <button
                      onClick={() => setDeliveryManSubTab('add')}
                      className="bg-[#0a457c] hover:bg-[#073259] text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg border-0 cursor-pointer flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>Register New Rider</span>
                    </button>
                  </div>

                  <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 border-b uppercase font-bold text-[10px]">
                          <th className="p-3.5">Rider ID</th>
                          <th className="p-3.5">Rider Name</th>
                          <th className="p-3.5">Vehicle Type</th>
                          <th className="p-3.5">Zone Coverage</th>
                          <th className="p-3.5 text-right">Withdrawable Balance</th>
                          <th className="p-3.5 text-center">Duty Status</th>
                          <th className="p-3.5 text-center">Toggle / Revoke</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {deliveryMenList.map((rider) => (
                          <tr key={rider.id} className="hover:bg-zinc-50/50">
                            <td className="p-3.5 font-mono text-[#0a457c] font-extrabold">{rider.id}</td>
                            <td className="p-3.5">
                              <span className="block font-bold text-zinc-900">{rider.name}</span>
                              <span className="text-[10px] text-zinc-404 font-mono italic block mt-0.5">{rider.email}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="bg-sky-50 text-sky-700 text-[10.5px] px-2 py-0.5 rounded-sm font-bold uppercase">{rider.vehicle}</span>
                            </td>
                            <td className="p-3.5 text-zinc-640 font-semibold">{rider.zone}</td>
                            <td className="p-3.5 text-right font-mono font-black text-emerald-600">৳{rider.balance.toLocaleString()}</td>
                            <td className="p-3.5 text-center">
                              <span className={`text-[10px] tracking-wide font-black uppercase px-2 py-0.5 rounded-full ${
                                rider.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'
                              }`}>
                                {rider.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-center space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setDeliveryMenList(prev => prev.map(m => m.id === rider.id ? { ...m, status: m.status === "Active" ? "Inactive" : "Active" } : m));
                                  setSuccessMsg(`Toggled network access status for courier: ${rider.name}`);
                                  setTimeout(() => setSuccessMsg(""), 3000);
                                }}
                                className="bg-zinc-50 hover:bg-zinc-100 border text-[11px] font-semibold text-zinc-700 px-2.5 py-1 rounded cursor-pointer"
                              >
                                Toggle Duty
                              </button>
                              <button
                                onClick={() => {
                                  requestDeletion(
                                    "কুরিয়ার এজেন্ট ডিলিট নিশ্চিতকরণ",
                                    "Confirm Delivery Courier Revocation",
                                    `আপনি কি নিশ্চিতভাবেই কুরিয়ার কুরিয়ার এজেন্ট '${rider.name}' কে ডি-রেজিস্টার করতে চান?`,
                                    `Are you sure you want to de-register and permanently revoke courier agent '${rider.name}'?`,
                                    () => {
                                      setDeliveryMenList(prev => prev.filter(m => m.id !== rider.id));
                                      setSuccessMsg(`De-registered and revoked courier: ${rider.name}`);
                                      setTimeout(() => setSuccessMsg(""), 3000);
                                    }
                                  );
                                }}
                                className="bg-red-50 hover:bg-red-100 text-[11px] font-bold text-red-600 px-2.5 py-1 rounded border-0 cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB: ADD NEW */}
              {deliveryManSubTab === 'add' && (
                <div className="bg-white border rounded-xl p-6 shadow-2xs max-w-lg">
                  <h3 className="font-extrabold text-sm border-b pb-2 mb-4">Register New Delivery Courier</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newDmName || !newDmPhone || !newDmEmail) {
                      setSuccessMsg("Please complete all requested registration credentials.");
                      setTimeout(() => setSuccessMsg(""), 3000);
                      return;
                    }
                    const newRider = {
                      id: `DM-${101 + deliveryMenList.length}`,
                      name: newDmName,
                      phone: newDmPhone,
                      email: newDmEmail,
                      zone: newDmZone,
                      status: "Active",
                      vehicle: newDmVehicle,
                      balance: 0
                    };
                    setDeliveryMenList(prev => [newRider, ...prev]);
                    // Auto setup dummy chat
                    setDmChatMessages(prev => ({
                      ...prev,
                      [newRider.id]: [
                        { sender: "admin", text: `Welcome to Nabik Bazar dispatch team, ${newDmName}! Ready for dispatch.`, time: "Just now" }
                      ]
                    }));

                    setSuccessMsg(`Newly registered rider: '${newDmName}' is now live on our shipping network.`);
                    setTimeout(() => setSuccessMsg(""), 3500);

                    // clear states
                    setNewDmName("");
                    setNewDmPhone("");
                    setNewDmEmail("");
                    setDeliveryManSubTab("list");
                  }} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Rider Full Name</label>
                      <input 
                        type="text" 
                        value={newDmName}
                        onChange={(e) => setNewDmName(e.target.value)}
                        placeholder="e.g., Sajid Rahman" 
                        className="w-full border rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Mobile Contact Phone</label>
                      <input 
                        type="text" 
                        value={newDmPhone}
                        onChange={(e) => setNewDmPhone(e.target.value)}
                        placeholder="e.g., 01712233445" 
                        className="w-full border rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Official Email Address</label>
                      <input 
                        type="email" 
                        value={newDmEmail}
                        onChange={(e) => setNewDmEmail(e.target.value)}
                        placeholder="e.g., rider@nabikbazar.com" 
                        className="w-full border rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Operational Division Zone</label>
                        <select 
                          value={newDmZone}
                          onChange={(e) => setNewDmZone(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-xs bg-white"
                        >
                          <option value="Dhaka (Gulshan, Banani)">Dhaka (Gulshan, Banani)</option>
                          <option value="Dhaka (Mirpur, Uttara)">Dhaka (Mirpur, Uttara)</option>
                          <option value="Chittagong Central">Chittagong Central</option>
                          <option value="Sylhet Environs">Sylhet Environs</option>
                          <option value="Gazipur Industrial Belt">Gazipur Industrial Belt</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Rider Vehicle Mode</label>
                        <select 
                          value={newDmVehicle}
                          onChange={(e) => setNewDmVehicle(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-xs bg-white"
                        >
                          <option value="Motorcycle">Motorcycle</option>
                          <option value="Bicycle">Bicycle</option>
                          <option value="Covered Van">Covered Van</option>
                          <option value="Foot Courier">Foot Courier</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#f58220] hover:bg-[#d86f16] text-white font-extrabold text-xs py-2.5 rounded-lg border-0 cursor-pointer shadow-xs transition"
                    >
                      Process Rider Credentials
                    </button>
                  </form>
                </div>
              )}

              {/* SUB TAB: LIVE CHAT */}
              {deliveryManSubTab === 'chat' && (
                <div className="bg-white border rounded-xl overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-3 max-w-4xl h-[450px]">
                  {/* Left Column - Rider Contacts Selection */}
                  <div className="border-r border-zinc-100 bg-[#063b6d]/5 flex flex-col h-full overflow-y-auto">
                    <div className="p-3 bg-zinc-50 border-b font-extrabold text-[10px] tracking-wider uppercase text-zinc-400 select-none">
                      Rider Radio Channels
                    </div>
                    <div className="divide-y divide-zinc-100 font-sans">
                      {deliveryMenList.map((m) => {
                        const hasMsgs = !!dmChatMessages[m.id];
                        const lastMsg = hasMsgs ? dmChatMessages[m.id][dmChatMessages[m.id].length - 1]?.text : "No messages yet";
                        return (
                          <button
                            key={m.id}
                            onClick={() => setDmChatId(m.id)}
                            className={`w-full text-left p-3 flex flex-col space-y-1 transition duration-155 border-0 cursor-pointer ${
                              dmChatId === m.id ? 'bg-[#0a457c]/10 border-l-4 border-[#0a457c]' : 'hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <strong className="text-zinc-800 text-[12.5px] font-bold">{m.name}</strong>
                              <span className="text-[9px] font-mono text-[#0a457c] font-bold bg-[#0a457c]/10 px-1 rounded">{m.id}</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 truncate max-w-[200px] leading-snug">{lastMsg}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column - Chat Window */}
                  <div className="col-span-2 flex flex-col h-full bg-white justify-between">
                    {/* Active rider profile banner */}
                    {(() => {
                      const activeRider = deliveryMenList.find(r => r.id === dmChatId);
                      return (
                        <>
                          <div className="p-3 bg-zinc-50 border-b flex justify-between items-center select-none">
                            <div className="text-left font-sans">
                              <span className="text-[10px] text-[#0a457c] font-black tracking-wide block font-mono">{dmChatId} • ACTIVE DISPATCH RADIO</span>
                              <strong className="text-zinc-800 text-[13px] font-extrabold">{activeRider ? activeRider.name : "Select Dispatcher"}</strong>
                            </div>
                            <span className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>COURIER IN-FLIGHT</span>
                            </span>
                          </div>

                          {/* Message Trail Container */}
                          <div className="p-4 overflow-y-auto space-y-4 flex-grow text-xs font-sans bg-zinc-50/20">
                            {dmChatMessages[dmChatId]?.map((msg, idx) => {
                              const isAdmin = msg.sender === 'admin';
                              return (
                                <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`p-3 max-w-[75%] rounded-2xl relative ${
                                    isAdmin 
                                      ? 'bg-[#0a457c] text-white rounded-tr-none' 
                                      : 'bg-zinc-100 text-zinc-800 rounded-tl-none border'
                                  }`}>
                                    <p className="leading-relaxed whitespace-pre-line break-words text-left">{msg.text}</p>
                                    <span className="text-[9.5px] opacity-60 block text-right mt-1 font-mono">{msg.time}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Send Chat Field */}
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!newDmChatMsgText.trim()) return;
                            const currentTarget = dmChatId;
                            const newMsg = { sender: 'admin' as const, text: newDmChatMsgText, time: "Just now" };
                            
                            setDmChatMessages(prev => ({
                              ...prev,
                              [currentTarget]: [...(prev[currentTarget] || []), newMsg]
                            }));
                            setNewDmChatMsgText("");

                            // Automated rider response simulator
                            setTimeout(() => {
                              let autoReply = "Assalamu alaikum. Ami visual waypoint checkpoints update korechi.";
                              if (currentTarget === "DM-101") {
                                autoReply = "Ji sir, delivery successfully deliver kora hoyeche, customer signature ekhon up-to-date.";
                              } else if (currentTarget === "DM-102") {
                                autoReply = "Mirpur road clear. On my way check the warehouse now.";
                              } else if (currentTarget === "DM-103") {
                                autoReply = "Heavy rainfall challenge persistent, but shipping ETA is safe inside 2 hours.";
                              }
                              setDmChatMessages(prev => ({
                                ...prev,
                                [currentTarget]: [...(prev[currentTarget] || []), { sender: 'dm' as const, text: autoReply, time: "Just now" }]
                              }));
                            }, 1800);

                          }} className="p-3 bg-zinc-50 border-t flex items-center space-x-2">
                            <input 
                              type="text"
                              value={newDmChatMsgText}
                              onChange={(e) => setNewDmChatMsgText(e.target.value)}
                              placeholder={`Speak into ${activeRider?.name || "rider"}'s Nabik dispatch terminal...`}
                              className="flex-grow border px-3 py-2 text-xs rounded-lg"
                            />
                            <button
                              type="submit"
                              className="bg-[#0a457c] hover:bg-[#073259] text-white px-4 py-2 text-xs font-extrabold uppercase border-0 rounded-lg cursor-pointer"
                            >
                              Dispatch radio
                            </button>
                          </form>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* SUB TAB: WITHDRAWS */}
              {deliveryManSubTab === 'withdraws' && (
                <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
                  <div className="p-3.5 bg-zinc-50 border-b font-extrabold text-[10px] tracking-wider uppercase text-zinc-400 select-none">
                    Courier Earnings Claim Submissions
                  </div>

                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 border-b uppercase font-semibold text-[10px]">
                        <th className="p-3.5">Ticket ID</th>
                        <th className="p-3.5">Courier Name</th>
                        <th className="p-3.5">Requested Amount</th>
                        <th className="p-3.5">Settlement Channel</th>
                        <th className="p-3.5">Request Date</th>
                        <th className="p-3.5 text-center">Verification Status</th>
                        <th className="p-3.5 text-center">Settlement Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-700">
                      {deliveryWithdrawRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-zinc-50/50">
                          <td className="p-3.5 font-mono text-zinc-404">{req.id}</td>
                          <td className="p-3.5 font-bold text-zinc-900">{req.name}</td>
                          <td className="p-3.5 font-mono font-black text-emerald-600">৳{req.amount.toLocaleString()}</td>
                          <td className="p-3.5">
                            <span className="block font-semibold">{req.method}</span>
                            <span className="text-[10px] text-zinc-404 font-mono italic">Acct No: {req.account}</span>
                          </td>
                          <td className="p-3.5 font-mono text-[10.5px] text-zinc-500">{req.date}</td>
                          <td className="p-3.5 text-center">
                            <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                              req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {req.status === 'Pending' ? (
                              <button
                                onClick={() => {
                                  // Update request status to Approved
                                  setDeliveryWithdrawRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "Approved" } : r));
                                  
                                  // Subtract from delivery man's visual wallet balance to reflect realism!
                                  setDeliveryMenList(prev => prev.map(dm => dm.name === req.name ? { ...dm, balance: Math.max(0, dm.balance - req.amount) } : dm));
                                  
                                  setSuccessMsg(`Dispatched electronic clearing instruction of ৳${req.amount.toLocaleString()} to ${req.name}'s ${req.method} routing.`);
                                  setTimeout(() => setSuccessMsg(""), 3500);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase text-[10px] px-2.5 py-1 border-0 rounded cursor-pointer transition shadow-2xs"
                              >
                                Clear Funds
                              </button>
                            ) : (
                              <span className="text-[10.5px] text-zinc-400 font-bold">✓ Payout Cleared</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUB TAB: EMERGENCY */}
              {deliveryManSubTab === 'emergency' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 text-left space-y-3">
                    <div className="flex justify-between items-center bg-transparent">
                      <strong className="text-rose-900 font-extrabold text-sm uppercase">National Police & EMS</strong>
                      <span className="bg-rose-100 text-rose-700 font-mono text-[10.5px] px-2 py-0.5 rounded font-black">HOTLINE 999</span>
                    </div>
                    <p className="text-[11.5px] text-rose-700 leading-relaxed font-semibold">Use during severe accidents, high-road thefts, or major delivery checkpoint obstructions instantly.</p>
                    <div className="pt-2 border-t border-rose-200/50 font-mono text-[11px] text-rose-900 font-black">
                      Direct Dial: 999 (No charge)
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-zinc-50 border rounded-xl p-5 text-left space-y-3">
                    <div className="flex justify-between items-center bg-transparent">
                      <strong className="text-zinc-900 font-extrabold text-sm uppercase">Nabik Central Dispatch HQ</strong>
                      <span className="bg-zinc-200 text-zinc-700 font-mono text-[10.5px] px-2 py-0.5 rounded font-black">TEL-BD</span>
                    </div>
                    <p className="text-[11.5px] text-zinc-600 leading-relaxed font-semibold">Contact administrative delivery team for route re-assignment, COD disputes, or parcel rejection logs verification.</p>
                    <div className="pt-2 border-t font-mono text-[11px] text-[#0a457c] font-black">
                      Hotline: +8801784905075
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-5 text-left space-y-3">
                    <div className="flex justify-between items-center bg-transparent">
                      <strong className="text-sky-900 font-extrabold text-sm uppercase">SLA Settlement & Insurance</strong>
                      <span className="bg-sky-100 text-sky-700 font-mono text-[10.5px] px-2 py-0.5 rounded font-black">FINANCE</span>
                    </div>
                    <p className="text-[11.5px] text-sky-600 leading-relaxed font-semibold">Queries on fuel allowance tickets, Eid priority dispatch bonuses, and medical claims routing.</p>
                    <div className="pt-2 border-t border-sky-200/50 font-mono text-[11px] text-[#0a457c] font-black">
                      Email: clearance@nabikbazar.com
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============== TAB: EMPLOYEES ============== */}
          {activeTab === 'employees' && (
            <div className="space-y-6 text-left font-sans" id="employees-view">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Platform System Employees & Administrators</h1>
                <p className="text-xs text-zinc-400 font-sans">Administrators, moderator profiles, and staff granted access permissions to the Nabik Bazar Suite.</p>
              </div>

              {/* Employees Sub-Tabs Navigation */}
              <div className="flex border-b border-zinc-200 pb-px space-x-6 select-none bg-transparent">
                {[
                  { id: "role-setup", label: "Employee Role Setup" },
                  { id: "list", label: "Employees" }
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setEmployeesSubTab(tb.id)}
                    className={`py-2 px-1 text-xs font-bold transition-all duration-150 border-b-2 bg-transparent cursor-pointer relative ${
                      employeesSubTab === tb.id 
                        ? 'border-[#0a457c] text-[#0a457c]' 
                        : 'border-transparent text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* SUB TAB: ROLE SETUP (Role Designer) */}
              {employeesSubTab === 'role-setup' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Form to create role */}
                  <div className="bg-white border rounded-xl p-6 shadow-2xs h-fit">
                    <h3 className="font-extrabold text-xs tracking-wider uppercase text-zinc-400 border-b pb-2 mb-4">Designer Role Security</h3>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!newRoleName) {
                        setSuccessMsg("Please state the Role Name.");
                        setTimeout(() => setSuccessMsg(""), 2000);
                        return;
                      }
                      if (newRolePerms.length === 0) {
                        setSuccessMsg("Please choose at least one access permission.");
                        setTimeout(() => setSuccessMsg(""), 2000);
                        return;
                      }

                      const newRole = {
                        id: `ROLE-${employeeRoles.length + 1}`,
                        name: newRoleName,
                        permissions: newRolePerms,
                        count: 0
                      };

                      setEmployeeRoles(prev => [...prev, newRole]);
                      setSuccessMsg(`Registered system privilege blueprint '${newRoleName}'.`);
                      setTimeout(() => setSuccessMsg(""), 3000);

                      // reset
                      setNewRoleName("");
                      setNewRolePerms([]);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Role Title</label>
                        <input
                          type="text"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          placeholder="e.g. Sales Moderator"
                          className="w-full border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-zinc-400 mb-2">Module Permissions</label>
                        <div className="space-y-2 text-xs text-zinc-700">
                          {["Products", "Orders", "Users", "Payouts", "Settings", "System Logs", "Helpdesk"].map((mod) => {
                            const hasIt = newRolePerms.includes(mod);
                            return (
                              <label key={mod} className="flex items-center space-x-2 cursor-pointer select-none bg-transparent">
                                <input
                                  type="checkbox"
                                  checked={hasIt}
                                  onChange={() => {
                                    if (hasIt) {
                                      setNewRolePerms(prev => prev.filter(p => p !== mod));
                                    } else {
                                      setNewRolePerms(prev => [...prev, mod]);
                                    }
                                  }}
                                  className="rounded border-zinc-300 text-[#00a651]"
                                />
                                <span>{mod} Access</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#f58220] hover:bg-[#d86f16] text-white font-extrabold text-xs py-2 rounded-lg border-0 cursor-pointer shadow-xs transition"
                      >
                        Register Access Blueprint
                      </button>
                    </form>
                  </div>

                  {/* Listing existing blueprints */}
                  <div className="md:col-span-2 bg-white border rounded-xl overflow-hidden shadow-2xs text-xs">
                    <div className="p-3.5 bg-zinc-50 border-b font-extrabold uppercase text-[10px] text-zinc-400 select-none">Access Level Blueprints</div>
                    <div className="divide-y font-sans">
                      {employeeRoles.map((role) => (
                        <div key={role.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
                          <div className="text-left space-y-1">
                            <div className="flex items-center space-x-2">
                              <strong className="text-zinc-900 text-sm font-extrabold">{role.name}</strong>
                              <span className="font-mono text-[9px] text-[#0a457c] bg-[#0a457c]/10 px-1.5 py-0.5 rounded font-bold">{role.id}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {role.permissions.map((p) => (
                                <span key={p} className="bg-emerald-50 text-emerald-700 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                                  ✓ {p}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-404 font-bold block">{role.count} associated staff</span>
                            <button
                              disabled={role.id === "ROLE-1" || role.id === "ROLE-2"}
                              onClick={() => {
                                requestDeletion(
                                  "রোল ডিলিট নিশ্চিতকরণ",
                                  "Confirm Role Blueprint Deletion",
                                  `আপনি কি নিশ্চিতভাবেই রোল '${role.name}' ডিলিট করতে চান?`,
                                  `Are you sure you want to permanently revoke structure blueprint for '${role.name}'?`,
                                  () => {
                                    setEmployeeRoles(prev => prev.filter(r => r.id !== role.id));
                                    setSuccessMsg(`Revoked and deleted role: ${role.name}`);
                                    setTimeout(() => setSuccessMsg(""), 3000);
                                  }
                                );
                              }}
                              className={`text-[10.5px] font-bold text-red-600 border border-red-200 mt-2 px-2.5 py-1 rounded bg-transparent ${
                                (role.id === "ROLE-1" || role.id === "ROLE-2") ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-50 cursor-pointer'
                              }`}
                            >
                              Destroy Blueprint
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: EMPLOYEES (Staff Registry and Add) */}
              {employeesSubTab === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Table lists */}
                  <div className="md:col-span-2 bg-white border rounded-xl overflow-hidden shadow-2xs">
                    <div className="p-3.5 bg-zinc-50 border-b font-extrabold uppercase text-[10px] text-zinc-400 select-none">Platform Privileged Users</div>
                    
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 border-b uppercase font-bold text-[10px]">
                          <th className="p-3.5">ID</th>
                          <th className="p-3.5">Staff Name</th>
                          <th className="p-3.5">Role Level</th>
                          <th className="p-3.5 text-center">Security Switch</th>
                          <th className="p-3.5 text-center">Safety Lock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-sansType">
                        {employeesList.map((emp) => (
                          <tr key={emp.id} className="hover:bg-zinc-50/50">
                            <td className="p-3.5 font-mono text-zinc-404">{emp.id}</td>
                            <td className="p-3.5">
                              <strong className="block text-zinc-900 font-extrabold">{emp.name}</strong>
                              <span className="text-[10px] text-zinc-440 font-mono italic block mt-0.5">{emp.email}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded">
                                {emp.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className={`text-[10px] tracking-wide font-black uppercase px-2 py-0.5 rounded-full ${
                                emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'
                              }`}>
                                {emp.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <button
                                disabled={emp.id === 'EMP-001'}
                                onClick={() => {
                                  setEmployeesList(prev => prev.map(e => e.id === emp.id ? { ...e, status: e.status === "Active" ? "Suspended" : "Active" } : e));
                                  setSuccessMsg(`Altered credential state for: ${emp.name}`);
                                  setTimeout(() => setSuccessMsg(""), 3000);
                                }}
                                className={`text-[11px] font-semibold border-0 text-zinc-700 px-2.5 py-1 rounded ${
                                  emp.id === 'EMP-001' ? 'opacity-30 cursor-not-allowed bg-zinc-100' : 'bg-zinc-100 hover:bg-zinc-200 cursor-pointer'
                                }`}
                              >
                                Toggle Lock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Form to append staff */}
                  <div className="bg-white border rounded-xl p-6 shadow-2xs h-fit">
                    <h3 className="font-extrabold text-xs tracking-wider uppercase text-zinc-400 border-b pb-2 mb-4">Onboard Staff Admin</h3>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!newEmpName || !newEmpEmail) {
                        setSuccessMsg("Please complete the required fields.");
                        setTimeout(() => setSuccessMsg(""), 2000);
                        return;
                      }

                      const newEmployeeObj = {
                        id: `EMP-${101 + employeesList.length}`,
                        name: newEmpName,
                        email: newEmpEmail,
                        role: newEmpRole,
                        status: "Active"
                      };

                      setEmployeesList(prev => [...prev, newEmployeeObj]);
                      
                      // Increment role usage count dynamically!
                      setEmployeeRoles(prev => prev.map(r => r.name === newEmpRole ? { ...r, count: r.count + 1 } : r));

                      setSuccessMsg(`Onboarded new administrator: '${newEmpName}' assigned to role '${newEmpRole}'.`);
                      setTimeout(() => setSuccessMsg(""), 3500);

                      // clear state Form
                      setNewEmpName("");
                      setNewEmpEmail("");
                    }} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Staff Full Name</label>
                        <input
                          type="text"
                          value={newEmpName}
                          onChange={(e) => setNewEmpName(e.target.value)}
                          placeholder="e.g. Rashedul Amin"
                          className="w-full border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Assisted Email Address</label>
                        <input
                          type="email"
                          value={newEmpEmail}
                          onChange={(e) => setNewEmpEmail(e.target.value)}
                          placeholder="e.g. rashed@nabikbazar.com"
                          className="w-full border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Security Access Role</label>
                        <select
                          value={newEmpRole}
                          onChange={(e) => setNewEmpRole(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-xs bg-white"
                        >
                          {employeeRoles.map((role) => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#f58220] hover:bg-[#d86f16] text-white font-extrabold text-xs py-2.5 rounded-lg border-0 cursor-pointer shadow-xs transition"
                      >
                        Authorize Staff Account
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-white border rounded-xl p-5 shadow-sm text-xs max-w-lg space-y-4">
                <h3 className="font-extrabold text-sm border-b pb-2">Active Employees Permissions Logs</h3>
                <div className="divide-y divide-zinc-50 font-sans">
                  <div className="py-2.5 flex justify-between items-center bg-white">
                    <div>
                      <strong className="block text-zinc-950 text-sm font-bold">Jamal Uddin Chowdhury</strong>
                      <span className="text-[10px] text-zinc-400 block mt-1 font-mono text-left">Level privileges: Master Administrator Admin</span>
                    </div>
                    <span className="bg-[#f58220] text-white text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded">SUITE OWNER</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center bg-white">
                    <div>
                      <strong className="block text-zinc-950 text-sm font-bold">Nibiz IT support team</strong>
                      <span className="text-[10px] text-zinc-400 block mt-1 font-mono text-left">Level privileges: Security Analyst and database backup inspector</span>
                    </div>
                    <span className="bg-teal-600 text-white text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded">SYSTEMS IT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============== TAB: WEBSITE DESIGN CUSTOMIZER ============== */}
          {activeTab === 'web-design' && (
            <div className="space-y-6 text-left font-sans" id="web-design-customizer-panel">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-100 pb-5 gap-4">
                <div>
                  <h1 className="text-xl font-black text-zinc-900 leading-tight">
                    {language === 'bn' ? '🎨 ওয়েবসাইট থিম ও কাস্টমাইজেশন' : '🎨 Theme & Content Live Engine'}
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 font-semibold">
                    {language === 'bn' 
                      ? 'সম্পূর্ণ ওয়েবসাইটের লেখা, কালার, লোগো, এবং স্লাইডার ইমেজ রিয়েল-টাইমে পরিবর্তন করুন। এটি আপনি ও আপনার গ্রাহক উভয়েই ব্যবহার করতে পারবেন।' 
                      : 'Customize writing, custom colors, logos and promo banner images in real-time.'}
                  </p>
                </div>
                
                {/* Reset to Default Button */}
                <button
                  id="reset-default-design-btn"
                  onClick={() => {
                    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে সম্পূর্ণ ডিজাইনটি আগের ডিফল্ট ডিজাইনে ফিরিয়ে নিতে চান?' : 'Are you sure you want to restore the entire design back to standard defaults?')) {
                      const defaultDesignPreset = PRESET_TENANTS[0];
                      saveTenant(defaultDesignPreset);
                      setActiveTenant(defaultDesignPreset);
                      window.location.reload();
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-black uppercase rounded-lg shadow-sm transition tracking-wider cursor-pointer font-sans"
                >
                  <RefreshCw size={13} className="animate-spin duration-[6s]" />
                  <span>{language === 'bn' ? 'ডিফল্ট ডিজাইন ফিরিয়ে আনুন' : 'Reset to Default Design'}</span>
                </button>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                
                {/* Left Area: Editor Settings Inputs */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Card 1: Main Names & Taglines info */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-zinc-800 border-b pb-2 flex items-center space-x-2">
                      <span className="text-orange-500 text-xs">■</span>
                      <span>{language === 'bn' ? '১. প্রধান শিরোনাম ও স্লোগানসমূহ' : '1. Names & Taglines'}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'ওয়েবসাইটের নাম (English)' : 'Shop Name (English)'}</label>
                        <input
                          id="cs-shop-name-en"
                          type="text"
                          value={csShopName}
                          onChange={(e) => setCsShopName(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'ওয়েবসাইটের নাম (বাংলা)' : 'Shop Name (Bangla)'}</label>
                        <input
                          id="cs-shop-name-bn"
                          type="text"
                          value={csShopNameBn}
                          onChange={(e) => setCsShopNameBn(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'স্লোগান লাইন (English)' : 'Tagline / Slogan (English)'}</label>
                        <input
                          id="cs-tagline-en"
                          type="text"
                          value={csTagline}
                          onChange={(e) => setCsTagline(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'স্লোগান লাইন (বাংলা)' : 'Tagline / Slogan (Bangla)'}</label>
                        <input
                          id="cs-tagline-bn"
                          type="text"
                          value={csTaglineBn}
                          onChange={(e) => setCsTaglineBn(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand focus:border-brand"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Aesthetic Themes, Branding Hex Code Colors */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-zinc-800 border-b pb-2 flex items-center space-x-2">
                      <span className="text-blue-500 text-xs">■</span>
                      <span>{language === 'bn' ? '২. কালার স্কিম ও থিম ব্রান্ডিং' : '2. Colors & Branding'}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'প্রধান ব্যাকগ্রাউন্ড কালার (Primary Hex)' : 'Primary Accent Color (Hex)'}</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            id="cs-primary-color-pick"
                            type="color"
                            value={csPrimaryColor}
                            onChange={(e) => setCsPrimaryColor(e.target.value)}
                            className="h-8 w-12 border rounded cursor-pointer"
                          />
                          <input
                            id="cs-primary-color-input"
                            type="text"
                            value={csPrimaryColor}
                            onChange={(e) => setCsPrimaryColor(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'হোভার কালার (Hover Hex)' : 'Hover Accent Color (Hex)'}</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            id="cs-hover-color-pick"
                            type="color"
                            value={csHoverColor}
                            onChange={(e) => setCsHoverColor(e.target.value)}
                            className="h-8 w-12 border rounded cursor-pointer"
                          />
                          <input
                            id="cs-hover-color-input"
                            type="text"
                            value={csHoverColor}
                            onChange={(e) => setCsHoverColor(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'হালকা ব্যাকগ্রাউন্ড (Bg Light Hex)' : 'Card Highlight Tint (Hex)'}</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            id="cs-bg-light-color-pick"
                            type="color"
                            value={csBgLightColor}
                            onChange={(e) => setCsBgLightColor(e.target.value)}
                            className="h-8 w-12 border rounded cursor-pointer"
                          />
                          <input
                            id="cs-bg-light-color-input"
                            type="text"
                            value={csBgLightColor}
                            onChange={(e) => setCsBgLightColor(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logo Image URL config */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mt-2">{language === 'bn' ? 'লোগো ইমেজ লিঙ্ক (Logo Icon URL / Path)' : 'Shop Logo URL'}</label>
                      <input
                        id="cs-logo-url-input"
                        type="text"
                        placeholder="Leave empty to use stylish name header"
                        value={csLogoUrl}
                        onChange={(e) => setCsLogoUrl(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-lg text-xs font-medium"
                      />
                      <span className="text-[10px] text-zinc-400 block mt-1">
                        {language === 'bn' ? '💡 লোগো ইমেজটি পিএনজি (PNG) ফরম্যাটে হওয়া ভালো।' : '💡 PNG format with transparent background is recommended.'}
                      </span>
                    </div>

                    {/* Quick Color Presets palette selection list */}
                    <div className="pt-2">
                      <span className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2">{language === 'bn' ? '🎨 ওয়ান-ক্লিক রেডিমেড প্রফেশনাল কালার প্যালেট' : '🎨 ONE-CLICK READY COLOR TUNINGS'}</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Nabik Autumn Orange', primary: '#f58220', hover: '#e06c09', bg: '#fff7ed' },
                          { name: 'Royal Sapphire Blue', primary: '#2563eb', hover: '#1d4ed8', bg: '#eff6ff' },
                          { name: 'Organic Fresh Green', primary: '#16a34a', hover: '#15803d', bg: '#f0fdf4' },
                          { name: 'Elegant Velvet Rose', primary: '#db2777', hover: '#be185d', bg: '#fdf2f8' },
                          { name: 'Futuristic Dark Gray', primary: '#18181b', hover: '#09090b', bg: '#f4f4f5' }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCsPrimaryColor(preset.primary);
                              setCsHoverColor(preset.hover);
                              setCsBgLightColor(preset.bg);
                            }}
                            className="px-2.5 py-1.5 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 rounded-md text-[10px] font-extrabold text-zinc-700 flex items-center space-x-1 border-dashed cursor-pointer"
                          >
                            <span className="inline-block h-3.5 w-3.5 rounded border border-white" style={{ backgroundColor: preset.primary }} />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: CMS Bar & Dropdown Manager - Interactive Nav customizer */}
                  <div className="bg-white border rounded-xl p-6 shadow-sm space-y-5" id="cms-nav-manager-card">
                    <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h3 className="font-extrabold text-sm text-zinc-900 flex items-center space-x-2">
                        <span className="text-[#f58220] text-xs">■</span>
                        <span>{language === 'bn' ? '৩. মেনুবার ও ড্রপডাউন কন্ট্রোল হাব (CMS)' : '3. Navigation Menu Control Center (CMS)'}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newItem: MenuItemConfig = {
                            id: "menu-" + Date.now(),
                            label: "New Link",
                            labelBn: "নতুন লিংক",
                            enabled: true,
                            actionType: "tab",
                            actionValue: "shop",
                            dropdownType: "none",
                            dropdownItems: []
                          };
                          setCsMenuItems([...csMenuItems, newItem]);
                          window.dispatchEvent(new CustomEvent("app-toast", { detail: "New navigation link placeholder added! Click save to apply." }));
                        }}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#f58220] hover:text-orange-700 font-extrabold text-xs rounded-lg flex items-center space-x-1 border-0 cursor-pointer transition animate-in fade-in active:scale-95 duration-150"
                      >
                        <Plus size={13} />
                        <span>{language === 'bn' ? 'নতুন মেনু আইটেম যোগ করুন' : 'Add New Link'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                      {language === 'bn' 
                        ? '💡 যেকোনো মেনু আইটেম সুনির্দিষ্টভাবে অন/অফ করতে নিচের সুইচগুলো ব্যবহার করুন। প্রয়োজনে ড্রপডউন টাইপ পরিবর্তন করে ডাইনামিক ব্র্যান্ডলিস্ট অথবা নিজস্ব সাব-মেনু সেট করুন।' 
                        : '💡 Easily toggle any menu item on/off, change target click behaviors, or install custom multi-level parent dropdown lists instantly.'}
                    </p>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 divide-y divide-zinc-100">
                      {csMenuItems.map((item, idx) => {
                        return (
                          <div key={item.id} className="pt-4 first:pt-0 space-y-3 text-xs text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-50/75 p-3 rounded-lg border border-zinc-100">
                              <div className="flex items-center space-x-2">
                                <span className="h-5 w-5 bg-zinc-250 text-zinc-700 text-[10px] font-black rounded-full flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                <strong className="font-extrabold text-zinc-850 text-[12.5px] tracking-tight">
                                  {language === 'bn' ? item.labelBn : item.label}
                                </strong>
                              </div>

                              <div className="flex items-center space-x-3 shrink-0">
                                {/* Toggle Switch */}
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={item.enabled} 
                                    onChange={(e) => {
                                      const copy = [...csMenuItems];
                                      copy[idx].enabled = e.target.checked;
                                      setCsMenuItems(copy);
                                    }}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                  <span className="ml-2 text-[10px] font-extrabold text-zinc-500 uppercase">
                                    {item.enabled ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'বন্ধ' : 'Inactive')}
                                  </span>
                                </label>

                                {/* Delete Main Link */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(language === 'bn' ? "আপনি কি এই মেনু আইটেমটি মুছতে চান?" : "Are you sure you want to delete this menu link?")) {
                                      const copy = csMenuItems.filter(m => m.id !== item.id);
                                      setCsMenuItems(copy);
                                    }
                                  }}
                                  className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded transition text-zinc-400 border-0 bg-transparent cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Label Translations Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Label (En)</label>
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(e) => {
                                    const copy = [...csMenuItems];
                                    copy[idx].label = e.target.value;
                                    setCsMenuItems(copy);
                                  }}
                                  className="w-full mt-1 px-2.5 py-1.5 border border-zinc-200 rounded text-xs bg-white font-medium text-zinc-800 focus:outline-[#f58220]"
                                  placeholder="e.g. Brands"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Label (বাংলা)</label>
                                <input
                                  type="text"
                                  value={item.labelBn}
                                  onChange={(e) => {
                                    const copy = [...csMenuItems];
                                    copy[idx].labelBn = e.target.value;
                                    setCsMenuItems(copy);
                                  }}
                                  className="w-full mt-1 px-2.5 py-1.5 border border-zinc-200 rounded text-xs bg-white font-medium text-zinc-800 focus:outline-[#f58220]"
                                  placeholder="যেমন: ব্র্যান্ডসমূহ"
                                />
                              </div>
                            </div>

                            {/* Routing Action types Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Click Action Behavior</label>
                                <select
                                  value={item.actionType}
                                  onChange={(e) => {
                                    const copy = [...csMenuItems];
                                    copy[idx].actionType = e.target.value as any;
                                    setCsMenuItems(copy);
                                  }}
                                  className="w-full mt-1 px-2 py-1.5 border border-zinc-205 rounded text-xs bg-white font-semibold text-zinc-800 focus:outline-[#f58220]"
                                >
                                  <option value="none">None (Parent link container)</option>
                                  <option value="tab">Switch Page Active Tab</option>
                                  <option value="scroll">Smooth Scroll to Section ID</option>
                                  <option value="url">External Hyperlink URL</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Action Value</label>
                                <input
                                  type="text"
                                  value={item.actionValue || ""}
                                  disabled={item.actionType === "none"}
                                  onChange={(e) => {
                                    const copy = [...csMenuItems];
                                    copy[idx].actionValue = e.target.value;
                                    setCsMenuItems(copy);
                                  }}
                                  className="w-full mt-1 px-2.5 py-1.5 border border-zinc-200 rounded text-xs bg-white font-mono text-zinc-800 disabled:opacity-50"
                                  placeholder={
                                    item.actionType === "tab" ? "e.g. shop, admin, orders" :
                                    item.actionType === "scroll" ? "e.g. footer-bar-cart, white-categories-button" :
                                    item.actionType === "url" ? "e.g. https://google.com" : "No behavior value needed"
                                  }
                                />
                              </div>
                            </div>

                            {/* SubDropdown configurations */}
                            <div className="bg-zinc-50 border border-zinc-200/50 rounded-lg p-3 space-y-3 ml-1">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Dropdown Menu Style</label>
                                <select
                                  value={item.dropdownType || "none"}
                                  onChange={(e) => {
                                    const copy = [...csMenuItems];
                                    copy[idx].dropdownType = e.target.value as any;
                                    if (e.target.value === "custom" && !copy[idx].dropdownItems) {
                                      copy[idx].dropdownItems = [];
                                    }
                                    setCsMenuItems(copy);
                                  }}
                                  className="w-full mt-1 px-2 py-1.5 border border-zinc-205 rounded text-xs bg-white font-bold text-zinc-800 focus:outline-[#f58220]"
                                >
                                  <option value="none">✖ No Dropdown menu (Single link childless)</option>
                                  <option value="brandList">📦 Auto Brand List Dropdown (Fetch from stock inventory database)</option>
                                  <option value="custom">🛠 Custom Sub-Menu Links Dropdown (Assign multiple custom paths)</option>
                                </select>
                              </div>

                              {/* If Custom sub dropdown menu links is enabled */}
                              {item.dropdownType === "custom" && (
                                <div className="space-y-2 border-t pt-2 border-zinc-250">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">Custom Dropdown Sub-Links:</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const copy = [...csMenuItems];
                                        const subItem: MenuItemDropdownItem = {
                                          id: "sub-" + Date.now(),
                                          label: "Child Sublink",
                                          labelBn: "উপ-লিংক",
                                          actionType: "tab",
                                          actionValue: "shop"
                                        };
                                        copy[idx].dropdownItems = [...(copy[idx].dropdownItems || []), subItem];
                                        setCsMenuItems(copy);
                                      }}
                                      className="px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-extrabold rounded shadow-2xs flex items-center space-x-1 cursor-pointer transition border-solid active:scale-95"
                                    >
                                      <Plus size={11} />
                                      <span>Add Sub-Link</span>
                                    </button>
                                  </div>

                                  {(!item.dropdownItems || item.dropdownItems.length === 0) ? (
                                    <div className="text-[10px] text-zinc-400 italic text-center py-2 bg-white rounded border border-dashed border-zinc-250">
                                      No sub-links set yet. Click "Add Sub-Link" to create ones dynamically!
                                    </div>
                                  ) : (
                                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                      {item.dropdownItems.map((sub, sIdx) => (
                                        <div key={sub.id} className="bg-white p-2.5 rounded-md border border-zinc-200 space-y-1.5 relative">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const copy = [...csMenuItems];
                                              copy[idx].dropdownItems = copy[idx].dropdownItems?.filter(s => s.id !== sub.id);
                                              setCsMenuItems(copy);
                                            }}
                                            className="absolute top-1 right-1 text-zinc-405 hover:text-rose-500 p-0.5 rounded transition bg-transparent border-0 cursor-pointer"
                                            title="Remove sub-link"
                                          >
                                            <X size={11} />
                                          </button>

                                          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                                            <div>
                                              <input
                                                type="text"
                                                value={sub.label}
                                                onChange={(e) => {
                                                  const copy = [...csMenuItems];
                                                  if (copy[idx].dropdownItems) {
                                                    copy[idx].dropdownItems![sIdx].label = e.target.value;
                                                    setCsMenuItems(copy);
                                                  }
                                                }}
                                                className="w-full px-1.5 py-0.5 border border-zinc-200 text-[11px] rounded bg-white text-zinc-800 font-bold"
                                                placeholder="Sublink label"
                                              />
                                            </div>
                                            <div>
                                              <input
                                                type="text"
                                                value={sub.labelBn}
                                                onChange={(e) => {
                                                  const copy = [...csMenuItems];
                                                  if (copy[idx].dropdownItems) {
                                                    copy[idx].dropdownItems![sIdx].labelBn = e.target.value;
                                                    setCsMenuItems(copy);
                                                  }
                                                }}
                                                className="w-full px-1.5 py-0.5 border border-zinc-200 text-[11px] rounded bg-white text-zinc-800 font-bold"
                                                placeholder="Sublink label Bn"
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                                            <select
                                              value={sub.actionType}
                                              onChange={(e) => {
                                                const copy = [...csMenuItems];
                                                if (copy[idx].dropdownItems) {
                                                  copy[idx].dropdownItems![sIdx].actionType = e.target.value as any;
                                                  setCsMenuItems(copy);
                                                }
                                              }}
                                              className="px-1 py-0.5 border border-zinc-200 text-[10px] rounded bg-white text-zinc-800 focus:outline-[#f58220]"
                                            >
                                              <option value="none">None</option>
                                              <option value="tab">Active Tab</option>
                                              <option value="scroll">Scroll ScrollID</option>
                                              <option value="url">External Link</option>
                                            </select>

                                            <input
                                              type="text"
                                              value={sub.actionValue || ""}
                                              onChange={(e) => {
                                                const copy = [...csMenuItems];
                                                if (copy[idx].dropdownItems) {
                                                  copy[idx].dropdownItems![sIdx].actionValue = e.target.value;
                                                  setCsMenuItems(copy);
                                                }
                                              }}
                                              className="px-1.5 py-0.5 border border-zinc-200 text-[10px] rounded bg-white font-mono text-zinc-800"
                                              placeholder="Action value"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 4: Sliding Carousel Banners (Up to 3 editable slides) */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-5">
                    <h3 className="font-extrabold text-sm text-zinc-800 border-b pb-2 flex items-center space-x-2">
                      <span className="text-purple-500 text-xs">■</span>
                      <span>{language === 'bn' ? '৪. হোমপেইজ স্লাইডার ব্যানার কারুকার্য' : '4. Home Banner Carousel Slides'}</span>
                    </h3>

                    <p className="text-[10px] text-orange-600 bg-orange-50 p-2.5 rounded-lg leading-relaxed font-bold">
                      {language === 'bn' 
                        ? '💡 স্লাইডার ১ সবসময় স্পেশাল ইন্টারেক্টিভ ম্যাগনেটিক পাওয়ার ব্যাংক মডেল রেন্ডার করবে যা আপনি চাইলে ৩.২ ক্যাটাগরী থেকে টাইটেল এডিট করতে পারবেন। স্লাইড ২ এবং স্লাইড ৩ এর জন্য সরাসরি ইমেজ পরিবর্তন করতে পারবেন।' 
                        : '💡 Slide 1 will render the interactive high fidelity tech mockup. Slide 2 and 3 render customizable full-width background graphics.'}
                    </p>

                    {csSlides.map((slide, sIdx) => (
                      <div key={sIdx} className="border border-zinc-100 rounded-lg p-4 space-y-3 bg-zinc-50/50 text-left">
                        <div className="flex items-center justify-between border-b pb-1.5 border-dashed">
                          <strong className="text-xs text-zinc-700 font-extrabold block">
                            {language === 'bn' ? `স্লাইড ${sIdx + 1} (${sIdx === 0 ? 'ইন্টারেক্টিভ স্পেশাল' : 'ইমেজ ব্যানার'})` : `Slide Carousel ${sIdx + 1} (${sIdx === 0 ? 'Interactive Model' : 'Image Banner'})`}
                          </strong>
                        </div>

                        {sIdx > 0 && (
                          <div className="space-y-1 text-xs">
                            <label className="block text-[10px] font-bold text-zinc-650">{language === 'bn' ? 'ব্যানার ইমেজ (Banner Image Location)' : 'Banner Image URL or Upload'}</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Paste image link..."
                                value={slide.image}
                                onChange={(e) => {
                                  const copy = [...csSlides];
                                  copy[sIdx].image = e.target.value;
                                  setCsSlides(copy);
                                }}
                                className="flex-1 px-2.5 py-1.5 border rounded text-xs font-mono bg-white"
                              />
                              <label className="bg-zinc-800 hover:bg-zinc-900 text-white font-extrabold text-[10px] px-3 py-2 rounded-lg cursor-pointer select-none transition shrink-0 h-full inline-flex items-center justify-center border border-zinc-750">
                                <span>{language === 'bn' ? 'কম্পিউটার/মোবাইল ফাইল' : 'Upload File'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        if (ev.target?.result) {
                                          const copy = [...csSlides];
                                          copy[sIdx].image = ev.target.result as string;
                                          setCsSlides(copy);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            
                            {slide.image && (
                              <div className="mt-1.5 relative inline-block bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                                <img src={slide.image} alt="Banner preview" className="h-10 w-auto rounded object-cover" />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-650">{language === 'bn' ? 'স্লাইড ব্যানার শিরোনাম (English)' : 'Slide Title (English)'}</label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => {
                                const copy = [...csSlides];
                                copy[sIdx].title = e.target.value;
                                setCsSlides(copy);
                              }}
                              className="w-full mt-0.5 px-2.5 py-1.5 border rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-650">{language === 'bn' ? 'স্লাইড ব্যানার শিরোনাম (বাংলা)' : 'Slide Title (Bangla)'}</label>
                            <input
                              type="text"
                              value={slide.titleBn}
                              onChange={(e) => {
                                const copy = [...csSlides];
                                copy[sIdx].titleBn = e.target.value;
                                setCsSlides(copy);
                              }}
                              className="w-full mt-0.5 px-2.5 py-1.5 border rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-650">{language === 'bn' ? 'স্লাইড সাবটাইটেল (English)' : 'Slide Subtitle (English)'}</label>
                            <input
                              type="text"
                              value={slide.subtitle}
                              onChange={(e) => {
                                const copy = [...csSlides];
                                copy[sIdx].subtitle = e.target.value;
                                setCsSlides(copy);
                              }}
                              className="w-full mt-0.5 px-2.5 py-1.5 border rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-650">{language === 'bn' ? 'স্লাইড সাবটাইটেল (বাংলা)' : 'Slide Subtitle (Bangla)'}</label>
                            <input
                              type="text"
                              value={slide.subtitleBn}
                              onChange={(e) => {
                                const copy = [...csSlides];
                                copy[sIdx].subtitleBn = e.target.value;
                                setCsSlides(copy);
                              }}
                              className="w-full mt-0.5 px-2.5 py-1.5 border rounded text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card 4: Contact, Support Helpline & Addresses */}
                  <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-zinc-800 border-b pb-2 flex items-center space-x-2">
                      <span className="text-emerald-500 text-xs">■</span>
                      <span>{language === 'bn' ? '৪. হেল্পলাইন ও কন্টাক্ট ডেডিকেশন' : '4. Helpline & Contacts'}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'যোগাযোগ মোবাইল (Phone Number)' : 'Support Hotline'}</label>
                        <input
                          id="cs-phone-input"
                          type="text"
                          value={csPhone}
                          onChange={(e) => setCsPhone(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'সাপোর্ট ইমেইল (Help Desk Email)' : 'Corporate Email'}</label>
                        <input
                          id="cs-email-input"
                          type="email"
                          value={csEmail}
                          onChange={(e) => setCsEmail(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'হোয়াটসঅ্যাপ সংযোগ নম্বর (WhatsApp 8801xxx)' : 'WhatsApp Integration Line'}</label>
                        <input
                          id="cs-whatsapp-input"
                          type="text"
                          value={csWhatsappNumber}
                          onChange={(e) => setCsWhatsappNumber(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs font-mono"
                          placeholder="e.g. 8801784905075"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold text-zinc-400 select-none uppercase mt-2 font-black">💡 INSTANT AUTO-SAVE SYNC</span>
                        <p className="text-[10px] text-zinc-400 leading-tight block mt-1">
                          {language === 'bn' 
                            ? 'নিচের বড় সেভ বাটনে ক্লিক করলে ওয়েবসাইটটি সফলভাবে সেভ ও লাইভ আপডেট হবে।' 
                            : 'Clicking the primary save config button commits your styling directly.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'ঠিকানা (English)' : 'Warehouse Address (English)'}</label>
                        <textarea
                          id="cs-address-en"
                          rows={2}
                          value={csAddress}
                          onChange={(e) => setCsAddress(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs focus:ring-1 focus:ring-brand focus:border-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'ঠিকানা (বাংলা)' : 'Warehouse Address (Bangla)'}</label>
                        <textarea
                          id="cs-address-bn"
                          rows={2}
                          value={csAddressBn}
                          onChange={(e) => setCsAddressBn(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-xs focus:ring-1 focus:ring-brand focus:border-brand"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ultimate Live Save trigger bar */}
                  <div className="flex justify-end pt-3">
                    <button
                      id="cs-save-all-designs-btn"
                      onClick={() => {
                        const updated: TenantConfig = {
                          ...activeTenant,
                          shopName: csShopName,
                          shopNameBn: csShopNameBn,
                          tagline: csTagline,
                          taglineBn: csTaglineBn,
                          phone: csPhone,
                          email: csEmail,
                          address: csAddress,
                          addressBn: csAddressBn,
                          whatsappNumber: csWhatsappNumber,
                          primaryColor: csPrimaryColor,
                          hoverColor: csHoverColor,
                          bgLightColor: csBgLightColor,
                          logoUrl: csLogoUrl,
                          slides: csSlides,
                          menuItems: csMenuItems
                        };
                        
                        saveTenant(updated);
                        setActiveTenant(updated);

                        // Raise custom state updates
                        const event = new CustomEvent("app-toast", { 
                          detail: language === 'bn' 
                            ? "✅ চমৎকার! ওয়েবসাইটের নতুন ডিজাইন সফলভাবে সেভ এবং লাইভ করা হয়েছে।" 
                            : "✅ Superb! Your custom layout details are live updated instantly." 
                        });
                        window.dispatchEvent(event);
                      }}
                      className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-lg shadow-md cursor-pointer transition-all duration-300 font-sans flex items-center space-x-2 border-0"
                    >
                      <CheckCircle size={16} />
                      <span>{language === 'bn' ? 'ডিজাইন কাস্টমাইজেশন সেভ করুন' : 'Apply & Save New Layout'}</span>
                    </button>
                  </div>
                  
                </div>

                {/* Right Area: Premium Design Live Preview Cards */}
                <div className="lg:col-span-4 space-y-6 text-left">
                  <div className="bg-zinc-900 text-white rounded-xl p-5 shadow-lg border border-zinc-800 space-y-4">
                    <div className="flex items-center space-x-1.5 border-b border-zinc-800 pb-2.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[11px] font-extrabold tracking-widest text-[#f58220] uppercase">{language === 'bn' ? 'লাইভ প্রিভিউ মনিটর' : 'LIVE DESIGN PREVIEW'}</span>
                    </div>

                    <div className="space-y-4 text-xs font-sans">
                      <div>
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'ব্রান্ড শিরোনাম (Header Title)' : 'Identity'}</span>
                        <div className="text-sm font-extrabold mt-1 truncate">
                          {language === 'bn' ? csShopNameBn : csShopName}
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5 truncate italic">
                          "{language === 'bn' ? csTaglineBn : csTagline}"
                        </span>
                      </div>

                      <div className="border-t border-zinc-800 pt-3">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">{language === 'bn' ? 'ব্রান্ড কালার স্কিম' : 'Color Scheme Palette'}</span>
                        <div className="flex items-center space-x-2.5">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="h-7 w-7 rounded-full border border-zinc-700 shadow-inner flex items-center justify-center font-bold" style={{ backgroundColor: csPrimaryColor }} />
                            <span className="text-[8px] font-bold text-zinc-400 font-mono">Primary</span>
                          </div>
                          <div className="flex flex-col items-center space-y-1">
                            <div className="h-7 w-7 rounded-full border border-zinc-700 shadow-inner" style={{ backgroundColor: csHoverColor }} />
                            <span className="text-[8px] font-bold text-zinc-400 font-mono">Hover</span>
                          </div>
                          <div className="flex flex-col items-center space-y-1">
                            <div className="h-7 w-7 rounded-full border border-[#ffffff15] shadow-inner" style={{ backgroundColor: csBgLightColor }} />
                            <span className="text-[8px] font-bold text-zinc-400 font-mono">Tint</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-800 pt-3 space-y-1">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'হেল্পলাইন হট লাইন' : 'Primary Contacts'}</span>
                        <p className="font-mono text-[11px] text-zinc-300">📞 {csPhone}</p>
                        <p className="font-mono text-[11px] text-zinc-400">{csEmail}</p>
                      </div>

                      <div className="border-t border-zinc-800 pt-3 space-y-1">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase">{language === 'bn' ? 'লজিস্টিক ঠিকানা' : 'Fulfillment Address'}</span>
                        <p className="text-zinc-400 text-[10px] leading-relaxed">
                          {language === 'bn' ? csAddressBn : csAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pro-Tips visual block */}
                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 text-[11px] text-amber-850 leading-relaxed space-y-2">
                    <strong className="block text-amber-900 font-bold">💡 {language === 'bn' ? 'পেশাদার পরামর্শ:' : 'Professional Tips:'}</strong>
                    <p>
                      {language === 'bn'
                        ? '১. আপনি বা আপনার কাস্টমার সরাসরি এই ড্যাশবোর্ড থেকে যেকোন ডিজাইন নিজের মনের মতো সেট করতে পারবেন।'
                        : '1. Any custom configurations applied here are immediate and stored securely in local state.'}
                    </p>
                    <p>
                      {language === 'bn'
                        ? '২. যদি কখনো সম্পূর্ণ লেখা ও ডিজাইন মূল ডিফল্ট ডিজাইনে ফিরিয়ে নিতে চান, "ডিফল্ট ডিজাইন ফিরিয়ে আনুন" ক্লিক করুন।'
                        : '2. Click the default design fallback action above to return pristine default themes instantly.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============== TAB: COURIER ============== */}
          {activeTab === 'courier' && (
            <div className="space-y-6 text-left font-sans" id="courier-integration-panel">
              <BanglaCourierSystem
                orders={orders}
                setOrders={setOrders}
                language={language}
                triggerToast={(msg) => {
                  window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
                }}
              />
            </div>
          )}

          {/* ============== TAB: PIXEL & GTM ============== */}
          {activeTab === 'pixel-gtm' && (
            <div className="space-y-6 text-left font-sans" id="pixel-gtm-panel shadow-sm">
              <PixelGtmManager language={language} />
            </div>
          )}

          {/* ============== TAB: SUBSCRIBERS ============== */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6 text-left font-sans" id="subscribers-desk-panel">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight">Newsletter subscriber directory</h1>
                <p className="text-xs text-zinc-400">List of registered email newsletters subscribers who opted-in for platform discount vouchers alert.</p>
              </div>

              <div className="bg-white border rounded-xl max-w-lg shadow-sm font-sans text-[12px] overflow-hidden">
                <div className="bg-zinc-50 font-extrabold uppercase text-[10px] text-zinc-400 border-b p-3">Mailing entries list</div>
                <div className="divide-y leading-normal">
                  <div className="p-3 hover:bg-zinc-50/20 text-left">
                    <strong className="block text-zinc-800 font-semibold">alaminchowdhury@gmail.com</strong>
                    <span className="text-[10px] text-zinc-400 block mt-1 font-sans">Subscribed date: May 30, 2026 12:46:15Z</span>
                  </div>
                  <div className="p-3 hover:bg-zinc-50/20 text-left">
                    <strong className="block text-zinc-800 font-semibold font-bold">client@ecommatrix.xyz</strong>
                    <span className="text-[10px] text-zinc-400 block mt-1 font-sans">Subscribed date: May 29, 2026 11:20:00Z</span>
                  </div>
                  <div className="p-3 hover:bg-zinc-50/20 text-left">
                    <strong className="block text-zinc-800 font-semibold font-bold block text-left">jamaluddinkh3424@gmail.com</strong>
                    <span className="text-[10px] text-[#222222]/50 text-zinc-400 text-left block mt-1 font-sans">Subscribed date: May 28, 2026 09:15:30Z</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </motion.div>

        </main>



      </div>

      <ModernInvoiceModal
        order={selectedInvoiceOrder}
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceOrder(null);
        }}
        language={language}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[1000000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 scale-110">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-extrabold text-stone-950 opacity-90 mb-2 font-sans select-none">
                {deleteConfirm.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans max-w-[90%] mx-auto">
                {deleteConfirm.message}
              </p>
            </div>
            <div className="bg-zinc-50 px-6 py-3.5 flex items-center justify-end space-x-3 border-t border-zinc-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs px-4 py-2 rounded-xl border border-zinc-200 transition cursor-pointer font-sans"
              >
                {language === 'bn' ? "বাতিল করুন" : "Cancel"}
              </button>
              <button
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(null);
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer font-sans"
              >
                {language === 'bn' ? "ডিলিট করুন" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
