import React, { useState, useEffect } from "react";
import { 
  Smartphone, CheckCircle2, AlertCircle, Copy, Trash2, Zap, MessageSquare, RefreshCw
} from "lucide-react";
import { getLicenseOrders, generate10SimulatedOrders, processSimulationPayment, deleteLicenseOrder, saveLicenseOrders } from "./licenseStore";
import { LicenseOrder } from "./types";

interface LicenseOrderManagerProps {
  language: 'bn' | 'en';
}

export function LicenseOrderManager({ language }: LicenseOrderManagerProps) {
  const [orders, setOrders] = useState<LicenseOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState("");

  const refreshOrders = () => {
    setOrders(getLicenseOrders());
  };

  useEffect(() => {
    refreshOrders();
    
    // Listen to custom store updates
    const handleUpdate = () => {
      refreshOrders();
    };
    window.addEventListener("gb-license-orders-updated", handleUpdate);
    return () => {
      window.removeEventListener("gb-license-orders-updated", handleUpdate);
    };
  }, []);

  const handleSimulate10 = () => {
    generate10SimulatedOrders();
    const msg = language === 'bn' 
      ? "একই সময়ে ১০ জন ভিন্ন ক্রেতার লাইসেন্স ক্রয়ের ডেমো অর্ডার সফলভাবে জেনারেট করা হয়েছে!" 
      : "10 simultaneous customer demo license orders successfully generated!";
    window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
  };

  const handleApprovePayment = (id: string, name: string) => {
    processSimulationPayment(id);
    const msg = language === 'bn' 
      ? `অর্ডার ${id} পরিশোধিত! এবং কাস্টমার "${name}" এর হোয়াটসঅ্যাপ নাম্বারে লাইসেন্স কী এবং রসিদ পাঠানো হয়েছে।`
      : `Order ${id} marked paid! License key & dispatch receipt sent to WhatsApp.`;
    window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
  };

  const handleFlush = () => {
    saveLicenseOrders([]);
    const msg = language === 'bn' ? "সকল লাইসেন্স অর্ডার ডাটাবেজ খালি করা হয়েছে।" : "All license order records flushed.";
    window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
  };

  const handleDelete = (id: string) => {
    deleteLicenseOrder(id);
    const msg = language === 'bn' ? `অর্ডার ${id} মুছে দেওয়া হয়েছে।` : `Order ${id} deleted successfully.`;
    window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
  };

  // Filter and search logic
  const filtered = orders.filter(o => {
    if (filter === 'pending' && o.paymentStatus !== 'pending') return false;
    if (filter === 'completed' && o.paymentStatus !== 'completed') return false;
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      return (
        o.customerName.toLowerCase().includes(s) || 
        o.whatsapp.includes(s) || 
        o.id.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs font-sans animate-in fade-in duration-200 w-full min-w-0">
      
      {/* Alert Header Banner */}
      <div className="bg-orange-500 text-white p-3 md:p-4 flex items-start gap-2.5 select-none text-left">
        <Zap className="shrink-0 animate-bounce mt-0.5 text-yellow-300 fill-yellow-300" size={18} />
        <div className="min-w-0 flex-1">
          <h4 className="text-[10.5px] md:text-xs font-black uppercase tracking-wider block">
            {language === 'bn' ? "অটোমেটেড পেমেন্ট ও হোয়াটসঅ্যাপ লাইসেন্স কী গেটওয়ে" : "AUTOMATED LICENSE KEY & WHATSAPP GATEWAY"}
          </h4>
          <p className="text-[10px] md:text-[11px] font-semibold text-orange-50 leading-relaxed mt-1 block">
            {language === 'bn' 
              ? "যখন একজন গ্রাহক ডেমো পছন্দ করে এবং লাইসেন্স কোড কিনতে চায়, তখন সে এই অর্ডারিং ও রিয়েল-টাইম পেমেন্ট (bKash/Nagad/Rocket) গেটওয়ে ব্যবহার করে। টাকা প্রাপ্তির সাথে সাথেই ডিস্ট্রিবিউশন রোবট কাস্টমারের হোয়াটসঅ্যাপ নাম্বারে একটি ইউনিক কোড পাঠিয়ে দেয়।" 
              : "When customers claim ownership, they access a payment gateway. Upon completing payment, our background workers instantly generate and pipe their dedicated unique license key directly to their WhatsApp."}
          </p>
        </div>
      </div>

      <div className="p-3 md:p-4 space-y-3.5 w-full min-w-0 box-border">
        {/* Dynamic Controls / Simulators */}
        <div className="flex flex-col gap-2.5 bg-zinc-50 border border-zinc-200 p-3 rounded-xl select-none text-left w-full min-w-0 box-border">
          <div className="min-w-0">
            <span className="text-[10.5px] font-black text-zinc-700 block uppercase">
              {language === 'bn' ? "টেমপ্লেট গেটওয়ে রি-ক্রিয়েশন টেস্ট টুলস" : "Integration Simulation Suite"}
            </span>
            <span className="text-[9.5px] font-semibold text-zinc-500 block mt-0.5 leading-normal">
              {language === 'bn' ? "১০ জন ভিন্ন কাস্টমারের একই সাথে অর্ডার পাওয়ার ট্র্যাকিং কনসোল" : "Simulate real-world customer spikes with 10 concurrent requests"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full min-w-0">
            <button
              type="button"
              onClick={handleSimulate10}
              className="flex-1 min-w-[170px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-lg text-[11px] font-black cursor-pointer shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Zap size={12} className="animate-pulse" />
              <span>{language === 'bn' ? "১০টি ইনস্ট্যান্ট অর্ডার জেনারেট করুন" : "Generate 10 simulated orders"}</span>
            </button>
            <button
              type="button"
              onClick={handleFlush}
              className="px-3 py-2 bg-zinc-150 hover:bg-red-50 hover:text-red-700 text-zinc-750 border-0 rounded-lg text-[11px] font-bold cursor-pointer transition inline-flex items-center justify-center gap-1 shrink-0"
            >
              <Trash2 size={12} />
              <span>{language === 'bn' ? "মুছুন" : "Flush"}</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-2 w-full min-w-0">
          <div className="flex items-center p-0.5 bg-zinc-100 rounded-xl border border-zinc-200 w-full overflow-x-auto scrollbar-none shrink-0 box-border">
            {[
              { id: 'all', label: language === 'bn' ? "সব অর্ডার" : "All Orders" },
              { id: 'pending', label: language === 'bn' ? "অপেক্ষমান" : "Pending" },
              { id: 'completed', label: language === 'bn' ? "পরিশোধিত" : "Paid" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`flex-1 min-w-[65px] text-center px-1 py-1.5 rounded-lg text-[10.5px] font-black border-0 cursor-pointer transition-all whitespace-nowrap ${
                  filter === tab.id 
                    ? "bg-white text-zinc-950 shadow-2xs" 
                    : "text-zinc-500 bg-transparent hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder={language === 'bn' ? "নাম/মোবাইল/আইডি দিয়ে খুঁজুন..." : "Filter order queues..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-white border border-zinc-250 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 w-full focus:ring-1 focus:ring-orange-500/10 text-zinc-800 box-border"
          />
        </div>

        {/* Orders Table/List */}
        {filtered.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-xl p-8 text-center select-none w-full min-w-0 box-border">
            <AlertCircle size={24} className="text-zinc-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-zinc-650">{language === 'bn' ? "খুঁজে পাওয়া যায়নি!" : "No matched license orders in queue"}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{language === 'bn' ? "উপরে সবুজ বোতামে ক্লিক করে টেস্ট ডাটা সক্রিয় করুন।" : "Simulate live customers by using the testing suite options above."}</p>
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100 max-h-[280px] overflow-y-auto w-full min-w-0 box-border">
            {filtered.map((o) => (
              <div key={o.id} className="p-3 hover:bg-zinc-50/50 transition-colors flex flex-col gap-2.5 text-left w-full min-w-0 box-border overflow-hidden">
                
                {/* Customer Information Row */}
                <div className="w-full min-w-0">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[9px] font-black text-zinc-700 bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded shrink-0">
                        {o.id}
                      </span>
                      <strong className="text-xs text-zinc-850 font-bold truncate">
                        {o.customerName}
                      </strong>
                    </div>
                    <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                      o.paymentStatus === 'completed' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-orange-50 text-orange-700 border border-orange-150 animate-pulse'
                    }`}>
                      {o.paymentStatus === 'completed' 
                        ? (language === 'bn' ? 'সফল' : 'Verified Paid') 
                        : (language === 'bn' ? 'অপেক্ষমান' : 'Needs Payment')}
                    </span>
                  </div>

                  <div className="text-[10.5px] text-zinc-500 font-semibold space-y-1 block mt-1.5 w-full min-w-0">
                    <div className="flex items-center gap-1.5 w-full min-w-0">
                      <MessageSquare size={11} className="text-green-500 shrink-0" />
                      <span className="text-zinc-400 font-sans text-[10px]">WhatsApp:</span> 
                      <strong className="text-zinc-700 font-mono text-xs truncate">{o.whatsapp}</strong>
                    </div>
                    <div className="pl-4 font-mono w-full min-w-0 flex items-center">
                      <span className="text-zinc-400 font-sans text-[10px] mr-1 shrink-0">Email:</span> 
                      <span className="text-zinc-650 truncate text-[10.5px] md:text-xs">{o.email}</span>
                    </div>
                    <div className="pl-4 text-[9px] text-zinc-400 font-sans block">
                      <span>অর্ডারের সময়:</span> <span>{new Date(o.requestedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-zinc-100 w-full my-0.5"></div>

                {/* Technical / Key Details & Actions */}
                <div className="space-y-2 w-full min-w-0">
                  
                  {/* Payment Info */}
                  <div className="flex items-center justify-between gap-1.5 select-none flex-wrap w-full">
                    <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded text-[9.5px] font-black shrink-0">
                      <span className={`h-1.5 w-1.5 rounded-full mr-0.5 ${
                        o.paymentMethod === 'bKash' ? 'bg-[#e2136e]' : o.paymentMethod === 'Nagad' ? 'bg-[#ec1c24]' : 'bg-[#8c3494]'
                      }`} />
                      <span className="text-zinc-700">{o.paymentMethod} Gateway</span>
                    </div>
                    <span className="font-mono text-zinc-800 font-black text-xs shrink-0">
                      ৳{o.priceBDT} BDT
                    </span>
                  </div>

                  {/* Key Display & WhatsApp Status */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap w-full min-w-0">
                    <div className="flex items-center bg-zinc-50 border border-zinc-250 rounded-lg p-0.5 pr-1.5 font-mono text-[10px] select-all min-w-0 flex-1 max-w-full overflow-hidden">
                      <span className="text-[8px] text-zinc-400 font-bold px-1 border-r border-zinc-200 uppercase mr-1 shrink-0">KEY</span>
                      <strong className="text-zinc-700 font-black text-[9.5px] truncate mr-1">{o.licenseKey}</strong>
                    </div>

                    {o.isWhatsAppSent && (
                      <span className="text-[8.5px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap inline-flex items-center gap-0.5 border border-green-150 shrink-0 select-none">
                        <CheckCircle2 size={9} className="fill-green-600 text-white" />
                        <span>Sent</span>
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-1.5 justify-end pt-1 w-full flex-nowrap">
                    {o.paymentStatus === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => handleApprovePayment(o.id, o.customerName)}
                        className="flex-1 justify-center px-2 py-1.5 bg-[#f58220] hover:bg-orange-650 text-white border-0 cursor-pointer rounded-lg text-[9.5px] font-extrabold transition-colors inline-flex items-center gap-1 shadow-2xs whitespace-nowrap min-w-0 truncate"
                      >
                        <CheckCircle2 size={10} className="shrink-0" />
                        <span className="truncate">{language === 'bn' ? "পেমেন্ট নিশ্চিত ও কোড পাঠান" : "Confirm Payment & Send Key"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(o.licenseKey);
                          window.dispatchEvent(new CustomEvent("app-toast", { 
                            detail: language === 'bn' ? "লাইসেন্স কোড কপি করা হয়েছে!" : "License key copied successfully!" 
                          }));
                        }}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 border-0 cursor-pointer rounded-lg text-[10px] font-bold transition-colors inline-flex items-center gap-1 select-none shrink-0"
                      >
                        <Copy size={10} />
                        <span>{language === 'bn' ? "কোড কপি" : "Copy Key"}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(o.id)}
                      className="p-1 hover:bg-red-55 hover:text-red-700 text-zinc-400 rounded-lg cursor-pointer transition-colors border-0 bg-transparent shrink-0 flex items-center justify-center"
                      title={language === 'bn' ? "মুছে ফেলুন" : "Delete Order"}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
