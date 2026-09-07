/**
 * UPI-Shield detection engine.
 *
 * Multi-signal, explainable heuristics (NOT trivial string equality):
 *  - Each signal is a family of regex/lexical patterns with weights.
 *  - Signals combine (co-occurrence bonus) because scam messages are defined
 *    by the *combination* of urgency + authority + action, not single words.
 *  - Score is normalised 0-100 and mapped to a risk band.
 *  - Every hit returns human-readable evidence in English + Hindi.
 */

export type RiskBand = "safe" | "caution" | "suspicious" | "high";

export interface SignalHit {
  id: string;
  label: { en: string; hi: string };
  why: { en: string; hi: string };
  weight: number;
  matches: string[];
}

export interface UpiIntent {
  raw: string;
  pa?: string | undefined; // payee address (VPA)
  pn?: string | undefined; // payee name
  am?: string | undefined; // amount
  tn?: string | undefined; // transaction note
  mc?: string | undefined; // merchant code
  flags: string[];
}

export interface AnalysisResult {
  score: number;
  band: RiskBand;
  hits: SignalHit[];
  intents: UpiIntent[];
  advice: { en: string[]; hi: string[] };
  summary: { en: string; hi: string };
}

interface SignalDef {
  id: string;
  label: { en: string; hi: string };
  why: { en: string; hi: string };
  weight: number;
  patterns: RegExp[];
}

/* ------------------------------------------------------------------ */
/* Signal definitions (English + Hinglish + Devanagari coverage)       */
/* ------------------------------------------------------------------ */

