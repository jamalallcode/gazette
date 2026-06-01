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
  Phone
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
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

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
        customerInfo: {
          name,
          phone,
          email: `${phone}@customer.aura`,
          address: `${address}, Area: ${district}, Bangladesh (Selected Option: ${selectedVariant})`,
          paymentMethod: 'Cash On Delivery',
          paymentStatus: language === 'en' ? 'Cash On Delivery' : 'হাতে পেয়ে মূল্য পরিশোধ'
        }
      };

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

  return (
    <div className="space-y-12" id="promo-landing-container">
      
      {/* ADVISOR/ADMIN SWITCHER HEADER FOR TESTING PURPOSES */}
      <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-wide">
        <div className="flex items-center space-x-2.5">
          <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 font-bold uppercase tracking-widest text-[10px]">Facebook Ads Tool</span>
          <p className="text-zinc-400 font-light">
            {language === 'en' 
              ? "Select any product from your catalog to instantly generate a specialized high-conversion Facebook Landing page:" 
              : "আপনার শপের যেকোনো পণ্য সিলেক্ট করে তাৎক্ষণিকভাবে ফেসবুক বিজ্ঞাপনের ল্যান্ডিং পেজ প্রিভিউ দেখুন:"}
          </p>
        </div>
        <select
          value={selectedProductId}
          onChange={(e) => {
            setSelectedProductId(e.target.value);
            setValidationError("");
          }}
          className="bg-zinc-950 border border-zinc-800 text-amber-400 font-bold px-4 py-2 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
          id="landing-product-preview-select"
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {language === 'bn' ? p.nameBn : p.name} (৳{p.priceBDT.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      {/* TOP EMERGENCY HURRY BANNER */}
      <div className="bg-gradient-to-r from-red-650 via-amber-600 to-amber-500 text-zinc-950 px-4 py-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-center shadow-lg font-sans">
        <div className="flex items-center space-x-2 justify-center md:justify-start">
          <Clock size={16} className="animate-spin text-zinc-950" />
          <span className="font-extrabold tracking-widest text-xs uppercase">
            {language === 'en' ? 'SPECIAL ADVERTISED CAMPAIGN OFFER' : 'ফেসবুক স্পেশাল ধামাকা অফার (খুবই সীমিত স্টক)'}
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
              <span className="absolute top-5 left-5 px-3 py-1 bg-red-600 text-white font-bold tracking-widest text-[9px] rounded uppercase shadow-xl">
                {language === 'en' ? 'HOT DEAL - Save 20%' : 'ফেসবুক প্রমোশন - ২০% ছাড়'}
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
                {language === 'bn' ? selectedProduct.nameBn : selectedProduct.name}
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light tracking-wide">
                {language === 'bn' ? selectedProduct.descriptionBn : selectedProduct.description}
              </p>

              {/* Highlight Product Value Props list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-850">
                {(language === 'bn' ? selectedProduct.featuresBn : selectedProduct.features)?.map((feat, idx) => (
                  <div key={idx} className="flex items-start text-xs text-zinc-300 font-light">
                    <CheckCircle size={14} className="text-amber-500 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* THREE CORE TRUST CARDS IN BANGLADESH */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Truck size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-200">
                {language === 'en' ? 'Home Delivery' : 'সারা বাংলাদেশে হোম ডেলিভারি'}
              </h4>
              <p className="text-[11px] text-zinc-500">
                {language === 'en' ? 'Dhaka within 24hr, outside 48-72hr' : 'ঢাকার ভেতরে ২৪ ঘণ্টা এবং বাইরে ৭২ ঘণ্টার মধ্যে ডেলিভারি'}
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-200">
                {language === 'en' ? 'Cash on Delivery' : 'হাতে পেয়ে মূল্য পরিশোধ'}
              </h4>
              <p className="text-[11px] text-zinc-500">
                {language === 'en' ? '100% risk-free. Open & verify then pay' : 'কোনো অগ্রিম পেমেন্ট নেই, পার্সেল দেখে পেমেন্ট করবেন'}
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl flex flex-col items-center text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <RotateCcw size={20} />
              </div>
              <h4 className="text-xs font-bold text-zinc-200">
                {language === 'en' ? '7 Days Easy Return' : '৭ দিনের সহজ রিটার্ন'}
              </h4>
              <p className="text-[11px] text-zinc-500">
                {language === 'en' ? 'Instant refunds or product replacement' : 'যেকোনো সমস্যায় নিশ্চিত রিটার্ন এবং এক্সচেঞ্জ গ্যারান্টি'}
              </p>
            </div>
          </div>

          {/* SOCIAL PROOF / REAL REVIEWS ACCORDING TO FB STANDARDS */}
          <div className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center space-x-2">
              <MessageSquare size={16} className="text-amber-500" />
              <span>{language === 'en' ? 'Recent Facebook Feedback' : 'ক্রেতাদের সাম্প্রতিক ফেসবুক রিভিউ'}</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-6.5 w-6.5 rounded-full bg-amber-600 flex items-center justify-center text-zinc-950 font-bold select-none text-[10px]">
                      রা
                    </div>
                    <strong className="text-zinc-200 font-semibold">রাশেদ চৌধুরী (ধানমন্ডি, ঢাকা)</strong>
                  </div>
                  <span className="text-emerald-500 font-mono text-[10px] font-bold">✔ Verified Buyer</span>
                </div>
                <div className="flex text-amber-500">
                  <Star size={11} fill="currentColor" /><Star size={11} fill="currentColor" /><Star size={11} fill="currentColor" /><Star size={11} fill="currentColor" /><Star size={11} fill="currentColor" />
                </div>
                <p className="text-[11.5px] text-zinc-400 font-light leading-relaxed">
                  {language === 'en' 
                    ? "Sublime quality! Checked the package right in front of the pathao rider and paid on cash. Outstanding premium feel." 
                    : "সত্যিই অসাধারণ কোয়ালিটি! ডেলিভারি ম্যানের সামনে প্যাকেট খুলে চেক করে তারপর টাকা দিয়েছি। অরিজিনাল প্রোডাক্ট, কোনো ত্রুটি নেই। ধন্যবাদ অরা!"}
                </p>
              </div>

              <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-6.5 w-6.5 rounded-full bg-amber-600 flex items-center justify-center text-zinc-950 font-bold select-none text-[10px]">
                      মি
                    </div>
                    <strong className="text-zinc-200 font-semibold">মিনহাজুল ইসলাম (চট্টগ্রাম সদর)</strong>
                  </div>
                  <span className="text-emerald-500 font-mono text-[10px] font-bold">✔ Verified Buyer</span>
                </div>
                <div className="flex text-amber-500">
                  <Star size={11} fill="currentColor" /><Star size={11} fill="currentColor" /><Star size={11} fill="currentColor" /><Star size={11} fill="currentColor" /><Star size={11} fill="currentColor" />
                </div>
                <p className="text-[11.5px] text-zinc-400 font-light leading-relaxed">
                  {language === 'en' 
                    ? "Highly recommended. Delivery took only 2 days in CTG. Packaging was state of class and safe." 
                    : "চিটাগং-এ ২ দিনের মধ্যে ডেলিভারি পেয়েছি। প্রোডাক্টের ফিনিশিং এবং লাক্সারি লুকটা দারুণ লেগেছে। যেমন দেখেছি ঠিক তেমনটাই পেয়েছি।"}
                </p>
              </div>
            </div>
          </div>

          {/* DYNAMIC FAQ SECTION TO SOLV COLD TRAFFIC */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center space-x-2">
              <HelpCircle size={16} className="text-amber-500" />
              <span>{language === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাসা ও উত্তর'}</span>
            </h3>

            <div className="divide-y divide-zinc-900 border-y border-zinc-900">
              <div className="py-4 space-y-1">
                <h5 className="text-xs font-semibold text-zinc-100">
                  {language === 'en' ? 'How can I do return if I find any issues?' : 'প্রোডাক্ট অপছন্দ কিংবা সমস্যা হলে কীভাবে এক্সচেঞ্জ করবো?'}
                </h5>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {language === 'en' 
                    ? 'Simply call us or message our Facebook page within 7 days. We will dispatch a courier rider to swap your product immediately.' 
                    : 'প্রোডাক্ট পরিবর্তন বা রিটার্ন পেতে আমাদের হেল্পলাইন নাম্বারে কল করুন অথবা ফেসবুক পেইজে মেসেজ দিন। ৭ দিনের মধ্যে কোনো চার্জ ছাড়াই পরিবর্তন পাবেন।'}
                </p>
              </div>

              <div className="py-4 space-y-1">
                <h5 className="text-xs font-semibold text-zinc-100">
                  {language === 'en' ? 'Is there any hidden fees or extra costs?' : 'অর্ডার করার সময় কোনো লুকানো ফি আছে কি?'}
                </h5>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
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
