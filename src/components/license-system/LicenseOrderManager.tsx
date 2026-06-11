import React, { useState, useEffect } from "react";
import { 
  Smartphone, CheckCircle2, AlertCircle, Copy, Trash2, Send, Zap, MessageSquare, RefreshCw
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

  // Filtered orders list
  const filtered = orders.filter(o => {
    if (filter === 'pending' && o.paymentStatus !== 'pending') return false;
    if (filter === 'completed' && o.paymentStatus !== 'completed') return false;
    
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.customerName.toLowerCase().includes(q) || 
        o.whatsapp.includes(q) || 
        o.id.toLowerCase().includes(q) ||
        o.licenseKey.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs font-sans animate-in fade-in duration-200">
      
      {/* Alert Header Banner */}
      <div className="bg-orange-500 text-white p-4 flex items-start gap-3 select-none">
        <Zap className="shrink-0 animate-bounce mt-0.5 text-yellow-300 fill-yellow-300" size={20} />
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider">
            {language === 'bn' ? "অটোমেটেড পেমেন্ট ও হোয়াটসঅ্যাপ লাইসেন্স কী গেটওয়ে" : "AUTOMATED LICENSE KEY & WHATSAPP GATEWAY"}
          </h4>
          <p className="text-[11px] font-semibold text-orange-55 max-w-xl leading-relaxed mt-0.5">
            {language === 'bn' 
              ? "যখন একজন গ্রাহক ডেমো পছন্দ করে এবং লাইসেন্স কোড কিনতে চায়, তখন সে এই অর্ডারিং ও রিয়েল-টাইম পেমেন্ট (bKash/Nagad/Rocket) গেটওয়ে ব্যবহার করে। টাকা প্রাপ্তির সাথে সাথেই ডিস্ট্রিবিউশন রোবট কাস্টমারের হোয়াটসঅ্যাপ নাম্বারে একটি ইউনিক কোড পাঠিয়ে দেয়।" 
              : "When customers claim ownership, they access a payment gateway. Upon completing payment, our background workers instantly generate and pipe their dedicated unique license key directly to their WhatsApp."}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Dynamic Controls / Simulators */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center bg-zinc-50 border border-zinc-250 p-3 rounded-xl select-none">
          <div>
            <span className="text-[11px] font-black text-zinc-700 block uppercase">
              {language === 'bn' ? "টেমপ্লেট গেটওয়ে রি-ক্রিয়েশন টেস্ট টুলস" : "Integration Simulation Suite"}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 block">
              {language === 'bn' ? "১০ জন ভিন্ন রিয়েল-টাইম কাস্টমারের একই সাথে অর্ডার পাওয়ার ট্র্যাকিং কনসোল" : "Simulate real-world customer spikes with 10 concurrent requests"}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleSimulate10}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-lg text-xs font-black cursor-pointer shadow-sm transition inline-flex items-center gap-1.5"
            >
              <Zap size={13} className="animate-pulse" />
              {language === 'bn' ? "১০টি ইনস্ট্যান্ট অর্ডার জেনারেট করুন" : "Generate 10 simultaneous orders"}
            </button>
            <button
              type="button"
              onClick={handleFlush}
              className="px-3 py-2 bg-zinc-250 hover:bg-red-50 hover:text-red-700 text-zinc-650 border border-zinc-300 rounded-lg text-xs font-bold cursor-pointer transition inline-flex items-center gap-1"
            >
              <Trash2 size={12} />
              {language === 'bn' ? "মুছুন" : "Flush"}
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 p-0.5 bg-zinc-100 rounded-xl border border-zinc-200">
            {[
              { id: 'all', label: language === 'bn' ? "সব অর্ডার" : "All Orders" },
              { id: 'pending', label: language === 'bn' ? "অপেক্ষমান" : "Pending Approval" },
              { id: 'completed', label: language === 'bn' ? "পরিশোধিত" : "Paid & Sent" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black border-0 cursor-pointer transition ${
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
            className="text-xs bg-white border border-zinc-250 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500 w-full sm:w-60 focus:ring-1 focus:ring-orange-500/20 text-zinc-800"
          />
        </div>

        {/* Orders Table/List */}
        {filtered.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-xl p-10 text-center select-none">
            <AlertCircle size={28} className="text-zinc-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-650">{language === 'bn' ? "খুঁজে পাওয়া যায়নি!" : "No matched license orders in queue"}</p>
            <p className="text-[10px] text-zinc-400 mt-1">{language === 'bn' ? "উপরে সবুজ বোতামে ক্লিক করে টেস্ট ডাটা সক্রিয় করুন।" : "Simulate live customers by using the testing suite options above."}</p>
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100 max-h-[420px] overflow-y-auto">
            {filtered.map((o) => (
              <div key={o.id} className="p-3.5 hover:bg-zinc-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                
                {/* Customer Information */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10.5px] font-black text-zinc-700 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
                      {o.id}
                    </span>
                    <strong className="text-xs text-zinc-855 font-bold tracking-tight">
                      {o.customerName}
                    </strong>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      o.paymentStatus === 'completed' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-orange-50 text-orange-700 border border-orange-100 animate-pulse'
                    }`}>
                      {o.paymentStatus === 'completed' 
                        ? (language === 'bn' ? 'সফল' : 'Verified Paid') 
                        : (language === 'bn' ? 'অপেক্ষমান' : 'Needs Payment')}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-500 font-semibold space-y-0.5">
                    <p className="flex items-center gap-1">
                      <MessageSquare size={11} className="text-green-500 shrink-0" />
                      <span>WhatsApp:</span> <strong className="text-zinc-750 font-mono text-xs">{o.whatsapp}</strong>
                    </p>
                    <p className="pl-4">
                      <span>Email:</span> <span className="font-mono">{o.email}</span>
                    </p>
                    <p className="pl-4 text-[10px] text-zinc-400">
                      <span>অর্ডারের সময়:</span> <span>{new Date(o.requestedAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Technical / Key Details & Actions */}
                <div className="flex flex-col md:items-end justify-center min-w-fit gap-2">
                  
                  {/* Payment Info */}
                  <div className="flex items-center justify-between md:justify-end gap-3 select-none">
                    <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-lg text-xs font-black">
                      <span className={`h-2 w-2 rounded-full mr-0.5 ${
                        o.paymentMethod === 'bKash' ? 'bg-[#e2136e]' : o.paymentMethod === 'Nagad' ? 'bg-[#ec1c24]' : 'bg-[#8c3494]'
                      }`} />
                      <span className="text-[10px] text-zinc-755 font-bold">{o.paymentMethod} Gateway</span>
                    </div>
                    <span className="font-mono text-zinc-800 font-black text-xs">
                      ৳{o.priceBDT} BDT
                    </span>
                  </div>

                  {/* Key Display & WhatsApp Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-zinc-50 border border-zinc-250 rounded-lg p-1 pr-1.5 font-mono text-xs select-all">
                      <span className="text-[10px] text-zinc-400 font-bold px-1.5 border-r border-zinc-200 uppercase mr-1.5 mr-1">KEY</span>
                      <strong className="text-zinc-750 font-black text-[11px]">{o.licenseKey}</strong>
                    </div>

                    {o.isWhatsAppSent && (
                      <span className="text-[9.5px] bg-green-50 hover:bg-green-100 text-green-700 font-bold px-2 py-1 rounded-md transition inline-flex items-center gap-1 select-none border border-green-200">
                        <CheckCircle2 size={10} className="fill-green-600 text-white" />
                        <span>WhatsApp Sent</span>
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-1.5 justify-end">
                    {o.paymentStatus === 'pending' ? (
                      <button
                        type="button"
                        onClick={() => handleApprovePayment(o.id, o.customerName)}
                        className="px-2.5 py-1.5 bg-[#f58220] hover:bg-orange-600 text-white border-0 cursor-pointer rounded-lg text-[10px] font-extrabold transition-all duration-200 inline-flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 size={11} />
                        {language === 'bn' ? "পেমেন্ট সফল ও কোড পাঠান" : "Confirm Payment & Send Key"}
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
                        className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-205 text-zinc-700 border-0 cursor-pointer rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1"
                      >
                        <Copy size={11} />
                        {language === 'bn' ? "কোড কপি" : "Copy Key"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(o.id)}
                      className="p-1.5 hover:bg-red-50 hover:text-red-600 text-zinc-400 rounded-lg cursor-pointer transition border-0 bg-transparent"
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