export const SIGNALS: SignalDef[] = [
  {
    id: "urgency",
    weight: 22,
    label: { en: "Artificial urgency / deadline", hi: "बनावटी जल्दबाजी / समय-सीमा" },
    why: {
      en: "The message pushes you to act within minutes. Real institutions never give a few-minute deadline over SMS.",
      hi: "संदेश आपको कुछ ही मिनटों में कार्रवाई के लिए मजबूर करता है। असली संस्थाएँ SMS पर इतनी छोटी समय-सीमा कभी नहीं देतीं।",
    },
    patterns: [
      /\b(immediate(ly)?|urgent(ly)?|right now|asap|within\s+\d+\s*(min|minute|hour|hr)s?|before\s+\d{1,2}\s*(pm|am|baje)|last (chance|warning)|final (notice|warning|reminder)|today itself|expires? (today|soon|in))\b/gi,
      /\b(turant|abhi|jaldi|aaj hi|antim (suchna|chetavani))\b/gi,
      /(तुरंत|अभी|जल्दी|आज ही|अंतिम (सूचना|चेतावनी)|समय सीमा)/g,
    ],
  },
  {
    id: "threat",
    weight: 24,
    label: { en: "Threat of loss or disconnection", hi: "नुकसान या कनेक्शन कटने की धमकी" },
    why: {
      en: "Fear of service cut, blocking or legal action is the classic coercion lever used to stop you from thinking.",
      hi: "सेवा बंद होने, खाता ब्लॉक होने या कानूनी कार्रवाई का डर, आपको सोचने से रोकने की सबसे आम चाल है।",
    },
    patterns: [
      /\b(disconnect(ed|ion)?|cut off|deactivat(e|ed|ion)|suspend(ed|sion)?|block(ed|ing)?|terminat(e|ed)|penalt(y|ies)|fine|legal action|FIR|court|seiz(e|ed)|freeze|frozen|de-?activate)\b/gi,
      /\b(katega|band ho jayega|kaat diya|jurmana|karyawahi)\b/gi,
      /(कट\s?जाएग|बंद हो जाएग|काट दिया|जुर्माना|कानूनी कार्रवाई|खाता बंद)/g,
    ],
  },
  {
    id: "authority",
    weight: 20,
    label: { en: "Unverified authority claim", hi: "असत्यापित अधिकारी होने का दावा" },
    why: {
      en: "The sender claims to be an electricity board, bank, KYC officer, police or government body without any verifiable identity.",
      hi: "भेजने वाला बिजली विभाग, बैंक, KYC अधिकारी, पुलिस या सरकारी संस्था होने का दावा करता है, पर कोई पहचान सत्यापित नहीं है।",
    },
    patterns: [
      /\b(electricity (board|department|bill|connection)|bijli|power (board|department)|bank (officer|manager|executive)|RBI|SBI|HDFC|ICICI|Axis|Paytm|PhonePe|GPay|Google Pay|KYC (update|officer|team)|income tax|customs|police|cyber cell|court|TRAI|EPFO|Aadhaar|UIDAI|gas agency|LPG)\b/gi,
      /(बिजली विभाग|बिजली बिल|बैंक अधिकारी|केवाईसी|आधार|पुलिस|आयकर)/g,
    ],
  },
  {
    id: "credential",
    weight: 30,
    label: { en: "Request for PIN / OTP / card data", hi: "पिन / ओटीपी / कार्ड जानकारी की माँग" },
    why: {
      en: "No genuine bank, app or officer ever asks for your UPI PIN, OTP, CVV or card number. This alone is proof of fraud.",
      hi: "कोई भी असली बैंक, ऐप या अधिकारी कभी आपका UPI PIN, OTP, CVV या कार्ड नंबर नहीं माँगता। यह अकेला ही धोखाधड़ी का प्रमाण है।",
    },
    patterns: [
      /\b(upi\s*pin|m-?pin|otp|one[\s-]?time[\s-]?password|cvv|card\s*(no|number)|expiry\s*date|net ?banking (id|password)|password|passcode|debit card details)\b/gi,
      /\b(pin bat(a|ao)|otp bat(a|ao)|otp share)\b/gi,
      /(ओटीपी|पिन|सीवीवी|पासवर्ड)/g,
    ],
  },
  {
    id: "refundlure",
    weight: 26,
    label: { en: "Refund / cashback / verification lure", hi: "रिफंड / कैशबैक / सत्यापन का लालच" },
    why: {
      en: "You are told to PAY or APPROVE a request in order to RECEIVE money. Receiving money on UPI never needs your PIN.",
      hi: "आपसे पैसे पाने के लिए भुगतान या रिक्वेस्ट स्वीकार करने को कहा जाता है। UPI पर पैसे लेने के लिए PIN कभी नहीं लगता।",
    },
    patterns: [
      /\b(refund|cash ?back|reward|prize|lottery|lucky (draw|winner)|bonus|claim (your|the)?\s*(amount|money)|verification (amount|charge|fee)|verify (your )?(account|payment)|test transaction|processing fee|registration fee|token amount)\b/gi,
      /\b(paise wapas|inaam|jeet(a|e)|shulk)\b/gi,
      /(रिफंड|कैशबैक|इनाम|लॉटरी|सत्यापन शुल्क|पंजीकरण शुल्क)/g,
    ],
  },
  {
    id: "collectreq",
    weight: 28,
    label: { en: "Collect-request / pay-to-receive trap", hi: "कलेक्ट-रिक्वेस्ट / पाने के लिए भुगतान का जाल" },
    why: {
      en: "Approving a 'collect request' or scanning a QR DEBITS your account. QR codes and requests can never credit you.",
      hi: "'कलेक्ट रिक्वेस्ट' स्वीकार करने या QR स्कैन करने पर पैसे कटते हैं। QR या रिक्वेस्ट से पैसे कभी नहीं आते।",
    },
    patterns: [
      /\b(accept (the )?(request|collect)|approve (the )?request|scan (this|the)? ?qr|qr code|collect request|enter (your )?pin to receive|pay to receive|send ?₹?\s?\d+ to (get|receive))\b/gi,
      /\b(request accept kar|qr scan kar)\b/gi,
      /(रिक्वेस्ट स्वीकार|क्यूआर स्कैन)/g,
    ],
  },
  {
    id: "channel",
    weight: 18,
    label: { en: "Off-channel contact / remote-access app", hi: "अनौपचारिक संपर्क / रिमोट-एक्सेस ऐप" },
    why: {
      en: "Being pushed to WhatsApp, a personal mobile number, or to install AnyDesk/TeamViewer gives the scammer control of your phone.",
      hi: "WhatsApp, निजी मोबाइल नंबर या AnyDesk/TeamViewer इंस्टॉल करवाना, ठग को आपके फ़ोन का नियंत्रण दे देता है।",
    },
    patterns: [
      /\b(anydesk|teamviewer|quick ?support|rustdesk|screen shar(e|ing)|install (this )?app|apk|download the app)\b/gi,
      /\b(whatsapp (me|karo|kare|par))\b/gi,
      /\b(call|contact|dial|sampark)\b[^.\n]{0,30}(\+?91[\s-]?)?[6-9]\d{9}\b/gi,
      /(व्हाट्सएप|कॉल करें)/g,
    ],
  },
  {
    id: "link",
    weight: 20,
    label: { en: "Suspicious or shortened link", hi: "संदिग्ध या छोटा किया गया लिंक" },
    why: {
      en: "Shortened or look-alike domains hide the real destination and usually lead to a fake payment page.",
      hi: "छोटे या मिलते-जुलते डोमेन असली पता छिपाते हैं और अक्सर नकली भुगतान पेज पर ले जाते हैं।",
    },
    patterns: [
      /\b(bit\.ly|tinyurl|t\.me|rb\.gy|cutt\.ly|is\.gd|shorturl|linktr\.ee)\S*/gi,
      /https?:\/\/[^\s]*(\.xyz|\.top|\.online|\.click|\.buzz|\.info|-?kyc|-?refund|-?verify)[^\s]*/gi,
      /\b[a-z0-9-]*(sbi|hdfc|icici|paytm|phonepe|npci|upi)[a-z0-9-]*\.(xyz|top|online|click|site|shop|in\.net)\b/gi,
    ],
  },
  {
    id: "secrecy",
    weight: 16,
    label: { en: "Secrecy / do-not-tell pressure", hi: "गोपनीयता / किसी को न बताने का दबाव" },
    why: {
      en: "Asking you to keep it secret or not to consult family is a coercion tactic to remove a second opinion.",
      hi: "किसी को न बताने या परिवार से सलाह न लेने को कहना, दूसरी राय रोकने की दबाव-रणनीति है।",
    },
    patterns: [
      /\b(do ?n['o]?t tell|don't inform|keep (this )?(secret|confidential)|without informing|no need to (tell|inform)|stay on (the )?(call|line)|do not (cut|disconnect) the call)\b/gi,
      /(किसी को मत बताना|गोपनीय रखें|कॉल मत काटना)/g,
    ],
  },
  {
    id: "moneyask",
    weight: 14,
    label: { en: "Direct payment instruction", hi: "सीधा भुगतान निर्देश" },
    why: {
      en: "A specific small amount is demanded now — small amounts lower resistance and confirm your account is live.",
      hi: "अभी एक छोटी राशि माँगी जा रही है — छोटी राशि विरोध कम करती है और खाता चालू होने की पुष्टि करती है।",
    },
    patterns: [
      /(₹|rs\.?|inr)\s?\d{1,7}(\.\d{1,2})?/gi,
      /\b(pay|transfer|send money|deposit|recharge)\b/gi,
      /(भुगतान|पैसे भेज|जमा कर)/g,
    ],
  },
  {
    id: "grammar",
    weight: 8,
    label: { en: "Mass-fraud template style", hi: "थोक-धोखाधड़ी टेम्पलेट शैली" },
    why: {
      en: "ALL-CAPS shouting, odd spacing and mixed scripts are typical of bulk scam templates.",
      hi: "बड़े अक्षरों में चिल्लाना, अजीब स्पेसिंग और मिली-जुली लिपि, थोक स्कैम टेम्पलेट की पहचान है।",
    },
    patterns: [/\b[A-Z]{5,}\b/g, /!{2,}/g, /\b(dear (customer|user|sir\/madam))\b/gi],
  },
];

/* Signals that neutralise risk (legit-looking transactional confirmations) */
const SAFE_PATTERNS: RegExp[] = [
  /\b(debited|credited)\b[^.]{0,60}\b(a\/c|account|acct)\b/gi,
  /\b(upi\s*ref|txn\s*(id|no)|ref\s*no)\b[\s:]*\d{6,}/gi,
  /\b(thank you for (your )?(payment|order))\b/gi,
];

/** Safety advisories such as "never share your OTP" must not count as a request. */
const NEGATED_CREDENTIAL =
  /\b(do ?n['o]?t|never|no one|nobody|kabhi (mat|nahi))\b[^.\n]{0,40}\b(share|shar(e|ing)|batao|bataye|disclose|reveal)\b[^.\n]{0,40}/gi;

/* ------------------------------------------------------------------ */
/* UPI intent parsing                                                  */
/* ------------------------------------------------------------------ */

export function parseUpiIntents(text: string): UpiIntent[] {
  const out: UpiIntent[] = [];
  const re = /upi:\/\/(pay|collect)\?[^\s"'<>]+/gi;
  const found = text.match(re) ?? [];
  for (const raw of found) {
    const q = raw.split("?")[1] ?? "";
    const params = new URLSearchParams(q);
    const get = (k: string) => params.get(k) ?? undefined;
    const intent: UpiIntent = {
      raw,
      pa: get("pa"),
      pn: get("pn"),
      am: get("am"),
      tn: get("tn"),
      mc: get("mc"),
      flags: [],
    };
    if (/^upi:\/\/collect/i.test(raw))
      intent.flags.push("Collect request: approving this DEBITS your account.");
    if (intent.pa && !/^[\w.\-]{2,}@[a-z]{2,}$/i.test(intent.pa))
      intent.flags.push("Payee VPA looks malformed.");
    if (intent.pn && intent.pa) {
      const nameToken = intent.pn.toLowerCase().replace(/[^a-z]/g, "").slice(0, 4);
      if (nameToken && !intent.pa.toLowerCase().includes(nameToken))
        intent.flags.push(`Display name "${intent.pn}" does not match the UPI ID.`);
    }
    if (intent.pn && /(refund|kyc|verify|electricity|bijli|support|helpline|npci|bank)/i.test(intent.pn))
      intent.flags.push("Payee name impersonates an official service.");
    if (!intent.mc) intent.flags.push("No merchant code: this is a personal, non-verified payee.");
    if (intent.am && Number(intent.am) > 0 && /refund|cashback/i.test(text))
      intent.flags.push("You are asked to PAY while being promised a refund.");
    out.push(intent);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Main analyser                                                       */
/* ------------------------------------------------------------------ */

export function bandOf(score: number): RiskBand {
  if (score >= 70) return "high";
  if (score >= 45) return "suspicious";
  if (score >= 20) return "caution";
  return "safe";
}

export const BAND_LABEL: Record<RiskBand, { en: string; hi: string }> = {
  safe: { en: "Looks Safe", hi: "सुरक्षित लगता है" },
  caution: { en: "Be Careful", hi: "सावधान रहें" },
  suspicious: { en: "Suspicious", hi: "संदिग्ध" },
  high: { en: "High Risk — Do Not Pay", hi: "उच्च जोखिम — भुगतान न करें" },
};

export function analyzeMessage(text: string): AnalysisResult {
  const clean = text.trim();
  // Strip anti-fraud advisories so "do not share your OTP" is not read as an OTP request.
  const scanText = clean.replace(NEGATED_CREDENTIAL, " ");
  const hits: SignalHit[] = [];

  for (const s of SIGNALS) {
    const matches = new Set<string>();
    for (const p of s.patterns) {
      const m = scanText.match(new RegExp(p.source, p.flags));
      if (m) m.slice(0, 4).forEach((x) => matches.add(x.trim()));
    }
    if (matches.size > 0) {
      hits.push({
        id: s.id,
        label: s.label,
        why: s.why,
        weight: s.weight,
        matches: [...matches].slice(0, 5),
      });
    }
  }

  const intents = parseUpiIntents(clean);
  if (intents.some((i) => /^upi:\/\/collect/i.test(i.raw)) && !hits.some((h) => h.id === "collectreq")) {
    const def = SIGNALS.find((x) => x.id === "collectreq")!;
    hits.push({
      id: def.id,
      label: def.label,
      why: def.why,
      weight: def.weight,
      matches: ["upi://collect"],
    });
  }
  if (intents.length > 0 && !hits.some((h) => h.id === "moneyask")) {
    const def = SIGNALS.find((x) => x.id === "moneyask")!;
    hits.push({ id: def.id, label: def.label, why: def.why, weight: def.weight, matches: ["upi:// payment intent"] });
  }

  // Weighted sum with diminishing returns, plus co-occurrence bonus.
  const sorted = [...hits].sort((a, b) => b.weight - a.weight);
  let raw = 0;
  sorted.forEach((h, i) => {
    raw += h.weight * Math.pow(0.82, i);
  });

  const families = new Set(hits.map((h) => h.id));
  const pressure = ["urgency", "threat", "secrecy"].some((f) => families.has(f));
  const action = ["credential", "collectreq", "moneyask", "link", "channel"].some((f) => families.has(f));
  const pretext = ["authority", "refundlure"].some((f) => families.has(f));
  if (pressure && action) raw += 14; // coercion + action = classic scam shape
  if (pretext && action) raw += 10;
  if (pressure && action && pretext) raw += 8;
  if (families.has("credential")) raw = Math.max(raw, 78); // hard floor
  if (intents.some((i) => i.flags.length >= 2)) raw += 12;

  let safeMarkers = 0;
  for (const sp of SAFE_PATTERNS) if (new RegExp(sp.source, sp.flags).test(clean)) safeMarkers++;
  raw -= safeMarkers * 18;
  // A properly formatted bank alert with no pressure signals is a transaction receipt.
  if (safeMarkers >= 2 && !pressure && !pretext) raw = Math.min(raw, 12);
  if (clean.length < 12) raw = Math.min(raw, 15);

  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const band = bandOf(score);

  const advice = buildAdvice(band, families);
  const summary = buildSummary(band, hits);

  return { score, band, hits, intents, advice, summary };
}

function buildSummary(band: RiskBand, hits: SignalHit[]) {
  const top = hits
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
  const en =
    top.length === 0
      ? "No known scam pressure patterns were found in this message."
      : `This message combines ${top.map((t) => t.label.en.toLowerCase()).join(", ")}. ${
          band === "high"
            ? "That combination is how UPI coercion scams work — do not pay."
            : "Verify through an official app before paying."
        }`;
  const hi =
    top.length === 0
      ? "इस संदेश में कोई ज्ञात ठगी-दबाव पैटर्न नहीं मिला।"
      : `इस संदेश में ${top.map((t) => t.label.hi).join(", ")} एक साथ हैं। ${
          band === "high"
            ? "यही तरीका UPI ठगी में इस्तेमाल होता है — भुगतान न करें।"
            : "भुगतान से पहले आधिकारिक ऐप से जाँच करें।"
        }`;
  return { en, hi };
}

function buildAdvice(band: RiskBand, families: Set<string>) {
  const en: string[] = [];
  const hi: string[] = [];
  const add = (e: string, h: string) => {
    en.push(e);
    hi.push(h);
  };

  if (band === "high" || band === "suspicious") {
    add(
      "Do not pay, do not approve any request, and do not scan any QR from this message.",
      "भुगतान न करें, कोई रिक्वेस्ट स्वीकार न करें और इस संदेश का कोई QR स्कैन न करें।",
    );
  }
  if (families.has("credential")) {
    add(
      "Never share your UPI PIN or OTP — no bank or officer will ever ask for it.",
      "अपना UPI PIN या OTP कभी साझा न करें — कोई बैंक या अधिकारी इसे कभी नहीं माँगता।",
    );
  }
  if (families.has("collectreq") || families.has("refundlure")) {
    add(
      "Receiving money never needs your PIN. Entering the PIN always sends money out.",
      "पैसे लेने के लिए PIN कभी नहीं लगता। PIN डालने पर हमेशा पैसे जाते हैं।",
    );
  }
  if (families.has("authority") || families.has("threat")) {
    add(
      "Call the official helpline printed on your real bill or the bank's app — never a number from this message.",
      "अपने असली बिल या बैंक ऐप पर छपे आधिकारिक हेल्पलाइन नंबर पर कॉल करें — इस संदेश के नंबर पर नहीं।",
    );
  }
  if (families.has("channel")) {
    add(
      "Do not install AnyDesk, TeamViewer or any screen-sharing app on a caller's instruction.",
      "किसी कॉलर के कहने पर AnyDesk, TeamViewer या स्क्रीन-शेयर ऐप इंस्टॉल न करें।",
    );
  }
  add(
    "If money is already lost, dial 1930 or report at cybercrime.gov.in within the golden hour.",
    "अगर पैसे चले गए हैं तो तुरंत 1930 डायल करें या cybercrime.gov.in पर शिकायत करें।",
  );
  if (band === "safe" && en.length === 1) {
    en.unshift("Nothing alarming found, but still verify any payment request inside your bank app.");
    hi.unshift("कुछ खतरनाक नहीं मिला, फिर भी किसी भी भुगतान अनुरोध की जाँच अपने बैंक ऐप में करें।");
  }
  return { en, hi };
}

export const SAMPLES: { title: string; text: string }[] = [
  {
    title: "Electricity disconnection",
    text: "Dear Customer, your electricity connection will be DISCONNECTED tonight at 9:30 PM as your previous bill was not updated. Immediately call our officer on 9812345678 to update. Last warning.",
  },
  {
    title: "Verification refund",
    text: "Congratulations! Your refund of Rs.4,850 is approved by KYC team. To verify your account, accept the collect request and enter your UPI PIN. Verification amount Rs.1 only. Claim within 10 minutes: http://sbi-refund-verify.xyz/claim",
  },
  {
    title: "Raw UPI intent",
    text: "Sir please approve, payment link: upi://collect?pa=refund.helpline@oksbi&pn=SBI%20Refund%20Cell&am=4999&tn=verification",
  },
  {
    title: "Genuine bank alert",
    text: "Rs.250.00 debited from A/c XX4412 on 04-09-26 to VPA grocerystore@ybl. UPI Ref 512398210344. Not you? Call 1800111109. Do not share your OTP or PIN with anyone.",
  },
];
