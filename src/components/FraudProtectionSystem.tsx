import React, { useState } from "react";
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Search, UserMinus, PlusCircle, 
  Settings, Database, Phone, CheckCircle, Ban 
} from "lucide-react";
import { 
  getBlacklist, saveBlacklist, getFraudRules, saveFraudRules, 
  getFraudConfig, saveFraudConfig, analyzeOrderRisk, normalizePhone, 
  BlacklistEntry, FraudPreventionRule, FraudConfig 
} from "../utils/fraudHelper";

export default function FraudProtectionSystem({ language }: { language: 'en' | 'bn' }) {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(getBlacklist());
  const [rules, setRules] = useState<FraudPreventionRule[]>(getFraudRules());
  const [config, setConfig] = useState<FraudConfig>(getFraudConfig());
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'blacklist' | 'rules'>('dashboard');

  // Interactive tester fields
  const [searchPhone, setSearchPhone] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchAmount, setSearchAmount] = useState<number>(3500);
  const [searchPayment, setSearchPayment] = useState("Cash on Delivery");
  
  // New entry fields
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newFbLink, setNewFbLink] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newSeverity, setNewSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');

  const triggerToast = (msg: string) => {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: msg }));
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone || !newName || !newReason) return;
    const normalized = normalizePhone(newPhone);
    if (blacklist.some(item => normalizePhone(item.phone) === normalized)) {
      triggerToast(language === 'bn' ? "এই নম্বরটি ইতিমধ্যেই ব্ল্যাকলিস্টে আছে!" : "Number already registered in blacklist!");
      return;
    }
    const newEntry: BlacklistEntry = {
      id: `BL-${Date.now().toString().slice(-4)}`, phone: normalized, name: newName.trim(),
      facebookLink: newFbLink.trim() || undefined, reason: newReason.trim(),
      dateAdded: new Date().toISOString().split('T')[0], riskSeverity: newSeverity
    };
    const updated = [newEntry, ...blacklist];
    setBlacklist(updated);
    saveBlacklist(updated);
    setNewPhone(""); setNewName(""); setNewFbLink(""); setNewReason("");
    triggerToast(language === 'bn' ? "গ্রাহককে সফলভাবে ব্ল্যাকলিস্টে যুক্ত করা হয়েছে!" : "Customer successfully blacklisted!");
  };

  const handleDeleteBlacklist = (id: string) => {
    const updated = blacklist.filter(item => item.id !== id);
    setBlacklist(updated);
    saveBlacklist(updated);
    triggerToast(language === 'bn' ? "ব্ল্যাকলিস্ট থেকে উইথড্র করা হয়েছে!" : "Customer removed from blacklist.");
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setRules(updated);
    saveFraudRules(updated);
    triggerToast(language === 'bn' ? "রুলস আপডেট করা হয়েছে!" : "Trigger updated!");
  };

  const handleUpdateConfig = (updated: FraudConfig) => {
    setConfig(updated);
    saveFraudConfig(updated);
    triggerToast(language === 'bn' ? "পলিসি প্যারামিটার সেভ করা হয়েছে!" : "Security parameters saved!");
  };

  const riskResult = searchPhone ? analyzeOrderRisk(searchPhone, searchName, searchAmount, searchPayment) : null;

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-2xs text-left font-sans" id="fraud-safety-system">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 mb-4">
        <div>
          <h2 className="text-[#052b52] text-base font-extrabold flex items-center space-x-2">
            <ShieldAlert className="text-rose-600" size={19} />
            <span>{language === 'bn' ? 'নিরাপদ অর্ডার প্রসেস ও ফ্রড ডিটেকশন' : 'Fraud Order Protection & Return Screener'}</span>
          </h2>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
            {language === 'bn' ? 'বাংলাদেশী কুরিয়ার রিটার্ন ঝুঁকি কমানোর ড্যাশবোর্ড' : 'Bangladesh COD Return Abuse Prevention Hub'}
          </p>
        </div>
        <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-150 rounded-xl px-2.5 py-1 text-rose-700 text-[10.5px] font-black">
          <Ban size={11} className="animate-pulse" />
          <span>{language === 'bn' ? `${blacklist.length}টি ফ্ল্যাগড` : `${blacklist.length} Blacklisted`}</span>
        </div>
      </div>

      <div className="flex bg-zinc-100 border rounded-xl p-1 gap-1 text-[11.5px] font-bold mb-5 select-none">
        {[
          { id: 'dashboard', label: language === 'bn' ? 'রিস্ক স্ক্রীনার' : 'Risk Screener', icon: Search },
          { id: 'blacklist', label: language === 'bn' ? 'ব্ল্যাকলিস্ট ডেটাবেস' : 'Fraud Database', icon: Database },
          { id: 'rules', label: language === 'bn' ? 'ডিটেকশন প্যারামিটার' : 'Control Rules', icon: Settings }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`flex-1 py-2 rounded-lg border-0 cursor-pointer transition flex items-center justify-center space-x-1.5 ${
              activeSubTab === t.id ? "bg-[#052b52] text-white shadow-xs font-black" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <t.icon size={11} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-xl">
              <span className="text-[9.5px] uppercase font-black text-red-650 tracking-wider">Critical Suspects</span>
              <strong className="block text-lg text-red-800 font-mono mt-0.5">{blacklist.filter(b => b.riskSeverity === 'CRITICAL').length} accounts</strong>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl">
              <span className="text-[9.5px] uppercase font-black text-amber-600 tracking-wider">Screener Filters</span>
              <strong className="block text-lg text-amber-800 font-mono mt-0.5">{rules.filter(r => r.enabled).length} triggers active</strong>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
              <span className="text-[9.5px] uppercase font-black text-emerald-600 tracking-wider">Unsecured COD Max Value</span>
              <strong className="block text-lg text-emerald-800 font-mono mt-0.5">৳{config.maxCodValueBDT.toLocaleString()}</strong>
            </div>
          </div>

          <div className="bg-zinc-50 border rounded-2xl p-4 space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <span className="text-xs font-black text-zinc-700 uppercase tracking-wide">
                📢 {language === 'bn' ? 'অর্ডার রিস্ক অ্যানালাইসিস উইজার্ড' : 'Interactive Risk Verification Screener'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-black text-zinc-400 block pb-0.5">Customer Mobile Phone</label>
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 017xxxxxxxx"
                    className="w-full border px-3 py-1.5 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-brand text-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-zinc-400 block pb-0.5">Customer Full Name</label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="e.g. Ariful Islam"
                    className="w-full border px-3 py-1.5 rounded-lg text-xs font-bold focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-black text-zinc-400 block pb-0.5">Total Amount (৳ BDT)</label>
                    <input
                      type="number"
                      value={searchAmount || ""}
                      onChange={(e) => setSearchAmount(Number(e.target.value))}
                      className="w-full border px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-zinc-400 block pb-0.5">Payment Method</label>
                    <select
                      value={searchPayment}
                      onChange={(e) => setSearchPayment(e.target.value)}
                      className="w-full border px-3 py-1.5 rounded-lg bg-white text-xs font-bold"
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Online Paid">Fully Paid / Pre-paid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                {riskResult ? (
                  <div className={`p-4 border rounded-xl text-left space-y-3 ${
                    riskResult.riskLevel === 'CRITICAL' || riskResult.riskLevel === 'HIGH' ? "bg-rose-50/80 border-rose-200 text-rose-950" : "bg-emerald-50/60 border-emerald-150 text-emerald-950"
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="text-[9.5px] uppercase font-black text-zinc-400 block leading-none">Risk Verdict</span>
                        <strong className="text-xs uppercase mt-0.5 tracking-wide">{riskResult.riskLevel} SUSPICION</strong>
                      </div>
                      <span className="text-sm font-mono font-black">{riskResult.riskScore}% Factor</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-black text-zinc-400 block">Threat Reasons Found</span>
                      {riskResult.matchedThreats.length === 0 ? (
                        <p className="text-[11px] font-bold text-emerald-800">✓ Stable phone number sequence. Low risk.</p>
                      ) : (
                        riskResult.matchedThreats.map((t, idx) => (
                          <div key={idx} className="text-[10.5px] font-bold flex items-center space-x-1">
                            <span>⚠ {t}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="bg-white p-2.5 rounded-lg text-[10.5px] border font-bold">
                      <span className="text-[8.5px] uppercase font-black text-zinc-400 block">Recommended Dispatch Directive</span>
                      <p className="text-zinc-800 font-extrabold mt-0.5">{riskResult.actionRequired}</p>
                      {riskResult.suggestedBookingFeeBDT > 0 && (
                        <div className="pt-1.5 border-t border-dashed mt-1.5 flex justify-between font-bold text-rose-700">
                          <span>Required Security Pre-pay:</span>
                          <span>৳{riskResult.suggestedBookingFeeBDT.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-xl text-zinc-400 flex flex-col justify-center items-center">
                    <ShieldCheck size={28} className="text-zinc-300 mb-1" />
                    <span className="text-xs font-bold">Risk Assessment Console</span>
                    <p className="text-[9.5px] text-zinc-400 mt-0.5">Please provide a client phone number above to start.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'blacklist' && (
        <div className="space-y-4 font-sans">
          <form onSubmit={handleAddBlacklist} className="bg-zinc-50 border p-4 rounded-xl space-y-3">
            <span className="text-xs font-black uppercase text-zinc-700 block border-b pb-1">
              ➕ {language === 'bn' ? 'সন্দেহভাজন মোবাইল ব্ল্যাকলিস্টে যোগ করুন' : 'Add Fraud / Fake Order Account'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-400 block">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 017xxxxxxxx"
                  className="w-full border px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-400 block">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rakib Islam"
                  className="w-full border px-3 py-1.5 rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-400 block">FB Profile link</label>
                <input
                  type="text"
                  value={newFbLink}
                  onChange={(e) => setNewFbLink(e.target.value)}
                  placeholder="facebook.com/profile"
                  className="w-full border px-3 py-1.5 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase font-black text-zinc-400 block">Reason for Blacklist *</label>
                <input
                  type="text"
                  required
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Ordered and refused repeatedly, fake transaction slip etc."
                  className="w-full border px-3 py-1.5 rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-400 block">Risk Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full bg-white border px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Block direct)</option>
                  <option value="HIGH">🟠 HIGH (Requires partial fee)</option>
                  <option value="MEDIUM">🟡 MEDIUM (Advise call verify)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-red-650 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg border-0 cursor-pointer"
              >
                Insert Suspect
              </button>
            </div>
          </form>

          <div className="border rounded-xl spill-x overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-zinc-50 border-b text-[9px] uppercase font-black text-zinc-400 sticky top-0 bg-white z-10">
                <tr>
                  <th className="p-3">Customer Profile</th>
                  <th className="p-3">Phone number</th>
                  <th className="p-3">Fraud Infraction Reason</th>
                  <th className="p-3 text-center">Threat</th>
                  <th className="p-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {blacklist.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="p-3">
                      <strong className="block text-zinc-900">{item.name}</strong>
                      {item.facebookLink && (
                        <a href={`https://${item.facebookLink}`} target="_blank" rel="noreferrer" className="text-[9px] text-blue-600 block mt-0.5">FB Profile 🔗</a>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-zinc-700">{item.phone}</td>
                    <td className="p-3 max-w-[200px] truncate font-semibold" title={item.reason}>{item.reason}</td>
                    <td className="p-3 text-center font-bold">
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black ${
                        item.riskSeverity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-900'
                      }`}>{item.riskSeverity}</span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeleteBlacklist(item.id)} className="bg-transparent border-0 hover:text-red-600 cursor-pointer">
                        <UserMinus size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black uppercase text-[#f58220]">Active Evaluator Modules</span>
              {rules.map((rule) => (
                <div key={rule.id} className="border p-2.5 rounded-xl bg-zinc-50 flex items-start justify-between">
                  <div>
                    <strong className="block font-bold">{rule.name}</strong>
                    <p className="text-[10px] text-zinc-400">{rule.description}</p>
                    <span className="text-[9px] font-mono text-[#f58220] block mt-0.5 font-bold">Score gravity impact: +{rule.scoreWeight}%</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => handleToggleRule(rule.id)}
                    className="h-4 w-4 rounded text-red-600 accent-red-600 mt-1 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-zinc-400">Policy Parameter Thresholds</span>
              <div className="border rounded-xl p-4 bg-white space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Max Unsecured COD Value:</span>
                    <span className="text-red-600">৳{config.maxCodValueBDT.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min="1000" max="20000" step="500"
                    value={config.maxCodValueBDT}
                    onChange={(e) => handleUpdateConfig({ ...config, maxCodValueBDT: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-[#f58220]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Default Booking Pre-pay Ratio:</span>
                    <span className="text-zinc-600">{config.defaultAdvancePercent}%</span>
                  </div>
                  <input
                    type="range" min="5" max="50" step="5"
                    value={config.defaultAdvancePercent}
                    onChange={(e) => handleUpdateConfig({ ...config, defaultAdvancePercent: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-[#052b52]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
