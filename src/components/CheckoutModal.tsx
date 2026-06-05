import React, { useState } from "react";
import { X, CircleCheck, Info, CreditCard, Flame, ReceiptText, ShieldCheck } from "lucide-react";
import { CartItem, Order } from "../types";
import PaymentGatewayModal from "./PaymentGatewayModal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: 'BDT' | 'USD';
  language: 'en' | 'bn';
  onOrderSuccess: (order: Order) => void;
  langText: any;
  currentUser?: any;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  currency,
  language,
  onOrderSuccess,
  langText,
  currentUser
}: CheckoutModalProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: currentUser ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() : "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    paymentMethod: "cod"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayMethod, setGatewayMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'upay' | 'sslcommerz'>('bkash');

  const totalBDT = cartItems.reduce((acc, item) => acc + (item.product.priceBDT * item.quantity), 0);
  const totalUSD = cartItems.reduce((acc, item) => acc + (item.product.priceUSD * item.quantity), 0);

  const displayTotal = currency === 'BDT'
    ? `৳${totalBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
    : `$${totalUSD.toFixed(2)}`;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = language === 'en' ? "Full name is required" : "সম্পূর্ণ নাম আবশ্যিক";
    }
    if (!formData.email.trim()) {
      newErrors.email = language === 'en' ? "Email address is required" : "ইমেইল অ্যাড্রেস আবশ্যিক";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = language === 'en' ? "Invalid email pattern" : "সঠিক ইমেইল ফরম্যাট প্রদান করুন";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'en' ? "Phone number is required" : "ফোন নাম্বার আবশ্যিক";
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = language === 'en' ? "Invalid phone sequence" : "সঠিক ফোন নাম্বার দিন";
    }
    if (!formData.address.trim()) {
      newErrors.address = language === 'en' ? "Delivery address is required" : "ডেলিভারি ঠিকানা আবশ্যিক";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const finalizeOrder = (trxId?: string, paymentDetail?: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const mockOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const deliveryDays = formData.paymentMethod === 'cod' ? 3 : 2;
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + deliveryDays);

      let finalPaymentMethodLabel = "Cash on Delivery";
      let finalPaymentStatus = "Pending";

      if (formData.paymentMethod !== 'cod') {
        finalPaymentStatus = "Paid";
        finalPaymentMethodLabel = paymentDetail || `Paid via ${formData.paymentMethod.toUpperCase()} (TXN: ${trxId})`;
      }

      const newOrder: Order = {
        id: mockOrderId,
        date: new Date().toLocaleDateString(),
        items: [...cartItems],
        totalBDT: totalBDT,
        totalUSD: totalUSD,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          paymentMethod: finalPaymentMethodLabel,
          paymentStatus: finalPaymentStatus
        },
        status: 'placed',
        estimatedDelivery: estimatedDeliveryDate.toDateString(),
        timestamp: Date.now()
      };

      onOrderSuccess(newOrder);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.paymentMethod !== 'cod') {
      setGatewayMethod(formData.paymentMethod as any);
      setIsGatewayOpen(true);
    } else {
      finalizeOrder();
    }
  };

  const handleGatewaySuccess = (trxId: string, info: string) => {
    setIsGatewayOpen(false);
    finalizeOrder(trxId, info);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-2xl bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 border border-zinc-850 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] text-zinc-100 p-6 sm:p-10 transform transition-all duration-300">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-5 mb-6 border-b border-zinc-900">
            <div className="flex items-center space-x-3.5">
              <ReceiptText className="text-amber-400" size={20} />
              <h2 className="text-xl font-normal tracking-wide text-zinc-50 serif-display">
                {language === 'en' ? 'Bespoke Order Checkout' : 'অর্ডার ও শিপিং তথ্য'}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-[9px] font-bold tracking-widest text-zinc-400 uppercase mb-2">
                  {language === 'en' ? 'Full name' : 'সম্পূর্ণ নাম'} <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. S.M. Sajjad' : 'যেমন: আশরাফুল ইসলাম'}
                  className="w-full px-4.5 py-3 bg-zinc-900/40 border border-zinc-850 rounded-xl text-zinc-150 text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-amber-500/80 focus:bg-zinc-950 transition-all font-light"
                  id="checkout-name"
                />
                {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[9px] font-bold tracking-widest text-zinc-400 uppercase mb-2">
                  {language === 'en' ? 'Active Phone No' : 'সক্রিয় মোবাইল নম্বর'} <span className="text-amber-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. 01712XXXXXX' : 'যেমন: ০১৭১২XXXXXX'}
                  className="w-full px-4.5 py-3 bg-zinc-900/40 border border-zinc-850 rounded-xl text-zinc-150 text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-amber-500/80 focus:bg-zinc-950 transition-all font-mono"
                  id="checkout-phone"
                />
                {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[9px] font-bold tracking-widest text-zinc-400 uppercase mb-2">
                {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} <span className="text-amber-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@domain.com"
                className="w-full px-4.5 py-3 bg-zinc-900/40 border border-zinc-850 rounded-xl text-zinc-150 text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-amber-500/80 focus:bg-zinc-950 transition-all font-mono"
                id="checkout-email"
              />
              {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Delivery address */}
            <div>
              <label className="block text-[9px] font-bold tracking-widest text-zinc-400 uppercase mb-2">
                {language === 'en' ? 'Shipping / Delivery Address' : 'শিপিং / ডেলিভারি ঠিকানা'} <span className="text-amber-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={language === 'en' ? 'e.g. Flat/House, Road, Area, Dhaka' : 'যেমন: ১৬, রবীন্দ্র সরণী, উত্তরা, ঢাকা'}
                rows={2}
                className="w-full px-4.5 py-3 bg-zinc-900/40 border border-zinc-850 rounded-xl text-zinc-150 text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-amber-500/80 focus:bg-zinc-950 transition-all resize-none font-light"
                id="checkout-address"
              />
              {errors.address && <p className="text-[11px] text-red-400 mt-1">{errors.address}</p>}
            </div>

            {/* Billing Payment Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                  {language === 'en' ? 'Preferred Payment Option' : 'পছন্দসই পেমেন্ট মাধ্যম'}
                </label>
                <div className="flex items-center space-x-1 text-zinc-500">
                  <ShieldCheck size={11} className="text-[#f58220]" />
                  <span className="text-[9px] leading-none uppercase font-extrabold text-zinc-550">100% Secured Secured Payments</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                {/* Cash on Delivery */}
                <label className={`relative border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition select-none ${
                  formData.paymentMethod === 'cod' 
                    ? 'border-amber-500/55 bg-amber-500/5 text-zinc-100' 
                    : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-850 hover:bg-zinc-900/30 text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {language === 'en' ? 'COD / ক্যাশ' : 'ক্যাশ অন ডেলিভারি'}
                    </span>
                    <Info size={12} className="text-zinc-500" />
                  </div>
                  <span className="text-[8.5px] text-zinc-500 leading-tight">
                    {language === 'en' ? 'Pay direct cash upon delivery' : 'হাতে পেয়ে মূল্য দিন'}
                  </span>
                </label>

                {/* bKash Mobile Wallet */}
                <label className={`relative border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition select-none ${
                  formData.paymentMethod === 'bkash' 
                    ? 'border-pink-500/40 bg-pink-500/5 text-zinc-100' 
                    : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-850 hover:bg-zinc-900/30 text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bkash"
                    checked={formData.paymentMethod === 'bkash'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 text-pink-400">
                      <Flame size={11} className="text-pink-500 animate-pulse animate-duration-1000" />
                      <span>bKash</span>
                    </span>
                    <span className="text-[8px] px-1 bg-pink-500/20 text-pink-300 font-extrabold rounded">5% OFF</span>
                  </div>
                  <span className="text-[8.5px] text-zinc-500 leading-tight">
                    {language === 'en' ? 'Instant secure wallet pay' : 'বিকাশ ইনস্ট্যান্ট পেমেন্ট'}
                  </span>
                </label>

                {/* Nagad Digital Pay */}
                <label className={`relative border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition select-none ${
                  formData.paymentMethod === 'nagad' 
                    ? 'border-orange-500/40 bg-orange-500/5 text-zinc-100' 
                    : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-850 hover:bg-zinc-900/30 text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="nagad"
                    checked={formData.paymentMethod === 'nagad'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'nagad' })}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      Nagad
                    </span>
                    <span className="text-[8px] px-1 bg-orange-500/20 text-orange-300 font-extrabold rounded">FAST</span>
                  </div>
                  <span className="text-[8.5px] text-zinc-500 leading-tight">
                    {language === 'en' ? 'Direct checkout with Nagad' : 'নগদ ডিজিটাল পেমেন্ট'}
                  </span>
                </label>

                {/* Rocket Pay */}
                <label className={`relative border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition select-none ${
                  formData.paymentMethod === 'rocket' 
                    ? 'border-purple-500/40 bg-purple-500/5 text-zinc-100' 
                    : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-850 hover:bg-zinc-900/30 text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="rocket"
                    checked={formData.paymentMethod === 'rocket'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'rocket' })}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Rocket
                    </span>
                    <span className="text-[8.5px] text-purple-400/80 font-bold">DBBL</span>
                  </div>
                  <span className="text-[8.5px] text-zinc-500 leading-tight">
                    {language === 'en' ? 'Dutch-Bangla Rocket Wallet' : 'রকেট দিয়ে সহজে পেমেন্ট'}
                  </span>
                </label>

                {/* Upay Pay */}
                <label className={`relative border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition select-none ${
                  formData.paymentMethod === 'upay' 
                    ? 'border-sky-500/40 bg-sky-500/5 text-zinc-100' 
                    : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-850 hover:bg-zinc-900/30 text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upay"
                    checked={formData.paymentMethod === 'upay'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'upay' })}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      Upay
                    </span>
                    <span className="text-[8px] text-sky-400/80 font-bold">UCB</span>
                  </div>
                  <span className="text-[8.5px] text-zinc-500 leading-tight">
                    {language === 'en' ? 'Upay secure digital payout' : 'ইউপে নিরাপদ ডিজিটাল ওয়ালেট'}
                  </span>
                </label>

                {/* SSLCommerz Visa/Master cards */}
                <label className={`relative border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition select-none ${
                  formData.paymentMethod === 'sslcommerz' 
                    ? 'border-cyan-500/40 bg-cyan-500/5 text-zinc-100' 
                    : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-850 hover:bg-zinc-900/30 text-zinc-400'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="sslcommerz"
                    checked={formData.paymentMethod === 'sslcommerz'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'sslcommerz' })}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1">
                      <CreditCard size={11} className="text-cyan-400" />
                      <span>Cards</span>
                    </span>
                    <span className="text-[8px] px-1 bg-cyan-550 text-white font-extrabold rounded">SSL</span>
                  </div>
                  <span className="text-[8.5px] text-zinc-500 leading-tight">
                    {language === 'en' ? 'Visa, Mastercard, Amex, Internet Bank' : 'এসএসএলকমার্জ কার্ড রাউটার'}
                  </span>
                </label>

              </div>
            </div>

            {/* Price review panel and Submit */}
            <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-5 bg-zinc-950/40 p-5 rounded-2xl">
              <div>
                <span className="text-xs text-zinc-400 font-mono">
                  {language === 'en' ? 'Subtotal Order Value' : 'সর্বোমোট প্রদেয় বিল'}
                </span>
                <span className="block text-2xl font-black text-amber-400 font-sans tracking-tight">
                  {displayTotal}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 text-xs font-black tracking-widest uppercase py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2.5"
                id="submit-order-checkout"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{language === 'en' ? 'Processing...' : 'অর্ডার পাঠানো হচ্ছে...'}</span>
                  </>
                ) : (
                  <span>{language === 'en' ? 'Confirm Real Order' : 'অর্ডার কনফার্ম করুন'}</span>
                )}
              </button>
            </div>

          </form>

          {/* Secure interactive payment gateway modal wrapper integration */}
          <PaymentGatewayModal
            isOpen={isGatewayOpen}
            onClose={() => setIsGatewayOpen(false)}
            method={gatewayMethod}
            amountBDT={totalBDT}
            onPaymentSuccess={handleGatewaySuccess}
            language={language}
          />

        </div>
      </div>
    </div>
  );
}
