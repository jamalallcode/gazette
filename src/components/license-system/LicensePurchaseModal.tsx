import React, { useState } from "react";
import { 
  X, Smartphone, Key, ShieldCheck, Heart, Copy, CheckCircle2, MessageSquare, CreditCard 
} from "lucide-react";
import { addLicenseOrder, saveLicenseOrders } from "./licenseStore";
import { LicenseOrder } from "./types";

interface LicensePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
}

export function LicensePurchaseModal({ isOpen, onClose, language }: LicensePurchaseModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: Payment Gateway, 3: Success Code
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [txid, setTxid] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");

  if (!isOpen) return null;

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !email.trim()) {
      const msg = language === 'bn' ? "অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।" : "Please fill out all fields.";
      window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
      return;
    }
    // Advance to payment
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto generate key
    const segments = [
      "GB-PRO",
      Math.floor(1000 + Math.random() * 9000).toString(),
      Math.floor(1000 + Math.random() * 9000).toString()
    ];
    const key = segments.join("-");
    const generatedTxid = txid.trim() || "TXN" + Math.random().toString(36).substr(2, 7).toUpperCase();

    // Create the actual order
    const orderId = "LO-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder: LicenseOrder = {
      id: orderId,
      customerName: name,
      email: email,
      whatsapp: whatsapp,
      licenseKey: key,
      paymentMethod: paymentMethod,
      paymentStatus: "completed", // Instantly completed upon customer checking out
      paymentTxid: generatedTxid,
      requestedAt: new Date().toISOString(),
      priceBDT: 4500,
      isWhatsAppSent: true // Automatically dispatch to WhatsApp
    };

    addLicenseOrder(newOrder);
    setGeneratedKey(key);
    setStep(3);

    // Dynamic Bangla custom event for notification or update toasts
    const successMsg = language === 'bn'
      ? `অভিনন্দন! আপনার পেমেন্ট নিশ্চিত করা হয়েছে। আপনার লাইসেন্স কী ${whatsapp} নাম্বারের হোয়াটসঅ্যাপে পাঠানো হয়েছে!`
      : `Payment Received! License verification key was pushed directly to WhatsApp for ${whatsapp}`;
    window.dispatchEvent(new CustomEvent("app-toast", { detail: successMsg }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-250 font-sans">
      <div 
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative border border-zinc-150 flex flex-col animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header decoration */}
        <div className="bg-[#f58220] p-4 text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <Key size={18} className="animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              {language === 'bn' ? "পেশাদারি মালিকানা লাইসেন্স কী সংগ্রহ করুন" : "Claim Lifetime Enterprise Key"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-zinc-200 bg-black/15 hover:bg-black/25 rounded-full h-7 w-7 flex items-center justify-center border-0 cursor-pointer transition text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[80vh]">
          {step === 1 && (
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="text-center pb-1 select-none">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 font-bold rounded-sm uppercase tracking-wide border border-emerald-150">
                  {language === 'bn' ? "রিয়েল-টাইম অটো সেটিং" : "Instant Active Sync"}
                </span>
              </div>

              {/* Beautiful message detailing everything about the license code */}
              <div className="bg-[#fdf6f0] border border-orange-200 rounded-xl p-3.5 space-y-2 select-none">
                <h4 className="text-xs font-black text-orange-700 uppercase flex items-center gap-1.5 leading-relaxed">
                  📢 {language === 'bn' ? "লাইসেন্স কোড সংগ্রহ নির্দেশিকা ও সুবিধা সমূহ" : "License Code Claims Guideline"}
                </h4>
                <ul className="text-[11px] text-zinc-700 space-y-1.5 list-disc pl-4 font-semibold leading-relaxed">
                  {language === 'bn' ? (
                    <>
                      <li><strong>টাইমার লকার অপসারণ:</strong> ওয়েবসাইটের ওপরে লাল রঙের টেম্পোরারি ডেমো স্যান্ডবক্স বার এবং কাউন্টডাউন টাইমার চিরতরে বন্ধ হবে।</li>
                      <li><strong>ফুল ফিচার অ্যাক্টিভেশন:</strong> কাস্টমার অর্ডার এসএমএস নোটিফিকেশন, গেটওয়ে ট্র্যাকিং, এবং কাস্টম রিসেলার প্যানেল সম্পূর্ণ আনলক হবে।</li>
                      <li><strong>স্বয়ংক্রিয় লাইসেন্স ডেলিভারি:</strong> বিকাশ/নগদ/রকেটে নির্ধারিত টাকা পাঠানোর সাথে সাথেই সিস্টেম অটোমেটিক আপনার কাঙ্ক্ষিত কোডটি জেনারেট করে আপনার দেওয়া হোয়াটসঅ্যাপ নম্বরে মেসেজ আকারে এবং এখানে স্ক্রিনে প্রদর্শন করবে।</li>
                      <li><strong>আজীবন ফ্রি আপডেট:</strong> একবার কোডটি নিয়ে সক্রিয় করলে সাইট সম্পূর্ণভাবে রেডি থাকবে। আপনাকে ম্যানুয়ালি কিছু করতে হবে না, শুধু মাঝে মাঝে আপনার বিকাশ/নগদ একাউন্ট চেক করবেন।</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Remove Trial Banner:</strong> Permanently disable the sessional countdown notice on top of the store page.</li>
                      <li><strong>Unlock Enterprise Modules:</strong> Turn on active customer notification alerts, order dispatch SMS logs, and the custom seller console.</li>
                      <li><strong>Automated Dispatch:</strong> Our backend immediately creates, formats, and releases your license code via WhatsApp as soon as payment is confirmed.</li>
                      <li><strong>Fully Automated Setup:</strong> Zero manual intervention required from your end. Simply verify your transaction reports!</li>
                    </>
                  )}
                </ul>
                <div className="border-t border-orange-100 pt-1.5 mt-2 flex justify-between items-center text-[10.5px] font-bold text-orange-900">
                  <span>{language === 'bn' ? "এককালীন আজীবন সক্রিয় ফি:" : "One-time Lifetime License Fee:"}</span>
                  <span className="font-mono text-xs font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">৳৪,৫০০ BDT</span>
                </div>
              </div>

              {/* Information Forms */}
              <div className="space-y-3">
                <div className="space-y-1 block text-left">
                  <label className="text-[10px] uppercase font-black text-zinc-500">
                    {language === 'bn' ? "আপনার পুরো নাম" : "Your Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. মাহবুব হাসান"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs font-semibold focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/25 text-zinc-800"
                  />
                </div>

                <div className="space-y-1 block text-left">
                  <label className="text-[10px] uppercase font-black text-zinc-500">
                    {language === 'bn' ? "হোয়াটসঅ্যাপ নম্বর (WhatsApp mobile)" : "WhatsApp Mobile Number"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs font-semibold font-mono focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/25 text-zinc-800"
                  />
                  <span className="text-[9px] text-zinc-400 block font-medium">
                    {language === 'bn' 
                      ? "* এই হোয়াটসঅ্যাপ নম্বরে পেমেন্ট সফল হওয়ার পরপরই লাইসেন্স চাবি মেসেজ চলে যাবে।" 
                      : "* Your license key is instantly dispatched to this number upon payment validation."}
                  </span>
                </div>

                <div className="space-y-1 block text-left">
                  <label className="text-[10px] uppercase font-black text-zinc-500">
                    {language === 'bn' ? "ইমেইল এড্রেস" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mahbub@gmail.com"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs font-semibold focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/25 text-zinc-800"
                  />
                </div>
              </div>

              <div className="pt-2 select-none">
                <button
                  type="submit"
                  className="w-full bg-[#f58220] hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer shadow-sm hover:shadow transition border-0 flex items-center justify-center gap-1"
                >
                  <span>{language === 'bn' ? "সম্মত (সম্মত আছি ও পেমেন্ট করুন)" : "সম্মত (I Agree & Proceed)"}</span>
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="text-center select-none">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Enterprise Lifetime License Rate</p>
                <h2 className="text-3xl font-black text-zinc-900 mt-1 select-all font-mono">৳৪,৫০০ <span className="text-sm text-zinc-500">BDT</span></h2>
              </div>

              {/* Payment Methods Selection Row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bKash', color: 'bg-[#e2136e]', logo: 'bKash' },
                  { id: 'Nagad', color: 'bg-[#ec1c24]', logo: 'Nagad' },
                  { id: 'Rocket', color: 'bg-[#8c3494]', logo: 'Rocket' }
                ].map((m) => {
                  const isSel = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition select-none ${
                        isSel 
                          ? "border-orange-500 bg-orange-50/10 text-orange-600" 
                          : "border-zinc-200 hover:border-zinc-300 text-zinc-650"
                      }`}
                    >
                      <div className={`h-2.5 w-2.5 rounded-full ${m.color} mb-1`} />
                      <span className="text-xs font-black">{m.logo}</span>
                    </button>
                  );
                })}
              </div>

              {/* Secure Payment details display */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2 select-none">
                <p className="text-[11px] text-zinc-700 leading-relaxed font-semibold">
                  {language === 'bn' 
                    ? `আমাদের নির্দিষ্ট ${paymentMethod} নম্বরে ৪,৫০০ টাকা "Send Money" সম্পন্ন করুন:` 
                    : `Please send exactly 4,500 BDT to following ${paymentMethod} official line:`}
                </p>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-zinc-150 font-mono text-xs select-all">
                  <span className="font-extrabold text-zinc-800">
                    {paymentMethod === 'bKash' ? "01734242026" : paymentMethod === 'Nagad' ? "01920263424" : "01512341234"}
                  </span>
                  <span className="text-[9px] bg-orange-100 text-[#f58220] px-1.5 py-0.5 rounded font-black font-sans uppercase">
                    {paymentMethod === 'bKash' ? "Merchant" : "Personal"}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                  {language === 'bn' 
                    ? "টাকা পাঠানোর পর বিকাশ বা নগদ হতে প্রাপ্ত ৮ ডিজিটের ট্রানজেকশন কন্টাক্ট কোডটি লিখুন। অথবা ডেমো পরীক্ষার জন্য নিচের বাটন চাপুন।" 
                    : "Specify the transaction token ID. For development verification, leave empty or click automatic bypass pay."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1 block text-left">
                  <label className="text-[10px] uppercase font-black text-zinc-500">
                    {language === 'bn' ? "পেমেন্ট ট্রানজেকশন আইডি (Transaction ID)" : "Transaction reference ID (TxID)"}
                  </label>
                  <input
                    type="text"
                    value={txid}
                    onChange={(e) => setTxid(e.target.value)}
                    placeholder="e.g. TRK9B8C2DA"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs font-bold font-mono focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/25 text-zinc-800 uppercase"
                  />
                </div>

                <div className="flex gap-2 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setTxid("TXN" + Math.random().toString(36).substr(2, 7).toUpperCase());
                      const event = new CustomEvent("app-toast", { 
                        detail: language === 'bn' ? "অটোমেটেড ডেমো পেমেন্ট সম্পন্ন হয়েছে!" : "Automated bypass payment checkout triggered!" 
                      });
                      window.dispatchEvent(event);
                    }}
                    className="bg-zinc-100 hover:bg-zinc-200 border-0 cursor-pointer text-zinc-700 font-black text-[10px] px-3.5 py-2.5 rounded-lg transition-all"
                  >
                    {language === 'bn' ? "পরীক্ষামূলক পেমেন্ট" : "Simulate Pay"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-xs py-2.5 rounded-lg cursor-pointer transition border-0 select-none"
                  >
                    {language === 'bn' ? "পেমেন্ট নিশ্চিত করুন" : "Confirm Payment Checkout"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
              <div className="flex justify-center select-none">
                <div className="bg-emerald-50 p-3 rounded-full border border-emerald-150 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={38} className="fill-emerald-500 text-white" />
                </div>
              </div>

              <div className="space-y-2 select-none">
                <h3 className="text-base font-black text-emerald-800">
                  {language === 'bn' ? "পেমেন্ট সফল ও লাইসেন্স সক্রিয়!" : "Payment Successfully Confirmed!"}
                </h3>
                <p className="text-xs text-zinc-500 font-semibold max-w-sm leading-relaxed px-1">
                  {language === 'bn' 
                    ? `আপনার জন্য চিরস্থায়ী লাইসেন্স কোড তৈরি করা হয়েছে ও নাম্বারে হোয়াটসঅ্যাপে পাঠানো হয়েছে। কোডটি কপি করে ডেমো লকারে পেস্ট করুন।` 
                    : `Your lifetime license string of keys was dispatched successfully! Keep copy and protect it carefully.`}
                </p>
              </div>

              {/* Code display segment */}
              <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 space-y-2 relative">
                <div className="text-[10px] uppercase font-black text-emerald-800 flex items-center justify-center gap-1 select-none">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  {language === 'bn' ? "আপনার চিরস্থায়ী লাইসেন্স চাবি" : "YOUR LIFETIME LICENSE KEY"}
                </div>
                <div className="font-mono text-sm font-black text-emerald-950 tracking-wider bg-white border border-emerald-150 rounded-lg p-2.5 select-all select-none">
                  {generatedKey}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    window.dispatchEvent(new CustomEvent("app-toast", { 
                      detail: language === 'bn' ? "লাইসেন্স কোড কপি হয়েছে!" : "License Key Copied!" 
                    }));
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-[10.5px] font-black rounded-lg cursor-pointer transition flex items-center gap-1 mx-auto"
                >
                  <Copy size={11} />
                  {language === 'bn' ? "কপি কোড" : "Copy License Key"}
                </button>
              </div>

              {/* Mock WhatsApp Confirmation Card */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-left space-y-1.5 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-1.5 select-none">
                  <MessageSquare size={13} className="text-green-600 shrink-0" />
                  <span className="text-[11px] font-black text-green-800">WhatsApp Alert Dispatcher</span>
                </div>
                <div className="border border-green-200 bg-white rounded-lg p-2 text-[11px] text-zinc-600 font-mono">
                  <p className="font-bold text-zinc-400 text-[10px]">TO: {whatsapp}</p>
                  <p className="mt-1 text-zinc-750">
                    {language === 'bn' 
                      ? `✉️ প্রিয় গ্রাহক, আপনার পেমেন্ট সফল হয়েছে। আপনার লাইসেন্স কোডটি হলো: ${generatedKey}। সাইটের লাল বারে ক্লিক করে ডেমো মোড চিরতরে বন্ধ করুন। ধন্যবাদ!`
                      : `✉️ Dear Client, Payment confirmed. Your premium active license key string is: [ ${generatedKey} ] which will activate lifetime access.`}
                  </p>
                </div>
              </div>

              <div className="pt-2 select-none">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-zinc-800 hover:bg-zinc-900 border-0 text-white text-xs font-extrabold py-2 rounded-xl cursor-pointer transition"
                >
                  {language === 'bn' ? "ফিরে যান" : "Return to Site"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
