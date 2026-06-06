import React, { useState, useEffect } from "react";
import { 
  X, Check, Printer, Copy, MessageSquare, Calendar, MapPin, 
  User, Phone, ShoppingBag, Sparkles, AlertCircle, BookmarkCheck
} from "lucide-react";
import { Order } from "../types";
import { playNotificationChime } from "../utils/audioHelper";

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'bn';
  currency: 'BDT' | 'USD';
}

export default function OrderSuccessModal({
  order,
  isOpen,
  onClose,
  language,
  currency
}: OrderSuccessModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeAlertTab, setActiveAlertTab] = useState<'all' | 'sms' | 'whatsapp'>('all');

  useEffect(() => {
    if (isOpen && order) {
      // Trigger confirmation chime
      playNotificationChime();
      
      // Trigger visual celebration
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const totalDisplay = currency === 'BDT'
    ? `৳${order.totalBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
    : `$${order.totalUSD.toFixed(2)}`;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    // Elegant fallback to open the standard printable area
    const printContent = document.getElementById("printable-receipt-card");
    if (!printContent) return;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Receipt - ${order.id}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { padding: 25px; background: white; color: black; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="font-sans antialiased text-zinc-900 bg-white">
            <div class="max-w-xl mx-auto border p-6 rounded-2xl shadow-sm bg-neutral-50/50">
              <div class="text-center mb-6 border-b pb-4">
                <h1 class="text-2xl font-black text-amber-600">GADGET BAZAR (গেজেট বাজার)</h1>
                <p class="text-xs text-zinc-550 mt-1">Order Placement Invoice Receipt</p>
                <p class="text-xs text-zinc-400 font-mono mt-1">ID: ${order.id} | Date: ${order.date}</p>
              </div>
              <div class="space-y-4 text-xs">
                <div>
                  <h3 class="font-bold text-zinc-900 border-b pb-1 uppercase tracking-wider text-[10px]">Customer Specs</h3>
                  <p class="mt-2 text-zinc-750"><strong>Name:</strong> ${order.customerInfo.name}</p>
                  <p class="text-zinc-750"><strong>Phone:</strong> ${order.customerInfo.phone}</p>
                  ${order.customerInfo.email ? `<p class="text-zinc-750"><strong>Email:</strong> ${order.customerInfo.email}</p>` : ''}
                  <p class="text-zinc-750"><strong>Shipping Address:</strong> ${order.customerInfo.address}</p>
                </div>
                <div>
                  <h3 class="font-bold text-zinc-900 border-b pb-1 uppercase tracking-wider text-[10px] mt-4">Order Items</h3>
                  <div class="mt-2 space-y-1.5 divide-y divide-zinc-200">
                    ${order.items.map(item => `
                      <div class="flex justify-between py-1.5 text-zinc-800">
                        <span>${language === 'bn' ? item.product.nameBn : item.product.name} (x${item.quantity})</span>
                        <span class="font-bold font-mono">৳${item.product.priceBDT.toLocaleString()}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="border-t pt-4 flex justify-between items-baseline">
                  <span class="font-bold text-zinc-700">GRAND TOTAL BILL:</span>
                  <span class="text-xl font-extrabold text-amber-600 font-mono">${totalDisplay}</span>
                </div>
                <div class="mt-6 text-[10px] text-zinc-400 text-center border-t pt-4">
                  Estimated Delivery date: ${order.estimatedDelivery} • Paid via ${order.customerInfo.paymentMethod}
                </div>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Custom simulated floating confettis
  const confettiPieces = Array.from({ length: 28 });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      
      {/* Decorative Simulated Confetti Emitter */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {confettiPieces.map((_, i) => {
            const randomX = Math.random() * 100; // %
            const randomSize = Math.random() * 8 + 6; // px
            const randomDelay = Math.random() * 4; // s
            const randomDuration = Math.random() * 4 + 3; // s
            const colorClass = [
              "bg-amber-400", "bg-emerald-400", "bg-rose-400", 
              "bg-sky-400", "bg-indigo-400", "bg-yellow-300"
            ][i % 6];
            return (
              <div 
                key={i}
                className={`absolute rounded-full opacity-75 ${colorClass} animate-bounce`}
                style={{
                  left: `${randomX}%`,
                  width: `${randomSize}px`,
                  height: `${randomSize}px`,
                  top: `-20px`,
                  animation: `fall ${randomDuration}s linear infinite`,
                  animationDelay: `${randomDelay}s`,
                }}
              />
            );
          })}
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Main card box container */}
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.4)] border border-neutral-100 flex flex-col z-10 animate-scaleUp text-left"
        id="order-success-modal-panel animate-in fade-in duration-200"
      >
        
        {/* Close trigger header icon */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 transition z-20 cursor-pointer border-0"
          title="Close details"
        >
          <X size={20} />
        </button>

        {/* Top vibrant visual banner */}
        <div className="bg-gradient-to-r from-[#052b52] via-[#0b4885] to-[#125ea8] p-6 sm:p-8 text-white relative overflow-hidden">
          {/* Subtle geometry graphics */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
              <polygon points="50,0 100,50 50,100 0,50" />
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/20 shrink-0 transform rotate-6 border border-emerald-400/30">
              <BookmarkCheck size={36} className="text-white animate-pulse" />
            </div>
            
            <div className="text-center sm:text-left space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                <Sparkles size={11} />
                <span>{language === 'bn' ? "অর্ডার সম্পূর্ণ নিশ্চিত" : "Order Confirmed Real Time"}</span>
              </span>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5">
                {language === 'bn' ? "আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!" : "Thank You! Your Order is Placed."}
              </h2>
              <p className="text-xs text-zinc-300 leading-normal max-w-xl">
                {language === 'bn' 
                  ? "কাস্টমারের নোটিফিকেশন এলার্ট ও রসিদ প্রস্তুত করা হয়েছে। গ্রাহক যেকোনো সময় নিচের লাইভ অর্ডার ট্র্যাক বা রসিদ ডাউনলোড করতে পারবেন।" 
                  : "We have compiled the customer record and fired background automated dispatcher alerts."}
              </p>
            </div>
          </div>
        </div>

        {/* Instant notification state tracker banner */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            </span>
            <p className="font-semibold leading-relaxed">
              {language === 'bn' 
                ? "গ্রাহক এবং এডমিন নোটিফিকেশন এলার্ট ইনস্ট্যান্ট পাঠানো হয়েছে!" 
                : "Outgoing Customer & Merchant alert messages generated!"}
            </p>
          </div>

          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9.5px] font-black rounded uppercase">
              ✔️ SMS SENT
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9.5px] font-black rounded uppercase">
              ✔️ WHATSAPP FIRED
            </span>
          </div>
        </div>

        {/* Detailed Receipt Bento Grid */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[50vh]" id="printable-receipt-card">
          
          {/* Copyable Order ID block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-150 rounded-2xl p-4.5">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block font-mono">Order Reference Voucher</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-zinc-800 font-mono tracking-wider">{order.id}</span>
                <button 
                  onClick={handleCopyOrderId}
                  className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-850 cursor-pointer border-0 transition"
                  title="Copy Voucher ID"
                >
                  <Copy size={13} />
                </button>
                {copiedId && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">copied</span>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5 sm:border-l sm:border-zinc-200 sm:pl-6">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block font-mono">Date Registered</span>
              <strong className="text-xs text-zinc-650 font-mono block">{order.date}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left box: Product items list */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                <ShoppingBag size={14} className="text-[#f58220]" />
                <h3 className="text-xs font-black uppercase text-zinc-800 tracking-wider">
                  {language === 'bn' ? "ক্রয়কৃত পণ্যসমূহ" : "Purchased Items"}
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {order.items.map((item) => {
                  const itemPrice = currency === 'BDT'
                    ? `৳${item.product.priceBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
                    : `$${item.product.priceUSD}`;
                  return (
                    <div key={item.product.id} className="flex justify-between items-center gap-3 bg-zinc-50/50 hover:bg-zinc-50 p-3 rounded-xl border border-zinc-150 transition">
                      <div className="text-left">
                        <strong className="text-xs text-zinc-800 block leading-tight">
                          {language === 'bn' ? item.product.nameBn : item.product.name}
                        </strong>
                        <span className="text-[10px] text-zinc-400 tracking-wider">
                          Quantity: <strong className="text-zinc-650">{item.quantity}</strong>
                        </span>
                      </div>
                      <span className="font-bold font-mono text-zinc-900 text-xs shrink-0">{itemPrice}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div className="bg-[#052b52]/5 border-t-2 border-dashed border-[#052b52]/20 rounded-2xl p-4.5 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500 font-bold">
                  <span>{language === 'bn' ? "উপমোট বিল" : "Subtotal"}</span>
                  <span className="font-mono">৳{order.totalBDT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-bold">
                  <span>{language === 'bn' ? "ডেলিভারি চার্জ" : "Delivery"}</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-baseline text-zinc-900 font-black pt-2 border-t border-zinc-200">
                  <span className="text-sm font-extrabold uppercase">{language === 'bn' ? "সর্বোমোট প্রদেয় বিল:" : "Total Bill:"}</span>
                  <span className="text-[#f58220] font-sans text-lg tracking-tight font-black">{totalDisplay}</span>
                </div>
              </div>
            </div>

            {/* Right box: Customer and courier detail */}
            <div className="space-y-5 bg-zinc-50/30 p-5 rounded-2xl border border-zinc-150/85">
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 border-b border-zinc-150 pb-2">
                  <MapPin size={14} className="text-[#f58220]" />
                  <h3 className="text-xs font-black uppercase text-zinc-800 tracking-wider">
                    {language === 'bn' ? "শিপিং ও কাস্টমার বিস্তারিত" : "Shipping & Profile Specs"}
                  </h3>
                </div>

                <div className="space-y-3.5 pt-1">
                  <div className="flex items-start gap-2.5">
                    <User size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block leading-none mb-1">Customer Name</span>
                      <strong className="text-xs text-zinc-800">{order.customerInfo.name}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block leading-none mb-1">Active Contact</span>
                      <strong className="text-xs text-zinc-800 font-mono">{order.customerInfo.phone}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block leading-none mb-1">Shipping Address</span>
                      <p className="text-xs text-zinc-650 leading-relaxed">{order.customerInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block leading-none mb-1">Delivery Time</span>
                      <strong className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-100">
                        {order.estimatedDelivery}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info specs card block */}
              <div className="bg-white border border-zinc-200/80 p-3.5 rounded-xl text-xs space-y-1 text-left">
                <span className="text-[9.5px] font-black uppercase text-zinc-400 block tracking-wider leading-none">Payment Channel Info</span>
                <div className="flex justify-between items-center">
                  <strong className="text-zinc-700 font-bold">{order.customerInfo.paymentMethod}</strong>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[9.5px] font-black uppercase tracking-wider font-mono">
                    {order.customerInfo.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions area */}
        <div className="bg-zinc-50 px-6 py-5.5 border-t border-zinc-150 flex flex-col sm:flex-row items-center justify-between gap-4.5">
          
          {/* Left quick printable/whatsapp tools helper */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none py-2.5 px-4 bg-white hover:bg-zinc-150 border border-zinc-250 hover:border-zinc-350 text-zinc-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              id="print-invoice-receipt-btn"
            >
              <Printer size={13} />
              <span>{language === 'bn' ? "রসিদ প্রিন্ট করুন" : "Print Receipt"}</span>
            </button>

            <button
              onClick={() => {
                const messageText = `Assalamu Alaikum, I just confirmed an order at Gadget Bazar!\nOrder ID: ${order.id}\nTotal: ${totalDisplay}\nEstimated Delivery: ${order.estimatedDelivery}`;
                const encodedMsg = encodeURIComponent(messageText);
                window.open(`https://wa.me/${order.customerInfo.phone.replace(/\D/g, '') || '01784905075'}?text=${encodedMsg}`, '_blank');
              }}
              className="flex-1 sm:flex-none py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              id="whatsapp-mock-share-btn"
            >
              <span className="text-emerald-500 font-extrabold text-sm">💬</span>
              <span>{language === 'bn' ? "হোয়াটসঅ্যাপে আপডেট দেখুন" : "Update via WhatsApp"}</span>
            </button>
          </div>

          {/* Core button to dismiss success layout */}
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3.5 px-10 bg-[#f58220] hover:bg-[#d46a13] text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-md hover:shadow-lg hover:scale-102 cursor-pointer border-0 text-center"
            id="continue-shopping-success-btn"
          >
            {language === 'bn' ? "শপিং চালিয়ে যান" : "Continue Shopping"}
          </button>
        </div>

      </div>
    </div>
  );
}
