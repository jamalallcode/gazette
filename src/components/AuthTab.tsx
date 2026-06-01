import React, { useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

interface AuthTabProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: 'en' | 'bn';
  onLoginSuccess: (user: any) => void;
  triggerToast: (msg: string) => void;
}

export default function AuthTab({
  currentTab,
  setCurrentTab,
  language,
  onLoginSuccess,
  triggerToast
}: AuthTabProps) {
  // Toggle between 'mobile' and 'email' signup types
  const [authType, setAuthType] = useState<'mobile' | 'email'>('mobile');
  
  // Sign up form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referCode, setReferCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign In form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginType, setLoginType] = useState<'mobile' | 'email'>('mobile');

  const isSignUp = currentTab === 'signup';

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleLoginPassword = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  // Simulated registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      triggerToast(language === 'bn' ? "প্রথম নাম আবশ্যক!" : "First Name is required!");
      return;
    }
    if (!lastName.trim()) {
      triggerToast(language === 'bn' ? "শেষ নাম আবশ্যক!" : "Last Name is required!");
      return;
    }

    if (authType === 'mobile') {
      if (!phone.trim()) {
        triggerToast(language === 'bn' ? "ফোন নম্বর আবশ্যক!" : "Phone Number is required!");
        return;
      }
      if (!phone.startsWith("880") && !phone.startsWith("+880")) {
        triggerToast(
          language === 'bn' 
            ? "বাংলাদেশি দেশের কোড (৮৮০...) দিয়ে ফোন নম্বর শুরু করুন!"
            : "Phone Number must start with BD country code (880...)!"
        );
        return;
      }
    } else {
      if (!email.trim() || !email.includes("@")) {
        triggerToast(language === 'bn' ? "সঠিক ইমেইল এড্রেস প্রদান করুন!" : "Please enter a valid email address!");
        return;
      }
    }

    if (password.length < 8) {
      triggerToast(
        language === 'bn' 
          ? "পাসওয়ার্ড অবশ্যই কমপক্ষে ৮ অক্ষরের হতে হবে!" 
          : "Password must be at least 8 characters long!"
      );
      return;
    }

    if (!agreeTerms) {
      triggerToast(
        language === 'bn'
          ? "দয়া করে আমাদের শর্তাবলীর সাথে সম্মত হন!"
          : "Please agree to our Terms and conditions!"
      );
      return;
    }

    // Success Simulation
    const mockUser = {
      firstName,
      lastName,
      phone: authType === 'mobile' ? phone : "",
      email: authType === 'email' ? email : "",
      password,
      referCode
    };

    // Save mock user to memory/local storage
    const users = JSON.parse(localStorage.getItem("nabik_registered_users") || "[]");
    users.push(mockUser);
    localStorage.setItem("nabik_registered_users", JSON.stringify(users));

    triggerToast(
      language === 'bn'
        ? `নিবন্ধন সফল হয়েছে! স্বাগতম, ${firstName}!`
        : `Registration successful! Welcome, ${firstName}!`
    );

    // Call success handler
    onLoginSuccess(mockUser);
    setCurrentTab('shop');
  };

  // Simulated Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginIdentifier.trim()) {
      triggerToast(
        loginType === 'mobile' 
          ? (language === 'bn' ? "ফোন নম্বর দিন!" : "Please enter your phone number!")
          : (language === 'bn' ? "ইমেল এড্রেস দিন!" : "Please enter your email address!")
      );
      return;
    }

    if (!loginPassword) {
      triggerToast(language === 'bn' ? "পাসওয়ার্ড দিন!" : "Please enter your password!");
      return;
    }

    // Attempt simulation logic (checks if matches existing stored user, or fallback match)
    const users = JSON.parse(localStorage.getItem("nabik_registered_users") || "[]");
    const foundUser = users.find((u: any) => {
      if (loginType === 'mobile') {
        return u.phone === loginIdentifier && u.password === loginPassword;
      } else {
        return u.email === loginIdentifier && u.password === loginPassword;
      }
    });

    if (foundUser) {
      onLoginSuccess(foundUser);
      triggerToast(
        language === 'bn' 
          ? `স্বাগতম ব্যাক, ${foundUser.firstName}!` 
          : `Welcome back, ${foundUser.firstName}!`
      );
      setCurrentTab('shop');
    } else {
      // Create a fallback user if they type password matching demo
      const fallbackUser = {
        firstName: "Guest",
        lastName: "Client",
        phone: loginType === 'mobile' ? loginIdentifier : "",
        email: loginType === 'email' ? loginIdentifier : "guest@mail.com",
        password: loginPassword,
        referCode: ""
      };
      
      onLoginSuccess(fallbackUser);
      triggerToast(
        language === 'bn' 
          ? `সিমুলেটর দিয়ে সাকসেস লগন সম্পন্ন হয়েছে!` 
          : `Logged in successfully via auth simulator!`
      );
      setCurrentTab('shop');
    }
  };

  const handleGoogleLogin = () => {
    const googleUser = {
      firstName: "Google",
      lastName: "User",
      phone: "",
      email: "googleuser@gmail.com",
      password: "google_oauth_bypass",
      referCode: ""
    };
    onLoginSuccess(googleUser);
    triggerToast(
      language === 'bn'
        ? "গুগল সাইন ইন সফল হয়েছে!"
        : "Google login simulation successful!"
    );
    setCurrentTab('shop');
  };

  return (
    <div className="bg-[#f8f9fa] py-12 px-4 shadow-3xs min-h-[600px] flex items-center justify-center font-sans">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-10 shadow-md border border-zinc-150 text-left">
        
        {/* Tab Title exactly matched with high-fidelity casing */}
        <h1 className="text-3xl font-bold text-zinc-90 w-full text-center text-zinc-900 tracking-tight select-none mb-8">
          {isSignUp ? (language === 'bn' ? 'সাইন আপ' : 'Sign Up') : (language === 'bn' ? 'সাইন ইন' : 'Sign In')}
        </h1>

        {/* 1. Pill switches for Mobile vs Email signup */}
        <div className="flex justify-center items-center space-x-3 mb-10 select-none">
          {isSignUp ? (
            <>
              <button
                type="button"
                onClick={() => setAuthType('mobile')}
                className={`px-6 py-3 rounded-lg text-xs font-extrabold tracking-wide border-0 transition duration-200 cursor-pointer ${
                  authType === 'mobile'
                    ? "bg-[#f58220] text-white shadow-lg shadow-orange-550/20"
                    : "bg-orange-50 text-[#f58220] hover:bg-orange-100/60"
                }`}
              >
                {language === 'bn' ? "মোবাইল দিয়ে সাইন আপ" : "Sign up with Mobile"}
              </button>
              <button
                type="button"
                onClick={() => setAuthType('email')}
                className={`px-6 py-3 rounded-lg text-xs font-extrabold tracking-wide border-0 transition duration-200 cursor-pointer ${
                  authType === 'email'
                    ? "bg-[#f58220] text-white shadow-lg shadow-orange-550/20"
                    : "bg-orange-50 text-[#f58220] hover:bg-orange-100/60"
                }`}
              >
                {language === 'bn' ? "ইমেল দিয়ে সাইন আপ" : "Sign up with Email"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setLoginType('mobile')}
                className={`px-6 py-3 rounded-lg text-xs font-extrabold tracking-wide border-0 transition duration-200 cursor-pointer ${
                  loginType === 'mobile'
                    ? "bg-[#f58220] text-white shadow-lg shadow-orange-550/20"
                    : "bg-orange-50 text-[#f58220] hover:bg-orange-100/60"
                }`}
              >
                {language === 'bn' ? "মোবাইল দিয়ে লগইন" : "Sign in with Mobile"}
              </button>
              <button
                type="button"
                onClick={() => setLoginType('email')}
                className={`px-6 py-3 rounded-lg text-xs font-extrabold tracking-wide border-0 transition duration-200 cursor-pointer ${
                  loginType === 'email'
                    ? "bg-[#f58220] text-white shadow-lg shadow-orange-550/20"
                    : "bg-orange-50 text-[#f58220] hover:bg-orange-100/60"
                }`}
              >
                {language === 'bn' ? "ইমেল দিয়ে লগইন" : "Sign in with Email"}
              </button>
            </>
          )}
        </div>

        {isSignUp ? (
          /* ================== SIGN UP FORM ================== */
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            
            {/* Input Row: First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5 text-left">
                <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                  {language === 'bn' ? 'ফাস্ট নেম (First Name)' : 'First Name'}
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200 bg-white"
                  placeholder="Ex: Doe"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                  {language === 'bn' ? 'লাস্ট নেম (Last Name)' : 'Last Name'}
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200 bg-white"
                  placeholder="Ex: Doe"
                />
              </div>

            </div>

            {/* Input Row: Phone Number or Email & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {authType === 'mobile' ? (
                <div className="space-y-1.5 text-left">
                  <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                    <span>{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</span>
                    <span className="text-[10px] text-orange-500 font-bold tracking-tight ml-1 font-sans">
                      ( * Country Code Is Must Like For BD 880 )
                    </span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200 bg-white font-mono"
                    placeholder="Enter phone number"
                  />
                </div>
              ) : (
                <div className="space-y-1.5 text-left">
                  <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                    <span>{language === 'bn' ? 'ইমেল এড্রেস' : 'Email Address'}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200 bg-white"
                    placeholder="Enter email address"
                  />
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200 bg-white pr-14"
                    placeholder="Minimum 8 characters long"
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-650 flex items-center justify-center border-0 bg-transparent cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

            </div>

            {/* Input Row: Refer Code (Optional) */}
            <div className="space-y-1.5 text-left w-full">
              <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                <span>{language === 'bn' ? 'রেফার কোড' : 'Refer Code'}</span>
                <span className="text-[10px] text-zinc-400 font-normal ml-1">(Optional)</span>
              </label>
              <input
                type="text"
                value={referCode}
                onChange={(e) => setReferCode(e.target.value)}
                className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200 bg-white"
                placeholder="Use referral code"
              />
            </div>

            {/* Checklist Checkbox: Perfectly matches layout spelling and capitalization */}
            <div className="flex items-center space-x-3 select-none py-1 text-left">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4.5 w-4.5 accent-[#f58220] border-zinc-300 rounded focus:ring-0 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-zinc-700 font-bold text-xs sm:text-sm cursor-pointer select-none">
                {language === 'bn' ? 'আমি আপনার শর্তাবলীতে সম্মত আছি' : 'I agree to Your Terms and conditions'}
              </label>
            </div>

            {/* Orange centered sign up button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="bg-[#f58220] hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-sm px-14 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-0 cursor-pointer uppercase tracking-wider"
              >
                {language === 'bn' ? 'নিবন্ধন করুন' : 'Sign up'}
              </button>
            </div>

          </form>
        ) : (
          /* ================== SIGN IN FORM ================== */
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {loginType === 'mobile' ? (
                <div className="space-y-1.5 text-left">
                  <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                    <span>{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</span>
                    <span className="text-[10px] text-zinc-400 font-normal ml-1">(e.g. 88017...)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200 bg-white font-mono"
                    placeholder="Enter phone number"
                  />
                </div>
              ) : (
                <div className="space-y-1.5 text-left">
                  <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                    <span>{language === 'bn' ? 'ইমেল এড্রেস' : 'Email Address'}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-805 text-zinc-805 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200"
                    placeholder="Enter email address"
                  />
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="block text-zinc-700 font-bold text-xs select-none pl-1">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="rounded-full border border-zinc-200 px-6 py-3.5 w-full text-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f58220]/20 focus:border-[#f58220] transition duration-200 bg-white pr-14"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={handleToggleLoginPassword}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-650 flex items-center justify-center border-0 bg-transparent cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

            </div>

            {/* Orange centered login button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-[#f58220] hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-sm px-14 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-0 cursor-pointer uppercase tracking-wider"
              >
                {language === 'bn' ? 'লগইন করুন' : 'Sign in'}
              </button>
            </div>

          </form>
        )}

        {/* Divider with centered continuous text, styled in high-fidelity BDT layout */}
        <div className="relative my-8 text-center select-none">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-150"></div>
          </div>
          <span className="relative bg-white px-5 text-xs text-zinc-400 font-bold uppercase tracking-wider">
            {language === 'bn' ? 'অথবা দিয়ে কন্টিনিউ করুন' : 'Or continue with'}
          </span>
        </div>

        {/* Google sign-in badge action button */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="h-12 w-12 rounded-full border border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50 flex items-center justify-center cursor-pointer transition shadow-3xs duration-205 bg-white border-0 p-0"
            aria-label="Continue with Google"
          >
            <svg 
              className="h-5.5 w-5.5" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                fill="#4285F4" 
              />
              <path 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                fill="#34A853" 
              />
              <path 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" 
                fill="#FBBC05" 
              />
              <path 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" 
                fill="#EA4335" 
              />
            </svg>
          </button>
        </div>

        {/* Dynamic bottom switches linking Sign Up and Sign In */}
        <div className="text-center font-bold text-xs sm:text-xs select-none">
          {isSignUp ? (
            <span className="text-zinc-500">
              {language === 'bn' ? 'ইতিমধ্যেই একটি অ্যাকাউন্ট আছে? ' : 'Already have account ? '}
              <button
                type="button"
                onClick={() => setCurrentTab('signin')}
                className="text-[#f58220] hover:text-orange-600 underline font-extrabold ml-1 bg-transparent border-0 cursor-pointer p-0"
              >
                {language === 'bn' ? 'লগইন করুন' : 'Sign in'}
              </button>
            </span>
          ) : (
            <span className="text-zinc-500">
              {language === 'bn' ? 'কোনো অ্যাকাউন্ট নেই? ' : "Don't have an account ? "}
              <button
                type="button"
                onClick={() => setCurrentTab('signup')}
                className="text-[#f58220] hover:text-orange-600 underline font-extrabold ml-1 bg-transparent border-0 cursor-pointer p-0"
              >
                {language === 'bn' ? 'রেজিস্টার করুন' : 'Sign up'}
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
