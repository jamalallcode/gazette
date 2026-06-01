import React, { useState } from "react";
import { TenantConfig, PRESET_TENANTS, saveTenant, lockResellerFeature } from "../data/tenantConfig";
import { PremiumTheme, PREMIUM_THEMES } from "../data/premiumThemes";
import { 
  Settings, 
  X, 
  Check, 
  Copy, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  Save, 
  RefreshCw, 
  Smartphone, 
  Mail, 
  MapPin, 
  Palette, 
  ToggleLeft,
  BookOpen,
  Lock
} from "lucide-react";

interface ResellerConfigPanelProps {
  activeTenant: TenantConfig;
  setActiveTenant: (tenant: TenantConfig) => void;
  language: 'en' | 'bn';
  triggerToast: (msg: string) => void;
}

export default function ResellerConfigPanel({
  activeTenant,
  setActiveTenant,
  language,
  triggerToast
}: ResellerConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string>(activeTenant.id);

  React.useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setActiveSubTab('presets');
    };
    window.addEventListener("open-reseller-panel", handleOpen);
    return () => {
      window.removeEventListener("open-reseller-panel", handleOpen);
    };
  }, []);

  const handleLockSession = () => {
    lockResellerFeature();
    triggerToast(
      language === 'bn'
        ? "রিসেলার প্যানেল সম্পূর্ণ লক করা হয়েছে! পুনরায় চালু করতে ডোমেইন এর শেষে '?reseller=true' যোগ করুন।"
        : "Reseller Panel locked! Append '?reseller=true' to the URL to reopen at any time."
    );
    setIsOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  // Form states matching TenantConfig
  const [shopName, setShopName] = useState(activeTenant.shopName);
  const [shopNameBn, setShopNameBn] = useState(activeTenant.shopNameBn);
  const [tagline, setTagline] = useState(activeTenant.tagline);
  const [taglineBn, setTaglineBn] = useState(activeTenant.taglineBn);
  const [phone, setPhone] = useState(activeTenant.phone);
  const [email, setEmail] = useState(activeTenant.email);
  const [address, setAddress] = useState(activeTenant.address);
  const [addressBn, setAddressBn] = useState(activeTenant.addressBn);
  const [whatsappNumber, setWhatsappNumber] = useState(activeTenant.whatsappNumber);
  const [primaryColor, setPrimaryColor] = useState(activeTenant.primaryColor);
  const [hoverColor, setHoverColor] = useState(activeTenant.hoverColor);
  const [bgLightColor, setBgLightColor] = useState(activeTenant.bgLightColor);

  // Feature state toggles
  const [enableAiAdvisor, setEnableAiAdvisor] = useState(activeTenant.enableAiAdvisor);
  const [enableSellerZone, setEnableSellerZone] = useState(activeTenant.enableSellerZone);
  const [enableDiscountedProducts, setEnableDiscountedProducts] = useState(activeTenant.enableDiscountedProducts);
  const [enableTrackOrder, setEnableTrackOrder] = useState(activeTenant.enableTrackOrder);
  const [enableBrandCarousel, setEnableBrandCarousel] = useState(activeTenant.enableBrandCarousel);
  const [enableWhatsappFloat, setEnableWhatsappFloat] = useState(activeTenant.enableWhatsappFloat);
  const [enableVendorModal, setEnableVendorModal] = useState(activeTenant.enableVendorModal);

  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'themes' | 'customize' | 'deploy'>('presets');
  const [themeSearch, setThemeSearch] = useState("");
  const [themeCategory, setThemeCategory] = useState<string>("all");

  const filteredThemes = PREMIUM_THEMES.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(themeSearch.toLowerCase()) || 
                          theme.nameBn.includes(themeSearch) || 
                          theme.category.toLowerCase().includes(themeSearch.toLowerCase()) || 
                          theme.categoryBn.includes(themeSearch) ||
                          theme.shopName.toLowerCase().includes(themeSearch.toLowerCase()) ||
                          theme.shopNameBn.includes(themeSearch);
    
    if (themeCategory === 'all') return matchesSearch;
    if (themeCategory === 'fashion') {
      return matchesSearch && ['chic-rose', 'crimson-velvet', 'plum-velvet', 'sunset-pink'].includes(theme.id);
    }
    if (themeCategory === 'food') {
      return matchesSearch && ['organic-green', 'golden-honey', 'mint-garden'].includes(theme.id);
    }
    if (themeCategory === 'tech') {
      return matchesSearch && ['electro-blue', 'cosmic-purple', 'cyber-indigo', 'solar-yellow', 'stealth-matte'].includes(theme.id);
    }
    if (themeCategory === 'lifestyle') {
      return matchesSearch && ['nabik-classic', 'arctic-cyan', 'minimal-mono', 'autumn-coral', 'ocean-breeze', 'safari-earth'].includes(theme.id);
    }
    return matchesSearch;
  });

  const handleSelectPremiumTheme = (theme: PremiumTheme) => {
    setActivePreset(theme.id);
    setShopName(theme.shopName);
    setShopNameBn(theme.shopNameBn);
    setTagline(theme.tagline);
    setTaglineBn(theme.taglineBn);
    setPrimaryColor(theme.primaryColor);
    setHoverColor(theme.hoverColor);
    setBgLightColor(theme.bgLightColor);

    // Merge directly into current tenant config
    const updated: TenantConfig = {
      ...activeTenant,
      id: theme.id,
      shopName: theme.shopName,
      shopNameBn: theme.shopNameBn,
      tagline: theme.tagline,
      taglineBn: theme.taglineBn,
      primaryColor: theme.primaryColor,
      hoverColor: theme.hoverColor,
      bgLightColor: theme.bgLightColor,
    };

    setActiveTenant(updated);
    saveTenant(updated);
    triggerToast(
      language === 'bn' 
        ? `ডিজাইন সক্রিয় করা হয়েছে: ${theme.nameBn}!` 
        : `Applied Premium Theme: ${theme.name}!`
    );
  };

  // Trigger when selecting a pre-built tenant preset
  const handleSelectPreset = (preset: TenantConfig) => {
    setActivePreset(preset.id);
    setShopName(preset.shopName);
    setShopNameBn(preset.shopNameBn);
    setTagline(preset.tagline);
    setTaglineBn(preset.taglineBn);
    setPhone(preset.phone);
    setEmail(preset.email);
    setAddress(preset.address);
    setAddressBn(preset.addressBn);
    setWhatsappNumber(preset.whatsappNumber);
    setPrimaryColor(preset.primaryColor);
    setHoverColor(preset.hoverColor);
    setBgLightColor(preset.bgLightColor);
    setEnableAiAdvisor(preset.enableAiAdvisor);
    setEnableSellerZone(preset.enableSellerZone);
    setEnableDiscountedProducts(preset.enableDiscountedProducts);
    setEnableTrackOrder(preset.enableTrackOrder);
    setEnableBrandCarousel(preset.enableBrandCarousel);
    setEnableWhatsappFloat(preset.enableWhatsappFloat);
    setEnableVendorModal(preset.enableVendorModal);

    // Set globally
    setActiveTenant(preset);
    saveTenant(preset);
    triggerToast(
      language === 'bn' 
        ? `প্রিসেট স্যুইচ করা হয়েছে: ${preset.shopNameBn}!` 
        : `Switched to Preset: ${preset.shopName}!`
    );
  };

  // Save the customized tenant configurations
  const handleSaveCustomConfig = () => {
    const updated: TenantConfig = {
      ...activeTenant,
      id: "custom-tenant",
      name: `Custom (${shopName})`,
      shopName,
      shopNameBn,
      tagline,
      taglineBn,
      phone,
      email,
      address,
      addressBn,
      whatsappNumber,
      primaryColor,
      hoverColor,
      bgLightColor,
      enableAiAdvisor,
      enableSellerZone,
      enableDiscountedProducts,
      enableTrackOrder,
      enableBrandCarousel,
      enableWhatsappFloat,
      enableVendorModal
    };

    setActiveTenant(updated);
    saveTenant(updated);
    triggerToast(
      language === 'bn' 
        ? "কনফিগারেশন সফলভাবে সেভ করা হয়েছে এবং অ্যাপ্লাই করা হয়েছে!" 
        : "Configurations successfully saved & applied!"
    );
  };

  const generatedTypeScriptCode = `export const MY_CUSTOM_CLIENT: TenantConfig = {
  id: "${shopName.toLowerCase().replace(/\s+/g, '-')}",
  name: "${shopName}",
  shopName: "${shopName}",
  shopNameBn: "${shopNameBn}",
  tagline: "${tagline}",
  taglineBn: "${taglineBn}",
  logoUrl: "",
  phone: "${phone}",
  email: "${email}",
  address: "${address}",
  addressBn: "${addressBn}",
  whatsappNumber: "${whatsappNumber}",
  whatsappMessage: "Hello! Inquiry from ${shopName} store.",
  defaultCurrency: "BDT",
  defaultLanguage: "bn",
  primaryColor: "${primaryColor}",
  hoverColor: "${hoverColor}",
  bgLightColor: "${bgLightColor}",
  enableAiAdvisor: ${enableAiAdvisor},
  enableSellerZone: ${enableSellerZone},
  enableDiscountedProducts: ${enableDiscountedProducts},
  enableTrackOrder: ${enableTrackOrder},
  enableBrandCarousel: ${enableBrandCarousel},
  enableWhatsappFloat: ${enableWhatsappFloat},
  enableVendorModal: ${enableVendorModal}
};`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(generatedTypeScriptCode);
    triggerToast(
      language === 'bn' 
        ? "কোড ক্লিপবোর্ডে কপি করা হয়েছে!" 
        : "TypeScript configuration copied to clipboard!"
    );
  };

  return (
    <>
      {/* 2. Side Panel Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-2xl z-[99999] flex justify-end font-sans">
          <div className="w-full max-w-lg bg-white h-screen flex flex-col shadow-2xl relative text-left">
            
            {/* Header */}
            <div className="bg-zinc-900 text-white p-5 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Settings size={20} className="text-yellow-450 animate-pulse text-brand" style={{ color: 'var(--brand-color)' }} />
                <div className="text-left">
                  <h3 className="text-sm font-black tracking-tight leading-none">
                    {language === 'bn' ? 'নাবিক রিসেলার ও ক্লোনিং স্যুট' : 'Reseller White-label Panel'}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-bold mt-1 block">
                    {language === 'bn' ? 'যেকোনো ক্লায়েন্টের জন্য সাইটটি কাস্টমাইজ করুন' : 'Clone & customize this eCommerce site in real-time'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLockSession}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-650 hover:bg-red-700 text-[10px] font-black text-white uppercase rounded-md border-0 cursor-pointer shadow-sm transition"
                  style={{ backgroundColor: '#dc2626' }}
                  title={language === 'bn' ? 'রিসেলার প্যানেল লক করুন যাতে সাধারণ ভিজিটররা দেখতে না পারে' : 'Lock panel access so normal users cannot find it'}
                >
                  <Lock size={11} />
                  <span>{language === 'bn' ? 'প্যানেল লক করুন' : 'Lock Panel'}</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-450 hover:text-white p-1 rounded-full hover:bg-zinc-850 cursor-pointer border-0 bg-transparent flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Links / Sub Tabs */}
            <div className="flex border-b border-zinc-150 select-none bg-zinc-50 flex-wrap">
              <button
                onClick={() => setActiveSubTab('presets')}
                className={`flex-1 min-w-[80px] py-2.5 text-[10.5px] font-black uppercase text-center border-b-2 cursor-pointer transition ${
                  activeSubTab === 'presets' 
                    ? "border-brand text-brand bg-white" 
                    : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {language === 'bn' ? '১. প্রিসেট' : '1. Presets'}
              </button>
              <button
                onClick={() => setActiveSubTab('themes')}
                className={`flex-1 min-w-[100px] py-2.5 text-[10.5px] font-black uppercase text-center border-b-2 cursor-pointer transition ${
                  activeSubTab === 'themes' 
                    ? "border-brand text-brand bg-white" 
                    : "border-transparent text-zinc-500 hover:text-zinc-808"
                }`}
              >
                {language === 'bn' ? '২. ১৭+ প্রিমিয়াম থিম' : '2. 17+ Themes'}
              </button>
              <button
                onClick={() => setActiveSubTab('customize')}
                className={`flex-1 min-w-[80px] py-2.5 text-[10.5px] font-black uppercase text-center border-b-2 cursor-pointer transition ${
                  activeSubTab === 'customize' 
                    ? "border-brand text-brand bg-white" 
                    : "border-transparent text-zinc-500 hover:text-zinc-805"
                }`}
              >
                {language === 'bn' ? '৩. কাস্টমাইজ' : '3. Customize'}
              </button>
              <button
                onClick={() => setActiveSubTab('deploy')}
                className={`flex-1 min-w-[100px] py-2.5 text-[10.5px] font-black uppercase text-center border-b-2 cursor-pointer transition ${
                  activeSubTab === 'deploy' 
                    ? "border-brand text-brand bg-white" 
                    : "border-transparent text-zinc-500 hover:text-zinc-805"
                }`}
              >
                {language === 'bn' ? '৪. হোস্টিং গাইড' : '4. Hosting'}
              </button>
            </div>

            {/* Body Scroll area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {activeSubTab === 'presets' && (
                <div className="space-y-4">
                  <div className="bg-orange-50/70 rounded-xl p-4 border border-orange-100 text-xs text-orange-850 leading-relaxed">
                    <strong>💡 {language === 'bn' ? 'সহজ ক্লোনিং গাইড:' : 'Easy Reseller / Pitching Mode:'}</strong>{' '}
                    {language === 'bn' 
                      ? 'নিচে বিভিন্ন ক্যাটাগরির ডেমো প্রিসেট রয়েছে। আপনার ক্লায়েন্ট ডেমো দেখতে চাইলে স্রেফ ১ ক্লিকে পুরো সাইটের নাম, ভাষা, কারেন্সি, এবং কালার স্কিম পরিবর্তন করে তাকে দেখাতে পারবেন!' 
                      : 'These templates let you switch identities instantly. You can pitch the same software with custom names, logos, color palettes, and languages to retail, organic organic food, tech, or clothing clients.'}
                  </div>

                  <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider pl-1">
                    {language === 'bn' ? 'প্রস্তুত ডেমো লিস্টিং' : 'SELECT PRE-CONFIGURED CLIENTS'}
                  </h4>

                  <div className="grid grid-cols-1 gap-3.5">
                    {PRESET_TENANTS.map((tenant) => {
                      const isActive = activePreset === tenant.id;
                      return (
                        <div
                          key={tenant.id}
                          onClick={() => handleSelectPreset(tenant)}
                          className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 select-none text-left relative overflow-hidden flex items-center justify-between ${
                            isActive 
                              ? "border-brand bg-brand-light shadow-md"
                              : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50"
                          }`}
                        >
                          {/* Left Details */}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-sm text-zinc-900 font-sans">
                                {language === 'bn' ? tenant.shopNameBn : tenant.shopName}
                              </span>
                              <span 
                                className="inline-block h-3 w-3 rounded-full border border-white"
                                style={{ backgroundColor: tenant.primaryColor }}
                              />
                            </div>
                            <p className="text-[11px] text-zinc-500 font-medium mt-1">
                              {language === 'bn' ? tenant.taglineBn : tenant.tagline}
                            </p>
                            <div className="flex items-center space-x-3.5 mt-2 text-[10px] text-zinc-400 font-bold">
                              <span>📞 {tenant.phone}</span>
                              <span>✉️ {tenant.email.split("@")[0]}</span>
                            </div>
                          </div>

                          {/* Active state pill */}
                          {isActive && (
                            <span className="bg-brand text-white text-[9px] font-black uppercase px-2 py-1 rounded-md flex items-center space-x-0.5">
                              <Check size={9} strokeWidth={4} />
                              <span>{language === 'bn' ? 'চলতি' : 'Active'}</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSubTab === 'themes' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-100 text-xs text-indigo-950 leading-relaxed">
                    <strong>✨ {language === 'bn' ? '১৭+ প্রিমিয়াম থিম লাইব্রেরি:' : '17+ Premium Themes Catalog:'}</strong>{' '}
                    {language === 'bn' 
                      ? 'নির্দিষ্ট ডেমো থিম বেছে নিয়ে ১-ক্লিকেই পুরো ই-কমার্স স্টোরের চমৎকার ডিজাইন স্কিম, লোগো ভাইব ও ব্র্যান্ড কম্বিনেশন পরিবর্তন করুন! ক্লায়েন্টকে লাইভ ডেমো দেখানোর জন্য এটি অত্যন্ত কার্যকর।' 
                      : 'Choose from our 17+ high-end designs. Switch instantly to preview layout styling tailored for various industries like tech gadgets, fashion boutique, green organic groceries, and more.'}
                  </div>

                  {/* Search and Filters inside Themes panel */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={language === 'bn' ? "থিম বা ক্যাটাগরি সার্চ করুন..." : "Search premium themes..."}
                        value={themeSearch}
                        onChange={(e) => setThemeSearch(e.target.value)}
                        className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
                      />
                      <span className="absolute left-3.5 top-3 text-xs text-zinc-400">🔍</span>
                      {themeSearch && (
                        <button
                          type="button"
                          onClick={() => setThemeSearch("")}
                          className="absolute right-3 top-2.5 text-xs text-zinc-405 text-zinc-400 hover:text-zinc-700 bg-transparent border-0 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-1.5 pb-1 select-none">
                      {[
                        { id: 'all', label: language === 'bn' ? 'সব থিম' : 'All' },
                        { id: 'fashion', label: language === 'bn' ? 'পোশাক ও ফ্যাশন' : 'Fashion' },
                        { id: 'food', label: language === 'bn' ? 'খাদ্য ও গ্রোসারি' : 'Food' },
                        { id: 'tech', label: language === 'bn' ? 'টেক ও গ্যাজেটস' : 'Tech' },
                        { id: 'lifestyle', label: language === 'bn' ? 'লাইফস্টাইল ও আদার্স' : 'Lifestyle' }
                      ].map((pill) => (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setThemeCategory(pill.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer transition ${
                            themeCategory === pill.id
                              ? 'bg-zinc-900 border-zinc-900 text-white'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <h5 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest pl-1">
                    {language === 'bn' ? `${filteredThemes.length}টি প্রিমিয়াম থিম পাওয়া গেছে` : `${filteredThemes.length} PREMIUM DESIGN TEMPLATES`}
                  </h5>

                  {/* Themes list view with visual color previews */}
                  <div className="grid grid-cols-1 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
                    {filteredThemes.map((theme) => {
                      const isActive = activePreset === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => handleSelectPremiumTheme(theme)}
                          className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 select-none text-left relative overflow-hidden flex flex-col justify-between ${
                            isActive 
                              ? "border-brand bg-amber-500/5 shadow-md ring-1 ring-brand/35"
                              : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50"
                          }`}
                        >
                          {/* Inner Layout Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <span className="text-2xl pt-0.5">{theme.icon}</span>
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-1.5 flex-wrap">
                                  <span className="font-extrabold text-sm text-zinc-900 font-sans">
                                    {language === 'bn' ? theme.nameBn : theme.name}
                                  </span>
                                  {/* Badge style */}
                                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded leading-none ${
                                    theme.badge === 'Hot' ? 'bg-rose-100 text-rose-700' :
                                    theme.badge === 'Exclusive' ? 'bg-amber-100 text-amber-700' :
                                    theme.badge === 'Trending' ? 'bg-violet-100 text-violet-700' :
                                    theme.badge === 'New' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-indigo-100 text-indigo-700'
                                  }`}>
                                    {theme.badge}
                                  </span>
                                </div>
                                <span className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                  {language === 'bn' ? theme.categoryBn : theme.category}
                                </span>
                              </div>
                            </div>

                            {/* Active indicator */}
                            {isActive ? (
                              <span className="bg-brand text-white text-[9px] font-black uppercase px-2 py-1 rounded-md flex items-center space-x-0.5">
                                <Check size={9} strokeWidth={4} />
                                <span>{language === 'bn' ? 'চলমান' : 'Active'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500 hover:text-zinc-700 font-bold border border-zinc-200 rounded px-2.5 py-1 bg-white hover:bg-zinc-100 cursor-pointer">
                                {language === 'bn' ? 'থিম সেট করুন' : 'Apply'}
                              </span>
                            )}
                          </div>

                          {/* Dynamic Color Palette Visualizer Bar */}
                          <div className="mt-3 bg-zinc-100/50 p-2 rounded-lg border border-zinc-150 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {/* Primary color block */}
                              <div className="flex items-center space-x-1">
                                <div 
                                  className="h-4 w-4 rounded border border-zinc-250 shadow-sm"
                                  style={{ backgroundColor: theme.primaryColor }}
                                />
                                <span className="text-[9px] font-mono text-zinc-500 font-semibold">{theme.primaryColor}</span>
                              </div>

                              {/* Hover color color block */}
                              <div className="flex items-center space-x-1">
                                <div 
                                  className="h-4 w-4 rounded border border-zinc-250 shadow-sm"
                                  style={{ backgroundColor: theme.hoverColor }}
                                />
                                <span className="text-[9px] font-mono text-zinc-500 font-semibold">{theme.hoverColor}</span>
                              </div>

                              {/* LightBg block */}
                              <div className="flex items-center space-x-1">
                                <div 
                                  className="h-4 w-4 rounded border border-zinc-250 shadow-sm"
                                  style={{ backgroundColor: theme.bgLightColor }}
                                />
                                <span className="text-[9px] font-mono text-zinc-500 font-semibold">{theme.bgLightColor}</span>
                              </div>
                            </div>

                            {/* Applied text preview */}
                            <span className="text-[9.5px] font-sans font-bold text-zinc-500 max-w-[130px] truncate">
                              "{language === 'bn' ? theme.shopNameBn : theme.shopName}"
                            </span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSubTab === 'customize' && (
                <div className="space-y-5">
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 text-xs text-zinc-600 space-y-1">
                     <p className="font-black text-zinc-90 w-full text-zinc-900">✏️ {language === 'bn' ? 'রিয়েল-টাইম এডিটর:' : 'Build a custom store'}</p>
                     <p>{language === 'bn' ? 'নিচের ফর্মটি পূরণ করে সাইটের যেকোনো তথ্য সেকেন্ডে পরিবর্তন করুন এবং কালার পরিবর্তন করে লাইভ দেখুন।' : 'Edit the values below to customize the branding, contact details, features, and layout for a client in real-time.'}</p>
                  </div>

                  {/* Group 1: Store profile */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-black text-zinc-405 text-zinc-400 uppercase tracking-widest pl-1">{language === 'bn' ? 'ব্র্যান্ডিং ও শিরোনাম' : 'BRAND DETAILS'}</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold uppercase pl-1 pl-1 mb-1">{language === 'bn' ? 'দোকানের নাম (EN)' : 'Store Name (EN)'}</label>
                        <input
                          type="text"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 pl-1 mb-1">{language === 'bn' ? 'দোকানের নাম (BN)' : 'Store Name (BN)'}</label>
                        <input
                          type="text"
                          value={shopNameBn}
                          onChange={(e) => setShopNameBn(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 pl-1 mb-1">{language === 'bn' ? 'ট্যাগলাইন (EN)' : 'Tagline (EN)'}</label>
                        <input
                          type="text"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 pl-1 mb-1">{language === 'bn' ? 'ট্যাগলাইন (BN)' : 'Tagline (BN)'}</label>
                        <input
                          type="text"
                          value={taglineBn}
                          onChange={(e) => setTaglineBn(e.target.value)}
                          className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 2: Contact info */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest pl-1">{language === 'bn' ? 'যোগাযোগের তথ্য' : 'CONTACT & SOCIALS'}</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 pl-1 mb-1">hotline phone</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-[11px] tracking-wide font-mono px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 pl-1 mb-1">whatsapp (+880...)</label>
                        <input
                          type="text"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="w-full text-[11px] tracking-wide font-mono px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 mb-1">Store email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 pl-1 mb-1">{language === 'bn' ? 'ঠিকানা (EN)' : 'Address (EN)'}</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 pl-1 mb-1">{language === 'bn' ? 'ঠিকানা (BN)' : 'Address (BN)'}</label>
                        <input
                          type="text"
                          value={addressBn}
                          onChange={(e) => setAddressBn(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 focus:border-brand focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group 3: Realtime UI Colors */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest pl-1">{language === 'bn' ? 'কালার প্যালেট কাস্টমাইজ' : 'THEME COLORS'}</h5>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 mb-1">{language === 'bn' ? 'মূল কালার' : 'Primary Hex'}</label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="h-8 w-8 cursor-pointer rounded border border-zinc-200 p-0"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-full text-[10px] font-mono px-1.5 py-1.5 border border-zinc-200 rounded-lg text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 mb-1">{language === 'bn' ? 'হোভার কালার' : 'Hover Hex'}</label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={hoverColor}
                            onChange={(e) => setHoverColor(e.target.value)}
                            className="h-8 w-8 cursor-pointer rounded border border-zinc-200 p-0"
                          />
                          <input
                            type="text"
                            value={hoverColor}
                            onChange={(e) => setHoverColor(e.target.value)}
                            className="w-full text-[10px] font-mono px-1.5 py-1.5 border border-zinc-200 rounded-lg text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase pl-1 mb-1">{language === 'bn' ? 'হালকা ব্যাকগ্রাউন্ড' : 'Light Bg Hex'}</label>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={bgLightColor}
                            onChange={(e) => setBgLightColor(e.target.value)}
                            className="h-8 w-8 cursor-pointer rounded border border-zinc-200 p-0"
                          />
                          <input
                            type="text"
                            value={bgLightColor}
                            onChange={(e) => setBgLightColor(e.target.value)}
                            className="w-full text-[10px] font-mono px-1.5 py-1.5 border border-zinc-200 rounded-lg text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group 4: Enable / Disable Features Toggles */}
                  <div className="space-y-3 pb-2">
                    <h5 className="text-[11px] font-black text-zinc-405 text-zinc-400 uppercase tracking-widest pl-1">{language === 'bn' ? 'ফিচারস অ্যাক্টিভেশন' : 'FEAUTRES TIERS TOGGLES'}</h5>
                    
                    <div className="space-y-2 text-xs">
                      
                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer select-none">
                        <span className="font-semibold text-zinc-700">{language === 'bn' ? 'Aura AI শপিং অ্যাসিস্ট্যান্ট' : 'Aura AI Shopping Advisor'}</span>
                        <input
                          type="checkbox"
                          checked={enableAiAdvisor}
                          onChange={(e) => setEnableAiAdvisor(e.target.checked)}
                          className="h-4.5 w-4.5 accent-brand rounded border-zinc-300 cursor-pointer focus:ring-0"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer select-none">
                        <span className="font-semibold text-zinc-700">{language === 'bn' ? 'সেলিং লিজার এবং রিসেলার জোন' : 'Affiliate Seller & Influencer Zone'}</span>
                        <input
                          type="checkbox"
                          checked={enableSellerZone}
                          onChange={(e) => setEnableSellerZone(e.target.checked)}
                          className="h-4.5 w-4.5 accent-brand rounded border-zinc-300 cursor-pointer focus:ring-0"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer select-none">
                        <span className="font-semibold text-zinc-700">{language === 'bn' ? 'ঈদ ও অফার ক্যাম্পেইন ব্যানার' : 'Eid & Offers Campaign Banners'}</span>
                        <input
                          type="checkbox"
                          checked={enableDiscountedProducts}
                          onChange={(e) => setEnableDiscountedProducts(e.target.checked)}
                          className="h-4.5 w-4.5 accent-brand rounded border-zinc-300 cursor-pointer focus:ring-0"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer select-none">
                        <span className="font-semibold text-zinc-700">{language === 'bn' ? 'অর্ডার ট্র্যাকিং সিস্টেম' : 'Order Receipt & Tracking Page'}</span>
                        <input
                          type="checkbox"
                          checked={enableTrackOrder}
                          onChange={(e) => setEnableTrackOrder(e.target.checked)}
                          className="h-4.5 w-4.5 accent-brand rounded border-zinc-300 cursor-pointer focus:ring-0"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer select-none">
                        <span className="font-semibold text-zinc-700">{language === 'bn' ? 'ব্র্যান্ড স্লাইডার ক্যারোসেল' : 'Top Brands Carousel Slider'}</span>
                        <input
                          type="checkbox"
                          checked={enableBrandCarousel}
                          onChange={(e) => setEnableBrandCarousel(e.target.checked)}
                          className="h-4.5 w-4.5 accent-brand rounded border-zinc-300 cursor-pointer focus:ring-0"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer select-none">
                        <span className="font-semibold text-zinc-700">{language === 'bn' ? 'হোয়াটসঅ্যাপ সাপোর্ট ভাসমান বোতাম' : 'WhatsApp Floating Chat Badge'}</span>
                        <input
                          type="checkbox"
                          checked={enableWhatsappFloat}
                          onChange={(e) => setEnableWhatsappFloat(e.target.checked)}
                          className="h-4.5 w-4.5 accent-brand rounded border-zinc-300 cursor-pointer focus:ring-0"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer select-none">
                        <span className="font-semibold text-zinc-700">{language === 'bn' ? 'মার্চেন্ট / ভেন্ডর রেজিস্ট্রেশন পপআপ' : 'Merchant & Vendor Registration Modal'}</span>
                        <input
                          type="checkbox"
                          checked={enableVendorModal}
                          onChange={(e) => setEnableVendorModal(e.target.checked)}
                          className="h-4.5 w-4.5 accent-brand rounded border-zinc-300 cursor-pointer focus:ring-0"
                        />
                      </label>

                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex space-x-3 text-xs select-none">
                    <button
                      onClick={handleSaveCustomConfig}
                      className="flex-1 bg-brand hover:bg-brand-hover text-white font-black uppercase py-3.5 rounded-xl border-0 cursor-pointer flex items-center justify-center space-x-1.5 shadow-md active:scale-98 transition transform duration-150"
                    >
                      <Save size={14} className="stroke-[2.5]" />
                      <span>{language === 'bn' ? 'অ্যাপ্লাই এবং সেভ' : 'Apply & Save'}</span>
                    </button>
                    
                    <button
                      onClick={copyCodeToClipboard}
                      className="px-4 bg-zinc-90 w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase rounded-xl border-0 cursor-pointer flex items-center justify-center space-x-1.5 transition"
                      title="Copy TypeScript settings code"
                    >
                      <Copy size={13} />
                      <span>{language === 'bn' ? 'TS কোড কপি' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Generated snippet preview */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] text-zinc-400 font-extrabold uppercase pl-1 pl-1">{language === 'bn' ? 'প্রোডাকশন কনফিগারেশন ফাইল কোড' : 'PROMOTION EXPORT SNIPPET'}</label>
                    <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-[9px] rounded-lg overflow-x-auto border border-zinc-850 max-h-[170px]">
                      {generatedTypeScriptCode}
                    </pre>
                  </div>
                </div>
              )}

              {activeSubTab === 'deploy' && (
                <div className="space-y-4">
                  <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-black text-zinc-900 flex items-center space-x-1">
                      <BookOpen size={16} className="text-brand stroke-[2.5]" />
                      <span>{language === 'bn' ? 'Vercel-এ সম্পূর্ণ ফ্রি হোস্টিং গাইড' : 'Vercel Free Hosting - Step-by-Step Guide'}</span>
                    </h4>

                    <div className="space-y-3.5 text-xs text-zinc-700 leading-relaxed font-sans text-left">
                      <div>
                        <p className="font-extrabold text-zinc-900">Step 1: Get the Code </p>
                        <p className="text-zinc-500 mt-0.5">
                          {language === 'bn' 
                            ? 'AI Studio কোড এডিটর এর Settings মেনু থেকে Download ZIP অথবা Export to GitHub অপশনে ক্লিক করে পুরো কোডটি আপনার কম্পিউটারে বা গিটহাবে নিন।' 
                            : 'Click the settings icon on AI Studio, export the project as a ZIP download or push directly to your private GitHub repository in one click.'}
                        </p>
                      </div>

                      <div className="h-px bg-zinc-200"></div>

                      <div>
                        <p className="font-extrabold text-zinc-900">Step 2: Install Vercel CLI or Connect GitHub</p>
                        <p className="text-zinc-500 mt-0.5">
                          {language === 'bn' 
                            ? 'ফ্রি হোস্টিং করতে vercel.com এ গিয়ে অ্যাকাউন্ট খুলুন। তারপর "Add New" -> "Project" এ ক্লিক করে আপনার কানেক্টেড গিটহাব রিপোজিটরি সিলেক্ট করুন।' 
                            : 'Sign up for a free Vercel account at vercel.com. Connect your GitHub account, and choose "Add New Project", then click Import on this repository.'}
                        </p>
                      </div>

                      <div className="h-px bg-zinc-200"></div>

                      <div>
                        <p className="font-extrabold text-zinc-900">Step 3: Easy Production Config </p>
                        <p className="text-zinc-500 mt-0.5">
                          {language === 'bn' 
                            ? 'Vercel অটোমেটিক্যালি এটি একটি Vite (React) অ্যাপ হিসেবে ডিটেক্ট করে নিবে। কোনো এক্সট্রা সেটিংস এর প্রয়োজন নেই! "Deploy" বাটনে ক্লিক করুন। ২ মিনিটে আপনার লাইভ ডোমেইন পেয়ে যাবেন!' 
                            : 'Vercel will automatically identify this as a Vite (React) Single Page Application. Keep all settings default, and hit Deploy. It compiles in 1 minute and produces a free secure live subdomain (e.g., storename.vercel.app).'}
                        </p>
                      </div>

                      <div className="h-px bg-zinc-200"></div>

                      <div className="bg-brand/10 p-3 rounded-lg text-brand-dark flex items-start space-x-2 border border-brand/20">
                        <Sparkles size={16} className="shrink-0 mt-0.5 text-brand" />
                        <div>
                          <p className="font-black text-[11px] uppercase tracking-wide">
                            {language === 'bn' ? 'হোয়াইট-লেবেল সেলস আইডিয়া' : 'WHITE-LABELED BUSINESS SECRET'}
                          </p>
                          <p className="text-[10px] text-zinc-650 mt-1 leading-relaxed">
                            {language === 'bn' 
                              ? 'আপনার ক্লায়েন্ট যখন অর্ডার করবে, তখন তার অর্ডার ডিটেইলস এর সাথে সে আপনার হোয়াটসঅ্যাপে বা ইমেলে শিট আকারে রিয়েল-টাইমে নোটিফিকেশন মেসেজ পাবে। আপনি ডেমো প্রিসেট পাল্টে ক্লায়েন্টকে দেখিয়ে কাস্টমাইজড কোডটি বিল্ড করে ভার্সেলে আলাদা প্রোজেক্ট হিসেবে হোস্টিং করে দিন। প্রত্যেক হোস্টিং-এর জন্য ৫,০০০৳ থেকে ২০,০০০৳ পর্যন্ত চার্জ করতে পারেন অনায়াসেই!'
                              : 'When clients requests revisions, just generate the custom theme colors and branding on this panel, copy the export snippet, replace the values in your workspace and trigger a push to deploy! You can sell independent sites to over 100+ stores easily.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <a 
                    href="https://vercel.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full h-11 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center space-x-1.5 transition hover:bg-black select-none cursor-pointer no-underline border-0"
                  >
                    <span>{language === 'bn' ? 'ভার্সেল ওয়েবসাইটে যান' : 'Go to Vercel.com'}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

            </div>

            {/* Footer with branding */}
            <div className="p-4 bg-zinc-90 border-t border-zinc-150 text-center select-none bg-zinc-50 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              {language === 'bn' ? 'নাবিক কাস্টম সলিউশনস' : 'Nabik Multitenant Suite'}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
