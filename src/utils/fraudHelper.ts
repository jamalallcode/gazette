import { Order } from "../types";

export interface BlacklistEntry {
  id: string;
  phone: string;
  name: string;
  facebookLink?: string;
  reason: string;
  dateAdded: string;
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface FraudPreventionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  scoreWeight: number; // contribution to risk score (0-100)
}

export interface FraudConfig {
  maxCodValueBDT: number; // require advance payment above this
  defaultAdvancePercent: number; // e.g. 10%
  blockSuspiciousOperators: boolean; // e.g. custom visual patterns
  minPhonePrefixLength: number;
}

export interface RiskAnalysisResult {
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  matchedThreats: string[];
  actionRequired: string;
  suggestedBookingFeeBDT: number;
}

// Pre-seeded known fraudulent patterns & blacklists for e-commerce in Bangladesh
const PRE_SEEDED_BLACKLIST: BlacklistEntry[] = [
  {
    id: "BL-001",
    phone: "01755123456",
    name: "Mohammad Rakib (Mirpur)",
    facebookLink: "facebook.com/rakib.fake.92",
    reason: "Ordered high-value leather goods, refused to accept 3 times upon courier arrival. Repeated fake bookings.",
    dateAdded: "2026-05-15",
    riskSeverity: "CRITICAL"
  },
  {
    id: "BL-002",
    phone: "01988554422",
    name: "Sultana Yasmin (Chittagong)",
    reason: "Payment fraud attempt. Claimed mobile bKash completed but sent edited screenshot with fake transaction ID.",
    dateAdded: "2026-05-20",
    riskSeverity: "CRITICAL"
  },
  {
    id: "BL-003",
    phone: "01822776611",
    name: "Ariful Jamil",
    facebookLink: "facebook.com/jamil.arif.buyer",
    reason: "Returned 2 consecutive cash-on-delivery parcels citing 'changed my mind' after package reached courier depot.",
    dateAdded: "2026-05-28",
    riskSeverity: "HIGH"
  }
];

const DEFAULT_RULES: FraudPreventionRule[] = [
  {
    id: "RULE_BLACKLISTED_PHONE",
    name: "Known Fraud Phone Match",
    description: "Triggers if customer phone is found in the merchant's unified blacklist dashboard.",
    enabled: true,
    scoreWeight: 95
  },
  {
    id: "RULE_HIGH_VAL_COD",
    name: "High Value Cash on Delivery",
    description: "Flags orders with total value above ৳6,000 using standard cash-on-delivery payment status.",
    enabled: true,
    scoreWeight: 45
  },
  {
    id: "RULE_NON_STANDARD_PHONE",
    name: "Suspicious Operator Sim Prefix",
    description: "Flags phone numbers that do not match standard Bangladeshi operators (+8801 or 013, 014, 015, 016, 017, 018, 019).",
    enabled: true,
    scoreWeight: 50
  },
  {
    id: "RULE_SPAM_BUYER_NAME",
    name: "Gibberish or Anonymous Name",
    description: "Flags customer names containing numbers, only single letters, or generic test markers (e.g. 'asdf', 'guest', 'test').",
    enabled: true,
    scoreWeight: 30
  }
];

const DEFAULT_CONFIG: FraudConfig = {
  maxCodValueBDT: 6000,
  defaultAdvancePercent: 15,
  blockSuspiciousOperators: true,
  minPhonePrefixLength: 11
};

// LocalStorage Persistence
const BLACKLIST_KEY = "sellsull_fraud_blacklist_v1";
const RULES_KEY = "sellsull_fraud_rules_v1";
const CONFIG_KEY = "sellsull_fraud_config_v1";

export function getBlacklist(): BlacklistEntry[] {
  try {
    const saved = localStorage.getItem(BLACKLIST_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed loading blacklist", e);
  }
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(PRE_SEEDED_BLACKLIST));
  return PRE_SEEDED_BLACKLIST;
}

export function saveBlacklist(list: BlacklistEntry[]): void {
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
}

export function getFraudRules(): FraudPreventionRule[] {
  try {
    const saved = localStorage.getItem(RULES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed loading rules config", e);
  }
  localStorage.setItem(RULES_KEY, JSON.stringify(DEFAULT_RULES));
  return DEFAULT_RULES;
}

export function saveFraudRules(rules: FraudPreventionRule[]): void {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function getFraudConfig(): FraudConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed loading fraud configuration details", e);
  }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  return DEFAULT_CONFIG;
}

