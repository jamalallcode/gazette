import React, { useState, useRef } from "react";
import { 
  X, Printer, Copy, RotateCcw, AlertTriangle, ShieldAlert, Check, 
  QrCode, FileText, Landmark, Smile, Settings, Languages, MessageSquare 
} from "lucide-react";
import { Order } from "../types";
import { analyzeOrderRisk } from "../utils/fraudHelper";

interface ModernInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'bn';
  currency?: string;
}

export default function ModernInvoiceModal({ 
  order, 
  isOpen, 
  onClose, 
  language 
}: ModernInvoiceModalProps) {
  const [invoiceLang, setInvoiceLang] = useState<'en' | 'bn'>(language);
  const [templateType, setTemplateType] = useState<'a4' | 'pos'>('a4');
  
  // Customizable attributes using state
  const [shopName, setShopName] = useState("লেজার দ্য পাঠশালা");
  const [shopSlogan, setShopSlogan] = useState("আপনার বিশ্বস্ত রিটেইল শপ");
  const [shopAddress, setShopAddress] = useState("সেক্টর ৪, উত্তরা, ঢাকা-১২৩০");
  const [shopPhone, setShopPhone] = useState("০১৯৭৭-৮৮৯৯০০");
  const [termsText, setTermsText] = useState("১) বিক্রিত মাল ফেরত নেওয়া হয় না। ২) যেকোনো ওয়ারেন্টি দাবির জন্য ইনভয়েস সাথে আনুন।");
  
  // Custom Toggles
  const [showQr, setShowQr] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showFraudRiskWarning, setShowFraudRiskWarning] = useState(true);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  // Derive risk factor
  const riskAnalysis = analyzeOrderRisk(
    order.customerInfo.phone,
    order.customerInfo.name,
    order.totalBDT,
    order.customerInfo.paymentMethod
  );

  // Subtotal calculations
  const subtotalBDT = order.totalBDT; 
  const deliveryCharge = order.totalBDT > 5000 ? 0 : 150;
  const vatTax = Math.round(subtotalBDT * 0.05); // 5% simulated
  const grandTotalBDT = subtotalBDT + deliveryCharge + vatTax;

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Open a temporary print frame/window to ensure perfect output styling without messing up React states
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Invoice - ${order.id}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  body { padding: 15px; background: white; color: black; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body class="font-sans text-xs">
              <div>${printContent}</div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback standard print
        window.print();
      }
    }
  };

  const handleCopyTextReceipt = () => {
    const itemLines = order.items.map(item => 
      `- ${item.product.name} (x${item.quantity}) - ৳${(item.product.priceBDT * item.quantity).toLocaleString()}`
    ).join("\n");

    const plainText = `
=== ${shopName.toUpperCase()} SALES RECEIPT ===
Invoice Number: ${order.id}
Date: ${order.date}
Customer Name: ${order.customerInfo.name}
Phone: ${order.customerInfo.phone}
Address: ${order.customerInfo.address}
-------------------------------------
Items Ordered:
${itemLines}
-------------------------------------
Subtotal: ৳${subtotalBDT.toLocaleString()}
Delivery Fee: ৳${deliveryCharge}
VAT (5%): ৳${vatTax}
Grand Total: ৳${grandTotalBDT.toLocaleString()}
Payment Mode: ${order.customerInfo.paymentMethod}
Status: ${order.customerInfo.paymentStatus}
=====================================
Thank you for shopping with ${shopName}!
`;

    navigator.clipboard.writeText(plainText.trim()).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 bg-[#052b52]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border shadow-2xl max-w-5xl w-full flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden" id="modern-invoice-system-panel">
        
        {/* Left Control Panel / Configuration settings */}
        <div className="w-full md:w-80 bg-zinc-50 border-r p-5 overflow-y-auto text-left space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-extrabold text-[#052b52] uppercase tracking-wider flex items-center space-x-1.5">
              <Settings size={15} className="text-[#f58220]" />
              <span>{language === 'bn' ? 'ইনভয়েস কন্ট্রোল প্যানেল' : 'Invoice Settings'}</span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-0.5">Customize real-time prints, layouts, and translations.</p>
          </div>

          {/* Bilingual Switchers */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-zinc-400 block tracking-wide">Select Language</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => setInvoiceLang('bn')}
                className={`py-1.5 rounded-lg border-0 font-extrabold text-[10px] uppercase flex items-center justify-center space-x-1 cursor-pointer ${invoiceLang === 'bn' ? 'bg-[#052b52] text-white' : 'bg-white hover:bg-zinc-200 text-zinc-650'}`}
              >
                <Languages size={11} />
                <span>বাংলা</span>
              </button>
              <button 
                onClick={() => setInvoiceLang('en')}
                className={`py-1.5 rounded-lg border-0 font-extrabold text-[10px] uppercase flex items-center justify-center space-x-1 cursor-pointer ${invoiceLang === 'en' ? 'bg-[#052b52] text-white' : 'bg-white hover:bg-zinc-200 text-zinc-650'}`}
              >
                <Languages size={11} />
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Form Factor Sizes */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-zinc-400 block tracking-wide">Invoice Layout Template</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => setTemplateType('a4')}
                className={`py-1.5 rounded-lg border-0 font-extrabold text-[10.5px] uppercase cursor-pointer flex items-center justify-center space-x-1 ${templateType === 'a4' ? 'bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-150 text-zinc-600 border'}`}
              >
                <FileText size={11} />
                <span>A4 Classic B2C</span>
              </button>
              <button 
                onClick={() => setTemplateType('pos')}
                className={`py-1.5 rounded-lg border-0 font-extrabold text-[10.5px] uppercase cursor-pointer flex items-center justify-center space-x-1 ${templateType === 'pos' ? 'bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-150 text-zinc-600 border'}`}
              >
                <Printer size={11} />
                <span>3" POS Thermal</span>
              </button>
            </div>
          </div>

          {/* Branded Text customizers */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-black text-zinc-400">Shop Title Name</label>
              <input 
                type="text" 
                value={shopName}
                onChange={(e) => setShopName(e.target.value)} 
                className="w-full border px-2.5 py-1 rounded text-[11px] font-bold text-zinc-850"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-black text-zinc-400">Slogan / Tagline</label>
              <input 
                type="text" 
                value={shopSlogan}
                onChange={(e) => setShopSlogan(e.target.value)} 
                className="w-full border px-2.5 py-1 rounded text-[11px] text-zinc-805 text-zinc-800"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-black text-zinc-400">Shop Outlet Address</label>
              <input 
                type="text" 
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)} 
                className="w-full border px-2.5 py-1 rounded text-[11px] text-zinc-805 text-zinc-800"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-black text-zinc-400">Footer Terms & Policy Text</label>
              <textarea 
                rows={2}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)} 
                className="w-full border px-2.5 py-1 rounded text-[10.5px] text-zinc-800 font-medium"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2 pt-2 border-t text-xs">
            <label className="flex items-center space-x-2 select-none cursor-pointer">
              <input 
                type="checkbox" 
                checked={showQr} 
                onChange={(e) => setShowQr(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#f58220]"
              />
              <span className="font-bold text-zinc-650 text-[11px]">Generate bKash Scan QR code</span>
            </label>

            <label className="flex items-center space-x-2 select-none cursor-pointer">
              <input 
                type="checkbox" 
                checked={showSignature} 
                onChange={(e) => setShowSignature(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#f58220]"
              />
              <span className="font-bold text-zinc-650 text-[11px]">Show Authorized signature sign</span>
            </label>

            <label className="flex items-center space-x-2 select-none cursor-pointer">
              <input 
                type="checkbox" 
                checked={showFraudRiskWarning} 
                onChange={(e) => setShowFraudRiskWarning(e.target.checked)}
                className="h-3.5 w-3.5 accent-rose-600"
              />
              <span className="font-bold text-zinc-650 text-[11px]">Render Security Warning tag</span>
            </label>
          </div>

          {/* Copy Plain Text system */}
          <button
            onClick={handleCopyTextReceipt}
            type="button"
            className="w-full border border-dashed border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-extrabold text-[10px] uppercase py-2 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition"
          >
            {copiedSuccess ? (
              <>
                <Check size={11} className="text-emerald-600" />
                <span className="text-emerald-700">Copied successfully</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy SMS Text Invoice</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview area with simulated Paper canvas rendering */}
        <div className="flex-1 bg-zinc-200 border-l relative flex flex-col justify-between overflow-hidden">
          
          {/* Floating Actions overlay */}
          <div className="bg-white border-b px-5 py-3 flex items-center justify-between no-print shrink-0">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider">
                {templateType === 'a4' ? "A4 Paper Classic Layout Preview" : "3-inch thermal layout scroll"}
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button 
                onClick={handlePrint}
                className="bg-[#f58220] hover:bg-[#e07116] text-white font-extrabold text-xs uppercase px-4 py-1.5 rounded-lg border-0 cursor-pointer shadow-xs transition flex items-center space-x-1.5"
              >
                <Printer size={13} />
                <span>{invoiceLang === 'bn' ? "ইনভয়েস প্রিন্ট" : "Print Invoice"}</span>
              </button>

              <button 
                onClick={onClose}
                className="bg-zinc-200 hover:bg-zinc-350 p-1.5 rounded-lg border-0 text-zinc-600 cursor-pointer transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Actual Scrollable paper canvas widget */}
          <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start">
            
            {/* PAPER CARD */}
            <div 
              ref={printAreaRef}
              className={`bg-white text-zinc-900 border text-left font-sans p-6 shadow-xl relative ${
                templateType === 'a4' ? 'w-full max-w-[210mm] min-h-[297mm]' : 'w-full max-w-[80mm]'
              }`}
              id="invoice-document-paper"
            >
              
              {/* PAID / UNPAID DIAGONAL STAMP */}
              <div className="absolute top-6 right-6 select-none opacity-85 z-10">
                <div className={`text-[11px] font-black uppercase border-2 p-1.5 rounded-xl tracking-widest text-center ${
                  order.customerInfo.paymentStatus.toLowerCase().includes("paid") || order.customerInfo.paymentStatus.includes("পরিশোধিত")
                    ? "border-emerald-600 text-emerald-800 rotate-[8deg] bg-emerald-50/50" 
                    : "border-red-600 text-red-700 rotate-[-8deg] bg-red-50/50"
                }`}>
                  {order.customerInfo.paymentStatus.toLowerCase().includes("paid") || order.customerInfo.paymentStatus.includes("পরিশোধিত")
                    ? (invoiceLang === 'bn' ? "পরিশোধিত (PAID)" : "PAID STATUS")
                    : (invoiceLang === 'bn' ? "বকেয়া (UNPAID)" : "COD - UNPAID")}
                </div>
              </div>

              {/* Invoice Header details */}
              <div className="border-b-2 border-zinc-900 pb-4 mb-4 space-y-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold font-sans tracking-wide text-zinc-950 uppercase">{shopName}</h1>
                    <p className="text-[10px] font-bold text-[#f58220] tracking-wide">{shopSlogan}</p>
                    <p className="text-[9.5px] text-zinc-500 font-semibold mt-1 leading-normal">
                      {shopAddress} | {invoiceLang === 'bn' ? `মোবাইল: ${shopPhone}` : `Call: ${shopPhone}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-base font-black uppercase text-zinc-700 tracking-wider">
                      {invoiceLang === 'bn' ? "বিক্রয় রশিদ" : "Retail Sale Invoice"}
                    </h2>
                    <p className="text-[9.5px] text-zinc-500 font-mono mt-0.5">
                      {invoiceLang === 'bn' ? "ইনভয়েস নম্বর: " : "Invoice ID: "}<strong className="text-zinc-950">{order.id}</strong>
                    </p>
                    <p className="text-[9.5px] text-zinc-500 font-mono">
                      {invoiceLang === 'bn' ? "তারিখ: " : "Issue Date: "}<strong className="text-zinc-900">{order.date}</strong>
                    </p>
                  </div>
                </div>

                {/* Return protect alerts shown in printable style */}
                {showFraudRiskWarning && riskAnalysis.riskScore > 30 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-[9.5px] text-red-900 flex items-start space-x-2">
                    <ShieldAlert size={14} className="text-red-700 mt-0.5 shrink-0" />
                    <div>
                      <strong>🛡️ Security Assessment Flag ({riskAnalysis.riskLevel}):</strong>
                      <p className="leading-relaxed mt-0.5 font-bold">
                        {invoiceLang === 'bn' 
                          ? "ঝুঁকি স্তর উচ্চ বা সন্দেহজনক। কোনো কারণে ক্যাশ অন ডেলিভারি পার্সেল রিফিউজ হলে বুকিং ফি অফেরতযোগ্য হিসেবে গণ্য হবে।" 
                          : "High return threat profile flagged. Cancellation or delivery return triggers automatic forfeiture of BDT 150 deposit charge."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs font-semibold text-zinc-700 border-b pb-4">
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">
                    {invoiceLang === 'bn' ? "গ্রহীতার তথ্য (Bill To):" : "Customer / Bill Recipient:"}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <p className="font-extrabold text-[#052b52] text-xs font-sans">{order.customerInfo.name}</p>
                    <p className="text-[10.5px] text-zinc-600 font-bold font-mono">Cell: {order.customerInfo.phone}</p>
                    <p className="text-[10.5px] text-zinc-500 font-semibold">{order.customerInfo.address}</p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">
                    {invoiceLang === 'bn' ? "ডেলিভারি ও পেমেন্ট সার্ভিস:" : "Transport & Payment Services:"}
                  </span>
                  <div className="mt-1 space-y-0.5 text-[11.5px]">
                    <p>{invoiceLang === 'bn' ? "কুরিয়ার সার্ভিস: " : "Shipper: "} REDX Express BD</p>
                    <p>{invoiceLang === 'bn' ? "পেমেন্ট মোড: " : "Payment: "} <strong className="text-[#f58220]">{order.customerInfo.paymentMethod}</strong></p>
                    <p>{invoiceLang === 'bn' ? "স্টেটাস: " : "Status: "} <strong className="text-emerald-700 font-bold">{order.customerInfo.paymentStatus}</strong></p>
                  </div>
                </div>
              </div>

              {/* Items Table details */}
              <div className="mb-4">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 border-b-2 border-zinc-900 text-[10px] text-zinc-500 font-black uppercase">
                      <th className="p-2 w-7">SL</th>
                      <th className="p-2">{invoiceLang === 'bn' ? "পণ্যের বিবরণ" : "Product & Parameters"}</th>
                      <th className="p-2 text-center w-16">{invoiceLang === 'bn' ? "মূল্য" : "Rate BDT"}</th>
                      <th className="p-2 text-center w-14">{invoiceLang === 'bn' ? "পরিমাণ" : "Qty"}</th>
                      <th className="p-2 text-right w-20">{invoiceLang === 'bn' ? "মোট মূল্য" : "Total"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-bold text-zinc-800">
                    {order.items.map((item, index) => {
                      const itemTitle = invoiceLang === 'bn' ? item.product.nameBn : item.product.name;
                      return (
                        <tr key={index} className="hover:bg-zinc-50">
                          <td className="p-2 text-zinc-400 font-mono">{index + 1}</td>
                          <td className="p-2 text-zinc-950">
                            <span>{itemTitle}</span>
                            <span className="block text-[8.5px] text-zinc-400 font-normal uppercase mt-0.5 tracking-wider">SKU: {item.product.id}</span>
                          </td>
                          <td className="p-2 text-center font-mono">৳{item.product.priceBDT.toLocaleString()}</td>
                          <td className="p-2 text-center font-mono">{item.quantity}</td>
                          <td className="p-2 text-right font-mono text-zinc-950">
                            ৳{(item.product.priceBDT * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Price Calculation details summary & signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end border-t pt-4">
                
                {/* Simulated payment instructions */}
                <div className="space-y-3">
                  <div className="text-[10px] text-zinc-500 leading-normal border rounded-xl p-2.5 font-medium space-y-1">
                    <span className="font-extrabold text-[#052b52] block header-font text-[10px]">
                      {invoiceLang === 'bn' ? "বই বা রিটেইল নোটিশ:" : "Retail Store Policy Memo:"}
                    </span>
                    <p className="line-clamp-2">{termsText}</p>
                  </div>

                  {/* Optional Scan pay QR simulator placeholder */}
                  {showQr && (
                    <div className="flex items-center space-x-2.5 border border-zinc-150 p-2 rounded-xl bg-zinc-50">
                      <QrCode className="text-pink-600 focus:outline" size={32} />
                      <div className="text-[9.5px]">
                        <strong className="block text-pink-700 tracking-wide">bKash/Nagad scan-to-pay</strong>
                        <span className="text-zinc-500 block">Scan to pre-pay advance return security fee of ৳150 BDT on checkout.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtotals breakdown table section */}
                <div className="space-y-1.5 text-xs text-zinc-600 font-bold border-l pl-4 font-sans max-w-sm ml-auto w-full">
                  <div className="flex justify-between items-center">
                    <span>{invoiceLang === 'bn' ? "উপমোট (Subtotal):" : "Cart Subtotal:"}</span>
                    <span className="font-mono text-zinc-950">৳{subtotalBDT.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>{invoiceLang === 'bn' ? "ডেলিভারি চার্জ (Delivery):" : "Courier Charge:"}</span>
                    <span className="font-mono text-zinc-950">৳{deliveryCharge}</span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-500 text-[10.5px]">
                    <span>{invoiceLang === 'bn' ? "ভ্যাট ৫% (VAT/Tax):" : "VAT / Tax (5%):"}</span>
                    <span className="font-mono">৳{vatTax}</span>
                  </div>

                  {/* Net Payable highlight panel */}
                  <div className="flex justify-between items-center border-t border-zinc-900 pt-2 text-[#052b52] font-black">
                    <span className="text-[11px] font-sans uppercase font-extrabold">{invoiceLang === 'bn' ? "সর্বমোট প্রদেয় বিল:" : "Total Net Payable:"}</span>
                    <span className="font-mono text-sm block">৳{grandTotalBDT.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Signatures Area */}
              {showSignature && (
                <div className="mt-8 pt-6 border-t-2 border-dashed border-zinc-200 grid grid-cols-2 text-center text-[10.5px] font-bold text-zinc-500">
                  <div>
                    <div className="h-6" />
                    <div className="border-t max-w-[120px] mx-auto pt-1 font-semibold">{invoiceLang === 'bn' ? "গ্রাহকের স্বাক্ষর" : "Customer Handover"}</div>
                  </div>
                  <div>
                    <div className="h-6 font-mono text-zinc-300 italic select-none">AUTHORIZED SIGN</div>
                    <div className="border-t max-w-[120px] mx-auto pt-1 font-semibold">{invoiceLang === 'bn' ? "অনুমোদিত স্বাক্ষর" : "Store Executive"}</div>
                  </div>
                </div>
              )}

              {/* Thank you note footer stamp */}
              <div className="text-center text-[9.5px] text-zinc-400 mt-6 font-black uppercase tracking-widest flex items-center justify-center space-x-1">
                <Smile size={10} className="text-[#f58220]" />
                <span>{invoiceLang === 'bn' ? "আমাদের সাথে কেনাকাটার জন্য আপনাকে ধন্যবাদ!" : "Thank you for shopping with us!"}</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
