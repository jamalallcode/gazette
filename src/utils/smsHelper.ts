import { Order } from "../types";

export interface SmsGateway {
  id: string;
  name: string;
  ratePerSms: number; // in BDT
  minCostBDT: number;
  isBangladeshOnly: boolean;
  active: boolean;
  apiEndpointSim: string;
}

export interface SmsTemplate {
  id: 'placed' | 'shipped' | 'delivered' | 'custom';
  name: string;
  templateBn: string;
  templateEn: string;
}

export interface SmsSettings {
  selectedGateway: string;
  apiKey: string;
  senderId: string;
  enableAutoPlaced: boolean;
  enableAutoShipped: boolean;
  enableAutoDelivered: boolean;
  smsBalanceBDT: number;
  templates: {
    placed: string;
    shipped: string;
    delivered: string;
  };
  enableAdminAlertOnOrder?: boolean;
  adminPhone?: string;
  adminTemplate?: string;
  enableAdminWhatsappAlertOnOrder?: boolean;
  adminWhatsappNumber?: string;
  adminWhatsappTemplate?: string;
}

export interface SmsLog {
  id: string;
  timestamp: string;
  orderId?: string;
  recipientName: string;
  recipientPhone: string;
  message: string;
  gatewayName: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  costBDT: number;
  charCount: number;
  segments: number;
  errorMessage?: string;
  channel?: 'SMS' | 'WHATSAPP';
}

// 6 Popular Bangladesh / Global gateways supported
export const POPULAR_GATEWAYS: SmsGateway[] = [
  {
    id: "greenweb",
    name: "Greenweb SMS BD",
    ratePerSms: 0.30,
    minCostBDT: 0.30,
    isBangladeshOnly: true,
    active: true,
    apiEndpointSim: "https://api.greenweb.com.bd/api.php"
  },
  {
    id: "boomcast",
    name: "BoomCast Telephony BD",
    ratePerSms: 0.32,
    minCostBDT: 0.32,
    isBangladeshOnly: true,
    active: false,
    apiEndpointSim: "https://boomcast.com.bd/smsapi"
  },
  {
    id: "bulksmsbd",
    name: "BulkSMS BD (Teletalk/GP Hub)",
    ratePerSms: 0.28,
    minCostBDT: 0.28,
    isBangladeshOnly: true,
    active: false,
    apiEndpointSim: "http://bulksmsbd.net/api/smsapi"
  },
  {
    id: "smscobd",
    name: "SMS.co.bd Premium",
    ratePerSms: 0.35,
    minCostBDT: 0.35,
    isBangladeshOnly: true,
    active: false,
    apiEndpointSim: "https://api.sms.co.bd/v2/send"
  },
  {
    id: "twilio",
    name: "Twilio Global Router",
    ratePerSms: 0.90, // Cost represented in BDT equivalent
    minCostBDT: 0.90,
    isBangladeshOnly: false,
    active: false,
    apiEndpointSim: "https://api.twilio.com/2010-04-01/Accounts"
  },
  {
    id: "infobip",
    name: "Infobip International Gate",
    ratePerSms: 1.10,
    minCostBDT: 1.10,
    isBangladeshOnly: false,
    active: false,
    apiEndpointSim: "https://api.infobip.com/sms/2/text/advanced"
  }
];

const DEFAULT_SETTINGS: SmsSettings = {
  selectedGateway: "greenweb",
  apiKey: "gw_api_7c9f83a483def9a1",
  senderId: "SELLSULL",
  enableAutoPlaced: true,
  enableAutoShipped: true,
  enableAutoDelivered: true,
  smsBalanceBDT: 1540.80,
  templates: {
    placed: "প্রিয় {customer_name}, Sellsull-এ আপনার {order_id} নম্বর অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। মোট মূল্য: ৳{total_bdt}। ধন্যবাদ!",
    shipped: "প্রিয় {customer_name}, আপনার {order_id} নম্বর অর্ডারটি কুরিয়ারে পাঠানো হয়েছে। শীঘ্রই ডেলিভারি রিসিভ করুন।",
    delivered: "প্রিয় {customer_name}, আপনার {order_id} নম্বর অর্ডারটি সফলভাবে ডেলিভারি করা হয়েছে! আমাদের সেবা কেমন লাগলো জানাবেন।"
  },
  enableAdminAlertOnOrder: true,
  adminPhone: "01784905075",
  adminTemplate: "[ADMIN ALERT] নতুন অর্ডার এসেছে! আইডি: {order_id}, কাস্টমার: {customer_name}, মোবাইল: {customer_phone}, মোট মূল্য: ৳{total_bdt}।",
  enableAdminWhatsappAlertOnOrder: true,
  adminWhatsappNumber: "01784905075",
  adminWhatsappTemplate: "[WHATSAPP ALERT 🟢] নতুন কাস্টমার অর্ডার এসেছে! আইডি: #{order_id}, কাস্টমার: {customer_name}, মোবাইল: {customer_phone}, মোট মূল্য: ৳{total_bdt}। অনুগ্রহ করে মার্চেন্ট ড্যাশবোর্ড চেক করুন।"
};

