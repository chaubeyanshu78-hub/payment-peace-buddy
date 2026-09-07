import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Languages,
  QrCode,
  Loader2,
  FileText,
  Presentation,
} from "lucide-react";
import { ThreatMeter } from "@/components/ThreatMeter";
import { analyzeMessage, SAMPLES, type AnalysisResult } from "@/lib/scam-engine";
import { aiAnalyzeMessage, type AiVerdict } from "@/lib/ai-analysis.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UPI-Shield — Payment Scam & Coercion Detector" },
      {
        name: "description",
        content:
          "Paste an SMS, WhatsApp message or UPI payment note and UPI-Shield scores the scam risk with bilingual English/Hindi safety guidance.",
      },
      { property: "og:title", content: "UPI-Shield — Payment Scam & Coercion Detector" },
      {
        property: "og:description",
        content: "Detect urgency, coercion and fake authority in UPI payment messages, in English and Hindi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ai, setAi] = useState<AiVerdict | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const runAi = useServerFn(aiAnalyzeMessage);

  const live = useMemo(() => (text.trim() ? analyzeMessage(text) : null), [text]);

  function scan() {
    if (!text.trim()) return;
    setResult(analyzeMessage(text));
    setAi(null);
  }

  async function deepScan() {
    if (!text.trim()) return;
    setResult(analyzeMessage(text));
    setAiLoading(true);
    try {
      setAi(await runAi({ data: { text } }));
    } catch {
      setAi({ ok: false, error: "Could not reach the AI service." });
    } finally {
      setAiLoading(false);
    }
  }

  const shown = result ?? live;

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-shield flex size-11 items-center justify-center rounded-2xl shadow-glow">
            <ShieldCheck className="size-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">UPI-Shield</h1>
            <p className="text-xs text-muted-foreground">Contextual payment scam & coercion detector</p>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <FileText className="size-4" /> Documentation
          </Link>
          <Link
            to="/slides"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Presentation className="size-4" /> Slide deck
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="mb-8 max-w-3xl">
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Scams don't break your PIN. They break your calm.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Paste any SMS, WhatsApp message, payment note or raw <code className="text-primary">upi://</code> link.
            UPI-Shield reads the intent behind the words — urgency, fake authority, refund bait, PIN requests — and
            answers in plain English and Hindi.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* Input */}
          <section className="panel p-5">
            <label htmlFor="msg" className="font-display text-sm font-semibold text-foreground">
              Message to check
            </label>
            <textarea
              id="msg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              placeholder="Paste the SMS / WhatsApp text or payment note here…"
              className="mt-3 w-full resize-y rounded-xl border border-input bg-background/60 p-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.title}
                  onClick={() => {
                    setText(s.text);
                    setResult(analyzeMessage(s.text));
                    setAi(null);
                  }}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {s.title}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={scan}
                className="bg-shield inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
              >
                <ShieldCheck className="size-4" /> Scan message
              </button>
              <button
                onClick={deepScan}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/50 px-5 py-2.5 font-display text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
              >
                {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                AI second opinion
              </button>
              <button
                onClick={() => {
                  setText("");
                  setResult(null);
                  setAi(null);
                }}
                className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Nothing is stored. The rule engine runs entirely on your device; the AI check is optional.
            </p>
          </section>

          {/* Result */}
          <section className="panel flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-foreground">Threat meter</h3>
              <button
                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Languages className="size-3.5" /> {lang === "en" ? "हिंदी में देखें" : "View in English"}
              </button>
            </div>

            {!shown ? (
              <div className="flex flex-1 flex-col items-center justify-center py-14 text-center text-sm text-muted-foreground">
                <ShieldCheck className="mb-3 size-10 opacity-40" />
                Paste a message or pick a sample to see the risk score.
              </div>
            ) : (
              <>
                <ThreatMeter score={shown.score} band={shown.band} />
                <p className="rounded-xl bg-background/50 p-4 text-sm text-foreground">
                  {lang === "en" ? shown.summary.en : shown.summary.hi}
                </p>
              </>
            )}
          </section>
        </div>

        {shown && (
          <>
            {/* Safety card */}
            <section className="panel mt-6 p-5">
              <h3 className="font-display text-sm font-semibold text-foreground">
                {lang === "en" ? "Safety card" : "सुरक्षा कार्ड"}
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {(lang === "en" ? shown.advice.en : shown.advice.hi).map((a, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-xl border border-border bg-background/40 p-3 text-sm text-foreground"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Evidence */}
            <section className="panel mt-6 p-5">
              <h3 className="font-display text-sm font-semibold text-foreground">
                {lang === "en" ? "Why this score — detected triggers" : "यह स्कोर क्यों — पकड़े गए संकेत"}
              </h3>
              {shown.hits.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {lang === "en" ? "No manipulation triggers detected." : "कोई हेरफेर संकेत नहीं मिला।"}
                </p>
              ) : (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {shown.hits
                    .slice()
                    .sort((a, b) => b.weight - a.weight)
                    .map((h) => (
                      <article key={h.id} className="rounded-xl border border-border bg-background/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-display text-sm font-semibold text-foreground">
                            {lang === "en" ? h.label.en : h.label.hi}
                          </h4>
                          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                            +{h.weight}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{lang === "en" ? h.why.en : h.why.hi}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {h.matches.map((m, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-accent/15 px-2 py-0.5 font-mono text-xs text-accent"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                </div>
              )}
            </section>

            {/* UPI intent */}
            {shown.intents.length > 0 && (
              <section className="panel mt-6 p-5">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                  <QrCode className="size-4 text-primary" /> UPI intent inspection
                </h3>
                {shown.intents.map((it, i) => (
                  <div key={i} className="mt-3 rounded-xl border border-border bg-background/40 p-4">
                    <code className="block break-all font-mono text-xs text-primary">{it.raw}</code>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      {[
                        ["Payee VPA", it.pa],
                        ["Name", it.pn && decodeURIComponent(it.pn)],
                        ["Amount", it.am ? `₹${it.am}` : undefined],
                        ["Note", it.tn && decodeURIComponent(it.tn)],
                      ].map(([k, v]) => (
                        <div key={k as string}>
                          <dt className="text-xs text-muted-foreground">{k}</dt>
                          <dd className="text-foreground">{(v as string) || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    <ul className="mt-3 space-y-1">
                      {it.flags.map((f, j) => (
                        <li key={j} className="flex gap-2 text-sm text-destructive">
                          <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {/* AI */}
            {(ai || aiLoading) && (
              <section className="panel mt-6 p-5">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                  <Sparkles className="size-4 text-accent" /> AI second opinion
                </h3>
                {aiLoading && <p className="mt-3 text-sm text-muted-foreground">Analysing the message…</p>}
                {ai && !ai.ok && <p className="mt-3 text-sm text-destructive">{ai.error}</p>}
                {ai?.ok && (
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent/15 px-3 py-1 font-display font-semibold text-accent uppercase">
                        {ai.risk}
                      </span>
                      {typeof ai.confidence === "number" && (
                        <span className="text-muted-foreground">
                          confidence {Math.round(ai.confidence * 100)}%
                        </span>
                      )}
                      {ai.manipulation_tactics?.map((t) => (
                        <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-foreground">{ai.explanation_en}</p>
                    <p className="text-muted-foreground">{ai.explanation_hi}</p>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Lost money to a scam? Dial <span className="text-foreground">1930</span> or report at cybercrime.gov.in.
        </footer>
      </main>
    </div>
  );
}
