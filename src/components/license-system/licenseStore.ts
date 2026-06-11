import { LicenseOrder } from "./types";

// Dynamic Bangladeshi Names and Numbers for simulation realism
const BANGLA_NAMES = [
  "রাকিব হাসান", "নিলয় রহমান", "সুমাইয়া আক্তার", "তানভীর আহমেদ", "সাজ্জাদ হোসেন",
  "আরিফুর রহমান", "মুমতাহিনা ইসলাম", "নুরুল হুদা", "মাহমুদুল হাসান", "কামরুল ইসলাম",
  "ফাতেমা তুজ জোহরা", "সাব্বির আহমেদ", "রিফাত চৌধুরী", "আকরাম হোসাইন", "জাকির হোসেন"
];

const PHONE_PREFIXES = ["017", "018", "019", "015", "016", "013", "014"];

function getRandomName(): string {
  return BANGLA_NAMES[Math.floor(Math.random() * BANGLA_NAMES.length)];
}

function getRandomPhone(): string {
  const prefix = PHONE_PREFIXES[Math.floor(Math.random() * PHONE_PREFIXES.length)];
  const body = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${prefix}${body}`;
}

function generateLicenseKey(): string {
  const segments = [
    "GB-PRO",
    Math.floor(1000 + Math.random() * 9000).toString(),
    Math.floor(1000 + Math.random() * 9000).toString()
  ];
  return segments.join("-");
}

function generateTxId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let txid = "TXN";
  for (let i = 0; i < 7; i++) {
    txid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return txid;
}

const STORAGE_KEY = "gb_license_orders_registry";

export function getLicenseOrders(): LicenseOrder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Seed with some initial realistic data
      const initialOrders: LicenseOrder[] = [
        {
          id: "LO-9021",
          customerName: "মাহবুব আলম",
          email: "mahbub.alam99@gmail.com",
          whatsapp: "01712456789",
          licenseKey: "GB-PRO-3424-9021",
          paymentMethod: "bKash",
          paymentStatus: "completed",
          paymentTxid: "TXN8B29C1X",
          requestedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          priceBDT: 4500,
          isWhatsAppSent: true
        },
        {
          id: "LO-9022",
          customerName: "রকিবুল ইসলাম",
          email: "rokib102@yahoo.com",
          whatsapp: "01923456780",
          licenseKey: "GB-PRO-2026-9022",
          paymentMethod: "Nagad",
          paymentStatus: "pending",
          paymentTxid: "",
          requestedAt: new Date(Date.now() - 1800000).toISOString(),
          priceBDT: 4500,
          isWhatsAppSent: false
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOrders));
      return initialOrders;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading license orders:", err);
    return [];
  }
}

export function saveLicenseOrders(orders: LicenseOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    // Dispatch a custom event to notify components reactively
    window.dispatchEvent(new CustomEvent("gb-license-orders-updated"));
  } catch (err) {
    console.error("Error saving license orders:", err);
  }
}

export function addLicenseOrder(order: LicenseOrder): void {
  const current = getLicenseOrders();
  current.unshift(order);
  saveLicenseOrders(current);
}

// SIMULATE 10 INSTANT SYSTEM CUSTOMERS AT THE SAME TIME
export function generate10SimulatedOrders(): LicenseOrder[] {
  const current = getLicenseOrders();
  
  const newOrders: LicenseOrder[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 10; i++) {
    const id = "LO-" + Math.floor(1000 + Math.random() * 9000);
    const name = getRandomName();
    const phone = getRandomPhone();
    const method = (["bKash", "Nagad", "Rocket"] as const)[Math.floor(Math.random() * 3)];
    const key = generateLicenseKey();
    
    const simulatedOrder: LicenseOrder = {
      id: id,
      customerName: name,
      email: `${phone}@gmail.com`,
      whatsapp: phone,
      licenseKey: key,
      paymentMethod: method,
      paymentStatus: "pending", // Initially pending, then completed
      paymentTxid: "",
      requestedAt: new Date(now - i * 65000).toISOString(), // slightly staggered times
      priceBDT: 4500,
      isWhatsAppSent: false
    };
    
    newOrders.push(simulatedOrder);
  }
  
  const updatedList = [...newOrders, ...current];
  saveLicenseOrders(updatedList);
  return newOrders;
}

// PROCESS MANUAL PAYMENT SIMULATION IN BULK OR SINGLE
export function processSimulationPayment(orderId: string): void {
  const current = getLicenseOrders();
  const index = current.findIndex(o => o.id === orderId);
  if (index !== -1) {
    current[index].paymentStatus = "completed";
    current[index].paymentTxid = generateTxId();
    current[index].isWhatsAppSent = true; // Auto send key to WhatsApp upon payment success!
    saveLicenseOrders(current);
  }
}

export function deleteLicenseOrder(orderId: string): void {
  const current = getLicenseOrders();
  const filtered = current.filter(o => o.id !== orderId);
  saveLicenseOrders(filtered);
}
