import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, Sparkles, ArrowLeft, RefreshCw, LogIn } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      triggerToast(language === 'bn' ? "ইমেল এবং পাসওয়ার্ড পূরণ করুন!" : "Please fill in email and password!");
      return;
    }

    setLoading(true);
    try {
      console.log("[ADMIN LOGIN] Initiating authentication request for:", email);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const responseText = await response.text();
      console.log("[ADMIN LOGIN] Received raw response text:", responseText);

      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("[ADMIN LOGIN] Failed to parse response as JSON. Raw text was:", responseText);
        throw new Error(language === 'bn' 
          ? `সার্ভার থেকে ত্রুটিপূর্ণ উত্তর পাওয়া গেছে! (Status: ${response.status})` 
          : `Invalid server response format! (Status: ${response.status})`
        );
      }

      if (response.ok && data.success) {
        triggerToast(language === 'bn' ? "এডমিন লগইন সফল হয়েছে!" : "Successfully verified! Welcome Administrator.");
        onLoginSuccess(data.user);
      } else {
        triggerToast(data.error || (language === 'bn' ? "লগইন ব্যর্থ হয়েছে! সঠিক ইমেল এবং পাসওয়ার্ড ব্যবহার করুন।" : "Login failed! Please check your credentials."));
      }
    } catch (err: any) {
      console.error("Admin login error context:", err);
      triggerToast(err.message || (language === 'bn' ? "সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে!" : "Could not connect to the authentication gateway."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] py-14 px-4 min-h-[600px] flex flex-col items-center justify-center font-sans relative overflow-hidden" id="admin-auth-shield-viewport">
      
      {/* Background radial accent flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-10 shadow-xl border border-zinc-200 text-left z-10 relative">
        
        {/* Shield Icon styling */}
        <div className="flex justify-center mb-5">
          <div className="bg-orange-50 p-3.5 rounded-full border border-orange-100 flex items-center justify-center text-orange-500 shadow-xs">
            <ShieldCheck size={32} className="stroke-[2.5px]" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-center text-zinc-900 tracking-tight select-none mb-2">
          {language === 'bn' ? 'এডমিন পোর্টাল লগইন' : 'Merchant Administration'}
        </h1>
        <p className="text-xs text-center text-zinc-500 font-semibold mb-8 select-none leading-relaxed">
          {language === 'bn' 
            ? 'শুধুমাত্র অনুমোদিত নাবিক বাজার এডমিনদের জন্য সিক্রেট সেশন।' 
            : 'Secure authentication window for authorized administrators only.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" id="admin-form-credentials-direct">
          
          {/* Helpful Demo Helper Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1 select-none">
            <span className="text-[11px] font-extrabold text-amber-700 flex items-center gap-1">
              <Sparkles size={11} className="fill-amber-600 inline" /> 
              {language === 'bn' ? 'অনুমোদিত ডেমো ক্রেডেনশিয়াল:' : 'Authorized Demo Credentials:'}
            </span>
            <p className="text-[11.5px] font-bold text-zinc-700 font-mono pl-3.5">
              Gmail: <span className="text-zinc-900 underline">jamaluddinkh3424@gmail.com</span>
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
                  <span>{language === 'bn' ? 'লগইন করুন' : 'Authorize & Login'}</span>
                  <LogIn size={13} />
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

      </div>

    </div>
  );
}