// Local storage keys
const SETTINGS_KEY = "sellsull_sms_settings_v1";
const LOGS_KEY = "sellsull_sms_logs_v1";

export function getSmsSettings(): SmsSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed loading SMS settings", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSmsSettings(settings: SmsSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getSmsLogs(): SmsLog[] {
  try {
    const saved = localStorage.getItem(LOGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed loading SMS logs", e);
  }
  // Generate beautiful initials mock logs for realism and illustration
  const initialLogs: SmsLog[] = [
    {
      id: "SMS-284910",
      timestamp: new Date(Date.now() - 3600000 * 2.5).toLocaleString('bn-BD'),
      orderId: "FD-482",
      recipientName: "আরিফুল ইসলাম",
      recipientPhone: "01784905075",
      message: "প্রিয় আরিফুল ইসলাম, Sellsull-এ আপনার FD-482 নম্বর অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। মোট মূল্য: ৳১,৫০০। ধন্যবাদ!",
      gatewayName: "Greenweb SMS BD",
      status: "SUCCESS",
      costBDT: 0.30,
      charCount: 110,
      segments: 1
    },
    {
      id: "SMS-193481",
      timestamp: new Date(Date.now() - 3600000 * 6.8).toLocaleString('bn-BD'),
      recipientName: "রকিব উদ্দিন",
      recipientPhone: "01811839210",
      message: "প্রিয় রকিব উদ্দিন, উইকেন্ড স্পেশাল মেগা অফারে ২৫% ডিসকাউন্ট উপভোগ করতে ব্যবহার করুন কোড: FESTIVE250",
      gatewayName: "Greenweb SMS BD",
      status: "SUCCESS",
      costBDT: 0.30,
      charCount: 104,
      segments: 1
    },
    {
      id: "SMS-092834",
      timestamp: new Date(Date.now() - 3600000 * 24.5).toLocaleString('bn-BD'),
      orderId: "NB-8931",
      recipientName: "তানজিলা বেগম",
      recipientPhone: "01948210340",
      message: "প্রিয় তানজিলা বেগম, আপনার NB-8931 নম্বর অর্ডারটি কুরিয়ারে পাঠানো হয়েছে। শীঘ্রই ডেলিভারি রিসিভ করুন।",
      gatewayName: "BoomCast Telephony BD",
      status: "SUCCESS",
      costBDT: 0.32,
      charCount: 96,
      segments: 1
    }
  ];
  localStorage.setItem(LOGS_KEY, JSON.stringify(initialLogs));
  return initialLogs;
}

