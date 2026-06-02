import React, { useState, useEffect } from "react";
import { ShieldCheck, Mail, Lock, Sparkles, Send, CheckCircle, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";

interface AdminLoginProps {
  language: 'en' | 'bn';
  onLoginSuccess: (user: any) => void;
  onCancel: () => void;
  triggerToast: (msg: string) => void;
}

export default function AdminLogin({
  language,
  onLoginSuccess,
  onCancel,
  triggerToast
}: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [loading, setLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  // Poll server helper specifically in development sandbox to detect memory-generated OTP 
  // and render the visual Simulated Email Dispatch notification box
  useEffect(() => {
    let intervalId: any = null;
    
    if (step === "otp") {
      const fetchLatestOTP = async () => {
        try {
          const res = await fetch("/api/admin/latest-otp");
          if (res.ok) {
            const data = await res.json();
            if (data.otp) {
              setSimulatedOtp(data.otp);
            }
          }
        } catch (e) {
          console.error("Error fetching simulated OTP:", e);
        }
      };
      
      // Initial fetch and 1.5s interval polling
      fetchLatestOTP();
      intervalId = setInterval(fetchLatestOTP, 1500);
    } else {
      setSimulatedOtp(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      triggerToast(language === 'bn' ? "ইমেল এবং পাসওয়ার্ড পূরণ করুন!" : "Please fill in email and password!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast(language === 'bn' ? "OTP পাঠানো হয়েছে! ইনবক্স অলটার চেক করুন।" : "OTP request generated! Check simulated inbox.");
        setStep("otp");
      } else {
        triggerToast(data.error || (language === 'bn' ? "লগইন ব্যর্থ হয়েছে!" : "Login request failed!"));
      }
    } catch (err) {
      console.error("Admin OTP request error:", err);
      triggerToast(language === 'bn' ? "সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে!" : "Could not connect to authentication gateway.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      triggerToast(language === 'bn' ? "OTP কোড প্রদান করুন!" : "Please enter the dynamic OTP code!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        triggerToast(language === 'bn' ? "এডমিন লগইন সফল হয়েছে!" : "Successfully verified! Welcome Administrator.");
        onLoginSuccess(data.user);
      } else {
        triggerToast(data.error || (language === 'bn' ? "ভুল OTP কোড!" : "Incorrect dynamic OTP code!"));
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      triggerToast(language === 'bn' ? "সার্ভার এরর ঘটেছে!" : "Network error during validation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] py-14 px-4 min-h-[640px] flex flex-col items-center justify-center font-sans relative overflow-hidden" id="admin-auth-shield-viewport">
      
      {/* Background radial accent flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-10 shadow-xl border border-zinc-200 text-left z-10 relative">
        
        {/* Shield Icon styling */}
        <div className="flex justify-center mb-5">
          <div className="bg-orange-50 p-3.5 rounded-full border border-orange-100 flex items-center justify-center text-orange-500 shadow-xs animate-pulse">
            <ShieldCheck size={32} className="stroke-[2.5px]" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-center text-zinc-900 tracking-tight select-none mb-2">
          {language === 'bn' ? 'এডমিন লকড পোর্টাল' : 'Merchant Administration'}
        </h1>
        <p className="text-xs text-center text-zinc-500 font-semibold mb-8 select-none leading-relaxed">
          {language === 'bn' 
            ? 'শুধুমাত্র অনুমোদিত নাবিক বাজার এডমিনদের জন্য ওয়ান-টাইপ পাসওয়ার্ড (OTP) সেশন।' 
            : 'Secure dynamic single-sign-on (OTP) for authenticated administrators only.'}
        </p>

        {step === "credentials" ? (
          /* ================= STEP 1: GMAIL & PASSWORD FORM ================= */
          <form onSubmit={handleCredentialsSubmit} className="space-y-5" id="admin-form-credentials">
            
            {/* Helpful Helper Notice */}
            <div className="bg-amber-550/10 bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 select-none">
              <span className="text-[11px] font-extrabold text-amber-700 flex items-center gap-1">
                <Sparkles size={11} className="fill-amber-600 inline" /> 
                {language === 'bn' ? 'অনুমোদিত ডেমো ক্রেডেনশিয়াল:' : 'Authorized Demo Credentials:'}
              </span>
              <p className="text-[11.5px] font-bold text-zinc-700 font-mono pl-3.5">
                Gmail: <span className="text-zinc-90 w-full underline">jamaluddinkh3424@gmail.com</span>
              </p>
              <p className="text-[11.5px] font-bold text-zinc-700 font-mono pl-3.5">
                Password: <span className="bg-zinc-100 px-1.5 rounded text-orange-700">admin123</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-700 font-extrabold text-xs pl-1">
                {language === 'bn' ? 'রেজিস্টার্ড জিমেইল (Gmail Address)' : 'Admin Gmail Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="rounded-full border border-zinc-200 pl-11 pr-5 py-3 w-full text-zinc-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition bg-white"
                />
                <Mail size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-700 font-extrabold text-xs pl-1">
                {language === 'bn' ? 'সিক্রেট পাসওয়ার্ড (Password)' : 'Secure Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-full border border-zinc-200 pl-11 pr-5 py-3 w-full text-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition bg-white"
                />
                <Lock size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f58220] hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border-0 cursor-pointer uppercase tracking-wider flex items-center justify-center space-x-2 disabled:bg-orange-300"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin text-white" />
                ) : (
                  <>
                    <span>{language === 'bn' ? 'ওয়ান-টাইম পাসওয়ার্ড পাঠান' : 'Submit Creds & Send OTP'}</span>
                    <Send size={12} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-xs py-3 rounded-full transition-colors border-0 cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowLeft size={12} />
                <span>{language === 'bn' ? 'বাতিল করে শপে ফিরুন' : 'Back to Shopping'}</span>
              </button>
            </div>

          </form>
        ) : (
          /* ================= STEP 2: VERIFY OTP 6-DIGIT CODE ================= */
          <form onSubmit={handleOtpVerifySubmit} className="space-y-5" id="admin-form-verification-otp">
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1 select-none">
              <span className="text-[11.5px] font-extrabold text-emerald-800 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-600 inline" /> 
                {language === 'bn' ? 'OTP রিকোয়েস্ট সফল হয়েছে!' : 'Verification Request Dispatched!'}
              </span>
              <p className="text-[11px] text-zinc-650 leading-relaxed">
                {language === 'bn' 
                  ? `আমরা ${email} অ্যাড্রেসে একটি ৬-সংখ্যার ওয়ান-টাইম পিন পাঠিয়েছি।` 
                  : `A 6-digit administrative session OTP has been dispatched to ${email}.`}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-700 font-extrabold text-xs pl-1">
                {language === 'bn' ? 'ওয়ান-টাইম পাসওয়ার্ড (OTP Code)' : '6-Digit Verification Pin'}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Ex: 582194"
                className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-center text-lg tracking-widest font-black focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition bg-white placeholder-zinc-300"
              />
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f58220] hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border-0 cursor-pointer uppercase tracking-wider flex items-center justify-center space-x-1 disabled:bg-orange-300"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin text-white" />
                ) : (
                  <span>{language === 'bn' ? 'ভেরিফাই এবং প্রবেশ করুন' : 'Verify & Launch Dashboard'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-xs py-3 rounded-full transition-colors border-0 cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowLeft size={12} />
                <span>{language === 'bn' ? 'ক্রেডেনশিয়াল পরিবর্তন করুন' : 'Change credentials'}</span>
              </button>
            </div>

          </form>
        )}

      </div>

      {/* ================= SIMULATED GMAIL POP-UP DISPATCH WARNING ================= */}
      {simulatedOtp && (
        <div 
          className="fixed bottom-6 left-6 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-5 z-55 animate-in slide-in-from-bottom-6 fade-in duration-300 font-sans"
          id="simulated-gmail-inbox-alert"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 select-none">
            <span className="text-[10px] font-black tracking-widest text-[#f58220] uppercase flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
              📬 GMAIL SIMULATOR (LIVE PIN)
            </span>
            <span className="text-[10.5px] font-mono text-slate-400">info@nabikbazar.com</span>
          </div>
          
          <div className="space-y-2 text-left">
            <p className="text-[11px] font-semibold text-slate-300">
              To: <span className="font-mono text-white underline">{email || "jamaluddinkh3424@gmail.com"}</span>
            </p>
            <p className="text-[11.5px] font-black text-rose-300 tracking-tight">
              Subject: Admin 6-Digit Verification Token Code
            </p>
            
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center space-y-1.5">
              <p className="text-[11px] text-slate-400 font-semibold">{language === 'bn' ? 'আপনার লগইন ওয়ান-টাইম পিন:' : 'Your administrative verification passcode is:'}</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl font-black tracking-widest text-emerald-400 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-md select-all">
                  {simulatedOtp}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtp(simulatedOtp);
                    triggerToast(language === 'bn' ? "OTP কপি এবং পেস্ট করা হয়েছে!" : "OTP filled automatically!");
                  }}
                  className="bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-[9px] px-2.5 py-1.5 rounded cursor-pointer border-0 uppercase"
                >
                  Auto Fill
                </button>
              </div>
            </div>
            
            <p className="text-[9.5px] text-slate-450 leading-relaxed font-semibold text-center pt-1 italic text-slate-400">
              Disclaimer: This simulates a real server-side email dispatch in the developer sandbox.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
