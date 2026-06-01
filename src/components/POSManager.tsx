import React, { useState, useMemo } from "react";
import { 
  Search, CheckCircle2, Printer, ShoppingCart, User, Smartphone, 
  MapPin, Check, Wifi, WifiOff, RefreshCw, Layers, Percent, Trash2, 
  ShieldCheck, Banknote, DollarSign 
} from "lucide-react";
import { Product, Order, Category } from "../types";
import { triggerOrderSmsNotification } from "../utils/smsHelper";

interface POSManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  language: 'en' | 'bn';
  currency: 'BDT' | 'USD';
}

export default function POSManager({
  products,
  setProducts,
  orders,
  setOrders,
  language,
  currency
}: POSManagerProps) {
  // Mode Selector: 'offline' (walk-in counter) vs 'online' (phone call/messenger booking)
  const [posMode, setPosMode] = useState<'offline' | 'online'>('offline');
  
  // Synced state: switch between Cloud Sync active vs offline local cache storage
  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [productSearch, setProductSearch] = useState("");

  // Customer credentials
  const [customerName, setCustomerName] = useState(language === 'bn' ? "সাধারণ ক্রেতা" : "Walk-in Guest");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("dhaka");
  const [selectedCourier, setSelectedCourier] = useState("Kamrul Islam (Mirpur, Uttara)");
  
  // Payment credentials
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashProvided, setCashProvided] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponStatus, setCouponStatus] = useState<'none' | 'success' | 'invalid'>('none');

  // Active basket state
  const [posCart, setPosCart] = useState<{product: Product; quantity: number}[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [posSuccessMsg, setPosSuccessMsg] = useState("");

  // Product classification list
  const uniqueCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["all", ...Array.from(cats)];
  }, [products]);

  // Filter products by search query + categories
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.nameBn.includes(productSearch);
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, activeCategory]);

  // Pricing calculations
  const grossAmount = posCart.reduce((sum, item) => sum + item.product.priceBDT * item.quantity, 0);
  const shippingFee = posMode === 'online' ? (deliveryRegion === 'dhaka' ? 60 : 120) : 0;
  const discountAmount = Math.round(grossAmount * (discountPercent / 100));
  const vatAmount = Math.round((grossAmount - discountAmount) * 0.05); // 5% standard VAT
  const netPayable = grossAmount - discountAmount + vatAmount + shippingFee;

  // Auto-calculated change for cashier physical drawer register
  const changeDue = useMemo(() => {
    const cash = parseFloat(cashProvided);
    if (isNaN(cash) || cash < netPayable) return 0;
    return cash - netPayable;
  }, [cashProvided, netPayable]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const testCode = couponCode.trim().toUpperCase();
    if (testCode === "NABIK50" || testCode === "FESTIVE250" || testCode === "EID30") {
      setDiscountPercent(15);
      setCouponStatus('success');
    } else {
      setDiscountPercent(0);
      setCouponStatus('invalid');
    }
  };

  const handleAddToBasket = (product: Product) => {
    if (product.stock <= 0) return;
    setPosCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handlePOSCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) return;

    // Build order object
    const simulatedTrx = "POS-" + Math.floor(100000 + Math.random() * 900000);
    const orderDetails: Order = {
      id: simulatedTrx,
      date: new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      items: [...posCart],
      totalBDT: netPayable,
      totalUSD: Math.round(netPayable / 120),
      customerInfo: {
        name: customerName,
        email: "pos-client@sellsullpay.xyz",
        phone: customerPhone || (language === 'bn' ? "মোবাইল দেওয়া হয়নি" : "No Mobile Provided"),
        address: posMode === 'offline' 
          ? (language === 'bn' ? "কাউন্টার ওভার-দা-কাউন্টার বিক্রি" : "Walk-in Direct Shop Sale")
          : `${language === 'bn' ? 'অনলাইন ডেলিভারি' : 'Online Shipping'} - Destination: ${deliveryRegion.toUpperCase()}`,
        paymentMethod: posMode === 'offline' ? `${paymentMethod} (Cashier Direct)` : `Online ${paymentMethod} (${selectedCourier})`,
        paymentStatus: "paid"
      },
      status: posMode === 'offline' ? 'delivered' : 'placed',
      estimatedDelivery: posMode === 'offline' ? "Immediate Handover" : "24-72 Hours via Courier"
    };

    // Deduct local React state products stock safely
    setProducts(prev => 
      prev.map(p => {
        const cartItem = posCart.find(it => it.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    setOrders(prev => [orderDetails, ...prev]);
    
    // Automatically trigger mobile SMS notification based on active checkout mode
    if (posMode === 'offline') {
      triggerOrderSmsNotification(orderDetails, 'delivered', "Sellsull Retail");
    } else {
      triggerOrderSmsNotification(orderDetails, 'placed', "Sellsull Retail");
    }

    setLastCompletedOrder(orderDetails);
    setPosCart([]);
    setCashProvided("");
    setCouponCode("");
    setDiscountPercent(0);
    setCouponStatus('none');
    
    // Auto-toggle visual modal receipt
    setShowReceiptModal(true);
    setPosSuccessMsg(
      language === 'bn' 
        ? `ইনভয়েস সফল হয়েছে! ট্রানজেকশন আইডি: ${simulatedTrx}` 
        : `POS Invoice cleared! Transaction ID: ${simulatedTrx}`
    );
    setTimeout(() => setPosSuccessMsg(""), 4500);
  };

  return (
    <div className="space-y-5 text-left font-sans" id="pos-management-system">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4.5">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 flex items-center space-x-2">
            <span>🛒</span>
            <span>{language === 'bn' ? 'স্মার্ট পয়েন্ট অফ সেল (POS) টার্মিনাল' : 'Enterprise Unified POS Terminal'}</span>
          </h1>
          <p className="text-xs text-zinc-500 font-semibold">
            {language === 'bn' 
              ? 'অফলাইন ওভার-দ্যা-কাউন্টার ক্যাশ সেলস এবং অনলাইন মেসেঞ্জার বুকিং একসাথে ইন্টিগ্রেটেড ম্যানেজমেন্ট।' 
              : 'Directly manage walk-in counter sales & book telephone/messenger courier orders details simultaneously.'}
          </p>
        </div>

        {/* Sync Mode Selector */}
        <div className="flex items-center space-x-2 bg-zinc-100 p-1 rounded-xl border">
          <button 
            type="button"
            onClick={() => setIsOnlineMode(!isOnlineMode)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center space-x-1.5 transition cursor-pointer border-0 ${
              isOnlineMode 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-amber-600 text-white shadow-xs'
            }`}
          >
            {isOnlineMode ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isOnlineMode 
              ? (language === 'bn' ? 'ক্লাউড সিঙ্ক চালু' : 'Cloud Sync Active') 
              : (language === 'bn' ? 'অফলাইন লোকাল ক্যাশ' : 'Offline Mode LocalCache')}
            </span>
          </button>
        </div>
      </div>

      {posSuccessMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-xs text-xs animate-pulse">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <span className="font-bold">{posSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setShowReceiptModal(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10.5px] font-black border-0 cursor-pointer"
          >
            {language === 'bn' ? 'রশিদ দেখুন' : 'View Quick Receipt'}
          </button>
        </div>
      )}

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Picking queue queue catalog (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border rounded-2xl p-4.5 shadow-2xs space-y-3">
            
            {/* Primary Category selection and search */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between select-none">
              <div className="relative w-full sm:w-[220px]">
                <Search className="absolute left-3 top-3 text-zinc-400" size={13} />
                <input
                  type="text"
                  placeholder={language === 'bn' ? "পণ্য খুঁজুন..." : "Filter catalog items..."}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3.5 py-2 border rounded-xl focus:border-brand focus:ring-1 focus:outline-none focus:ring-brand"
                />
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1 items-center max-w-full overflow-x-auto pb-1">
                {uniqueCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition border cursor-pointer ${
                      activeCategory === cat 
                        ? 'bg-zinc-900 border-zinc-900 text-white' 
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-650'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtering loop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredProducts.map(p => {
              const isOutOfStock = p.stock <= 0;
              return (
                <div 
                  key={p.id}
                  onClick={() => !isOutOfStock && handleAddToBasket(p)}
                  className={`bg-white border rounded-2xl p-3 flex flex-col justify-between space-y-2.5 transition active:scale-98 shadow-3xs cursor-pointer ${
                    isOutOfStock 
                      ? 'opacity-55 cursor-not-allowed border-zinc-200' 
                      : 'hover:border-amber-500 hover:shadow-xs border-zinc-150'
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={p.image} 
                      className="h-20 w-full object-cover rounded-xl border" 
                      alt="" 
                      referrerPolicy="no-referrer" 
                    />
                    {isOutOfStock && (
                      <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                        Sold Out
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#052b52] text-[11.5px] truncate font-sans">
                      {language === 'bn' ? p.nameBn : p.name}
                    </h4>
                    <span className="block text-[11px] text-amber-600 font-extrabold font-mono mt-0.5">
                      ৳{p.priceBDT.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9.5px] text-zinc-400 border-t pt-1.5 font-bold leading-none">
                    <span>Stock: {p.stock}</span>
                    <span className="text-zinc-605 bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded font-black">+ Pick</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cashier Terminal Form (Span 5) */}
        <div className="lg:col-span-5">
          <form onSubmit={handlePOSCheckout} className="bg-white border text-zinc-850 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-4">
              
              {/* Dual Mode Sub-Tab */}
              <div className="grid grid-cols-2 gap-1.5 bg-zinc-100 p-1.5 rounded-xl border select-none">
                <button
                  type="button"
                  onClick={() => {
                    setPosMode('offline');
                    setCustomerName(language === 'bn' ? "সাধারণ ক্রেতা" : "Walk-in Guest");
                  }}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    posMode === 'offline' 
                      ? 'bg-zinc-900 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
                  }`}
                >
                  🏪 {language === 'bn' ? 'অফলাইন ক্যাশ সেল' : 'Offline walk-in'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPosMode('online');
                    setCustomerName("");
                  }}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    posMode === 'online' 
                      ? 'bg-[#063b6d] text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-[#063b6d] hover:bg-zinc-200/50'
                  }`}
                >
                  🚀 {language === 'bn' ? 'অনলাইন বুকিং' : 'Online Booking'}
                </button>
              </div>

              {/* Dynamic Customer fields */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-0.5">
                    <label className="text-[9px] uppercase font-black text-zinc-400 block">
                      {language === 'bn' ? 'ক্রেতার নাম *' : 'Customer Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={posMode === 'offline' ? "Guest Client" : "Enter virtual user..."}
                      className="w-full border px-2.5 py-1.5 rounded-lg font-semibold text-xs focus:ring-1 focus:ring-brand focus:outline-none"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] uppercase font-black text-zinc-400 block">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone hotline'}
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className="w-full border px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold focus:ring-1 focus:ring-brand focus:outline-none"
                    />
                  </div>
                </div>

                {/* Shipping & Delivery logic specifically for Online booking */}
                {posMode === 'online' && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase font-black text-indigo-700 block">Delivery Region</label>
                      <select
                        value={deliveryRegion}
                        onChange={(e) => setDeliveryRegion(e.target.value)}
                        className="w-full bg-white border px-1.5 py-1 rounded focus:outline-none"
                      >
                        <option value="dhaka">Dhaka (In-side ৳60)</option>
                        <option value="outside">Out-of-Dhaka (৳120)</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase font-black text-indigo-700 block">Courier Agent</label>
                      <select
                        value={selectedCourier}
                        onChange={(e) => setSelectedCourier(e.target.value)}
                        className="w-full bg-white border px-1.5 py-1 rounded focus:outline-none text-[11px]"
                      >
                        <option value="Kamrul Islam (Mirpur, Uttara)">Kamrul Islam (Mirpur)</option>
                        <option value="Sajid Rahman (Gulshan, Banani)">Sajid Rahman (Gulshan)</option>
                        <option value="Apex Courier Express">Apex Express Partner</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Coupon Code match engine */}
                <div className="flex space-x-1.5 items-end">
                  <div className="flex-1 text-xs">
                    <label className="text-[9px] uppercase font-black text-zinc-400 block">Promo Coupon</label>
                    <input
                      type="text"
                      placeholder="NABIK50 or FESTIVE250"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full uppercase text-xs font-mono font-bold px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="py-1.5 px-3 border-0 bg-zinc-800 hover:bg-zinc-950 text-white rounded-lg text-xs font-black uppercase cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                {couponStatus === 'success' && (
                  <span className="block text-[10px] text-emerald-600 font-bold">✓ 15% discount successfully validated!</span>
                )}
                {couponStatus === 'invalid' && (
                  <span className="block text-[10px] text-red-500 font-bold">✕ Invalid or generic promo code format.</span>
                )}
              </div>

              {/* Basket list view */}
              <div className="border-t pt-2.5 space-y-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">Active Cart list</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {posCart.length === 0 ? (
                    <div className="text-center py-6 text-zinc-400 text-xs font-semibold select-none bg-zinc-50 border border-dashed rounded-xl">
                      No products scanned or picked.
                    </div>
                  ) : (
                    posCart.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-zinc-50 border border-zinc-100 p-2 rounded-xl">
                        <div className="truncate flex-1 pr-2 text-left">
                          <span className="font-extrabold text-zinc-900 block truncate leading-none mb-1">
                            {language === 'bn' ? item.product.nameBn : item.product.name}
                          </span>
                          <span className="text-[9px] text-[#f58220] font-mono leading-none">
                            ৳{item.product.priceBDT.toLocaleString()} x {item.quantity}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPosCart(prev => prev.map(p => p.product.id === item.product.id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p));
                            }}
                            className="bg-white border rounded px-1.5 font-bold cursor-pointer"
                          >-</button>
                          <strong className="px-1.5 text-[11px] font-mono">{item.quantity}</strong>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity >= item.product.stock) return;
                              setPosCart(prev => prev.map(p => p.product.id === item.product.id ? { ...p, quantity: p.quantity + 1 } : p));
                            }}
                            className="bg-white border rounded px-1.5 font-bold cursor-pointer"
                          >+</button>
                          <button
                            type="button"
                            onClick={() => {
                              setPosCart(prev => prev.filter(p => p.product.id !== item.product.id));
                            }}
                            className="text-red-500 hover:text-red-700 pl-1.5 bg-transparent border-0 font-bold text-xs"
                          >✕</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Secure Payment methods */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase font-black text-zinc-400 block">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white border px-2 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="Cash">In-Hand Cash</option>
                    <option value="bKash Merchant Pay">bKash Merchant Pay</option>
                    <option value="Nagad Wallet">Nagad Pay</option>
                    <option value="Rocket Wallet">Rocket Pay</option>
                    <option value="Bank Visa/Mastercard">Visa/Mastercard DBBL</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] uppercase font-black text-zinc-400 block">
                    {language === 'bn' ? 'টাকা ক্যাশ গ্রহণ করেছে' : 'Cash Paid BDT'}
                  </label>
                  <input
                    type="text"
                    value={cashProvided}
                    onChange={(e) => setCashProvided(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 1000"
                    disabled={paymentMethod !== "Cash"}
                    className="w-full border px-2 py-1 bg-white rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              </div>

            </div>

            {/* Calculations and submit action buttons */}
            <div className="border-t pt-3.5 space-y-3 mt-4">
              <div className="space-y-1.5 text-[11px] font-bold text-zinc-550 select-none">
                <div className="flex justify-between">
                  <span>Gross Amount:</span>
                  <span className="font-mono">৳{grossAmount.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Coupon ({discountPercent}%):</span>
                    <span className="font-mono">- ৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT & Tax (5% Standard):</span>
                  <span className="font-mono">৳{vatAmount.toLocaleString()}</span>
                </div>
                {posMode === 'online' && (
                  <div className="flex justify-between text-indigo-700">
                    <span>Courier Delivery Fee:</span>
                    <span className="font-mono">+ ৳{shippingFee.toLocaleString()}</span>
                  </div>
                )}

                {paymentMethod === 'Cash' && parseFloat(cashProvided) >= netPayable && (
                  <div className="flex justify-between text-amber-600 text-xs font-black border-t border-dashed pt-1 mt-1">
                    <span>CUSTOMER CHANGE RETURN:</span>
                    <span className="font-mono text-sm leading-none">৳{changeDue.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline font-black border-t pt-2.5">
                <span className="text-[#052b52] text-xs uppercase tracking-wider">Net Amount Payable</span>
                <span className="text-emerald-700 font-mono text-xl">
                  ৳{netPayable.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={posCart.length === 0}
                className="w-full bg-[#f58220] hover:bg-[#e07116] disabled:bg-zinc-150 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl border-0 shadow-sm cursor-pointer transition flex items-center justify-center space-x-1"
              >
                <span>Complete {posMode === 'offline' ? 'Offline Invoice' : 'Online Booking'} &gt;</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* RETAIL RECEIPT PREVIEW MODAL */}
      {showReceiptModal && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs select-none">
          <div className="bg-white border rounded-3xl w-full max-w-sm overflow-hidden text-zinc-900 border-zinc-200 shadow-2xl flex flex-col justify-between">
            <div className="p-5 overflow-y-auto max-h-[80vh] space-y-4">
              
              {/* Receipt Header */}
              <div className="text-center font-mono">
                <h3 className="font-black text-base text-zinc-950 uppercase tracking-tight">Sellsull Retail Desk</h3>
                <span className="text-[10px] block uppercase text-zinc-400 tracking-widest mt-0.5">Secure Transaction Invoice</span>
                <div className="border-y border-dashed my-2.5 py-1 text-[10px] text-zinc-500 text-left space-y-0.5">
                  <div className="flex justify-between"><span>INVOICE NO:</span><strong>{lastCompletedOrder.id}</strong></div>
                  <div className="flex justify-between"><span>DATE STAMP:</span><span>{lastCompletedOrder.date}</span></div>
                  <div className="flex justify-between"><span>CLIENT:</span><span className="font-bold">{lastCompletedOrder.customerInfo.name}</span></div>
                  {customerPhone && (
                    <div className="flex justify-between"><span>PHONE NO:</span><span>{lastCompletedOrder.customerInfo.phone}</span></div>
                  )}
                  <div className="flex justify-between"><span>PAY METHOD:</span><span className="uppercase text-zinc-900 font-bold">{lastCompletedOrder.customerInfo.paymentMethod}</span></div>
                </div>
              </div>

              {/* Items loop */}
              <div className="font-mono text-xs space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Purchased Specifications</span>
                <div className="divide-y divide-dashed">
                  {lastCompletedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5">
                      <div className="truncate flex-1 pr-2">
                        <span className="font-extrabold truncate block">{language === 'bn' ? item.product.nameBn : item.product.name}</span>
                        <span className="text-[10px] text-zinc-500">৳{item.product.priceBDT.toLocaleString()} x {item.quantity}</span>
                      </div>
                      <span className="font-bold">৳{(item.product.priceBDT * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="font-mono pt-2 border-t border-dashed space-y-1.5 text-xs text-left">
                <div className="flex justify-between">
                  <span>Gross Total:</span>
                  <span>৳{lastCompletedOrder.totalBDT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-zinc-950 text-sm border-t border-dashed pt-1.5">
                  <span>NET BILL AMOUNT:</span>
                  <span>৳{lastCompletedOrder.totalBDT.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 text-center select-none space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 text-[10px] font-bold">
                  <ShieldCheck size={12} />
                  <span>TRANSACTION COMPLETED - SYNCED</span>
                </div>
                <span className="block text-[9px] text-zinc-400 font-mono mt-2">Thank you for shopping at Sellsull.com!</span>
              </div>

            </div>

            {/* Print and Close Actions */}
            <div className="bg-zinc-50 border-t p-4 flex space-x-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center space-x-1 cursor-pointer border-0"
              >
                <Printer size={13} />
                <span>Print receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 px-3 bg-zinc-200 hover:bg-zinc-250 text-zinc-800 rounded-xl text-xs font-black uppercase cursor-pointer border-0"
              >
                Close Desktop
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
