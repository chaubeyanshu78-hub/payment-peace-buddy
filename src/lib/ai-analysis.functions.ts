import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ text: z.string().min(1).max(4000) });

export interface AiVerdict {
  ok: boolean;
  error?: string;
  risk?: "safe" | "caution" | "suspicious" | "high";
  confidence?: number;
  manipulation_tactics?: string[];
  explanation_en?: string;
  explanation_hi?: string;
}

export const aiAnalyzeMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AiVerdict> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, error: "AI is not configured for this project." };

    const body = {
      model: "google/gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content:
            "You are UPI-Shield, an Indian digital-payment fraud analyst. Judge whether a message is a social-engineering / coercion payment scam. Reply ONLY with compact JSON: {\"risk\":\"safe|caution|suspicious|high\",\"confidence\":0-1,\"manipulation_tactics\":[\"...\"],\"explanation_en\":\"2 short sentences for a non-technical user\",\"explanation_hi\":\"same in simple Hindi\"}",
        },
        { role: "user", content: data.text },
      ],
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      if (res.status === 429) return { ok: false, error: "AI is busy right now. Try again shortly." };
      if (res.status === 402)
        return { ok: false, error: "AI credits are exhausted. Add credits to use AI analysis." };
      return { ok: false, error: `AI request failed (${res.status}). ${msg.slice(0, 160)}` };
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { ok: false, error: "AI returned an unreadable answer." };
    try {
      const parsed = JSON.parse(match[0]);
      return { ok: true, ...parsed };
    } catch {
      return { ok: false, error: "AI returned an unreadable answer." };
    }
  });
