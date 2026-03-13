const SCAM_KEYWORDS = [
  "account blocked", "account will be blocked", "verify now", "urgent", "immediately",
  "otp", "pin", "password", "bank account", "upi", "transfer", "refund",
  "lottery", "prize", "winner", "congratulations", "free money", "click here",
  "limited time", "act now", "kyc", "suspend", "freeze", "legal action",
  "police", "arrest", "tax fraud", "income tax", "irdai", "sebi", "rbi",
  "aadhar", "pan card", "debit card", "credit card", "atm", "cvv",
  "cash back", "reward points", "claim", "expire", "verify your",
  "http://", "bit.ly", "tinyurl", "suspicious link", "malicious",
];

const UPI_PATTERN = /[a-zA-Z0-9._-]+@[a-zA-Z]+/g;
const PHONE_PATTERN = /(\+91|0)?[6-9]\d{9}/g;
const BANK_ACCOUNT_PATTERN = /\b\d{9,18}\b/g;
const LINK_PATTERN = /https?:\/\/[^\s]+/g;
const IFSC_PATTERN = /[A-Z]{4}0[A-Z0-9]{6}/g;

export interface ExtractionResult {
  bankAccounts: string[];
  upiIds: string[];
  phishingLinks: string[];
  phoneNumbers: string[];
  suspiciousKeywords: string[];
}

export function detectScamProbability(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  let matchedKeywords = 0;

  for (const keyword of SCAM_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchedKeywords++;
      score += keyword.length > 10 ? 15 : 8;
    }
  }

  if (UPI_PATTERN.test(text)) score += 20;
  if (PHONE_PATTERN.test(text)) score += 15;
  if (LINK_PATTERN.test(text)) score += 25;

  const urgencyWords = ["immediately", "right now", "today", "hours", "minutes", "urgent", "critical"];
  for (const word of urgencyWords) {
    if (lowerText.includes(word)) score += 10;
  }

  if (lowerText.includes("block") || lowerText.includes("suspend") || lowerText.includes("freeze")) {
    score += 20;
  }

  return Math.min(score, 100);
}

export function detectScamType(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("upi") || lowerText.includes("transfer") || lowerText.includes("gpay") || lowerText.includes("phonepe")) {
    return "UPI Fraud";
  }
  if (lowerText.includes("bank") || lowerText.includes("account") || lowerText.includes("atm") || lowerText.includes("debit")) {
    return "Bank Fraud";
  }
  if (lowerText.includes("lottery") || lowerText.includes("winner") || lowerText.includes("prize") || lowerText.includes("congratulations")) {
    return "Lottery Scam";
  }
  if (lowerText.includes("http") || lowerText.includes("click here") || lowerText.includes("link") || lowerText.includes("website")) {
    return "Phishing";
  }
  if (lowerText.includes("kyc") || lowerText.includes("aadhar") || lowerText.includes("pan")) {
    return "KYC Fraud";
  }
  if (lowerText.includes("tax") || lowerText.includes("income") || lowerText.includes("refund")) {
    return "Tax Fraud";
  }
  if (lowerText.includes("offer") || lowerText.includes("deal") || lowerText.includes("discount") || lowerText.includes("free")) {
    return "Fake Offer";
  }

  return "General Scam";
}

export function extractIntelligence(text: string): ExtractionResult {
  const upiMatches = text.match(UPI_PATTERN) || [];
  const phoneMatches = text.match(PHONE_PATTERN) || [];
  const linkMatches = text.match(LINK_PATTERN) || [];
  const accountMatches = text.match(BANK_ACCOUNT_PATTERN) || [];
  const ifscMatches = text.match(IFSC_PATTERN) || [];

  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];
  for (const keyword of SCAM_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }

  const suspiciousLinks = linkMatches.filter(link => {
    const domain = link.toLowerCase();
    return !domain.includes("google.com") && !domain.includes("facebook.com") &&
      !domain.includes("youtube.com") && !domain.includes("wikipedia.org");
  });

  return {
    bankAccounts: [...new Set([...accountMatches, ...ifscMatches])].slice(0, 5),
    upiIds: [...new Set(upiMatches)].slice(0, 5),
    phishingLinks: [...new Set(suspiciousLinks)].slice(0, 5),
    phoneNumbers: [...new Set(phoneMatches)].slice(0, 5),
    suspiciousKeywords: [...new Set(foundKeywords)].slice(0, 10),
  };
}

export function mergeIntelligence(existing: ExtractionResult, newData: ExtractionResult): ExtractionResult {
  return {
    bankAccounts: [...new Set([...existing.bankAccounts, ...newData.bankAccounts])],
    upiIds: [...new Set([...existing.upiIds, ...newData.upiIds])],
    phishingLinks: [...new Set([...existing.phishingLinks, ...newData.phishingLinks])],
    phoneNumbers: [...new Set([...existing.phoneNumbers, ...newData.phoneNumbers])],
    suspiciousKeywords: [...new Set([...existing.suspiciousKeywords, ...newData.suspiciousKeywords])],
  };
}
