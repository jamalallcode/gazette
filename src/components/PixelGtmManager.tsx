import React, { useState, useEffect } from "react";
import { 
  Code, 
  Settings, 
  Layers, 
  CheckCircle, 
  Terminal, 
  Eye, 
  Copy, 
  Play, 
  RotateCw,
  Info,
  ExternalLink,
  ShieldCheck,
  Award
} from "lucide-react";
import { 
  getPixelSettings, 
  savePixelSettings, 
  getPixelLogs, 
  savePixelLogs, 
  triggerPixelEvent, 
  PixelSettings, 
  PixelEvent 
} from "../utils/pixelHelper";

interface PixelGtmManagerProps {
  language: 'en' | 'bn';
}

export default function PixelGtmManager({ language }: PixelGtmManagerProps) {
  const [settings, setSettings] = useState<PixelSettings>(getPixelSettings());
  const [logs, setLogs] = useState<PixelEvent[]>(getPixelLogs());
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'test' | 'code'>('config');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handlePixelUpdate = () => {
      setLogs(getPixelLogs());
    };
    window.addEventListener("nabik_pixel_fired", handlePixelUpdate);
    return () => window.removeEventListener("nabik_pixel_fired", handlePixelUpdate);
  }, []);

  const handleSaveSettings = (updated: PixelSettings) => {
    setSettings(updated);
    savePixelSettings(updated);
    window.dispatchEvent(
      new CustomEvent("app-toast", { 
        detail: language === 'bn' ? "পিক্সেল এবং জিটিএম সেটিং সফলভাবে সংরক্ষিত হয়েছে!" : "Pixel & GTM settings saved successfully!" 
      })
    );
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearLogs = () => {
    savePixelLogs([]);
    setLogs([]);
  };

  // Generate simulated test events
  const handleFireMockEvent = (eventName: string, data: Record<string, any>) => {
    triggerPixelEvent(eventName, data);
    window.dispatchEvent(
      new CustomEvent("app-toast", { 
        detail: language === 'bn' ? `ইভেন্ট '${eventName}' সফলভাবে ফায়ার হয়েছে!` : `Successfully fired pixel event: '${eventName}'!` 
      })
    );
  };

  const fbPixelCodeSnippet = `<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${settings.pixelId || "YOUR_PIXEL_ID"}');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
       src="https://www.facebook.com/tr?id=${settings.pixelId || "YOUR_PIXEL_ID"}&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->`;

  const gtmCodeSnippet = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${settings.gtmId || "GTM-XXXXXXX"}');</script>
<!-- End Google Tag Manager -->`;

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-xs text-left text-zinc-800" id="pixel-gtm-integration-system">
      
      {/* Top title header */}
      <div className="bg-gradient-to-r from-blue-900 to-[#104273] text-white p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Code size={22} className="text-[#f58220]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
              {language === 'bn' ? "স্মার্ট মার্কেটিং ট্র্যাকিং হাব" : "Analytical & Marketing Tracking Hub"}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-blue-200 font-bold mt-1">
              {language === 'bn' ? "ফেসবুক পিক্সেল এবং গুগল ট্যাগ ম্যানেজার এপিআই ডায়াগনস্টিকস" : "Live Facebook Pixel & Google Tag Manager Integration System"}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/10 p-1 rounded-lg text-xs font-black select-none">
          <button 
            type="button" 
            onClick={() => setActiveSubTab('config')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${activeSubTab === 'config' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/10'}`}
          >
            {language === 'bn' ? "কনফিগারেশন" : "Settings"}
          </button>
          <button 
            type="button" 
            onClick={() => setActiveSubTab('test')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${activeSubTab === 'test' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/10'}`}
          >
            {language === 'bn' ? "টেস্টিং টুল" : "Events Monitor"}
          </button>
          <button 
            type="button" 
            onClick={() => setActiveSubTab('code')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${activeSubTab === 'code' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/10'}`}
          >
            {language === 'bn' ? "সোর্স কোড" : "Developer Snippets"}
          </button>
        </div>
      </div>

      {/* Info Warning Bar */}
      <div className="bg-blue-50/50 px-5 py-3 border-b border-blue-100 flex items-start space-x-2 text-xs">
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-blue-900 leading-relaxed font-semibold">
          {language === 'bn' 
            ? "আপনার ইকমার্স সাইটে কাস্টমারের আচরণ ও কনভার্সন ট্র্যাক করুন। অর্ডার সম্পন্ন হলে (Purchase), কার্টে পণ্য যোগ করলে (AddToCart) বা চেকআউট শুরু করলে ইভেন্টগুলো স্বয়ংক্রিয়ভাবে পিক্সেল এবং ট্যাগ ম্যানেজারে চলে যাবে।"
            : "Monitor and record customer lifecycle goals instantly. Adding products, initiating checkout, and purchase completion automatically dispatches metadata payloads to integrated networks."}
        </p>
      </div>

      <div className="p-6">
        
        {/* SUBTAB 1: CONFIGURATION SETTINGS */}
        {activeSubTab === 'config' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form Side */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">
                {language === 'bn' ? "মার্কেটিং কনফিগার সেটিংস" : "Merchant Account Credentials"}
              </h4>

              <div className="bg-zinc-50 border p-4 rounded-xl space-y-4 text-xs font-semibold">
                
                {/* Facebook Pixel Inputs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-600 block">{language === 'bn' ? "১. ফেসবুক পিক্সেল আইডি (Facebook Pixel ID)" : "1. Facebook Pixel Account ID"}</label>
                    <input 
                      type="checkbox"
                      checked={settings.enablePixel}
                      onChange={(e) => handleSaveSettings({ ...settings, enablePixel: e.target.checked })}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <input 
                    type="text"
                    value={settings.pixelId}
                    onChange={(e) => handleSaveSettings({ ...settings, pixelId: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 128491028492023"
                    className="w-full bg-white border rounded-lg px-3 py-1.5 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 block font-normal leading-normal">
                    {language === 'bn' ? "* মেটা বিজনেস ম্যানেজার অ্যাকাউন্ট থেকে সংগৃহীত পিক্সেল আইডি এখানে যোগ করুন।" : "* Standard Meta Pixel ID sequence containing digits only."}
                  </span>
                </div>

                <hr className="border-zinc-200" />

                {/* Google Tag Manager Inputs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-600 block">{language === 'bn' ? "২. গুগল ট্যাগ ম্যানেজার আইডি (GTM Container ID)" : "2. GTM Container ID"}</label>
                    <input 
                      type="checkbox"
                      checked={settings.enableGtm}
                      onChange={(e) => handleSaveSettings({ ...settings, enableGtm: e.target.checked })}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <input 
                    type="text"
                    value={settings.gtmId}
                    onChange={(e) => handleSaveSettings({ ...settings, gtmId: e.target.value.toUpperCase().trim() })}
                    placeholder="e.g. GTM-P83KD9A"
                    className="w-full bg-white border rounded-lg px-3 py-1.5 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 block font-normal leading-normal">
                    {language === 'bn' ? "* গুগল ট্যাগ ম্যানেজার অ্যাকাউন্ট ড্যাশবোর্ডের উপরে থাকা আইডিটি এখানে লিখুন।" : "* Standard GTM code formatted like GTM-XXXXXXX."}
                  </span>
                </div>

              </div>
            </div>

            {/* Diagnostic Guide details */}
            <div className="bg-[#104273]/5 border border-[#104273]/15 rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-black text-[#f58220] tracking-widest block">
                  {language === 'bn' ? "কনভার্সন ইন্টেলিজেন্স ট্র্যাকিং" : "Dynamic Standard Conversion Tracking"}
                </span>
                
                <h5 className="text-sm font-bold text-zinc-800">
                  {language === 'bn' ? "অটোমেটেড ই-কমার্স ট্র্যাকিং রুলস" : "Continuous Analytical Monitoring"}
                </h5>
                <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                  {language === 'bn' 
                    ? "কোনো থার্ড-পার্টি প্লাগইন ছাড়াই এই মডিউলটি রিটেইল ওয়েবসাইটের সকল গুরুত্বপূর্ণ ইভেন্ট মেটা ডাটা এবং প্যারামিটারসহ ট্র্যাক করবে।"
                    : "No heavy visual plug-ins required. Every vital checkout funnel progression generates clean tracking signals automatically for precise marketing attribution."}
                </p>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span><strong>PageView</strong> - {language === 'bn' ? "পেজ ভিউ ট্র্যাকিং" : "Every active view traversal"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span><strong>AddToCart</strong> - {language === 'bn' ? "কার্টে পণ্য যুক্ত হলে" : "Adding products to shopping bag"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span><strong>InitiateCheckout</strong> - {language === 'bn' ? "চেকআউট পেজ ওপেন হলে" : "Opening checkout overlay checkout details"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span><strong>Purchase</strong> - {language === 'bn' ? "সফলভাবে অর্ডার সম্পূর্ণ হলে (৳ মূল্যসহ)" : "Successful order creation inside store (with BDT)"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 mt-4 flex items-center justify-between text-[11px] font-bold text-zinc-500">
                <span>Status: <strong className="text-emerald-600 font-extrabold">{settings.enablePixel || settings.enableGtm ? "ACTIVE / সক্রিয়" : "INACTIVE"}</strong></span>
                <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-black">SDK v2.0</span>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 2: EVENTS MONITOR & DEBUGGER */}
        {activeSubTab === 'test' && (
          <div className="space-y-6">
            
            {/* Direct Trigger Simulation Panel */}
            <div className="bg-zinc-50 border p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  {language === 'bn' ? "ম্যানুয়াল ইভেন্ট ফায়ার সিম্যুলেটর (টেস্টিং)" : "Analytical Event Dispatcher Sandbox"}
                </h4>
                <p className="text-[10px] text-[#f58220] font-black">{language === 'bn' ? "পিক্সেল এবং জিটিএম টেস্ট করুন" : "Test setup instantaneously"}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleFireMockEvent("PageView", { path: "/", title: "Main Catalog Page" })}
                  className="bg-white hover:bg-zinc-100 border text-zinc-700 font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Play size={10} className="text-blue-500 fill-blue-500" />
                  <span>PageView</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFireMockEvent("AddToCart", { id: "NB-20", title: "Premium Men's Polo", category: "clothing", price: 1250 })}
                  className="bg-white hover:bg-zinc-100 border text-zinc-700 font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Play size={10} className="text-emerald-500 fill-emerald-500" />
                  <span>AddToCart</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFireMockEvent("InitiateCheckout", { value: 1250, currency: "BDT", count: 1 })}
                  className="bg-white hover:bg-zinc-100 border text-zinc-700 font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Play size={10} className="text-orange-500 fill-orange-500" />
                  <span>InitiateCheckout</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFireMockEvent("Purchase", { orderId: "NAB-81924", value: 1250, currency: "BDT", items: 1 })}
                  className="bg-white hover:bg-zinc-100 border text-zinc-700 font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Play size={10} className="text-[#052b52] fill-[#052b52]" />
                  <span>Purchase</span>
                </button>
              </div>
            </div>

            {/* Logs streams table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-extrabold text-zinc-400 uppercase tracking-older flex items-center space-x-1">
                  <Terminal size={12} className="text-blue-500" />
                  <span>{language === 'bn' ? "লাইভ রিয়েল-টাইম ইভেন্ট লগ" : "Real-Time Tracing Diagnostics Feed"}</span>
                </h4>
                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded inline-block cursor-pointer border-0 transition"
                  >
                    {language === 'bn' ? "লগ পরিষ্কার করুন" : "Clear Fire Logs"}
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 border border-dashed rounded-xl text-xs text-zinc-400 font-semibold leading-relaxed">
                  {language === 'bn' 
                    ? "কোনো ইভেন্ট এখনও ডিটেক্ট করা যায়নি। ওয়েবসাইটে কেনাকাটা করুন অথবা টেস্ট বাটনে ক্লিক করে ডেমো ইভেন্ট ফায়ার করুন।" 
                    : "No dynamic analytical events captured yet. Execute customer checkouts or utilize Sandbox dispatch buttons to watch live JSON logs."}
                </div>
              ) : (
                <div className="border rounded-xl shadow-3xs max-h-[290px] overflow-y-auto divide-y font-mono text-xs">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 bg-zinc-50/50 hover:bg-zinc-50 transition flex items-start justify-between gap-3 text-left">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            log.origin === "Facebook Pixel" 
                              ? "bg-blue-105 text-blue-900 bg-blue-100" 
                              : "bg-amber-100 text-amber-900"
                          }`}>
                            {log.origin}
                          </span>
                          <strong className="text-zinc-900 text-[12px]">{log.eventName}</strong>
                        </div>
                        <pre className="text-[10px] text-zinc-500 font-sans font-semibold mt-1 bg-white border p-2 rounded-lg max-w-lg overflow-x-auto leading-normal">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>

                      <div className="text-right text-[10px] text-zinc-400 font-sans shrink-0">
                        <span>{log.timestamp}</span>
                        <span className="block text-[8px] bg-zinc-200 text-zinc-700 px-1 rounded font-mono font-bold mt-1 inline-block uppercase">{log.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUBTAB 3: DEVELOPER CODE SNIPPETS */}
        {activeSubTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border-l-4 border-[#f58220] text-amber-900 p-4 rounded-xl text-xs leading-relaxed font-semibold">
              {language === 'bn' 
                ? "আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে এই কোডগুলো ওয়েবসাইটের ব্যাকএন্ডে ইনজেক্ট করেছে। কোনো কোডিং জ্ঞান ছাড়াই সরাসরি কাজ করবে।"
                : "The analytics engine handles direct SDK integrations. No manual copy pasting required — tracking variables are injected seamlessly."}
            </div>

            {/* Meta Pixel Block */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-blue-900 uppercase">1. Generated Meta Facebook Pixel Tag</span>
                <button
                  onClick={() => handleCopyCode(fbPixelCodeSnippet, "pixel")}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-bold px-2 py-1 rounded border-0 cursor-pointer flex items-center space-x-1"
                >
                  <Copy size={11} />
                  <span>{copiedId === "pixel" ? (language === 'bn' ? "কপি হয়েছে!" : "Copied!") : (language === 'bn' ? "কোড কপি করুন" : "Copy Tag Code")}</span>
                </button>
              </div>
              <pre className="bg-zinc-900 text-amber-400 p-4 rounded-xl text-[10px] overflow-x-auto max-h-[160px] font-mono leading-relaxed border border-zinc-950">
                {fbPixelCodeSnippet}
              </pre>
            </div>

            {/* GTM Block */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-[#114274] uppercase font-sans">2. Generated Google Tag Manager Tag</span>
                <button
                  onClick={() => handleCopyCode(gtmCodeSnippet, "gtm")}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-bold px-2 py-1 rounded border-0 cursor-pointer flex items-center space-x-1"
                >
                  <Copy size={11} />
                  <span>{copiedId === "gtm" ? (language === 'bn' ? "কপি হয়েছে!" : "Copied!") : (language === 'bn' ? "কোড কপি করুন" : "Copy Tag Code")}</span>
                </button>
              </div>
              <pre className="bg-zinc-900 text-teal-400 p-4 rounded-xl text-[10px] overflow-x-auto max-h-[160px] font-mono leading-relaxed border border-zinc-950">
                {gtmCodeSnippet}
              </pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
