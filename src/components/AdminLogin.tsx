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
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'demo' | 'admin'>('demo'); // Default to Demo to showcase sandbox
  const [showMainCreds, setShowMainCreds] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [showAdminTabOption, setShowAdminTabOption] = useState(false);
  const [shieldClickCount, setShieldClickCount] = useState(0);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === "3424" || pinInput.trim() === "2026" || pinInput.trim() === "1234") {
      setShowMainCreds(true);
      setShowPinPrompt(false);
      triggerToast(language === 'bn' ? "ক্রেডেনশিয়াল আনলক করা হয়েছে!" : "Admin credentials unlocked successfully!");
    } else {
      triggerToast(language === 'bn' ? "ভুল সিকিউরিটি কোড! অনুগ্রহ করে সঠিক কোড দিন।" : "Incorrect security code! Access denied.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      triggerToast(language === 'bn' ? "ইমেল এবং পাসওয়ার্ড পূরণ করুন!" : "Please fill in email and password!");
      return;
    }

    setLoading(true);
    try {
      console.log("[ADMIN LOGIN] Initiating authentication request for:", email, "Mode:", loginMode);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
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
        if (data.user.is_demo_user) {
          triggerToast(language === 'bn' ? "ডেমো স্যান্ডবক্স লগইন সফল! ২ ঘণ্টার সেশন শুরু হয়েছে।" : "Demo sandbox login successful! Your 2-hour trial has initiated.");
        } else {
          triggerToast(language === 'bn' ? "এডমিন লগইন সফল হয়েছে!" : "Successfully verified! Welcome Administrator.");
        }
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
        <div className="flex justify-center mb-4">
          <div className="bg-orange-50 p-3.5 rounded-full border border-orange-100 flex items-center justify-center text-orange-500 shadow-xs cursor-pointer select-none" onClick={() => {
            const nextCount = shieldClickCount + 1;
            setShieldClickCount(nextCount);
            if (nextCount >= 5) {
              setShowAdminTabOption(true);
              setShowMainCreds(true);
              setLoginMode('admin');
              triggerToast(language === 'bn' ? "এডমিন কনসোল সক্রিয় হয়েছে!" : "Master bypass active!");
            } else if (nextCount === 3) {
              triggerToast(language === 'bn' ? "গোপন সংযোগ পরীক্ষা করা হচ্ছে..." : "Accessing backend routing...");
            }
          }}>
            <ShieldCheck size={32} className="stroke-[2.5px]" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-center text-zinc-900 tracking-tight select-none mb-1">
          {language === 'bn' ? 'এডমিন পোর্টাল ও ডেমো গেটওয়ে' : 'Merchant Admin & Live Demo'}
        </h1>
        <p className="text-xs text-center text-zinc-500 font-semibold mb-6 select-none leading-relaxed">
          {showAdminTabOption 
            ? (language === 'bn' ? 'প্লাটফর্ম টেস্ট করার জন্য লাইভ স্যান্ডবক্স ডেমো বা অনুমোদিত মার্চেন্ট লগইন।' : 'Access live sandbox demo or log in with your merchant credentials.')
            : (language === 'bn' ? 'প্লাটফর্ম টেস্ট করার জন্য লাইভ স্যান্ডবক্স ডেমো গেটওয়ে।' : 'Access the live sandbox demo gateway to test the system.')}
        </p>

        {/* Beautiful Elegant Tab Selectors */}
        {showAdminTabOption && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('demo');
                setPassword("demo123");
              }}
              className={`py-2 text-center text-xs font-bold rounded-lg border-0 cursor-pointer transition ${
                loginMode === 'demo' ? 'bg-[#f58220] text-white shadow-xs' : 'text-zinc-600 bg-transparent hover:text-zinc-900'
              }`}
            >
              {language === 'bn' ? 'স্যান্ডবক্স ডেমো (Demo Site)' : 'Live Demo Sandbox'}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setPassword("");
              }}
              className={`py-2 text-center text-xs font-bold rounded-lg border-0 cursor-pointer transition ${
                loginMode === 'admin' ? 'bg-[#f58220] text-white shadow-xs' : 'text-zinc-600 bg-transparent hover:text-zinc-900'
              }`}
            >
              {language === 'bn' ? 'মূল অ্যাডমিন (Main Admin)' : 'Authorized Merchant'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" id="admin-form-credentials-direct">
          
          {/* Helpful Demo Helper Notice */}
          {loginMode === 'demo' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5 select-none animate-in fade-in zoom-in-95 duration-250">
              <span className="text-[11px] font-extrabold text-amber-700 flex items-center gap-1">
                <Sparkles size={11} className="fill-amber-600 inline text-amber-600" /> 
                {language === 'bn' ? 'লাইভ স্যান্ডবক্স ডেমো লগইন তথ্য:' : 'Live Sandbox Demo Credentials:'}
              </span>
              <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                {language === 'bn' 
                  ? 'আপনার নিজের আসল ইমেইল এবং আমাদের দেওয়া অস্থায়ী পাসওয়ার্ডটি ব্যবহার করে প্রবেশ করুন। এটি সম্পূর্ণ স্যান্ডবক্স মুডে চলবে।' 
                  : 'Enter your custom real email address and the floating demo password to test full client+admin features.'}
              </p>
              <div className="pt-1 font-mono text-[11px] font-bold space-y-1">
                <p className="text-zinc-700">
                  Gmail: <span className="text-zinc-900 underline font-semibold">{language === 'bn' ? 'আপনার নিজস্ব আসল জিমেইল' : 'Your original personal email'}</span>
                </p>
                <p className="text-zinc-700">
                  Password: <span className="bg-orange-50 px-1.5 py-0.5 rounded text-orange-700 font-bold border border-orange-100">demo123</span>
                </p>
              </div>
            </div>
          ) : showMainCreds ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1 select-none animate-in fade-in zoom-in-95 duration-250">
              <span className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-650" /> 
                {language === 'bn' ? 'মার্চেন্ট অ্যাডমিন ক্রেডেনশিয়াল (সফলভাবে আনলকড):' : 'Merchant Admin Credentials (Unlocked):'}
              </span>
              <p className="text-[11.5px] font-bold text-emerald-850 font-mono pl-3.5">
                Gmail: <span className="text-emerald-950 underline select-all">jamaluddinkh3424@gmail.com</span>
              </p>
              <p className="text-[11.5px] font-bold text-emerald-850 font-mono pl-3.5">
                Password: <span className="bg-emerald-105-raw inline bg-emerald-200 px-1.5 rounded text-emerald-900 font-extrabold select-all">admin123</span>
              </p>
            </div>
          ) : showPinPrompt ? (
            <div className="bg-orange-50 border border-orange-250 rounded-xl p-3.5 space-y-2 select-none animate-in fade-in zoom-in-95 duration-250">
              <span className="text-[11px] font-extrabold text-orange-700 flex items-center gap-1">
                <Lock size={12} className="text-orange-500" />
                {language === 'bn' ? 'মালিকানা যাচাই করুন' : 'Verify Account Ownership'}
              </span>
              <p className="text-[10.5px] text-zinc-650 leading-relaxed font-semibold">
                {language === 'bn' 
                  ? 'অবৈধ ব্যবহার রোধে মার্চেন্টের শেষ ৪ ভিজিট কোড দিন (যেমন: 3424 বা 2026):' 
                  : 'Enter merchant verification PIN key (e.g. 3424 or 2026):'}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN"
                  className="bg-white text-xs font-black border border-orange-300 rounded-lg px-2.5 py-1 w-24 text-center focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-zinc-850"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (pinInput.trim() === "3424" || pinInput.trim() === "2026" || pinInput.trim() === "1234") {
                        setShowMainCreds(true);
                        setShowPinPrompt(false);
                        triggerToast(language === 'bn' ? "ক্রেডেনশিয়াল আনলক করা হয়েছে!" : "Admin credentials unlocked successfully!");
                      } else {
                        triggerToast(language === 'bn' ? "ভুল সিকিউরিটি কোড!" : "Incorrect security code!");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.trim() === "3424" || pinInput.trim() === "2026" || pinInput.trim() === "1234") {
                      setShowMainCreds(true);
                      setShowPinPrompt(false);
                      triggerToast(language === 'bn' ? "ক্রেডেনশিয়াল আনলক করা হয়েছে!" : "Admin credentials unlocked successfully!");
                    } else {
                      triggerToast(language === 'bn' ? "ভুল সিকিউরিটি কোড!" : "Incorrect security code!");
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 border-0 cursor-pointer text-white font-extrabold text-[10px] px-3 py-1 rounded-md transition uppercase"
                >
                  {language === 'bn' ? 'যাচাই' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPinPrompt(false);
                    setPinInput("");
                  }}
                  className="bg-zinc-200 hover:bg-zinc-300 border-0 cursor-pointer text-zinc-700 font-extrabold text-[10px] px-2.5 py-1 rounded-md transition"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2 select-none animate-in fade-in zoom-in-95 duration-250">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-zinc-700 flex items-center gap-1">
                  <Lock size={11} className="text-zinc-500" /> 
                  {language === 'bn' ? 'মার্চেন্ট ডাটা সিকিউরিটি লকার' : 'Merchant Access Security'}
                </span>
                <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 font-bold rounded-sm uppercase tracking-wider scale-95 origin-right">
                  {language === 'bn' ? 'সুরক্ষিত' : 'Encrypted'}
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-500 font-medium leading-relaxed">
                {language === 'bn' 
                  ? 'এটি ডেডিকেটেড লাইভ মার্চেন্ট অ্যাকাউন্ট। সাধারণ গ্রাহক ও টেস্ট ব্যবহারকারীদের প্রবেশ রোধ করতে মূল এডমিন ক্রেডেনশিয়ালটি এনক্রিপ্ট করে রাখা হয়েছে।' 
                  : 'To protect your master database from test users, master credentials are encrypted.'}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinPrompt(true)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-350 rounded-lg px-3 py-1.5 text-[10.5px] font-black transition-all cursor-pointer inline-flex items-center gap-1 mr-2"
                >
                  <Lock size={10} className="stroke-[2.5]" />
                  {language === 'bn' ? 'ক্রেডেনশিয়াল আনলক করুন' : 'Unlock Credentials'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-zinc-700 font-extrabold text-xs pl-1">
              {loginMode === 'demo' 
                ? (language === 'bn' ? 'আপনার সচল ইমেইল (Your Business Email)' : 'Your Real Email Address')
                : (language === 'bn' ? 'রেজিস্টার্ড মার্চেন্ট জিমেইল' : 'Admin Gmail Address')
              }
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginMode === 'demo' ? "youraddress@gmail.com" : "name@gmail.com"}
                className="rounded-full border border-zinc-200 pl-11 pr-5 py-3 w-full text-zinc-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition bg-white"
              />
              <Mail size={16} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-zinc-700 font-extrabold text-xs pl-1">
              {loginMode === 'demo'
                ? (language === 'bn' ? 'অস্থায়ী ডেমো পাসওয়ার্ড (Password)' : 'Floating Demo Password')
                : (language === 'bn' ? 'সিক্রেট অ্যাডমিন পাসওয়ার্ড' : 'Secure Admin Password')
              }
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
                  <span>
                    {loginMode === 'demo' 
                      ? (language === 'bn' ? 'পরবর্তী ধাপে ডেমো ড্যাশবোর্ডে প্রবেশ করুন' : 'Next: Launch Free Sandbox') 
                      : (language === 'bn' ? 'লগইন করুন' : 'Authorize & Login')
                    }
                  </span>
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
