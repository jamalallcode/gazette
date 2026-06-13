import React, { useState, useEffect } from "react";
import { Product, Order } from "../types";
import { 
  Sparkles, 
  Clock, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle, 
  ThumbsUp, 
  ShoppingBag, 
  Star,
  Users,
  MessageSquare,
  Gift,
  HelpCircle,
  Phone,
  ChevronDown,
  Settings,
  Link,
  Copy,
  Save,
  Check,
  Video,
  Share2
} from "lucide-react";

interface PromoLandingTabProps {
  products: Product[];
  language: 'en' | 'bn';
  currency: 'BDT' | 'USD';
  onPlaceOrder: (order: Order) => void;
  setCurrentTab: (tab: string) => void;
}

export default function PromoLandingTab({
  products,
  language,
  currency,
  onPlaceOrder,
  setCurrentTab
}: PromoLandingTabProps) {
  // Choose initially featured item - prod-1 (Headphones) or let user switch to preview how landing pages look for different products!
  const [selectedProductId, setSelectedProductId] = useState<string>("prod-1");
  const [isProductListOpen, setIsProductListOpen] = useState(false);
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // ----------------------------------------------------
  // DYNAMIC LANDING PAGE BUILDER & MARKETER INTEGRATION
  // ----------------------------------------------------
  const [currentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("nabik_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Check URL Param on mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const prodIdFromUrl = searchParams.get("prodId");
      if (prodIdFromUrl && products.some(p => p.id === prodIdFromUrl)) {
        setSelectedProductId(prodIdFromUrl);
      }
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Load configs
  const [customConfigs, setCustomConfigs] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem("nabik_custom_landing_configs");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Admin Customizer open status
  const [isAdminModeOpen, setIsAdminModeOpen] = useState(false);

  // Form custom details state
  const [promoLabel, setPromoLabel] = useState("");
  const [promoTitle, setPromoTitle] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(20);
  const [pixelId, setPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [customBulletsText, setCustomBulletsText] = useState("");

  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pixel events log for interactive live tracker
  const [pixelEvents, setPixelEvents] = useState<{timestamp: string; event: string; parameter: string}[]>([]);

  // Push custom events visually so creators can see Pixel working!
  const pushPixelEvent = (eventName: string, param: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setPixelEvents(prev => [{ timestamp: timeStr, event: eventName, parameter: param }, ...prev].slice(0, 5));
  };

  // Sync state whenever selected product or storage configs update
  useEffect(() => {
    const config = customConfigs[selectedProductId] || {};
    
    setPromoLabel(config.promoLabel || (language === "bn" ? "ফেসবুক স্পেশাল ধামাকা অফার" : "SPECIAL ADVERTISED CAMPAIGN OFFER"));
    setPromoTitle(config.promoTitle || (language === "bn" ? `ফেসবুক প্রমোশন - ২০% ছাড়ে ${selectedProduct ? (language === "bn" ? selectedProduct.nameBn : selectedProduct.name) : ""}` : `Facebook Promotion - 20% Special Discount`));
    setPromoDesc(config.promoDesc || (language === "bn" ? selectedProduct?.descriptionBn || selectedProduct?.description : selectedProduct?.description));
    setYoutubeVideoId(config.youtubeVideoId || "bO2J9vX9rNo");
    setDiscountPercent(config.discountPercent !== undefined ? config.discountPercent : 20);
    setPixelId(config.pixelId || "293847529384752");
    setTiktokPixelId(config.tiktokPixelId || "1029384756");
    setWhatsappNumber(config.whatsappNumber || "01700000000");
    
    const defaultBullets = language === "bn" ? 
      (selectedProduct?.featuresBn || selectedProduct?.features || []) : 
      (selectedProduct?.features || []);
    const bullets = config.customBullets || defaultBullets;
    setCustomBulletsText(bullets.join("\n"));

    // Fire PageView event to simulated pixel!
    pushPixelEvent("PageView", `ProductID: ${selectedProductId}`);
  }, [selectedProductId, customConfigs, selectedProduct, language]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBullets = customBulletsText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const updatedConfig = {
      promoLabel,
      promoTitle,
      promoDesc,
      youtubeVideoId,
      discountPercent: Number(discountPercent),
      pixelId,
      tiktokPixelId,
      whatsappNumber,
      customBullets: updatedBullets
    };

    const newConfigs = {
      ...customConfigs,
      [selectedProductId]: updatedConfig
    };

    setCustomConfigs(newConfigs);
    localStorage.setItem("nabik_custom_landing_configs", JSON.stringify(newConfigs));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    pushPixelEvent("LandingCustomizeSaved", `ProductID: ${selectedProductId}`);
  };

  const currentBullets = customBulletsText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const copyLandingLink = () => {
    const rawUrl = window.location.origin + window.location.pathname;
    const shareableUrl = `${rawUrl}?tab=landing&prodId=${selectedProductId}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);

    pushPixelEvent("ShareLinkClicked", `Copied: ${selectedProductId}`);
  };

  // Form Fields State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("");
  
  // Interaction success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Countdown timer simulation for landing urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 42, seconds: 19 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }; // Reset
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update product default variant when product changes
  useEffect(() => {
    if (selectedProduct && selectedProduct.features && selectedProduct.features.length > 0) {
      setSelectedVariant(selectedProduct.features[0]);
    }
  }, [selectedProductId]);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < selectedProduct.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Shipping calculate based on District inside Bangladesh
  const shippingCost = district === "Dhaka" ? 60 : 120;
  
  const unitPrice = currency === 'BDT' ? selectedProduct.priceBDT : selectedProduct.priceUSD;
  const productTotal = unitPrice * quantity;
  const grandTotal = productTotal + (currency === 'BDT' ? shippingCost : (shippingCost / 120));

  const handleImmediateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError(language === 'en' ? "Please provide your full name." : "দয়া করে আপনার সম্পূর্ণ নাম লিখুন।");
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setValidationError(language === 'en' ? "Provide a valid 11-digit mobile number." : "সঠিক ১১ ডিজিটের মোবাইল নম্বরটি লিখুন।");
      return;
    }
    if (!address.trim() || address.trim().length < 10) {
      setValidationError(language === 'en' ? "Please supply your detailed home delivery address." : "দয়া করে আপনার বিস্তারিত হোম ডেলিভারি ঠিকানা লিখুন।");
      return;
    }

    setIsSubmitting(true);
    pushPixelEvent("InitiateCheckout", `Customer: ${name} (Phone: ${phone})`);

    setTimeout(() => {
      const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const currentDateString = new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const newOrder: Order = {
        id: generatedOrderId,
        date: currentDateString,
        items: [
          {
            product: selectedProduct,
            quantity: quantity
          }
        ],
        totalBDT: currency === 'BDT' ? grandTotal : grandTotal * 120,
        totalUSD: currency === 'USD' ? grandTotal : grandTotal / 120,
        status: 'placed',
        estimatedDelivery: language === 'en' ? "2 to 3 days maximum" : "২ থেকে ৩ কর্মদিবস",
        timestamp: Date.now(),
        customerInfo: {
          name,
          phone,
          email: `${phone}@customer.aura`,
          address: `${address}, Area: ${district}, Bangladesh (Selected Option: ${selectedVariant})`,
          paymentMethod: 'Cash On Delivery',
          paymentStatus: language === 'en' ? 'Cash On Delivery' : 'হাতে পেয়ে মূল্য পরিশোধ'
        }
      };

      pushPixelEvent("Purchase", `Order Completed! Item: ${selectedProduct.name}, Total: ৳${grandTotal}`);
      onPlaceOrder(newOrder);
      setIsSubmitting(false);
      
      // Clean inputs
      setName("");
      setPhone("");
      setAddress("");
      setQuantity(1);
      
      // Auto-jump view scroll back to top to let user see invoice summary
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  const pad = (num: number) => String(num).padStart(2, "0");

  const [landingReviews, setLandingReviews] = useState<{reviewer: string; text: string; date: string; rating: number}[]>(() => {
    const saved = localStorage.getItem("nabik_landing_feedback");
    return saved ? JSON.parse(saved) : [];
  });
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackText.trim()) return;
    const newFb = {
      reviewer: feedbackName,
      text: feedbackText,
      rating: feedbackRating,
      date: new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    const updated = [newFb, ...landingReviews];
    setLandingReviews(updated);
    localStorage.setItem("nabik_landing_feedback", JSON.stringify(updated));
    setFeedbackName("");
    setFeedbackText("");
  };

  return (
    <div className="space-y-12" id="promo-landing-container">
      
      {/* LANDING PAGE CREATOR & CONTROL CENTRE FOR ADMNS/RESELLERS */}
      <div className="bg-zinc-950 border border-zinc-850 p-5 sm:p-7 rounded-3xl space-y-6 shadow-2xl relative font-sans overflow-hidden">
        
        {/* Subtle decorative glow in background */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-zinc-900 pb-5">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="text-amber-400 h-5 w-5 animate-pulse" />
              <span>{language === 'bn' ? "ফেসবুক ও সোশ্যাল মিডিয়া ল্যান্ডিং পেজ মেকার" : "Facebook Ads Landing Page Generator"}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-light max-w-xl leading-relaxed">
              {language === 'bn' 
                ? "আপনার যেকোনো ক্যাটালগ প্রোডাক্টের জন্য অতি সহজে কাস্টম বিজ্ঞাপন সেলস ফানেল তৈরি করুন। নিচে তথ্য সেভ করলেই লাইভ ল্যান্ডিং পেজের ডাটা সাথে সাথে আপডেট হয়ে যাবে!" 
                : "Easily design customized marketing landing page funnels for any catalog product with simulated Pixel integration & copyable campaign links."}
            </p>
          </div>

          {/* Toggle View Controller Tabs */}
          <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 self-start md:self-center">
            <button
              type="button"
              onClick={() => setIsAdminModeOpen(false)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-0 ${
                !isAdminModeOpen 
                  ? "bg-amber-500 text-zinc-950 font-black shadow-lg" 
                  : "text-zinc-400 hover:text-zinc-200 bg-transparent"
              }`}
            >
              <Users size={12} />
              <span>{language === 'bn' ? "কাস্টমার লাইভ প্রিভিউ" : "Customer Preview"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdminModeOpen(true);
                pushPixelEvent("ConfigureModeOpened", `Product: ${selectedProductId}`);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border-0 ${
                isAdminModeOpen 
                  ? "bg-amber-500 text-zinc-950 font-black shadow-lg" 
                  : "text-zinc-400 hover:text-zinc-200 bg-transparent"
              }`}
            >
              <Settings size={12} />
              <span>{language === 'bn' ? "এডমিন এ্যাড ডিজাইনার" : "Landing Customize"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Product Selector Section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900">
          <div className="space-y-1 flex-1 min-w-0">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{language === 'bn' ? "পদক্ষেপ ১: কোন প্রোডাক্টের ফেসবুক বিজ্ঞাপন বানাচ্ছেন?" : "STEP 1: Select product for campaign"}</span>
            <p className="text-xs text-zinc-300 font-bold truncate">
              {language === 'bn' ? `বর্তমানে সিলেক্টেড: ${selectedProduct.nameBn}` : `Active Campaign: ${selectedProduct.name}`}
            </p>
          </div>

          <div className="relative shrink-0" id="landing-product-preview-select-container">
            <button
              type="button"
              onClick={() => setIsProductListOpen(!isProductListOpen)}
              className="w-full lg:w-80 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500 text-amber-400 font-bold px-4.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition duration-200 cursor-pointer shadow-md select-none"
              id="landing-product-preview-trigger"
            >
              <div className="flex items-center space-x-2.5 text-left truncate min-w-0 flex-1">
                {selectedProduct.image && (
                  <img 
                    src={selectedProduct.image} 
                    alt="" 
                    className="w-7 h-7 object-cover rounded border border-zinc-800 flex-shrink-0 bg-zinc-900"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="truncate flex-1 min-w-0">
                  <span className="block truncate text-zinc-100 font-extrabold max-w-[200px]">
                    {language === 'bn' ? selectedProduct.nameBn : selectedProduct.name}
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-bold font-mono">
                    ৳{selectedProduct.priceBDT.toLocaleString()}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className="text-zinc-400 ml-2.5 flex-shrink-0" />
            </button>

            {isProductListOpen && (
              <>
                {/* Overlay backdrop to dismiss on click */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProductListOpen(false)}
                />
                <div 
                  className="absolute right-0 mt-2 w-full lg:w-96 bg-zinc-950 border border-zinc-805 rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 divide-y divide-zinc-900 max-h-72 overflow-y-auto animate-fade-in animate-duration-150"
                  id="landing-product-preview-list"
                >
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setValidationError("");
                        setIsProductListOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3.5 px-3.5 py-2.5 text-left hover:bg-zinc-900 cursor-pointer transition text-xs border-r-0 border-y-0 ${
                        selectedProductId === p.id 
                          ? 'bg-amber-500/10 border-l-4 border-amber-500' 
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <img 
                        src={p.image} 
                        alt="" 
                        className="w-8 h-8 object-cover rounded border border-zinc-800 flex-shrink-0 bg-zinc-900"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-extrabold truncate text-zinc-200 ${selectedProductId === p.id ? 'text-amber-400' : ''}`}>
                          {language === 'bn' ? p.nameBn : p.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold font-mono">
                          ৳{p.priceBDT.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* LANDING CREATOR SETTINGS FORM WORKSPACE */}
        {isAdminModeOpen && (
          <form onSubmit={handleSaveConfig} className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-850 space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-black uppercase text-amber-400 font-mono tracking-wider">
                ⚙️ Landings parameters for: {selectedProductId.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => {
                  const defaultBullets = language === "bn" ? (selectedProduct.featuresBn || []) : (selectedProduct.features || []);
                  setPromoLabel(language === "bn" ? "ফেসবুক স্পেশাল ধামাকা অফার" : "SPECIAL ADVERTISED CAMPAIGN OFFER");
                  setPromoTitle(language === "bn" ? `ফেসবুক প্রমোশন - ২০% ছাড়ে ${selectedProduct.nameBn}` : `Facebook Promotion - 20% Special Discount`);
                  setPromoDesc(language === "bn" ? selectedProduct.descriptionBn : selectedProduct.description);
                  setYoutubeVideoId("bO2J9vX9rNo");
                  setDiscountPercent(20);
                  setPixelId("293847529384752");
                  setTiktokPixelId("1029384756");
                  setWhatsappNumber("01700000000");
                  setCustomBulletsText(defaultBullets.join("\n"));
                  setValidationError("");
                  pushPixelEvent("CustomizeReset", `ProductID: ${selectedProductId}`);
                }}
                className="text-[10px] text-zinc-500 hover:text-amber-400 transition bg-transparent border-0 font-extrabold cursor-pointer"
              >
                [ RESET TO DEFAULT ]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300">
              
              {/* Left Column Controls */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">
                    Offer Badge / অফার রিবন টেক্সট
                  </label>
                  <input
                    type="text"
                    required
                    value={promoLabel}
                    onChange={(e) => setPromoLabel(e.target.value)}
                    placeholder="উদা: সীমিত সময়ের জন্য ৫০% ছাড়!"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">
                    Main Banner Title / বড় আকর্ষণীয় শিরোনাম
                  </label>
                  <input
                    type="text"
                    required
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    placeholder="উদা: সম্পূর্ণ ফ্রী ডেলিভারিতে মেক্সিমাম গ্যারান্টি হেডফোন!"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">
                    WhatsApp Support hotline / সরাসরি বিক্রয় হোয়াটসঅ্যাপ নম্বর
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="উদা: 01700000000"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none font-mono"
                  />
                  <p className="text-[9px] text-zinc-500">অ্যাড এ ক্লিক করার পর ক্রেতা এই নম্বরে হোয়াটসঅ্যাপ করতে পারবেন।</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">
                    YouTube Video ID / ভিডিওর বিজ্ঞাপন কোড
                  </label>
                  <input
                    type="text"
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(e.target.value)}
                    placeholder="উদা: bO2J9vX9rNo"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none font-mono"
                  />
                  <p className="text-[9px] text-zinc-500">আপনার ইউটিউব ভিডিও-এর লিংক থেকে ID বসান (যেমন: watch?v=<strong>bO2J9vX9rNo</strong>)।</p>
                </div>
              </div>

              {/* Right Column Controls */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">
                    Fake Discount Percent % / পূর্ব মূল্য বাড়ানোর হার
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <span className="font-mono text-xs font-black text-amber-500 bg-zinc-950 px-2 py-1 rounded w-12 text-center shrink-0">
                      {discountPercent}%
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-500">এটি ক্রেতার মনে আকর্ষণ বানাতে অরিজিনাল মূল্যের ওপর ভিত্তি করে একটি বড় কাটা-মূল্য (Regular Price) তৈরি করবে।</p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={pixelId}
                      onChange={(e) => setPixelId(e.target.value)}
                      placeholder="Pixel tracking id"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold">
                      TikTok Pixel ID
                    </label>
                    <input
                      type="text"
                      value={tiktokPixelId}
                      onChange={(e) => setTiktokPixelId(e.target.value)}
                      placeholder="TikTok pixel id"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-extrabold flex justify-between">
                    <span>Bullet Highlights / আকর্ষণীয় বুলেট পয়েন্ট</span>
                    <span className="text-[9px] text-zinc-500 lowercase">(one feature per line)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={customBulletsText}
                    onChange={(e) => setCustomBulletsText(e.target.value)}
                    placeholder="১০০% জেনুইন অরিজিনাল সাউন্ড&#10;৭ দিন রিপ্লেসমেন্ট গ্যারান্টি&#10;ফ্রি স্পেশাল গিফট বক্স পাবেন"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>

            </div>

            {/* Campaign analytics pixel tracker simulator */}
            <div className="p-4.5 bg-zinc-950/80 border border-zinc-850 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-[#22c55e]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                  <span>📡 Simulated Ads Pixel Telemetry Feed (রিয়েলটাইম পিক্সেল)</span>
                </span>
                <span className="font-mono text-zinc-550">Status: Listening...</span>
              </div>
              <div className="font-mono text-[10.5px] text-zinc-400 space-y-1.5 select-none divide-y divide-zinc-900/60 max-h-24 overflow-y-auto">
                {pixelEvents.length === 0 ? (
                  <p className="text-zinc-650 italic text-center py-2">No pixels emitted yet. Interact with the preview page below to trigger events.</p>
                ) : (
                  pixelEvents.map((evt, i) => (
                    <div key={i} className="flex justify-between items-center py-1 font-light">
                      <span className="text-zinc-600 shrink-0 select-none">[{evt.timestamp}]</span>
                      <span className="text-amber-400 font-bold px-2 truncate flex-1 md:text-left">{evt.event}</span>
                      <span className="text-zinc-400 text-right truncate max-w-xs">{evt.parameter}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Save Buttons & Copy Campaign links Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4.5 pt-4 border-t border-zinc-900">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black tracking-wide text-xs px-8 py-3 rounded-xl transition shadow-xl shrink-0 cursor-pointer border-0 flex items-center justify-center gap-2"
              >
                {saveSuccess ? <Check size={14} className="stroke-[3]" /> : <Save size={14} />}
                <span>{saveSuccess ? (language === 'bn' ? "ডিজাইন সফলভাবে সংরক্ষিত!" : "Saved!") : (language === 'bn' ? "ল্যান্ডিং পেজ ডিজাইন সেভ করুন" : "Save Landing Page Details")}</span>
              </button>

              <button
                type="button"
                onClick={copyLandingLink}
                className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-white px-5 py-3 rounded-xl transition text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
                title="Copy campaign link to direct ads traffic here"
              >
                {copiedLink ? <Check size={14} className="text-[#22c55e]" /> : <Link size={14} />}
                <span>{copiedLink ? (language === 'bn' ? "বিজ্ঞাপন ক্যাম্পেইন লিংক কপিড!" : "Link Copied!") : (language === 'bn' ? "ফেসবুক বিজ্ঞাপন লিংক কপি করুন [Copy ADS URL]" : "Copy Campaign Link for Facebook Ads")}</span>
              </button>

              {saveSuccess && (
                <span className="text-[#22c55e] font-sans font-bold text-xs animate-pulse text-center sm:text-left">
                  ✓ Config successfully synchronized!
                </span>
              )}
            </div>

          </form>
        )}

      </div>

      {/* TOP EMERGENCY HURRY BANNER */}
      <div className="bg-gradient-to-r from-red-650 via-amber-600 to-amber-500 text-zinc-950 px-4 py-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-center shadow-lg font-sans">
        <div className="flex items-center space-x-2 justify-center md:justify-start">
          <Clock size={16} className="animate-spin text-zinc-950" />
          <span className="font-extrabold tracking-widest text-xs uppercase text-zinc-950">
            {promoLabel}
          </span>
        </div>
        <div className="flex items-center space-x-2.5 bg-zinc-950 text-white px-4 py-1.5 rounded-lg text-xs font-mono shadow-md">
          <span className="text-[10px] text-zinc-400 font-sans tracking-wide">Ends in:</span>
          <span className="text-amber-400 font-bold">{pad(timeLeft.hours)}</span>:
          <span className="text-amber-400 font-bold">{pad(timeLeft.minutes)}</span>:
          <span className="text-amber-400 font-bold">{pad(timeLeft.seconds)}</span>
        </div>
      </div>

      {/* LUXURY LANDING MAIN COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: HERO VISUALS & SALES PERSUASIONS */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Large Product Frame card */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-zinc-950">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
              <span className="absolute top-5 left-5 px-3.5 py-1 bg-red-600 text-white font-extrabold tracking-widest text-[9px] rounded-md uppercase shadow-xl">
                {promoLabel}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" className="mr-0.5" />
                  ))}
                </span>
                <span className="text-xs text-zinc-400 font-bold">
                  {selectedProduct.rating.toFixed(1)} / 5 ({selectedProduct.reviewsCount} {language === 'en' ? 'satisfied reviews' : 'কাস্টমার মতামত'})
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-normal leading-tight text-white serif-display tracking-wide">
                {promoTitle}
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light tracking-wide">
                {promoDesc}
              </p>

              {/* DYNAMIC PRICING AND VALUE SENSE */}
              <div className="flex flex-wrap items-center gap-4.5 my-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">{language === 'bn' ? "অফার মূল্য (ধামাকা অফার):" : "Campaign Special Price:"}</span>
                  <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                    {currency === 'BDT' ? `৳${selectedProduct.priceBDT.toLocaleString()}` : `$${selectedProduct.priceUSD.toFixed(2)}`}
                  </span>
                </div>
                {discountPercent > 0 && (
                  <div className="border-l border-zinc-800 pl-4">
                    <span className="text-[10px] text-zinc-500 uppercase block font-bold">{language === 'bn' ? "সাধারণ রিটেইল মূল্য:" : "Regular Price:"}</span>
                    <span className="text-sm text-zinc-500 line-through font-mono">
                      {currency === 'BDT' 
                        ? `৳${Math.round(selectedProduct.priceBDT * (1 + discountPercent / 100)).toLocaleString()}`
                        : `$${(selectedProduct.priceUSD * (1 + discountPercent / 100)).toFixed(2)}`}
                    </span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <span className="bg-red-650 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded ml-auto">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Highlight Product Value Props list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-850">
                {currentBullets.map((feat, idx) => (
                  <div key={idx} className="flex items-start text-xs text-zinc-300 font-light">
                    <CheckCircle size={14} className="text-[#34d399] mr-2.5 mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* YOUTUBE ADVERTISEMENT FOR COLD FACEBOOK TRAFFIC */}
          {youtubeVideoId && (
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850 p-5 rounded-3xl space-y-3.5 shadow-xl text-left animate-fade-in">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <Video className="text-amber-500 h-4 w-4" />
                <h3 className="text-[11px] font-black uppercase text-white tracking-widest">
                  {language === 'bn' ? "পণ্যটির লাইভ ভিডিও রিভিউ দেখে অর্ডার করুন" : "Watch Product Live Video Review"}
                </h3>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-850 bg-zinc-950 shadow-2xl">
                <iframe
                  className="absolute inset-0 w-full h-full border-0"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* THREE CORE TRUST CARDS IN BANGLADESH */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Truck size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-100">
                {language === 'en' ? 'Home Delivery' : 'সারা বাংলাদেশে হোম ডেলিভারি'}
              </h4>
              <p className="text-[11px] text-zinc-400">
                {language === 'en' ? 'Dhaka within 24hr, outside 48-72hr' : 'ঢাকার ভেতরে ২৪ ঘণ্টা এবং বাইরে ৭২ ঘণ্টার মধ্যে ডেলিভারি'}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-100">
                {language === 'en' ? 'Cash on Delivery' : 'হাতে পেয়ে মূল্য পরিশোধ'}
              </h4>
              <p className="text-[11px] text-zinc-400">
                {language === 'en' ? '100% risk-free. Open & verify then pay' : 'কোনോ অগ্রিম পেমেন্ট নেই, পার্সেল দেখে পেমেন্ট করবেন'}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <RotateCcw size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-100">
                {language === 'en' ? '7 Days Easy Return' : '৭ দিনের সহজ রিটার্ন'}
              </h4>
              <p className="text-[11px] text-zinc-400">
                {language === 'en' ? 'Instant refunds or product replacement' : 'যেকোনো সমস্যায় নিশ্চিত রিটার্ন এবং এক্সচেঞ্জ গ্যারান্টি'}
              </p>
            </div>
          </div>

          {/* SOCIAL PROOF / REAL REVIEWS ACCORDING TO FB STANDARDS */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-200 flex items-center space-x-2">
              <MessageSquare size={16} className="text-amber-500" />
              <span>{language === 'en' ? 'Customer Feedback' : 'ক্রেতাদের কাস্টমার রিভিউ ও কমেন্ট'}</span>
            </h3>

            <div className="space-y-4">
              {landingReviews.length === 0 ? (
                <div className="p-5 text-center bg-zinc-950/40 rounded-xl border border-zinc-850/60 text-zinc-400 text-xs py-8">
                  {language === 'en' 
                    ? "No customer reviews yet. If you have purchased this product, be the first to share your valuable review or comment below!"
                    : "এখনো কোনো কাস্টমার রিভিউ পাওয়া যায়নি। আপনি যদি আমাদের পণ্যটি কিনে থাকেন, তবে সবার প্রথম কাস্টমার রিভিউটি আপনিই নিচে যুক্ত করুন!"}
                </div>
              ) : (
                landingReviews.map((rev, idx) => (
                  <div key={idx} className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-6.5 w-6.5 rounded-full bg-amber-600 flex items-center justify-center text-zinc-950 font-black select-none text-[10px]">
                          {rev.reviewer.slice(0, 2)}
                        </div>
                        <strong className="text-zinc-200 font-semibold">{rev.reviewer}</strong>
                      </div>
                      <span className="text-zinc-500 font-sans text-[9px]">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} size={10} fill="currentColor" className="stroke-none" />
                      ))}
                    </div>
                    <p className="text-[11.5px] text-zinc-300 font-light leading-relaxed">
                      {rev.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Submittable client form */}
            <form onSubmit={handleAddFeedback} className="bg-zinc-950/40 border border-zinc-850/60 p-4 rounded-xl space-y-3 mt-4 text-xs">
              <div className="font-bold text-zinc-350 pb-1.5 border-b border-zinc-900 text-xs flex items-center space-x-1">
                <span className="text-amber-500">✦</span>
                <span>{language === 'en' ? 'Share Your Authentic Review' : 'আপনার মূল্যবান কাস্টমার রিভিও লিখুন'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider">{language === 'en' ? 'Your Name' : 'আপনার নাম'}</label>
                  <input
                    type="text"
                    required
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder={language === 'en' ? "e.g. Robin Islam" : "উদা: রবিন ইসলাম"}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 rounded focus:outline-none focus:border-amber-500 text-xs placeholder-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider block">{language === 'en' ? 'Rating' : 'রেটিং দিন'}</label>
                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-2 py-1.5 rounded focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                    <option value={2}>⭐⭐ (2/5)</option>
                    <option value={1}>⭐ (1/5)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">{language === 'en' ? 'Your Comment / Review' : 'আপনার মন্তব্য বা রিভিউটি লিখুন'}</label>
                <textarea
                  required
                  rows={2}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={language === 'en' ? "Write your genuine experience with this product..." : "এই প্রোডাক্টটি নিয়ে আপনার আসল অভিজ্ঞতা বা মন্তব্য লিখুন..."}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 rounded focus:outline-none focus:border-amber-500 text-xs placeholder-zinc-600 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold uppercase py-2 rounded transition cursor-pointer border-0 text-[11px]"
              >
                {language === 'en' ? 'SUBMIT FEEDBACK' : 'রিভিউ সাবমিট করুন'}
              </button>
            </form>
          </div>

          {/* DYNAMIC FAQ SECTION TO SOLV COLD TRAFFIC */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#eeeeee] flex items-center space-x-2">
              <HelpCircle size={16} className="text-amber-500" />
              <span>{language === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাসা ও উত্তর'}</span>
            </h3>

            <div className="divide-y divide-zinc-800 border-y border-zinc-800">
              <div className="py-4 space-y-1.5">
                <h5 className="text-xs font-semibold text-zinc-100">
                  {language === 'en' ? 'How can I do return if I find any issues?' : 'প্রোডাক্ট অপছন্দ কিংবা সমস্যা হলে কীভাবে এক্সচেঞ্জ করবো?'}
                </h5>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  {language === 'en' 
                    ? 'Simply call us or message our Facebook page within 7 days. We will dispatch a courier rider to swap your product immediately.' 
                    : 'প্রোডাক্ট পরিবর্তন বা রিটার্ন পেতে আমাদের হেল্পলাইন নাম্বারে কল করুন অথবা ফেসবুক পেইজে মেসেজ দিন। ৭ দিনের মধ্যে কোনো চার্জ ছাড়াই পরিবর্তন পাবেন।'}
                </p>
              </div>

              <div className="py-4 space-y-1.5">
                <h5 className="text-xs font-semibold text-zinc-100">
                  {language === 'en' ? 'Is there any hidden fees or extra costs?' : 'অর্ডার করার সময় কোনো লুকানো ফি আছে কি?'}
                </h5>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  {language === 'en' 
                    ? 'Absolutely not! You only pay the listed price plus standard shipping costs (Dhaka 60 BDT, outside 120 BDT) on Cash on Delivery.' 
                    : 'জ্বি না, কোনো লুকানো চার্জ নেই। আপনি প্রোডাক্টের মূল্য এবং কুরিয়ার চার্জ বাদে অতিরিক্ত কোনো টাকা পরিশোধ করবেন না।'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: HIGH-CONVERTING DIRECT ORDER FORM (STAYS STICKY IN PREFERENCE) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-zinc-900 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_4px_45px_rgba(245,158,11,0.06)] space-y-6">
            
            <div className="text-center space-y-2 pb-4 border-b border-zinc-850">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] uppercase font-bold tracking-widest">
                <Gift size={11} className="text-amber-400 animate-bounce" />
                <span>Cash on delivery / ক্যাশ অন ডেলিভারি</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white serif-display">
                {language === 'en' ? 'Direct Order Now' : 'সহজ অর্ডার ফর্ম'}
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'en' 
                  ? 'Fill the form with correct info to confirm order instantly' 
                  : 'অর্ডারটি কনফার্ম করতে নিচের ফর্মে আপনার সঠিক তথ্য দিন'}
              </p>
            </div>

            {/* QUICK ORDER FORM */}
            <form onSubmit={handleImmediateOrder} className="space-y-5" id="direct-landing-order-form">
              
              {/* Validation alert */}
              {validationError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center font-bold">
                  {validationError}
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase tracking-widest font-bold">
                  {language === 'en' ? 'Your Name' : 'আপনার সম্পূর্ণ নাম'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'en' ? "e.g. Abdullah Khan" : "উদা: মোঃ আরিফুল ইসলাম"}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-light"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase tracking-widest font-bold">
                  {language === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-3.5 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={language === 'en' ? "e.g. 017XXXXXXXX" : "উদা: ০১৭xxxxxxxx (১১ ডিজিট)"}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono font-bold"
                  />
                </div>
              </div>

              {/* Delivery District selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase tracking-widest font-bold">
                  {language === 'en' ? 'Select Region' : 'ডেলিভারি অঞ্চল'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDistrict("Dhaka")}
                    className={`p-3.5 border rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      district === "Dhaka"
                        ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow-md"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span>{language === 'en' ? 'Inside Dhaka' : 'ঢাকার ভেতরে'}</span>
                    <span className="text-[10px] font-normal font-mono">৳৬০ / COD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDistrict("Outside")}
                    className={`p-3.5 border rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      district === "Outside"
                        ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow-md"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span>{language === 'en' ? 'Outside Dhaka' : 'ঢাকার বাইরে'}</span>
                    <span className="text-[10px] font-normal font-mono">৳১২০ / COD</span>
                  </button>
                </div>
              </div>

              {/* Complete Delivery Address */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase tracking-widest font-bold">
                  {language === 'en' ? 'Full Delivery Address' : 'বিস্তারিত ঠিকানা'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={language === 'en' ? "e.g. House #14, Road #4, Dhanmandi, Dhaka" : "উদা: বাসা নং- ১৪, রোড নং- ৪, ধানমন্ডি, ঢাকা"}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-light resize-none"
                />
              </div>

              {/* Feature Variant select option if exists */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-zinc-400 uppercase tracking-widest font-bold">
                    {language === 'en' ? 'Preferred Specification / Design' : 'পছন্দের মডেল / সাইজ'}
                  </label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-zinc-300 focus:outline-none transition"
                  >
                    {(language === 'bn' ? selectedProduct.featuresBn : selectedProduct.features)?.map((feat, i) => (
                      <option key={i} value={feat}>{feat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity Counter adjusting */}
              <div className="flex items-center justify-between pb-3">
                <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold font-sans">
                  {language === 'en' ? 'Order Quantity' : 'অর্ডার পরিমাণ'}
                </span>
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="h-9 w-9 rounded-lg hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold w-10 text-center text-zinc-100">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="h-9 w-9 rounded-lg hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* AMBIENT BILL SUMMARY WINDOW */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-2 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Product Total' : 'পণ্যের সাবটোটাল'}:</span>
                  <span className="font-mono">{currency === 'BDT' ? `৳${productTotal.toLocaleString()}` : `$${productTotal.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Delivery Fee' : 'ডেলিভারি চার্জ'}:</span>
                  <span className="font-mono text-amber-500">{currency === 'BDT' ? `৳${shippingCost}` : `$${(shippingCost / 120).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-zinc-900">
                  <span className="font-bold text-white text-[13px]">{language === 'en' ? 'Total Bill' : 'সর্বমোট প্রদেয় বিল'}:</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {currency === 'BDT' ? `৳${grandTotal.toLocaleString()}` : `$${grandTotal.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* CONVERT BIG SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting || selectedProduct.stock <= 0}
                className={`w-full py-4.5 rounded-2xl text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-xl cursor-pointer ${
                  selectedProduct.stock <= 0
                    ? 'bg-zinc-800 text-zinc-650 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black shadow-[0_4px_25px_rgba(16,185,129,0.2)] hover:scale-[1.01]'
                }`}
                id="submit-landing-order-btn"
              >
                {isSubmitting ? (
                  <span className="animate-spin h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <ShoppingBag size={14} className="text-zinc-950" />
                    <span>{language === 'en' ? 'CONFIRM ORDER NOW' : 'অর্ডার কনফার্ম করুন'}</span>
                  </>
                )}
              </button>

              {/* WHATSAPP SUPPORT ACTION */}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                    language === 'bn' 
                      ? `আসসালামু আলাইকুম, আমি ল্যান্ডিং পেজ থেকে "${selectedProduct.name}" অর্ডার করতে চাই।` 
                      : `Hello, I would like to place an order for "${selectedProduct.name}" from your landing page.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => pushPixelEvent("WhatsAppClicked", `Contacting WA: ${whatsappNumber}`)}
                  className="w-full py-3.5 rounded-2xl text-xs font-extrabold tracking-wider text-white bg-[#25D366] hover:bg-[#20ba56] transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-[0_4px_20px_rgba(37,211,102,0.15)] cursor-pointer no-underline"
                  id="whatsapp-order-landing-link"
                >
                  <MessageSquare size={14} className="text-white fill-white shrink-0" />
                  <span>{language === 'bn' ? 'সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন' : 'ORDER DIRECTLY VIA WHATSAPP'}</span>
                </a>
              )}

              <div className="text-center pt-2 flex items-center justify-center space-x-1.5 text-[10px] text-zinc-500 font-light select-none">
                <Users size={12} className="text-amber-500" />
                <span>{language === 'en' ? '41 people recently ordered this' : 'আজকে ৪১ জন এটি নিয়েছেন!'}</span>
              </div>

            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
