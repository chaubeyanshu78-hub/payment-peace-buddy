import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Presentation } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "UPI-Shield Documentation — Build & Demo Guide" },
      {
        name: "description",
        content:
          "Step-by-step documentation for UPI-Shield: problem, architecture, detection engine, scoring model, API, demo script and roadmap.",
      },
      { property: "og:title", content: "UPI-Shield Documentation" },
      {
        property: "og:description",
        content: "Full project documentation for the UPI-Shield payment scam and coercion detector.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Docs,
});

const TOC = [
  ["1", "Problem statement"],
  ["2", "Solution overview"],
  ["3", "System architecture"],
  ["4", "Detection engine design"],
  ["5", "Scoring model"],
  ["6", "Bilingual output layer"],
  ["7", "UPI intent parsing"],
  ["8", "AI second opinion"],
  ["9", "Step-by-step build (4 hours)"],
  ["10", "How to use / demo script"],
  ["11", "Testing & accuracy"],
  ["12", "Limitations & roadmap"],
];

function H({ id, n, children }: { id: string; n: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-24 font-display text-2xl font-bold text-foreground">
      <span className="text-primary">{n}.</span> {children}
    </h2>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-background/60 p-4 font-mono text-xs leading-relaxed text-foreground">
      {children}
    </pre>
  );
}

