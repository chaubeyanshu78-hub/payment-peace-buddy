import type { RiskBand } from "@/lib/scam-engine";
import { BAND_LABEL } from "@/lib/scam-engine";

const COLOR: Record<RiskBand, string> = {
  safe: "var(--safe)",
  caution: "var(--caution)",
  suspicious: "var(--suspicious)",
  danger: "var(--danger)",
  high: "var(--danger)",
} as Record<RiskBand, string>;

export function ThreatMeter({ score, band }: { score: number; band: RiskBand }) {
  const angle = (score / 100) * 180 - 90;
  const color = COLOR[band];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-60">
        <svg viewBox="0 0 200 110" className="h-full w-full">
          <defs>
            <linearGradient id="meterTrack" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--safe)" />
              <stop offset="40%" stopColor="var(--caution)" />
              <stop offset="70%" stopColor="var(--suspicious)" />
              <stop offset="100%" stopColor="var(--danger)" />
            </linearGradient>
          </defs>
          <path
            d="M15 100 A85 85 0 0 1 185 100"
            fill="none"
            stroke="url(#meterTrack)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.35"
          />
          <path
            d="M15 100 A85 85 0 0 1 185 100"
            fill="none"
            stroke="url(#meterTrack)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 267} 400`}
            style={{ transition: "stroke-dasharray 700ms cubic-bezier(.2,.8,.2,1)" }}
          />
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px", transition: "transform 700ms cubic-bezier(.2,.8,.2,1)" }}>
            <line x1="100" y1="100" x2="100" y2="32" stroke={color} strokeWidth="4" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="100" r="8" fill={color} />
        </svg>
      </div>
      <div className="-mt-4 text-center">
        <div className="font-display text-4xl font-bold" style={{ color }}>
          {score}
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <div className="mt-1 font-display text-lg font-semibold" style={{ color }}>
          {BAND_LABEL[band].en}
        </div>
        <div className="text-sm text-muted-foreground">{BAND_LABEL[band].hi}</div>
      </div>
    </div>
  );
}
