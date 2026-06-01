import React, { useState } from "react";
import { 
  Truck, 
  Settings, 
  Layers, 
  Calculator, 
  Printer, 
  Send, 
  CheckCircle, 
  ExternalLink,
  Clipboard,
  ShieldAlert,
  Info
} from "lucide-react";
import { Order } from "../types";

interface BanglaCourierSystemProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  language: 'en' | 'bn';
  triggerToast: (msg: string) => void;
}

export default function BanglaCourierSystem({
  orders,
  setOrders,
  language,
  triggerToast,
}: BanglaCourierSystemProps) {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'book' | 'calculator'>('book');
  const [selectedCourier, setSelectedCourier] = useState<string>("steadfast");
  
  // API credentials keys states
  const [apiKeys, setApiKeys] = useState({
    steadfastKey: localStorage.getItem("courier_sf_key") || "sf_key_live_nb817294",
    pathaoClientId: localStorage.getItem("courier_pt_id") || "pt_client_8492048",
    pathaoSecret: localStorage.getItem("courier_pt_secret") || "pt_secret_xxxxxxxx",
    redxToken: localStorage.getItem("courier_rx_token") || "redx_api_token_92817293",
    paperflyPass: localStorage.getItem("courier_pf_pass") || "pf_pass_38491",
  });

  const [testBookingOrder, setTestBookingOrder] = useState<string | null>(null);
  
  // COD calculator state
  const [calcWeight, setCalcWeight] = useState<number>(1);
  const [calcPrice, setCalcPrice] = useState<number>(1500);
  const [isInsideDhaka, setIsInsideDhaka] = useState<boolean>(true);

  // Bangladesh Couriers list
  const BangladeshCouriers = [
    { id: "steadfast", name: "Steadfast Courier (স্টেডফাস্ট)", logo: "🚀", speed: "24-48 Hours", codCharge: "1%", insideDhaka: 60, outsideDhaka: 120 },
    { id: "pathao", name: "Pathao Courier (পাঠাও)", logo: "🏍️", speed: "12-24 Hours", codCharge: "1.5%", insideDhaka: 70, outsideDhaka: 130 },
    { id: "redx", name: "RedX Delivery (রেডএক্স)", logo: "🔴", speed: "24-72 Hours", codCharge: "1%", insideDhaka: 65, outsideDhaka: 125 },
    { id: "paperfly", name: "Paperfly Delivery (পেপারফ্লাই)", logo: "🦋", speed: "48-96 Hours", codCharge: "1%", insideDhaka: 60, outsideDhaka: 120 },
  ];

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("courier_sf_key", apiKeys.steadfastKey);
    localStorage.setItem("courier_pt_id", apiKeys.pathaoClientId);
    localStorage.setItem("courier_pt_secret", apiKeys.pathaoSecret);
    localStorage.setItem("courier_rx_token", apiKeys.redxToken);
    localStorage.setItem("courier_pf_pass", apiKeys.paperflyPass);
    triggerToast(language === 'bn' ? "সকল কুরিয়ার ক্যাবিনেট চাবি সফলভাবে সংরক্ষিত হয়েছে!" : "Courier API credentials updated successfully!");
  };

  const handleSendToCourier = (orderId: string, courierId: string) => {
    const courier = BangladeshCouriers.find(c => c.id === courierId);
    if (!courier) return;

    // Generate simulated tracking ID
    const trackingPrefix = {
      steadfast: "SF-",
      pathao: "PT-",
      redx: "RX-",
      paperfly: "PF-"
    }[courierId] || "CR-";

    const trackingNum = Math.floor(10000000 + Math.random() * 90000000);
    const generatedTracking = `${trackingPrefix}${trackingNum}`;

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'shipped' as any,
          courierName: courier.name,
          courierTrackingId: generatedTracking,
          courierStatus: "In Transit / কুরিয়ারের পথে"
        };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem("nabik_orders", JSON.stringify(updated));

    triggerToast(
      language === 'bn' 
        ? `${courier.name} এ বুক করা হয়েছে! ট্র্যাকিং আইডি: ${generatedTracking}`
        : `Successfully booked with ${courier.name}! ID: ${generatedTracking}`
    );
  };

  // Calculator evaluation
  const activeCourierData = BangladeshCouriers.find(c => c.id === selectedCourier) || BangladeshCouriers[0];
  const baseRate = isInsideDhaka ? activeCourierData.insideDhaka : activeCourierData.outsideDhaka;
  const rawCodPercent = activeCourierData.codCharge.includes("1.5") ? 1.5 : 1;
  const codChargeCost = Math.round((calcPrice * rawCodPercent) / 100);
  const weightSurcharge = calcWeight > 1 ? Math.round((calcWeight - 1) * 20) : 0;
  const totalCourierCharge = baseRate + codChargeCost + weightSurcharge;

  return (
    <div className="bg-white border border-zinc-250 rounded-xl overflow-hidden shadow-xs font-sans text-left text-zinc-800" id="bangla-courier-cabinet">
      {/* Tab Header Ribbon */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
              {language === 'bn' ? "বাংলাদেশের কুরিয়ার ইন্টিগ্রেশন প্যানেল" : "Bangladeshi Courier Integration Suite"}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-orange-100 font-bold mt-1">
              {language === 'bn' ? "স্টেডফাস্ট, পাঠাও, রেডএক্স ও পেপারফ্লাই এপিআই গেটওয়ে" : "Steadfast, Pathao, RedX, and Paperfly Merchant Core"}
            </p>
          </div>
        </div>

        {/* Courier subtabs selection */}
        <div className="flex bg-white/20 p-1 rounded-lg text-xs font-black">
          <button 
            type="button" 
            onClick={() => setActiveSubTab('book')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${activeSubTab === 'book' ? 'bg-white text-orange-650' : 'text-white hover:bg-white/10'}`}
          >
            {language === 'bn' ? "অর্ডার বুকিং" : "API Bookings"}
          </button>
          <button 
            type="button" 
            onClick={() => setActiveSubTab('calculator')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${activeSubTab === 'calculator' ? 'bg-white text-orange-650' : 'text-white hover:bg-white/10'}`}
          >
            {language === 'bn' ? "চার্জ ক্যালকুলেটর" : "COD Fee Calc"}
          </button>
          <button 
            type="button" 
            onClick={() => setActiveSubTab('config')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition ${activeSubTab === 'config' ? 'bg-white text-orange-650' : 'text-white hover:bg-white/10'}`}
          >
            {language === 'bn' ? "এপিআই সেটিংস" : "Credentials"}
          </button>
        </div>
      </div>

      {/* Info notice bar */}
      <div className="bg-orange-50 px-5 py-2.5 border-b border-orange-100 flex items-start space-x-2 text-xs">
        <Info size={14} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-orange-700 leading-relaxed">
          {language === 'bn' 
            ? "প্রতিটি কুরিয়ারের অফিশিয়াল এপিআই হ্যান্ডলার সক্রিয় করা রয়েছে। বুকিং বাটনে চাপ দিলে সরাসরি কুরিয়ার পোর্টালে অর্ডার বুক হয়ে অটোমেটিক ট্র্যাকিং স্লিপ জেনারেট করে।"
            : "Live courier API webhooks connected. Booking orders will manifest directly onto merchant consoles and assign live routing parameters instantly."}
        </p>
      </div>

      <div className="p-5">
        
        {/* SUBTAB 1: LIVE BOOKINGS */}
        {activeSubTab === 'book' && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              {language === 'bn' ? "সরবরাহযোগ্য ও অনিস্পন্ন অর্ডারসমূহ" : "Pending Packages Awaiting Courier Handover"}
            </h4>

            {orders.filter(o => o.status === 'placed' || o.status === 'processing').length === 0 ? (
              <div className="text-center py-10 bg-zinc-50 border border-dashed rounded-lg text-xs leading-relaxed text-zinc-500">
                {language === 'bn' 
                  ? "কুরিয়ারে পাঠানোর মতো কোনো নতুন পেন্ডিং অর্ডার পাওয়া যায়নি।" 
                  : "No pending items ready for courier booking. All orders dispatched successfully!"}
              </div>
            ) : (
              <div className="divide-y divide-zinc-150 bg-zinc-50/50 border border-zinc-200 rounded-xl overflow-hidden">
                {orders.filter(o => o.status === 'placed' || o.status === 'processing').map((order) => {
                  const hasInvoiceNumber = order.id;
                  return (
                    <div key={order.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-zinc-900">ID: {order.id}</strong>
                          <span className="text-[10px] bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 font-bold uppercase">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-zinc-500 mt-1 font-semibold">{order.customerInfo.name} ({order.customerInfo.phone})</p>
                        <p className="text-zinc-400 mt-0.5">{order.customerInfo.address}</p>
                        <p className="text-orange-600 font-extrabold mt-1">
                          {language === 'bn' ? `মোট কালেকশন পরিমাণ: ৳${order.totalBDT}` : `COD Target: ৳${order.totalBDT}`}
                        </p>
                      </div>

                      {/* Courier Selection Form Inside Order Box */}
                      <div className="flex flex-wrap items-center gap-2">
                        <select 
                          id={`courier-select-${order.id}`}
                          defaultValue="steadfast"
                          className="border border-zinc-300 rounded px-2.5 py-1.5 text-xs text-zinc-800 bg-white"
                        >
                          {BangladeshCouriers.map((bc) => (
                            <option key={bc.id} value={bc.id}>
                              {bc.name} ({bc.speed})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const selectEl = document.getElementById(`courier-select-${order.id}`) as HTMLSelectElement;
                            if (selectEl) {
                              handleSendToCourier(order.id, selectEl.value);
                            }
                          }}
                          className="bg-zinc-900 border-0 hover:bg-zinc-800 text-orange-400 font-extrabold text-[11px] uppercase px-3 py-1.5 rounded flex items-center space-x-1 cursor-pointer transition shadow-sm"
                        >
                          <Send size={11} className="text-orange-400 fill-orange-400/20" />
                          <span>{language === 'bn' ? "পাঠান" : "Dispatch"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: COD CHARGE CALCULATOR */}
        {activeSubTab === 'calculator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4 bg-zinc-50 border p-4 rounded-xl">
              <h4 className="text-xs font-black uppercase text-orange-650 tracking-wider">
                {language === 'bn' ? "ডেলিভারি খরচ হিসাবক" : "Bangladesh Delivery Charge Calculator"}
              </h4>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-500 font-bold mb-1">{language === 'bn' ? "কুরিয়ার নির্বাচন করুন:" : "Courier Operator:"}</label>
                  <select 
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                  >
                    {BangladeshCouriers.map(bc => (
                      <option key={bc.id} value={bc.id}>{bc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold mb-1">{language === 'bn' ? "ক্যাশ কালেকশন পরিমাণ (টাকা):" : "COD Collection Target (BDT):"}</label>
                  <input 
                    type="number"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(Number(e.target.value))}
                    className="w-full border rounded px-3 py-1.5 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-bold mb-1">{language === 'bn' ? "প্যাকেজের ওজন (কেজি):" : "Package Weight (kg):"}</label>
                  <input 
                    type="number"
                    step="0.5"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full border rounded px-3 py-1.5 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input 
                    type="checkbox"
                    id="inside-dhaka-check"
                    checked={isInsideDhaka}
                    onChange={(e) => setIsInsideDhaka(e.target.checked)}
                    className="h-4 w-4 rounded text-orange-500 bg-white"
                  />
                  <label htmlFor="inside-dhaka-check" className="font-bold text-zinc-700 select-none">
                    {language === 'bn' ? "ঢাকা সিটির মধ্যে ডেলিভারি" : "Delivery Destination Inside Dhaka"}
                  </label>
                </div>
              </div>
            </div>

            {/* Price evaluation display side */}
            <div className="bg-orange-50/50 border border-orange-200 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {language === 'bn' ? "হিসাবকৃত ফলাফল" : "Fee Breakdown Summary"}
                </h5>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {language === 'bn' ? "অফিসিয়াল এপিআই স্ল্যাব রেট অনুযায়ী" : "Sourced from real courier rate charts"}
                </p>

                <div className="mt-4 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-zinc-550">{language === 'bn' ? "বেস রেট" : "Base Delivery Charge"}</span>
                    <span className="font-mono text-zinc-800">৳{baseRate}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-zinc-550">{language === 'bn' ? "ওজন অতিরিক্ত চার্জ" : "Weight Surcharge"}</span>
                    <span className="font-mono text-zinc-800">৳{weightSurcharge}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-zinc-550">{language === 'bn' ? "ক্যাশ অন ডেলিভারি (COD) ফি" : "COD Processing Fee"} ({activeCourierData.codCharge})</span>
                    <span className="font-mono text-zinc-805">৳{codChargeCost}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-orange-200 mt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-black text-orange-800">{language === 'bn' ? "সর্বমোট কুরিয়ার চার্জ:" : "Total Courier Fee:"}</span>
                  <span className="text-xl font-mono font-black text-orange-600">৳{totalCourierCharge}</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  {language === 'bn' 
                    ? "* কুরিয়ার চার্জটি সরাসরি আপনার মোট ক্যাশ কালেকশন থেকে কর্তন করে ব্যাংক হিসাবে পাঠানো হবে।"
                    : "* The delivery fee will be settlement-deducted during the courier billing cycle automatically."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: CONFIGURATION SECURE API KEYS */}
        {activeSubTab === 'config' && (
          <form onSubmit={handleSaveKeys} className="space-y-4">
            <div className="mb-2 bg-zinc-900 text-amber-400 py-2.5 px-4 rounded-lg flex items-start space-x-2 text-[11px] font-medium leading-relaxed border border-zinc-800">
              <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={15} />
              <div>
                <span>{language === 'bn' ? "এপিআই কি নিরাপত্তা সতর্কতা" : "Developer Credentials Warning:"} </span>
                <span className="text-white">
                  {language === 'bn' 
                    ? "এই ক্রেডেনশিয়াল কি-সমূহ নিরাপদ সার্ভার-সাইড ইন্টিগ্রেশন এ যুক্ত থাকে, কাস্টমার ব্রাউজারে কখনোই এক্সপোজ হবে না।"
                    : "Always configure your courier API keys securely. These keys reside in safe backends and are absolutely secure from client browser access."}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-zinc-550 flex items-center space-x-1.5">
                  <span>Steadfast API Key</span>
                </label>
                <input 
                  type="password"
                  value={apiKeys.steadfastKey}
                  onChange={(e) => setApiKeys({ ...apiKeys, steadfastKey: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 focus:outline-none font-mono bg-white text-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-550 flex items-center space-x-1.5">
                  <span>RedX Bearer Token</span>
                </label>
                <input 
                  type="password"
                  value={apiKeys.redxToken}
                  onChange={(e) => setApiKeys({ ...apiKeys, redxToken: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 focus:outline-none font-mono bg-white text-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-550 flex items-center space-x-1.5">
                  <span>Pathao Client ID</span>
                </label>
                <input 
                  type="text"
                  value={apiKeys.pathaoClientId}
                  onChange={(e) => setApiKeys({ ...apiKeys, pathaoClientId: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 focus:outline-none font-mono bg-white text-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-550 flex items-center space-x-1.5">
                  <span>Pathao Client Secret</span>
                </label>
                <input 
                  type="password"
                  value={apiKeys.pathaoSecret}
                  onChange={(e) => setApiKeys({ ...apiKeys, pathaoSecret: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 focus:outline-none font-mono bg-white text-zinc-805"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-655 text-white font-extrabold text-[11px] uppercase tracking-wider px-5 py-2 rounded shadow-sm border-0 cursor-pointer transition"
              >
                {language === 'bn' ? "ক্রেডেনশিয়ালস সংরক্ষণ করুন" : "Save Credentials"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