function Docs() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to detector
        </Link>
        <Link
          to="/slides"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Presentation className="size-4" /> Slide deck
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 pb-24 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="panel sticky top-6 p-4 text-sm">
            <p className="mb-2 font-display font-semibold text-foreground">Contents</p>
            <ul className="space-y-1.5">
              {TOC.map(([n, t]) => (
                <li key={n}>
                  <a href={`#s${n}`} className="text-muted-foreground transition-colors hover:text-primary">
                    {n}. {t}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="panel p-6 sm:p-10">
          <p className="font-display text-xs uppercase tracking-widest text-primary">Project documentation</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">
            UPI-Shield: Contextual Digital Payment Scam & Coercion Detector
          </h1>
          <p className="mt-4 text-muted-foreground">
            Version 1.0 · Hackathon MVP · Team size 2–3 · Build window 4 hours
          </p>

          <H id="s1" n="1">Problem statement</H>
          <p className="mt-3 text-muted-foreground">
            Indian UPI fraud has moved from technical attacks to psychological ones. A scammer calls or texts posing as
            the electricity board, a bank KYC officer or a refund desk, manufactures a deadline ("your connection will
            be cut at 9:30 PM"), and the victim <strong className="text-foreground">willingly</strong> authorises the
            payment. Because the user enters their own MPIN on their own device, 2FA, device binding and MPIN checks all
            pass. The security layer that is missing is not authentication — it is{" "}
            <strong className="text-foreground">context</strong>.
          </p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Coercion and deception are invisible to the payment rails.</li>
            <li>Victims are often first-time digital users, elderly, or under time pressure.</li>
            <li>Warnings in English only are ignored by a large share of users.</li>
          </ul>

          <H id="s2" n="2">Solution overview</H>
          <p className="mt-3 text-muted-foreground">
            UPI-Shield is a pre-payment "context firewall". The user pastes the message that is pushing them to pay.
            The app returns three things in under a second:
          </p>
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-muted-foreground">
            <li>A <strong className="text-foreground">Threat Meter</strong> (0–100 with a risk band).</li>
            <li><strong className="text-foreground">Evidence</strong> — which manipulation tactics were found and why each one matters.</li>
            <li>A <strong className="text-foreground">bilingual safety card</strong> with concrete do-not-do actions in English and Hindi.</li>
          </ol>

          <H id="s3" n="3">System architecture</H>
          <Code>{`┌──────────────────────────────────────────────┐
│  Ingest layer                                │
│  SMS text · WhatsApp text · payment note ·   │
│  raw upi:// intent string                    │
└───────────────┬──────────────────────────────┘
                ▼
┌──────────────────────────────────────────────┐
│  Detection core (runs on device, offline)    │
│  1. Normaliser  (case, spacing, scripts)     │
│  2. Signal matcher (11 tactic families)      │
│  3. UPI intent parser                        │
│  4. Risk aggregator (weights + co-occurrence)│
└───────────────┬──────────────────────────────┘
                ▼
┌──────────────────────────────────────────────┐
│  Explanation layer                           │
│  Threat Meter · evidence chips · EN/HI cards │
└───────────────┬──────────────────────────────┘
                ▼ (optional)
┌──────────────────────────────────────────────┐
│  AI second opinion — server function →       │
│  Lovable AI Gateway (Gemini) → JSON verdict  │
└──────────────────────────────────────────────┘`}</Code>
          <p className="mt-4 text-muted-foreground">
            Files: <code className="text-primary">src/lib/scam-engine.ts</code> (rules + scoring + parser),{" "}
            <code className="text-primary">src/lib/ai-analysis.functions.ts</code> (server-side AI call),{" "}
            <code className="text-primary">src/components/ThreatMeter.tsx</code> (gauge),{" "}
            <code className="text-primary">src/routes/index.tsx</code> (UI).
          </p>

          <H id="s4" n="4">Detection engine design</H>
          <p className="mt-3 text-muted-foreground">
            The engine deliberately avoids trivial keyword equality. Each of the 11 tactic families is a{" "}
            <strong className="text-foreground">pattern set</strong> covering English, Hinglish and Devanagari, and a
            verdict is driven by how families combine, not by any single word.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4">Family</th>
                  <th className="py-2 pr-4">What it captures</th>
                  <th className="py-2">Weight</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Urgency", "Deadlines, 'within 10 minutes', 'final notice'", 22],
                  ["Threat", "Disconnection, blocking, penalty, legal action", 24],
                  ["Authority", "Electricity board, bank, KYC, police, UIDAI claims", 20],
                  ["Credential", "UPI PIN, OTP, CVV, card or password requests", 30],
                  ["Refund lure", "Refund, cashback, prize, 'verification amount'", 26],
                  ["Collect request", "Approve request / scan QR / pay-to-receive", 28],
                  ["Off-channel", "WhatsApp, personal number, AnyDesk, APK install", 18],
                  ["Link", "Shorteners and look-alike bank domains", 20],
                  ["Secrecy", "'Don't tell anyone', 'stay on the call'", 16],
                  ["Money ask", "Explicit ₹ amount plus pay/transfer verb", 14],
                  ["Template style", "ALL-CAPS, '!!', 'Dear Customer'", 8],
                ].map((r) => (
                  <tr key={r[0] as string} className="border-b border-border/50">
                    <td className="py-2 pr-4 text-foreground">{r[0]}</td>
                    <td className="py-2 pr-4">{r[1]}</td>
                    <td className="py-2">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H id="s5" n="5">Scoring model</H>
          <p className="mt-3 text-muted-foreground">
            Weights are combined with diminishing returns so that one loud family cannot alone saturate the score, then
            bonuses are added for the shapes that define coercion fraud.
          </p>
          <Code>{`sorted   = hits sorted by weight desc
raw      = Σ  weight_i × 0.82^i          // diminishing returns

pressure = urgency | threat | secrecy
action   = credential | collect | money | link
pretext  = authority | refund lure

raw += 14  if pressure AND action        // coercion + action
raw += 10  if pretext  AND action        // fake reason + action
raw +=  8  if all three                  // full scam shape
raw  = max(raw, 78) if credential        // PIN/OTP ask = always high
raw += 12  if a upi:// intent has 2+ red flags
raw -= 12  per genuine-transaction pattern (bank debit alert format)

score = clamp(round(raw), 0, 100)
band  = 0–19 Safe · 20–44 Caution · 45–69 Suspicious · 70–100 High Risk`}</Code>

          <H id="s6" n="6">Bilingual output layer</H>
          <p className="mt-3 text-muted-foreground">
            Every signal carries a curated Hindi twin for its label, explanation and advice line. Curated translation
            beats machine translation here because safety instructions must be unambiguous ("PIN कभी साझा न करें"), and
            it keeps the app fully offline. Google Translate / an LLM can be swapped in for additional languages.
          </p>

          <H id="s7" n="7">UPI intent parsing (bonus feature)</H>
          <p className="mt-3 text-muted-foreground">
            Raw <code className="text-primary">upi://pay</code> and <code className="text-primary">upi://collect</code>{" "}
            strings are parsed into payee VPA, name, amount and note, then checked for:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>collect requests (approving them debits the user);</li>
            <li>display name that does not match the VPA handle;</li>
            <li>payee names impersonating "refund", "KYC", "bank", "bijli";</li>
            <li>missing merchant code (a personal, unverified payee);</li>
            <li>a payable amount while a refund is being promised.</li>
          </ul>
          <Code>{`upi://collect?pa=refund.helpline@oksbi&pn=SBI%20Refund%20Cell&am=4999&tn=verification
→ collect request  → name/VPA mismatch  → impersonates official service
→ no merchant code → pay-while-promised-refund      ⇒ +12 risk`}</Code>

          <H id="s8" n="8">AI second opinion</H>
          <p className="mt-3 text-muted-foreground">
            The "AI second opinion" button calls a server function that forwards the message to a Gemini model through
            the Lovable AI Gateway and asks for strict JSON: risk band, confidence, tactic list and a two-sentence
            explanation in English and Hindi. The API key never reaches the browser. The rule engine remains the
            primary verdict so the demo works even if AI is unavailable.
          </p>
          <Code>{`POST /v1/chat/completions   (server-side only)
model: google/gemini-3.7-flash
system: "reply ONLY with JSON {risk, confidence,
         manipulation_tactics, explanation_en, explanation_hi}"
user:   <pasted message>`}</Code>

          <H id="s9" n="9">Step-by-step build (4 hours)</H>
          <ol className="mt-4 space-y-3 text-muted-foreground">
            {[
              ["0:00–0:20", "Freeze scope: one input box, one score, one bilingual card. Collect 10 real scam SMS samples and 3 genuine bank alerts."],
              ["0:20–1:10", "Write the signal library: 11 tactic families, each with English + Hinglish + Devanagari patterns, weights and a plain-language 'why'."],
              ["1:10–1:40", "Implement the aggregator: diminishing-returns sum, co-occurrence bonuses, credential floor, safe-pattern subtraction, band mapping."],
              ["1:40–2:00", "Add the UPI intent parser and its red-flag checks."],
              ["2:00–2:40", "Build the UI: textarea, sample buttons, animated Threat Meter gauge, evidence cards with matched-text chips."],
              ["2:40–3:05", "Add the bilingual toggle and the safety card, with a curated Hindi twin for every string."],
              ["3:05–3:25", "Wire the optional AI second opinion through a server function; handle 429/402 errors gracefully."],
              ["3:25–3:50", "Test against the sample set, tune weights until genuine bank alerts stay under 20 and scam samples stay above 70."],
              ["3:50–4:00", "Rehearse the 90-second demo and deploy."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-4 rounded-xl border border-border bg-background/40 p-3">
                <span className="w-24 shrink-0 font-mono text-xs text-primary">{t}</span>
                <span className="text-sm">{d}</span>
              </li>
            ))}
          </ol>

          <H id="s10" n="10">How to use / 90-second demo script</H>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li><strong className="text-foreground">0:00–0:15</strong> — "Scammers don't break the PIN, they break your calm." State the problem in one line.</li>
            <li><strong className="text-foreground">0:15–0:35</strong> — Click the "Verification refund" sample. The meter swings to High Risk.</li>
            <li><strong className="text-foreground">0:35–0:55</strong> — Point at the evidence cards: refund lure + collect request + PIN ask + urgency, each with the exact matched words.</li>
            <li><strong className="text-foreground">0:55–1:10</strong> — Hit the Hindi toggle; the whole safety card flips to Hindi.</li>
            <li><strong className="text-foreground">1:10–1:25</strong> — Paste the raw <code>upi://collect</code> sample to show intent parsing red flags.</li>
            <li><strong className="text-foreground">1:25–1:30</strong> — Click the genuine bank alert sample: score drops to Safe. Proves it is not keyword panic.</li>
          </ol>

          <H id="s11" n="11">Testing & accuracy</H>
          <p className="mt-3 text-muted-foreground">
            Evaluation set: 10 scam messages (electricity, KYC, refund, lottery, army-buyer, courier customs, job offer,
            loan approval, gas subsidy, remote-access support) and 5 genuine messages (bank debit alert, OTP alert,
            merchant receipt, delivery OTP, salary credit). Target on the MVP set: all scam samples ≥ 70, all genuine
            samples ≤ 20, zero genuine messages in the High band. Retune by adjusting family weights, never by adding a
            one-off word match.
          </p>

          <H id="s12" n="12">Limitations & roadmap</H>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Text-only today: voice-call coercion is the biggest real-world channel and needs speech-to-text.</li>
            <li>OCR from screenshots is designed but not in the 4-hour build.</li>
            <li>Regional languages beyond Hindi (Marathi, Bengali, Tamil, Telugu) via the same curated-string pattern.</li>
            <li>Android SMS listener + accessibility overlay to warn at the moment of payment, not after.</li>
            <li>Community reporting of new templates to grow the signal library.</li>
          </ul>

          <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm text-muted-foreground">
            <strong className="text-foreground">Disclaimer:</strong> UPI-Shield is an educational safety aid, not a
            regulated financial product. If money has already been lost, dial 1930 or report at cybercrime.gov.in
            within the first hour.
          </div>
        </article>
      </main>
    </div>
  );
}
