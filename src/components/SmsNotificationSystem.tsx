import React, { useState, useEffect } from "react";
import { 
  Bell, Smartphone, Database, Check, AlertTriangle, ShieldCheck, 
  Send, RefreshCw, Radio, Layers, Code, User, FileText, PlusCircle, CreditCard 
} from "lucide-react";
import { 
  getSmsSettings, saveSmsSettings, getSmsLogs, POPULAR_GATEWAYS, 
  sendSmsSimulated, SmsLog, SmsSettings 
} from "../utils/smsHelper";

export default function SmsNotificationSystem({ language }: { language: 'en' | 'bn' }) {
  const [settings, setSettings] = useState<SmsSettings>(getSmsSettings());
  const [logs, setLogs] = useState<SmsLog[]>(getSmsLogs());
  const [activeTab, setActiveTab] = useState<'settings' | 'templates' | 'broadcast' | 'logs'>('settings');

  // Broadcast manual tests states
  const [testMobile, setTestMobile] = useState("");
  const [testName, setTestName] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [successAnimation, setSuccessAnimation] = useState<string | null>(null);

  // Character evaluation details
  const charsCount = testMsg.length;
  const charsRemaining = 160 - (charsCount % 160);
  const totalSegments = Math.ceil(charsCount / 160) || 1;

  useEffect(() => {
    // Listen to real-time events triggered by order status dispatches or POS clearings!
    const handleSmsFired = (e: Event) => {
      const customEvent = e as CustomEvent<SmsLog>;
      if (customEvent.detail) {
        setLogs(getSmsLogs());
        setSettings(getSmsSettings());
      }
    };
    window.addEventListener("sellsull_sms_fired", handleSmsFired);
    return () => window.removeEventListener("sellsull_sms_fired", handleSmsFired);
  }, []);

  const handleSaveAllSettings = (updated: SmsSettings) => {
    setSettings(updated);
    saveSmsSettings(updated);
    triggerAlertToast(
      language === 'bn' ? "এসএমএস কন্ট্রোল প্যানেল সেভ করা হয়েছে!" : "SMS Gateways Controller configuration updated!"
    );
  };

  const handleSimulateTopup = () => {
    const fresh = { ...settings, smsBalanceBDT: Number((settings.smsBalanceBDT + 500).toFixed(2)) };
    handleSaveAllSettings(fresh);
    triggerAlertToast(
      language === 'bn' ? "৳৫০০ ক্রেডিট রিচার্জ সফল হয়েছে!" : "Simulated BDT 500 SMS Credits topped up successfully!"
    );
  };

  const handleManualBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMobile || !testMsg) return;

    const phoneClean = testMobile.replace(/\D/g, '');
    const clientName = testName.trim() || (language === 'bn' ? "সম্মানিত গ্রাহক" : "Retail Customer");

    const responseLog = sendSmsSimulated(phoneClean, clientName, testMsg);

    if (responseLog.status === 'SUCCESS') {
      setSuccessAnimation(
        language === 'bn' 
          ? `সফলভাবে পাঠানো হয়েছে! চার্জ কাটা হয়েছে: ৳${responseLog.costBDT}` 
          : `Dispatched successfully! Transaction fee charged: BDT ${responseLog.costBDT}`
      );
      setTestMobile("");
      setTestName("");
      setTestMsg("");
      setTimeout(() => setSuccessAnimation(null), 4000);
    } else {
      setSuccessAnimation(`✕ FAILED: ${responseLog.errorMessage}`);
      setTimeout(() => setSuccessAnimation(null), 4000);
    }
  };

  const triggerAlertToast = (msg: string) => {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
  };

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-2xs space-y-5 text-left font-sans" id="sms-notification-module">
      {/* Module Title Header and credits metrics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div className="space-y-0.5">
          <h2 className="text-[#052b52] text-base font-extrabold flex items-center space-x-2">
            <Smartphone className="text-[#f58220]" size={18} />
            <span>{language === 'bn' ? 'বাংলাদেশী ইন্টিগ্রেটেড এসএমএস গেটওয়ে সার্ভিস' : 'Mobile SMS Notification Core'}</span>
          </h2>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
            {language === 'bn' ? 'স্বয়ংক্রিয় অর্ডার ট্র্যাকিং ও কাস্টমার মোবাইলে আপডেট' : 'Enterprise Bulk-SMS & Trigger Rules Manager'}
          </p>
        </div>

        {/* Live balance counter */}
        <div className="flex items-center space-x-3 bg-zinc-50 border border-zinc-150 rounded-xl p-2.5">
          <div className="text-right">
            <span className="text-[8.5px] uppercase font-black text-zinc-400 block tracking-wider">SMS Wallet Balance</span>
            <span className="text-emerald-700 font-mono font-black text-sm block">৳{settings.smsBalanceBDT.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleSimulateTopup}
            type="button"
            className="p-1 px-1.5 bg-zinc-900 border-0 hover:bg-zinc-950 text-white font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer flex items-center space-x-1"
            title="Simulate Credit Recharge"
          >
            <CreditCard size={10} />
            <span>+ TOP-UP</span>
          </button>
        </div>
      </div>

      {/* Subtab Controllers */}
      <div className="flex border-b border-zinc-150 flex-wrap text-xs select-none bg-zinc-50 rounded-t-xl overflow-hidden p-1 gap-1">
        {[
          { id: 'settings', label: language === 'bn' ? 'গেটওয়ে কনফিগার' : 'API Gateways', icon: Radio },
          { id: 'templates', label: language === 'bn' ? 'নোটিফিকেশন রুলস' : 'Auto Templates', icon: FileText },
          { id: 'broadcast', label: language === 'bn' ? 'কাস্টম সেন্ডার' : 'Manual Sandbox', icon: Send },
          { id: 'logs', label: language === 'bn' ? 'ডেলিভারি হিস্ট্রি' : 'Live SMS Logs', icon: Database },
        ].map((btn) => {
          const Icon = btn.icon;
          const isActive = activeTab === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id as any)}
              className={`flex-1 py-2 px-2.5 border-0 rounded-lg font-extrabold uppercase text-[10.5px] flex items-center justify-center space-x-1.5 cursor-pointer transition ${
                isActive 
                  ? "bg-[#052b52] text-white shadow-xs" 
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
              }`}
            >
              <Icon size={12} />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab Content Panels */}
      <div className="pt-2">

        {/* Tab 1: Gateways API key configurations */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#052b52]/5 border border-[#052b52]/15 rounded-xl p-3.5 text-[11px] text-zinc-650 leading-relaxed space-y-1">
              <strong>📢 Active Bangladesh Routing Gateway Interface IP:</strong>
              <p>The system uses mock network wrappers connected to authorized telecommunication routes. Any valid placed order in web or physical checkout triggers instant billing BDT subtraction to simulate raw ISP integration perfectly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3.5">
                <div className="space-y-0.5 text-xs">
                  <label className="text-[10px] uppercase font-black text-zinc-400 block">Select Outgoing Gateway API Provider</label>
                  <select
                    value={settings.selectedGateway}
                    onChange={(e) => handleSaveAllSettings({ ...settings, selectedGateway: e.target.value })}
                    className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-bold text-zinc-800 text-xs"
                  >
                    {POPULAR_GATEWAYS.map(gw => (
                      <option key={gw.id} value={gw.id}>
                        {gw.name} (৳{gw.ratePerSms}/Sms)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5 text-xs">
                  <label className="text-[10px] uppercase font-black text-zinc-400 block">Sender Masking / Sender ID</label>
                  <input
                    type="text"
                    value={settings.senderId}
                    onChange={(e) => handleSaveAllSettings({ ...settings, senderId: e.target.value.toUpperCase() })}
                    placeholder="e.g. SELLSULL or NABIKBZ"
                    className="w-full border border-zinc-200 px-3 py-2 rounded-xl font-bold font-sans tracking-wide text-xs focus:ring-1 focus:ring-brand text-zinc-800"
                  />
                  <span className="text-[9.5px] text-zinc-400 block">Must match non-masking bulk carrier registration specifications.</span>
                </div>

                <div className="space-y-0.5 text-xs">
                  <label className="text-[10px] uppercase font-black text-zinc-400 block">Secure Gateway API Token</label>
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => handleSaveAllSettings({ ...settings, apiKey: e.target.value })}
                    className="w-full border border-zinc-200 px-3 py-2 rounded-xl font-mono text-xs focus:ring-1 focus:ring-brand text-zinc-800"
                  />
                </div>
              </div>

              {/* Graphical Gateway visualizer block */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#f58220] block">Active ISP Gateway Features</span>
                  <div className="space-y-1.5">
                    {POPULAR_GATEWAYS.map(gw => {
                      const isActive = settings.selectedGateway === gw.id;
                      return (
                        <div 
                          key={gw.id} 
                          onClick={() => handleSaveAllSettings({ ...settings, selectedGateway: gw.id })}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                            isActive 
                              ? "bg-amber-500/5 border-[#f58220] text-amber-900 font-extrabold" 
                              : "bg-white border-zinc-150 hover:border-zinc-350 text-zinc-500"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={isActive ? "text-[#f58220]" : "text-zinc-400"}>●</span>
                            <span>{gw.name}</span>
                          </div>
                          <span className="font-mono text-[10.5px]">৳{gw.ratePerSms}/sms</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SMS notification triggers and rules */}
        {activeTab === 'templates' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-850 p-3 rounded-xl text-[10.5px]">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Use the dynamic wildcard tags: <strong>{`{customer_name}`}</strong>, <strong>{`{order_id}`}</strong>, <strong>{`{total_bdt}`}</strong>, or <strong>{`{shop_name}`}</strong> to inject live checkout details automatically.</span>
            </div>

            {/* Checkbox trigger options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'enableAutoPlaced', label: language === 'bn' ? 'অর্ডার প্লেস এসএমএস চালু' : 'Trigger on Placement', color: "border-l-indigo-600" },
                { key: 'enableAutoShipped', label: language === 'bn' ? 'শিপমেন্ট এসএমএস চালু' : 'Trigger on Shipment', color: "border-l-amber-500" },
                { key: 'enableAutoDelivered', label: language === 'bn' ? 'ডেলিভারি এসএমএস চালু' : 'Trigger on Delivery', color: "border-l-emerald-600" }
              ].map(opt => (
                <div key={opt.key} className={`border border-zinc-150 border-l-4 ${opt.color} bg-zinc-50/50 p-3 rounded-xl flex items-center justify-between select-none`}>
                  <span className="text-xs font-bold text-zinc-700">{opt.label}</span>
                  <input
                    type="checkbox"
                    checked={(settings as any)[opt.key]}
                    onChange={(e) => handleSaveAllSettings({ ...settings, [opt.key]: e.target.checked })}
                    className="h-4 w-4 rounded text-[#f58220] focus:ring-brand border-zinc-300 accent-amber-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Template inputs */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">1. Order Placed Confirmation SMS</span>
                  {settings.enableAutoPlaced ? <span className="text-[9px] font-black text-indigo-600 uppercase">● Active Trigger</span> : <span className="text-[9px] text-zinc-400 uppercase">● Disabled</span>}
                </div>
                <textarea
                  value={settings.templates.placed}
                  onChange={(e) => handleSaveAllSettings({ ...settings, templates: { ...settings.templates, placed: e.target.value } })}
                  rows={2}
                  className="w-full border border-zinc-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand text-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">2. Shipment / Dispatch SMS</span>
                  {settings.enableAutoShipped ? <span className="text-[9px] font-black text-amber-600 uppercase">● Active Trigger</span> : <span className="text-[9px] text-zinc-400 uppercase">● Disabled</span>}
                </div>
                <textarea
                  value={settings.templates.shipped}
                  onChange={(e) => handleSaveAllSettings({ ...settings, templates: { ...settings.templates, shipped: e.target.value } })}
                  rows={2}
                  className="w-full border border-zinc-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand text-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400 block">3. Order Successful Delivery SMS</span>
                  {settings.enableAutoDelivered ? <span className="text-[9px] font-black text-emerald-600 uppercase">● Active Trigger</span> : <span className="text-[9px] text-zinc-400 uppercase">● Disabled</span>}
                </div>
                <textarea
                  value={settings.templates.delivered}
                  onChange={(e) => handleSaveAllSettings({ ...settings, templates: { ...settings.templates, delivered: e.target.value } })}
                  rows={2}
                  className="w-full border border-zinc-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand text-zinc-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Sandboxed broadcast announcer */}
        {activeTab === 'broadcast' && (
          <form onSubmit={handleManualBroadcast} className="space-y-4 animate-fadeIn">
            {successAnimation && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3.5 rounded-xl font-bold flex items-center space-x-2 text-xs">
                <span>{successAnimation}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs">
                <div className="space-y-0.5">
                  <label className="text-[10px] uppercase font-black text-zinc-400 block">Recipient Phone Number (Subscriber) *</label>
                  <input
                    type="tel"
                    required
                    value={testMobile}
                    onChange={(e) => setTestMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 01784905075"
                    maxLength={11}
                    className="w-full border border-zinc-200 px-3 py-2 rounded-xl text-xs font-mono focus:ring-1 focus:ring-brand font-bold text-zinc-850"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] uppercase font-black text-zinc-400 block">Recipient Human Label / Name</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. Arif Hossain"
                    className="w-full border border-zinc-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-brand font-bold text-zinc-850"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] uppercase font-black text-zinc-400 block">SMS Message Custom body *</label>
                  <textarea
                    required
                    value={testMsg}
                    onChange={(e) => setTestMsg(e.target.value)}
                    placeholder="Type custom marketing broadcast alerts. Perfect to alert customers about sales..."
                    rows={4}
                    className="w-full border border-zinc-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand tracking-wide text-zinc-800"
                  />
                </div>

                {/* Submit trigger */}
                <button
                  type="submit"
                  disabled={!testMobile || !testMsg}
                  className="w-full bg-[#f58220] hover:bg-[#e07116] disabled:bg-zinc-150 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl border-0 shadow-xs cursor-pointer transition flex items-center justify-center space-x-1.5"
                >
                  <Send size={13} />
                  <span>Send Test SMS Notification &gt;</span>
                </button>
              </div>

              {/* Live Preview visualizer card */}
              <div className="flex flex-col justify-center items-center">
                <div className="w-full max-w-[280px] bg-zinc-900 text-white rounded-[32px] p-4.5 border-[6px] border-zinc-800 shadow-xl space-y-4 relative font-sans aspect-[9/16] flex flex-col justify-between">
                  {/* Smartphone top notches */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 select-none">
                    <span>SELLSULL MASK</span>
                    <div className="h-4 w-12 bg-zinc-800 rounded-full shrink-0" />
                    <span>UTC+6</span>
                  </div>

                  {/* The visual preview bubble bubble */}
                  <div className="flex-1 flex flex-col justify-center select-none pt-4 space-y-3">
                    <div className="bg-zinc-800 text-zinc-100 rounded-2xl p-3 border border-zinc-700 text-xs shadow-md space-y-1">
                      <span className="block text-[8px] font-black uppercase text-[#f58220] tracking-widest">Incoming SMS Text</span>
                      <p className="font-semibold leading-relaxed break-words">{testMsg || (language === 'bn' ? "এসএমএস মেসেজ এখানে লিখলে সরাসরি স্ক্রিনে ডেমো প্রিভিউ দেখতে পাবেন..." : "Enter custom message text inside the editor form to watch real-time modular smartphone preview layout...")}</p>
                    </div>
                  </div>

                  {/* Meter analytics footer inside the smartphone mock */}
                  <div className="bg-zinc-950 p-2 rounded-xl text-[9px] text-zinc-400 font-mono space-y-1">
                    <div className="flex justify-between"><span>Characters:</span><strong className="text-zinc-200">{charsCount}</strong></div>
                    <div className="flex justify-between"><span>Remaining limit:</span><strong className="text-zinc-200">{charsRemaining}</strong></div>
                    <div className="flex justify-between"><span>Billing Count:</span><strong className="text-amber-500 font-extrabold">{totalSegments} SMS</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Tab 4: Logs table history */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-zinc-400 uppercase tracking-wider">{logs.length} SMS DISPATCH LOGS EXECUTED</span>
              <button
                onClick={() => setLogs(getSmsLogs())}
                className="text-[10px] font-black uppercase tracking-wider text-[#052b52] bg-zinc-100 hover:bg-zinc-200 rounded px-2.5 py-1.5 border-0 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw size={10} />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="overflow-x-auto border rounded-xl shadow-3xs max-h-[380px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 font-bold bg-zinc-50 border border-dashed rounded-xl">
                  No SMS logs available. Try sending a manual text to populate.
                </div>
              ) : (
                <table className="w-full text-xs text-left text-zinc-550 border-collapse">
                  <thead className="bg-zinc-50 border-b text-[10px] uppercase font-black tracking-wider text-zinc-500 sticky top-0 bg-white z-10">
                    <tr>
                      <th className="p-3">ID / Time</th>
                      <th className="p-3">Recipient Name/Phone</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Gateway / Cost</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-zinc-800">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50/50">
                        <td className="p-3 whitespace-nowrap">
                          <strong className="block text-zinc-950 font-mono">{log.id}</strong>
                          <span className="text-[9.5px] text-zinc-400 font-mono block">{log.timestamp}</span>
                          {log.orderId && (
                            <span className="inline-block bg-zinc-100 text-[8.5px] font-black uppercase px-1 py-0.5 rounded text-zinc-650 mt-1 font-sans">
                              OrderId: {log.orderId}
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <strong className="block text-[#052b52]">{log.recipientName}</strong>
                          <span className="text-zinc-500 font-mono">{log.recipientPhone}</span>
                        </td>
                        <td className="p-3 max-w-[200px] truncate-with-tooltip">
                          <p className="line-clamp-2 leading-relaxed text-zinc-700 font-sans" title={log.message}>
                            {log.message}
                          </p>
                          <span className="text-[9.5px] text-zinc-400 block font-mono">
                            {log.charCount} characters • {log.segments} {log.segments === 1 ? 'part' : 'parts'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="block text-zinc-900 font-semibold">{log.gatewayName}</span>
                          <strong className="block text-emerald-700 font-mono">৳{log.costBDT.toFixed(2)}</strong>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full ${
                            log.status === 'SUCCESS' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            <span>{log.status}</span>
                          </span>
                          {log.errorMessage && (
                            <span className="block text-[8px] text-red-500 font-sans italic mt-1 max-w-[110px] truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