export function saveFraudConfig(config: FraudConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

/**
 * Clean & normalize a phone number for accurate matching
 */
export function normalizePhone(phone: string): string {
  const banglaDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const converted = phone.replace(/[০-৯]/g, (w) => banglaDigits[w] || w);
  const digits = converted.replace(/\D/g, '');
  if (digits.startsWith('880')) {
    return digits.slice(2); // turn 88017... to 017...
  }
  if (!digits.startsWith('0') && digits.length === 10) {
    return '0' + digits; // prepend 0
  }
  return digits;
}

/**
 * Main Dynamic Fraud & Risk Analysis Engine for Bangladeshi Merchants
 */
export function analyzeOrderRisk(
  phone: string,
  customerName: string,
  totalBDT: number,
  paymentMethod: string
): RiskAnalysisResult {
  const list = getBlacklist();
  const rules = getFraudRules();
  const config = getFraudConfig();

  const formattedPhone = normalizePhone(phone);
  const matchedThreats: string[] = [];
  let cumulativeScore = 0;

  // 1. Blacklist Check
  const blacklistRule = rules.find(r => r.id === "RULE_BLACKLISTED_PHONE");
  if (blacklistRule?.enabled) {
    const isMatched = list.some(entry => normalizePhone(entry.phone) === formattedPhone);
    if (isMatched) {
      cumulativeScore += blacklistRule.scoreWeight;
      matchedThreats.push("Matches known customer profile in Fraud Blacklist DB!");
    }
  }

  // 2. High Value Cash On Delivery Check
  const highValRule = rules.find(r => r.id === "RULE_HIGH_VAL_COD");
  if (highValRule?.enabled) {
    const isCod = paymentMethod.toLowerCase().includes("cash") || 
                  paymentMethod.toLowerCase().includes("counter") || 
                  paymentMethod.includes("COD");
    if (isCod && totalBDT > config.maxCodValueBDT) {
      cumulativeScore += highValRule.scoreWeight;
      matchedThreats.push(`High Value Cash-On-Delivery Order (৳${totalBDT.toLocaleString()} > limit ৳${config.maxCodValueBDT.toLocaleString()})`);
    }
  }

  // 3. Bangladesh Phone Operator Prefix validation
  const operandRule = rules.find(r => r.id === "RULE_NON_STANDARD_PHONE");
  if (operandRule?.enabled && formattedPhone) {
    // Standard operator prefixes: 013, 014, 015, 016, 017, 018, 019
    const regexBD = /^(013|014|015|016|017|018|019)\d{8}$/;
    if (!regexBD.test(formattedPhone)) {
      cumulativeScore += operandRule.scoreWeight;
      matchedThreats.push(`Suspicious/Invalid BD mobile operator layout or length (${formattedPhone || 'empty'})`);
    }
  }

  // 4. Anonymous Name Check
  const nameRule = rules.find(r => r.id === "RULE_SPAM_BUYER_NAME");
  if (nameRule?.enabled && customerName) {
    const canonicalName = customerName.toLowerCase().trim();
    const isTestName = ["test", "asdf", "xyz", "guest", "admin", "client", "buyer"].some(kw => canonicalName.includes(kw));
    const isTooShort = canonicalName.length <= 2;
    const hasNumbers = /\d/.test(canonicalName);

    if (isTestName || isTooShort || hasNumbers) {
      cumulativeScore += nameRule.scoreWeight;
      matchedThreats.push(`Spam/Anonymous identity pattern flagged: "${customerName}"`);
    }
  }

  // Limit score to bounds
  const penaltyScore = Math.min(100, Math.max(0, cumulativeScore));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (penaltyScore >= 90) riskLevel = 'CRITICAL';
  else if (penaltyScore >= 60) riskLevel = 'HIGH';
  else if (penaltyScore >= 30) riskLevel = 'MEDIUM';

  // Advise specific action based on assessment
  let actionRequired = "Approved. Safe to print invoice & dispatch to shipping.";
  let suggestedBookingFeeBDT = 0;

  if (riskLevel === 'CRITICAL') {
    actionRequired = "⚠️ CRITICAL SUSPICION: Contact customer manually. Cancel directly or require complete 100% advance bKash/Nagad clearing before dispatching.";
    suggestedBookingFeeBDT = Math.round(totalBDT);
  } else if (riskLevel === 'HIGH') {
    suggestedBookingFeeBDT = Math.round((totalBDT * config.defaultAdvancePercent) / 100);
    // minimum charge-in fee of BDT 150 for courier return security
    if (suggestedBookingFeeBDT < 150) suggestedBookingFeeBDT = 150;
    actionRequired = `⚡ ACTION MANDATED: High returning risk. Require an advance booking/shipping fee of ৳${suggestedBookingFeeBDT.toLocaleString()} via bKash/Nagad before shipment.`;
  } else if (riskLevel === 'MEDIUM') {
    suggestedBookingFeeBDT = 150; // standard delivery pre-payment
    actionRequired = `ℹ️ ADVISORY: Recommend calling the customer to verify real address coordinates or request ৳150 delivery prepay.`;
  }

  return {
    riskScore: penaltyScore,
    riskLevel,
    matchedThreats,
    actionRequired,
    suggestedBookingFeeBDT
  };
}