export function saveSmsLogs(logs: SmsLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

// Dispatch general mock SMS sender tool
export function sendSmsSimulated(
  recipientPhone: string,
  recipientName: string,
  messageText: string,
  orderId?: string
): SmsLog {
  const settings = getSmsSettings();
  const gateway = POPULAR_GATEWAYS.find(g => g.id === settings.selectedGateway) || POPULAR_GATEWAYS[0];
  const charCount = messageText.length;
  const segments = Math.ceil(charCount / 160) || 1;
  const cost = Number((gateway.ratePerSms * segments).toFixed(2));

  let status: 'SUCCESS' | 'FAILED' = "SUCCESS";
  let errorMessage: string | undefined = undefined;

  // Realism fail-safe check: check balance is sufficient or phone number length
  if (settings.smsBalanceBDT < cost) {
    status = "FAILED";
    errorMessage = "Insufficient SMS credits API balance.";
  } else if (!recipientPhone || recipientPhone.length < 10) {
    status = "FAILED";
    errorMessage = "Invalid subscriber contact number address format.";
  }

  // Deduct balance if success
  if (status === "SUCCESS") {
    settings.smsBalanceBDT = Number((settings.smsBalanceBDT - cost).toFixed(2));
    saveSmsSettings(settings);
  }

  const newLog: SmsLog = {
    id: "SMS-" + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toLocaleString('bn-BD', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    orderId,
    recipientName,
    recipientPhone,
    message: messageText,
    gatewayName: gateway.name,
    status,
    costBDT: cost,
    charCount,
    segments,
    errorMessage,
    channel: 'SMS'
  };

  const logs = getSmsLogs();
  logs.unshift(newLog);
  saveSmsLogs(logs);

  // Dispatch global custom event so the UI can instantly refresh or fire toast notifications automatically!
  window.dispatchEvent(new CustomEvent("sellsull_sms_fired", { detail: newLog }));

  return newLog;
}

// WhatsApp Dispatch simulation
export function sendWhatsappSimulated(
  recipientPhone: string,
  recipientName: string,
  messageText: string,
  orderId?: string
): SmsLog {
  const charCount = messageText.length;
  const segments = Math.ceil(charCount / 160) || 1;
  const cost = 0.00; // Free simulated WhatsApp alerts

  let status: 'SUCCESS' | 'FAILED' = "SUCCESS";
  let errorMessage: string | undefined = undefined;

  if (!recipientPhone || recipientPhone.length < 10) {
    status = "FAILED";
    errorMessage = "Invalid WhatsApp phone format.";
  }

  const newLog: SmsLog = {
    id: "WA-" + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toLocaleString('bn-BD', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    orderId,
    recipientName,
    recipientPhone,
    message: messageText,
    gatewayName: "WhatsApp Enterprise Cloud API (Meta Authorized)",
    status,
    costBDT: cost,
    charCount,
    segments,
    errorMessage,
    channel: 'WHATSAPP'
  };

  const logs = getSmsLogs();
  logs.unshift(newLog);
  saveSmsLogs(logs);

  // Dispatch global custom event so the UI can instantly refresh or fire toast notifications automatically!
  window.dispatchEvent(new CustomEvent("sellsull_sms_fired", { detail: newLog }));

  return newLog;
}

// Order Trigger Helper
export function triggerOrderSmsNotification(
  order: Order,
  eventType: 'placed' | 'shipped' | 'delivered',
  shopName: string = "Nabik Bazar"
): SmsLog | null {
  const settings = getSmsSettings();
  
  if (eventType === 'placed' && !settings.enableAutoPlaced) return null;
  if (eventType === 'shipped' && !settings.enableAutoShipped) return null;
  if (eventType === 'delivered' && !settings.enableAutoDelivered) return null;

  // Get raw template
  let rawTemplate = "";
  if (eventType === 'placed') {
    rawTemplate = settings.templates.placed;
  } else if (eventType === 'shipped') {
    rawTemplate = settings.templates.shipped;
  } else if (eventType === 'delivered') {
    rawTemplate = settings.templates.delivered;
  }

  if (!rawTemplate) return null;

  // Replace wildcards
  const customerName = order.customerInfo.name || "সম্মানিত গ্রাহক";
  const formattedMessage = rawTemplate
    .replace(/{customer_name}/g, customerName)
    .replace(/{order_id}/g, order.id)
    .replace(/{total_bdt}/g, order.totalBDT.toString())
    .replace(/{shop_name}/g, shopName);

  let recipientPhone = order.customerInfo.phone || "";
  // Strip non-digits
  recipientPhone = recipientPhone.replace(/\D/g, '');
  if (!recipientPhone) {
    recipientPhone = "01784905075"; // fallback simulation number
  }

  // Send to Customer
  const customerLog = sendSmsSimulated(recipientPhone, customerName, formattedMessage, order.id);

  // Send admin SMS alert on placement if enabled
  if (eventType === 'placed' && settings.enableAdminAlertOnOrder !== false && settings.adminPhone) {
    const rawAdminTemplate = settings.adminTemplate || "[ADMIN ALERT] নতুন অর্ডার এসেছে! আইডি: {order_id}, কাস্টমার: {customer_name}, মোবাইল: {customer_phone}, মোট মূল্য: ৳{total_bdt}।";
    const formattedAdminMessage = rawAdminTemplate
      .replace(/{customer_name}/g, customerName)
      .replace(/{order_id}/g, order.id)
      .replace(/{customer_phone}/g, order.customerInfo.phone || "N/A")
      .replace(/{total_bdt}/g, order.totalBDT.toString())
      .replace(/{shop_name}/g, shopName);

    sendSmsSimulated(settings.adminPhone.replace(/\D/g, '') || "01784905075", "Sellsull Admin Alert Routing", formattedAdminMessage, order.id);
  }

  // Send admin WhatsApp alert on placement if enabled
  if (eventType === 'placed' && settings.enableAdminWhatsappAlertOnOrder !== false && settings.adminWhatsappNumber) {
    const rawWhatsappTemplate = settings.adminWhatsappTemplate || "[WHATSAPP ALERT 🟢] নতুন কাস্টমার অর্ডার এসেছে! আইডি: #{order_id}, কাস্টমার: {customer_name}, মোবাইল: {customer_phone}, মোট মূল্য: ৳{total_bdt}। অনুগ্রহ করে মার্চেন্ট ড্যাশবোর্ড চেক করুন।";
    const formattedWhatsappMessage = rawWhatsappTemplate
      .replace(/{customer_name}/g, customerName)
      .replace(/{order_id}/g, order.id)
      .replace(/{customer_phone}/g, order.customerInfo.phone || "N/A")
      .replace(/{total_bdt}/g, order.totalBDT.toString())
      .replace(/{shop_name}/g, shopName);

    sendWhatsappSimulated(settings.adminWhatsappNumber.replace(/\D/g, '') || "01784905075", "Sellsull Admin WhatsApp Alert Routing", formattedWhatsappMessage, order.id);
  }

  return customerLog;
}
