import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Flame, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Smartphone, Key, Info } from "lucide-react";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'sslcommerz';
  amountBDT: number;
  onPaymentSuccess: (trxId: string, info: string) => void;
  language: 'en' | 'bn';
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  method,
  amountBDT,
  onPaymentSuccess,
  language
}: PaymentGatewayModalProps) {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Account, 2: OTP, 3: PIN/Submit, 4: Success
  const [accountNumber, setAccountNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [selectedCardType, setSelectedCardType] = useState<string>("visa");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const displayAmount = amountBDT.toLocaleString();

  // Color theme variables based on actual brand specifications
  const getBrandDetails = () => {
    switch (method) {
      case 'bkash':
        return {
          name: "bKash Merchant Pay",
          primaryColor: "#E2136E",
          bgClass: "bg-[#E2136E]",
          textClass: "text-[#E2136E]",
          logo: "https://i.ibb.co/6y4tYrC/bkash-logo.png", // iconic logo placeholder/emoji helper
          placeholder: "01XXXXXXXXX"
        };
      case 'nagad':
        return {
          name: "Nagad Gateway",
          primaryColor: "#F26322",
          bgClass: "bg-[#F26322]",
          textClass: "text-[#F26322]",
          logo: "",
          placeholder: "01XXXXXXXXX"
        };
      case 'rocket':
        return {
          name: "Rocket Merchant Payment",
          primaryColor: "#8C3494",
          bgClass: "bg-[#8C3494]",
          textClass: "text-[#8C3494]",
          logo: "",
          placeholder: "01XXXXXXXXXX" // 12 digits
        };
      case 'upay':
        return {
          name: "Upay Payment Portal",
          primaryColor: "#054D8C",
          bgClass: "bg-[#054D8C]",
          textClass: "text-[#054D8C]",
          logo: "",
          placeholder: "01XXXXXXXXX"
        };
      case 'sslcommerz':
        return {
          name: "SSLCommerz Secured Gateway Router",
          primaryColor: "#00629B",
          bgClass: "bg-[#00629B]",
          textClass: "text-[#00629B]",
          logo: "",
          placeholder: ""
        };
    }
  };

  const brand = getBrandDetails();

  // Automatically trigger a mock SMS notification with OTP code for higher fidelity!
  useEffect(() => {
    if (step === 2) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const gatewayName = method.toUpperCase();
      const message = `[SMS Verification] Your ${gatewayName} Verification Code is ${generatedOtp}. Valid for 3 mins. Do not share.`;
      
      const timer = setTimeout(() => {
        setSmsNotification(message);
        setOtp(generatedOtp);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [step, method]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (step === 1) {
      if (method === 'sslcommerz') {
        if (selectedCardType === 'visa' || selectedCardType === 'mastercard' || selectedCardType === 'dbbl') {
          if (!cardHolder.trim() || cardNumber.length < 16) {
            setErrorMsg(language === 'bn' ? "দয়া করে সঠিক কার্ড তথ্য দিন" : "Please provide valid Card credentials");
            return;
          }
        }
        setStep(3); // card payments bypass standard mobile wallet OTP step
        return;
      }

      if (!accountNumber.trim() || accountNumber.length < 11) {
        setErrorMsg(language === 'bn' ? "দয়া করে সঠিক মোবাইল নম্বর দিন" : "Please enter a valid 11-digit wallet number.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (otp.length < 4) {
        setErrorMsg(language === 'bn' ? "ভেরিফিকেশন কোড ভুল হয়েছে" : "Verification code must be supplied.");
        return;
      }
      setSmsNotification(null);
      setStep(3);
    } else if (step === 3) {
      if (method !== 'sslcommerz' && pin.length < 4) {
        setErrorMsg(language === 'bn' ? "দয়া করে সঠিক পিন দিন" : "PIN security code must be entered.");
        return;
      }
      
      // Perform payment completion hook
      const rawTrx = "TRX" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const detailInfo = method === 'sslcommerz' 
        ? `Paid via SSLCommerz [${selectedCardType.toUpperCase()}]`
        : `Paid via ${method.toUpperCase()} (${accountNumber})`;

      setStep(4);
      
      setTimeout(() => {
        onPaymentSuccess(rawTrx, detailInfo);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md font-sans">
      
      {/* SMS notification HUD wrapper */}
      {smsNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] w-full max-w-sm bg-zinc-900 border-l-4 border-amber-500 rounded-lg shadow-2xl p-4 animate-bounce text-zinc-100 flex items-start space-x-3">
          <Smartphone className="shrink-0 text-amber-500 mt-0.5" size={18} />
          <div className="text-left">
            <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none mb-1">Incoming SMS Message</span>
            <p className="text-xs font-mono font-bold leading-normal">{smsNotification}</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md bg-white text-zinc-800 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200">
        
        {/* Banner with logo & styling */}
        <div className={`${brand.bgClass} text-white px-6 py-5 flex items-center justify-between`}>
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center font-black text-white">৳</div>
            <div className="text-left">
              <span className="block text-xs uppercase tracking-widest text-white/70 font-semibold leading-none">Checkout Secure Portal</span>
              <h3 className="font-extrabold text-[15px] block mt-1 tracking-tight leading-none">{brand.name}</h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 px-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs border-0 cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Security bar */}
        <div className="bg-zinc-100 px-6 py-2 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-zinc-650">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">SSL Encrypted Sandbox Gateway</span>
          </div>
          <span className="text-xs font-black text-zinc-800 font-mono">BDT ৳{displayAmount}</span>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-650 text-xs px-4.5 py-3 rounded-xl border border-red-200 flex items-center space-x-2">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span className="font-bold">{errorMsg}</span>
            </div>
          )}

          {step < 4 ? (
            <form onSubmit={handleNext} className="space-y-4">
              
              {/* SSLCOMMERZ specific card switcher */}
              {method === 'sslcommerz' && step === 1 && (
                <div className="space-y-4 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Select Bank Card Router</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'visa', label: 'Visa Card' },
                      { id: 'mastercard', label: 'Mastercard' },
                      { id: 'dbbl', label: 'DBBL Nexus' }
                    ].map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setSelectedCardType(card.id)}
                        className={`py-2 px-1 border-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          selectedCardType === card.id 
                            ? 'border-sky-500 bg-sky-50 text-sky-800' 
                            : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        <CreditCard size={14} />
                        <span>{card.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Card Holder Name</label>
                      <input
                        type="text"
                        placeholder="e.g. TASNIM RAHMAN"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 border border-zinc-350 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">16-Digit Card Number</label>
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="4321 9000 1234 5678"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 border border-zinc-350 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Wallet Step 1 Account Number input */}
              {method !== 'sslcommerz' && step === 1 && (
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Enter Account wallet Number</label>
                    <button
                      type="button"
                      onClick={() => setAccountNumber("01712345678")}
                      className={`text-[9.5px] font-bold underline ${brand.textClass} bg-transparent border-0 cursor-pointer`}
                    >
                      Autofill number
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder={brand.placeholder}
                      maxLength={12}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    <Smartphone className="absolute left-3 top-3.5 text-zinc-400" size={16} />
                  </div>
                  <span className="block text-[10px] text-zinc-400 leading-relaxed font-semibold italic">
                    * Make sure this account is currently registered with {method.toUpperCase()} and has sufficient balance.
                  </span>
                </div>
              )}

              {/* OTP Input Screen */}
              {step === 2 && (
                <div className="space-y-3 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Verification OTP Code (6 Digits)</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="XXXXXX"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl font-mono text-center text-lg tracking-widest font-black focus:outline-none focus:ring-2"
                    />
                    <Key className="absolute left-3 top-3.5 text-zinc-400" size={16} />
                  </div>
                  <span className="block text-[10px] text-zinc-550 italic font-semibold">
                    We've triggered an automatic SMS OTP to keep checking credentials secure in your browser viewport.
                  </span>
                </div>
              )}

              {/* PIN Screen */}
              {step === 3 && (
                <div className="space-y-3 text-left">
                  {method === 'sslcommerz' ? (
                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-sky-850 space-y-2">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-600 leading-none">Card Authentication Bypass</span>
                      <p className="text-xs font-semibold leading-relaxed">
                        SSLCommerz multi-bank credentials have been authenticated. Click the confirm button below to finalize transaction safely.
                      </p>
                    </div>
                  ) : (
                    <>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Security Transaction PIN</label>
                      <input
                        type="password"
                        required
                        maxLength={5}
                        placeholder="•••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full py-3 px-4 border border-zinc-300 rounded-xl font-mono text-center text-xl tracking-widest focus:outline-none focus:ring-2"
                      />
                      <div className="flex items-center space-x-1.5 p-3.5 rounded-xl bg-amber-50 text-amber-850 border border-amber-200">
                        <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-[9.5px] leading-tight font-semibold">
                          This is a local sandbox router. Entering your PIN is 100% secure as no data leaves your storage.
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="pt-2 flex space-x-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((step - 1) as any)}
                    className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-extrabold rounded-xl border-0 transition"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className={`flex-1 py-3 px-5 text-white text-xs font-black uppercase tracking-widest rounded-xl border-0 transition cursor-pointer flex items-center justify-center space-x-1.5 ${brand.bgClass} hover:opacity-90`}
                >
                  <span>{step === 3 ? "Complete Payment" : "Verify & Continue"}</span>
                  <ChevronRight size={14} className="stroke-[3px]" />
                </button>
              </div>

            </form>
          ) : (
            
            /* Success confirmation states */
            <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-200 animate-pulse">
                <CheckCircle2 size={36} className="stroke-[3px]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-zinc-900">Payment Processed Successfully!</h4>
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  The secure API gateway transaction was cleared. Redirecting you to Sellsull webshop receipt summary...
                </p>
              </div>
            </div>

          )}
        </div>

        {/* Footer info lock secure signature */}
        <div className="bg-zinc-50 px-6 py-4.5 border-t border-zinc-250 flex items-center justify-center space-x-1.5">
          <ShieldCheck size={13} className="text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Verified by Sellsull Pay Shields</span>
        </div>

      </div>
    </div>
  );
}
