import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Printer } from "lucide-react";

export const Route = createFileRoute("/slides")({
  head: () => ({
    meta: [
      { title: "UPI-Shield Slide Deck — Presentation" },
      {
        name: "description",
        content:
          "A 12-slide presentation deck for UPI-Shield: problem, solution, architecture, detection engine, demo flow, impact and roadmap.",
      },
      { property: "og:title", content: "UPI-Shield Slide Deck" },
      { property: "og:description", content: "Presentation-ready deck for the UPI-Shield scam detector project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Slides,
});

interface Slide {
  kicker: string;
  title: string;
  bullets?: string[];
  note?: string;
  mono?: string;
}

const SLIDES: Slide[] = [
  {
    kicker: "Slide 1 · Title",
    title: "UPI-Shield",
    bullets: [
      "Contextual Digital Payment Scam & Coercion Detector",
      "Reads the message behind the payment, in English and Hindi",
      "Team of 2–3 · 4-hour MVP · Web app",
    ],
    note: "Opening line: 'Scammers don't break your PIN — they break your calm.'",
  },
  {
    kicker: "Slide 2 · The real-world context",
    title: "The scam is social, not technical",
    bullets: [
      "A call or SMS claims your electricity will be cut tonight at 9:30 PM",
      "A 'KYC officer' promises a refund if you approve one small request",
      "The victim panics and pays within minutes",
    ],
    note: "Tell one 20-second story. Do not read the slide.",
  },
  {
    kicker: "Slide 3 · The core problem",
    title: "The user authorises the fraud themselves",
    bullets: [
      "MPIN, 2FA and device binding all succeed — the user typed the PIN",
      "Payment rails see a valid transaction, not a coerced one",
      "Missing layer is context, not authentication",
    ],
  },
  {
    kicker: "Slide 4 · Why it matters",
    title: "Scale of exposure",
    bullets: [
      "Hundreds of millions of UPI users, many first-time digital users",
      "Social-urgency deception defeats every existing check",
      "English-only warnings are ignored by the most vulnerable users",
    ],
  },
  {
    kicker: "Slide 5 · Our solution",
    title: "A context firewall before the payment",
    bullets: [
      "Paste any SMS, WhatsApp text, payment note or upi:// link",
      "Get a 0–100 Threat Meter with a clear risk band",
      "Get evidence: which manipulation tactics were used and why",
      "Get a bilingual safety card telling the user exactly what not to do",
    ],
  },
  {
    kicker: "Slide 6 · Architecture",
    title: "Three layers, one second",
    mono: `Ingest  →  Detection core (on device)  →  Explanation
                    ├ normaliser
                    ├ 11 tactic families
                    ├ upi:// intent parser
                    └ risk aggregator
                                     ↓ optional
                        AI second opinion (Gemini)`,
    note: "Offline-first: the rule engine never needs the network, so the demo cannot fail.",
  },
  {
    kicker: "Slide 7 · Detection engine",
    title: "Tactic families, not keywords",
    bullets: [
      "Urgency · Threat · Fake authority · PIN/OTP request",
      "Refund lure · Collect-request trap · Off-channel · Suspicious link",
      "Secrecy pressure · Money ask · Bulk-template style",
      "Each family covers English, Hinglish and Devanagari patterns",
    ],
  },
  {
    kicker: "Slide 8 · Scoring model",
    title: "Combination is the signal",
    mono: `raw = Σ weight × 0.82^rank        (diminishing returns)
+14  pressure AND action
+10  pretext  AND action
+ 8  all three
floor 78 if the message asks for PIN/OTP
-12  genuine bank-alert patterns

0–19 Safe · 20–44 Caution · 45–69 Suspicious · 70+ High Risk`,
  },
  {
    kicker: "Slide 9 · Bilingual safety card",
    title: "Advice a first-time user can act on",
    bullets: [
      "'Receiving money never needs your PIN' — पैसे लेने के लिए PIN कभी नहीं लगता",
      "Curated Hindi, not machine translation, so instructions stay unambiguous",
      "One toggle flips the entire result view",
    ],
  },
  {
    kicker: "Slide 10 · Live demo",
    title: "90 seconds, four clicks",
    bullets: [
      "1. Verification-refund sample → High Risk, meter swings",
      "2. Evidence cards show the exact matched phrases",
      "3. Hindi toggle → whole safety card in Hindi",
      "4. Genuine bank alert → Safe (proves it is not keyword panic)",
    ],
  },
  {
    kicker: "Slide 11 · Bonus & impact",
    title: "Beyond the MVP",
    bullets: [
      "Raw upi:// intent parsing with payee-name vs VPA mismatch checks",
      "Next: screenshot OCR, voice-call transcription, regional languages",
      "Next: Android overlay that warns at the moment of payment",
    ],
  },
  {
    kicker: "Slide 12 · Close",
    title: "Stop the payment before the panic wins",
    bullets: [
      "Explainable, offline, bilingual, one second",
      "Try it: paste any suspicious message",
      "Lost money? Dial 1930 or report at cybercrime.gov.in",
    ],
  },
];

function Slides() {
  const [i, setI] = useState(0);
  const next = useCallback(() => setI((v) => Math.min(v + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setI((v) => Math.max(v - 1, 0)), []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  const s = SLIDES[i];

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to detector
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground">
            Documentation
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Printer className="size-4" /> Print / PDF
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        <section className="panel flex min-h-[460px] flex-col justify-between p-8 sm:p-12">
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-primary">{s.kicker}</p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-5xl">
              {s.title}
            </h1>
            {s.bullets && (
              <ul className="mt-8 space-y-4">
                {s.bullets.map((b, k) => (
                  <li key={k} className="flex gap-4 text-lg text-muted-foreground">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-shield" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.mono && (
              <pre className="mt-8 overflow-x-auto rounded-xl border border-border bg-background/60 p-5 font-mono text-xs leading-relaxed text-foreground sm:text-sm">
                {s.mono}
              </pre>
            )}
          </div>
          {s.note && (
            <p className="mt-8 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-muted-foreground">
              <span className="font-semibold text-accent">Speaker note: </span>
              {s.note}
            </p>
          )}
        </section>

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={prev}
            disabled={i === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Previous
          </button>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SLIDES.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                aria-label={`Go to slide ${k + 1}`}
                className={`h-2 rounded-full transition-all ${k === i ? "bg-shield w-7" : "w-2 bg-border"}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={i === SLIDES.length - 1}
            className="bg-shield inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Slide {i + 1} of {SLIDES.length} · use ← → keys · "Print / PDF" exports the current slide
        </p>
      </main>
    </div>
  );
}
