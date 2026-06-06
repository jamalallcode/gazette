import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Truck, 
  Calendar, 
  CheckCircle, 
  Package, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  ExternalLink,
  Info
} from "lucide-react";
import { Order } from "../types";

interface LiveTrackingSystemProps {
  orders: Order[];
  language: 'en' | 'bn';
  currency: 'BDT' | 'USD';
  onBackToShop: () => void;
}

export default function LiveTrackingSystem({
  orders,
  language,
  currency,
  onBackToShop
}: LiveTrackingSystemProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = searchQuery.trim().toLowerCase();
    
    if (!cleaned) {
      setTrackedOrder(null);
      return;
    }

    // Attempt lookup by Order ID prefix or strict match, or Customer Phone number
    const match = orders.find((o) => {
      const matchId = o.id.toString().toLowerCase() === cleaned || o.id.toString().toLowerCase().includes(cleaned);
      const matchPhone = o.customerInfo.phone?.trim() === cleaned || o.customerInfo.phone?.trim().includes(cleaned);
      return matchId || matchPhone;
    });

    if (match) {
      setTrackedOrder(match);
    } else {
      setTrackedOrder(null);
    }
  };

  const getStatusLabelText = (status: string) => {
    switch (status) {
      case 'placed': return language === 'bn' ? 'অর্ডার গৃহীত হয়েছে' : 'Order Placed';
      case 'processing': return language === 'bn' ? 'প্যাকেজিং ও প্রোসেসিং চলছে' : 'Processing Package';
      case 'shipped': return language === 'bn' ? 'কুরিয়ারে হস্তান্তর করা হয়েছে' : 'Dispatched to Courier';
      case 'delivered': return language === 'bn' ? 'সফলভাবে ডেলিভারি হয়েছে' : 'Successfully Delivered';
      default: return status;
    }
  };

  const statusMilestones = [
    { key: 'placed', label: language === 'bn' ? 'সংগৃহীত' : 'Received', desc: language === 'bn' ? 'অর্ডারের তথ্য সিস্টেমে নথিভুক্ত হযেছে' : 'Order securely saved by Gadget Bazar' },
    { key: 'processing', label: language === 'bn' ? 'প্রক্রিয়াকরণ' : 'Processing', desc: language === 'bn' ? 'পণ্য গুণগত মান নিশ্চিত করে প্যাকিং শেষ হয়েছে' : 'Items packed, quality approved' },
    { key: 'shipped', label: language === 'bn' ? 'শিপমেন্ট' : 'In Transit', desc: language === 'bn' ? 'ডেলিভারি পার্টনার কুরিয়ারে হস্তান্তর সম্পন্ন' : 'Handed over to Bangladeshi Courier' },
    { key: 'delivered', label: language === 'bn' ? 'ডেলিভারি' : 'Delivered', desc: language === 'bn' ? 'আপনার ঠিকানায় পণ্য পৌঁছে দেওয়া হয়েছে' : 'Arrived safely at your doorstep' }
  ];

  const getStepIndex = (status: string) => {
    if (status === 'placed') return 0;
    if (status === 'processing') return 1;
    if (status === 'shipped') return 2;
    if (status === 'delivered') return 3;
    return 0;
  };

  const stepIndex = trackedOrder ? getStepIndex(trackedOrder.status) : -1;

  return (
    <div className="w-full text-zinc-805 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden font-sans text-left" id="live-tracking-panel">
      {/* Top Banner Styling */}
      <div className="bg-gradient-to-r from-[#f58220] to-orange-600 text-black px-6 py-5 select-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-black leading-tight flex items-center space-x-2">
            <Truck className="text-black" size={24} />
            <span>{language === 'bn' ? "লাইভ অর্ডার ট্র্যাকিং সিস্টেম" : "Live Product Shipments Tracking"}</span>
          </h2>
          <p className="text-xs text-black/85 font-semibold mt-1">
            {language === 'bn' ? "যেকোনো অতিথি বা নিবন্ধিত গ্রাহক অর্ডার আইডি অথবা ফোন নম্বর দিয়ে সরাসরি খুঁজুন" : "Guest customers can track parcel transit progress instantly using mobile or order credentials"}
          </p>
        </div>

        <button 
          onClick={onBackToShop}
          className="bg-black hover:bg-zinc-900 border-0 text-white font-extrabold text-[11px] uppercase tracking-wider py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <span>{language === 'bn' ? "পুনরায় কেনাকাটা" : "Return to Shop"}</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Search Lookup Bar Container */}
        <div className="max-w-xl mx-auto bg-zinc-50 border p-5 sm:p-6 rounded-2xl text-center shadow-2xs">
          <h3 className="text-sm font-black text-zinc-800 tracking-tight">
            {language === 'bn' ? "অর্ডার ট্র্যাকিং আইডি প্রবেশ করুন" : "Enter Order ID or Customer Phone Sequence"}
          </h3>
          <p className="text-xs text-zinc-505 mt-1">
            {language === 'bn' ? "উদাহরন: NAB- বা আপনার ১১ সংখ্যার মোবাইল নম্বর" : "e.g., NAB-xxxxxxx or your 11-digit mobile number"}
          </p>

          <form onSubmit={handleTrackSearch} className="mt-4 flex items-center overflow-hidden bg-white rounded-full border border-zinc-300 focus-within:border-[#f58220] focus-within:ring-1 focus-within:ring-[#f58220] transition shadow-xs h-[44px]">
            <input 
              type="text"
              placeholder={language === 'bn' ? "খুঁজুন..." : "e.g., NAB-89241 or 01784905"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-2 text-sm text-zinc-800 bg-white placeholder-zinc-400 focus:outline-none"
              id="live-track-search-input"
            />
            <button
              type="submit"
              className="bg-[#f58220] hover:bg-orange-655 text-white h-full px-6 transition cursor-pointer shrink-0 border-0 flex items-center justify-center rounded-r-full font-bold text-xs uppercase"
            >
              <Search size={15} className="mr-1.5 stroke-[3px]" />
              <span>{language === 'bn' ? 'অন্বেষণ' : 'Track'}</span>
            </button>
          </form>
        </div>

        {/* Look up results */}
        {hasSearched && !trackedOrder && (
          <div className="text-center py-10 bg-rose-50 border border-rose-100 rounded-xl max-w-xl mx-auto">
            <p className="text-rose-650 font-black text-sm">
              {language === 'bn' ? "দুঃখিত! এই আইডি বা মোবাইল নম্বরে কোনো সক্রিয় অর্ডার পাওয়া যায়নি।" : "Shipment Details Not Found!"}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {language === 'bn' ? "অনুগ্রহ করে সঠিক নম্বরে খোঁজ করুন অথবা এডমিনের সাথে যোগাযোগ করুন।" : "Verify the format and input variables, or check again on your admin portal."}
            </p>
          </div>
        )}

        {trackedOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Left Col: Order overview card & milestones timeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Timeline layout card with beautiful circles */}
              <div className="bg-zinc-50/50 border rounded-xl p-5 sm:p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
                  <div>
                    <span className="text-[10px] bg-black text-orange-400 font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      ID: {trackedOrder.id}
                    </span>
                    <h4 className="text-sm font-black text-zinc-900 mt-1.5">
                      {getStatusLabelText(trackedOrder.status)}
                    </h4>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'bn' ? 'ডেলিভারি মাধ্যম' : 'Courier Method'}</p>
                    <p className="text-xs text-[#f58220] font-black mt-0.5">
                      {trackedOrder.courierName || (language === 'bn' ? "গেজেট এক্সপ্রেস ডেলিভারি" : "Gadget Bazar Express Logistics")}
                    </p>
                    {trackedOrder.courierTrackingId && (
                      <p className="text-[10px] text-zinc-500 font-mono font-bold mt-1 bg-white border border-zinc-200 px-1.5 py-0.5 rounded inline-block">
                        Track: {trackedOrder.courierTrackingId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timeline progress line bar */}
                <div className="space-y-6 relative pl-6 border-l-2 border-zinc-200 ml-3">
                  {statusMilestones.map((milestone, idx) => {
                    const isDone = stepIndex >= idx;
                    const isActive = stepIndex === idx;

                    return (
                      <div key={milestone.key} className="relative">
                        {/* Bullet point indicator with bounce */}
                        <div className={`absolute -left-[35px] top-0 h-6.5 w-6.5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone 
                            ? "bg-[#f58220] border-[#f58220] text-black shadow-sm"
                            : "bg-white border-zinc-200 text-zinc-300"
                        } ${isActive ? "ring-4 ring-orange-500/25 animate-pulse" : ""}`}>
                          {isDone ? (
                            <CheckCircle size={11} className="stroke-[3px]" />
                          ) : (
                            <div className="h-1.5 w-1.5 bg-zinc-300 rounded-full" />
                          )}
                        </div>

                        <div>
                          <h5 className={`text-xs font-black ${isDone ? "text-zinc-800" : "text-zinc-400"}`}>
                            {milestone.label}
                          </h5>
                          <p className={`text-[11px] leading-relaxed mt-0.5 ${isDone ? "text-zinc-500 font-semibold" : "text-zinc-400"}`}>
                            {milestone.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated maps route pathway in beautiful visual HTML blocks */}
              <div className="bg-white border rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center space-x-1">
                  <MapPin size={13} className="text-[#f58220]" />
                  <span>{language === 'bn' ? "পার্সেল রুটিং ম্যাপ (লাইভ সিমুলেটর)" : "Live Simulated Route Pathways Hub"}</span>
                </h4>

                <div className="relative bg-[#f8f9fa] border rounded-xl p-4 overflow-hidden h-36 flex flex-col justify-between">
                  {/* Grid layout decoration lines */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-[0.04] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5),transparent_60%)]">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="border-t border-l border-black" />
                    ))}
                  </div>

                  {/* Flow items */}
                  <div className="flex justify-between items-center text-center mt-2 relative z-10 text-[9px] sm:text-[10px] select-none font-extrabold text-zinc-500">
                    {[
                      { l: language === 'bn' ? 'সেন্ট্রাল হাব' : 'Main Hub', done: stepIndex >= 0 },
                      { l: language === 'bn' ? 'তেজগাঁও শোরুম' : 'Tejgaon Center', done: stepIndex >= 1 },
                      { l: language === 'bn' ? 'কুরিয়ার স্টোর' : 'Courier Sort', done: stepIndex >= 2 },
                      { l: language === 'bn' ? 'ডোরস্টেপ' : 'Customer Area', lActive: "Dest.", done: stepIndex >= 3 }
                    ].map((hub, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center border-2 ${
                          hub.done ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-zinc-200 text-zinc-400"
                        }`}>
                          {i + 1}
                        </div>
                        <span className={`block mt-1 font-bold ${hub.done ? "text-orange-600 font-extrabold" : "text-zinc-400"}`}>{hub.l}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipment live message tag */}
                  <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg flex items-center justify-between text-[11px] font-bold text-orange-850 mt-1 relative z-10 shrink-0">
                    <span className="flex items-center">
                      <Clock size={12} className="text-orange-500 mr-1 shrink-0" />
                      <span>{language === 'bn' ? "ডেলিভারি আনুমানিক সময়:" : "Estimated Delivery Window:"} <strong>{trackedOrder.estimatedDelivery}</strong></span>
                    </span>
                    <span className="text-[9px] bg-orange-200 text-orange-900 rounded font-black uppercase px-1.5 py-0.5">
                      {trackedOrder.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Col: Logistics courier details & Recipient parameters */}
            <div className="space-y-6">
              
              {/* Delivery Agent Details */}
              <div className="bg-white border rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  {language === 'bn' ? "ডেলিভারি রাইডার বিবরণ" : "Assigned On-Duty Courier Agent"}
                </h4>

                <div className="flex items-center space-x-3 bg-zinc-50 p-3 rounded-lg border">
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-[#f58220] shrink-0 font-bold font-sans">
                    RH
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-zinc-800">
                      {language === 'bn' ? "রাকিব হোসেন" : "Rakib Hossain"}
                    </h5>
                    <p className="text-[10px] text-zinc-500 mt-1 font-semibold flex items-center">
                      <Truck size={10} className="mr-1 text-[#f58220]" />
                      <span>{language === 'bn' ? "পাঠাও প্রিমিয়াম রাইডার" : "Licensed Delivery Professional"}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <a 
                    href="tel:+8801918381924"
                    className="w-full inline-flex items-center justify-center py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold font-mono transition"
                  >
                    <Phone size={12} className="mr-1.5 text-orange-500 stroke-[2.5px]" />
                    <span>+8801918381924</span>
                  </a>

                  <a 
                    href={`https://wa.me/8801918381924?text=Hello+Rakib+I+want+to+know+about+order+${trackedOrder.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition border-0 cursor-pointer"
                  >
                    <MessageSquare size={12} className="mr-1.5 text-white stroke-[2.5px]" />
                    <span>{language === 'bn' ? "হোয়াটসঅ্যাপ চ্যাট" : "WhatsApp Chat Rider"}</span>
                  </a>
                </div>
              </div>

              {/* Selected Order Summary Recipient Details */}
              <div className="bg-zinc-50/50 border rounded-xl p-5 space-y-3.5 text-xs font-semibold">
                <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  {language === 'bn' ? "গ্রাহক ও শিপিং ঠিকানা" : "Recipient & Billing Terms"}
                </h4>

                <div className="space-y-1 bg-white border p-3 rounded-lg leading-relaxed text-zinc-700 font-semibold">
                  <p><span className="text-zinc-400">{language === 'bn' ? 'নাম:' : 'Name:'}</span> <strong className="text-zinc-800">{trackedOrder.customerInfo.name}</strong></p>
                  <p><span className="text-zinc-400">{language === 'bn' ? 'ফোন:' : 'Phone:'}</span> <strong className="text-zinc-850 font-mono">{trackedOrder.customerInfo.phone}</strong></p>
                  <p><span className="text-zinc-400">{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</span> {trackedOrder.customerInfo.address}</p>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-zinc-400 font-bold uppercase text-[10px]">{language === 'bn' ? 'বিল পরিমাণ' : 'Billing total'}</span>
                  <span className="text-sm font-black text-orange-600 font-mono">
                    {currency === 'BDT' ? `৳${trackedOrder.totalBDT}` : `$${trackedOrder.totalUSD}`}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
