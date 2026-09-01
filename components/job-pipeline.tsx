"use client"

import { interp } from "@/lib/interp"

/**
 * Project 03 — scroll-reactive pipeline for the Python + AI LLM job scraper.
 *
 * Four stations reveal in sequence as `progress` advances, connected by a
 * vertical "energy" line that draws downward (reinforcing the flow):
 *
 *   1. SCRAPE  — a Playwright terminal counts jobs as they are pulled
 *   2. STORE   — the haul is written to a local database
 *   3. GRADE   — the LLM scores each job against the resume; a ring sweeps to
 *                7.8 and jobs under the 7/10 gate dim out
 *   4. EMAIL   — a digest lands with the matches: title, company, apply link,
 *                and the LLM's reason you're a fit
 *
 * Windows are expressed in this component's own 0..1 progress space; the parent
 * maps its scene progress onto roughly 0.16 → 0.99 of the scroll.
 */

const GREEN = "oklch(0.5 0.07 168)"
const GOLD = "oklch(0.76 0.11 84)"
const CREME = "oklch(0.93 0.028 88)"
const MUTE = "oklch(0.72 0.03 88)"
const LINE = "oklch(0.93 0.028 88 / 0.14)"
const CARD = "oklch(0.24 0.05 264 / 0.72)"

// reveal windows for the four stations
const W = {
  scrape: [0.06, 0.26] as [number, number],
  store: [0.28, 0.42] as [number, number],
  grade: [0.44, 0.66] as [number, number],
  email: [0.68, 0.9] as [number, number],
}

function rise(p: number, [a, b]: [number, number]) {
  const opacity = interp(p, [a, a + (b - a) * 0.4], [0, 1])
  const y = interp(p, [a, a + (b - a) * 0.5], [26, 0])
  return { opacity, transform: `translateY(${y}px)` }
}

export function JobPipeline({ progress }: { progress: number }) {
  // scraped-job counter climbs during the scrape beat
  const count = Math.round(interp(progress, [W.scrape[0], W.scrape[1]], [0, 218]))
  // grade ring sweep (0..1) and numeric score
  const gradeSweep = interp(progress, [W.grade[0] + 0.03, W.grade[1] - 0.02], [0, 1])
  const score = (gradeSweep * 7.8).toFixed(1)
  // vertical connector draw
  const lineDraw = interp(progress, [W.scrape[0], W.email[0]], [0, 1])

  return (
    <div className="relative mx-auto w-full max-w-[420px] px-2">
      {/* connector line behind the stations */}
      <div className="absolute bottom-6 left-[34px] top-6 w-px" style={{ background: LINE }} aria-hidden>
        <div
          className="absolute left-0 top-0 w-px"
          style={{ height: `${lineDraw * 100}%`, background: `linear-gradient(${GOLD}, ${GREEN})` }}
        />
      </div>

      <div className="flex flex-col gap-5">
        {/* 1 — SCRAPE */}
        <Station index={1} label="Scrape" active={progress > W.scrape[0]} style={rise(progress, W.scrape)}>
          <div className="rounded-lg border p-3 font-mono text-[11px] leading-relaxed" style={{ borderColor: LINE, background: "oklch(0.16 0.04 265 / 0.9)" }}>
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.6 0.14 25)" }} />
              <span className="h-2 w-2 rounded-full" style={{ background: GOLD }} />
              <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
              <span className="ml-2 text-[10px]" style={{ color: MUTE }}>
                scraper.py
              </span>
            </div>
            <p style={{ color: MUTE }}>
              <span style={{ color: GOLD }}>async with</span> Playwright() <span style={{ color: GOLD }}>as</span> p:
            </p>
            <p style={{ color: MUTE }}>&nbsp;&nbsp;jobs = <span style={{ color: CREME }}>await</span> scrape(boards, api_key)</p>
            <p className="mt-1.5 flex items-baseline gap-2" style={{ color: CREME }}>
              <span className="font-serif text-2xl tabular-nums" style={{ color: GOLD }}>
                {count}
              </span>
              <span className="text-[10px]" style={{ color: MUTE }}>
                roles pulled
              </span>
            </p>
          </div>
        </Station>

        {/* 2 — STORE */}
        <Station index={2} label="Store locally" active={progress > W.store[0]} style={rise(progress, W.store)}>
          <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: LINE, background: CARD }}>
            <div className="relative h-9 w-9 shrink-0">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-x-0 h-2.5 rounded-[3px] border"
                  style={{ top: i * 5, borderColor: LINE, background: "oklch(0.3 0.05 264)" }}
                />
              ))}
            </div>
            <div>
              <p className="text-[13px]" style={{ color: CREME }}>
                Saved to local dataset
              </p>
              <p className="font-mono text-[10px]" style={{ color: MUTE }}>
                ~/jobs/2026-08.jsonl
              </p>
            </div>
          </div>
        </Station>

        {/* 3 — GRADE */}
        <Station index={3} label="LLM grades vs. resume" active={progress > W.grade[0]} style={rise(progress, W.grade)}>
          <div className="flex items-center gap-4 rounded-lg border p-3" style={{ borderColor: LINE, background: CARD }}>
            <Gauge sweep={gradeSweep} score={score} />
            <div className="min-w-0 flex-1">
              {[
                { t: "Senior Product Engineer", s: 7.8, ok: true },
                { t: "Growth PM, Fintech", s: 6.2, ok: false },
                { t: "Founding Engineer", s: 8.4, ok: true },
              ].map((row, i) => {
                const shown = gradeSweep > 0.2 + i * 0.22
                return (
                  <div
                    key={row.t}
                    className="flex items-center justify-between gap-2 border-b py-1 last:border-b-0"
                    style={{ borderColor: LINE, opacity: shown ? (row.ok ? 1 : 0.4) : 0, transition: "opacity .2s" }}
                  >
                    <span className="truncate text-[11px]" style={{ color: CREME }}>
                      {row.t}
                    </span>
                    <span
                      className="shrink-0 font-mono text-[11px] tabular-nums"
                      style={{ color: row.ok ? GREEN : MUTE }}
                    >
                      {row.s.toFixed(1)}
                    </span>
                  </div>
                )
              })}
              <p className="mt-1.5 text-[9px] uppercase tracking-[0.15em]" style={{ color: MUTE }}>
                Gate · keep 7.0 and up
              </p>
            </div>
          </div>
        </Station>

        {/* 4 — EMAIL */}
        <Station index={4} label="Digest emailed" active={progress > W.email[0]} style={rise(progress, W.email)}>
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: LINE, background: CARD }}>
            <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: LINE }}>
              <span className="text-[11px]" style={{ color: MUTE }}>
                Inbox · today
              </span>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ background: "oklch(0.5 0.07 168 / 0.2)", color: GREEN }}>
                3 matches
              </span>
            </div>
            <div className="p-3">
              <p className="font-serif text-[15px] leading-tight" style={{ color: CREME }}>
                Founding Engineer
              </p>
              <p className="text-[11px]" style={{ color: MUTE }}>
                Vantage Labs · Remote ·{" "}
                <span className="underline" style={{ color: GOLD }}>
                  Apply
                </span>
              </p>
              <div className="mt-2 rounded-md border-l-2 py-1 pl-2.5" style={{ borderColor: GREEN }}>
                <p className="text-[8px] uppercase tracking-[0.14em]" style={{ color: GREEN }}>
                  Why you fit · 8.4/10
                </p>
                <p className="mt-1 text-[11px] leading-snug" style={{ color: CREME }}>
                  Your 0→1 product work and Python/LLM tooling map directly to their early-stage, full-stack mandate.
                </p>
              </div>
            </div>
          </div>
        </Station>
      </div>
    </div>
  )
}

function Station({
  index,
  label,
  active,
  style,
  children,
}: {
  index: number
  label: string
  active: boolean
  style: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div className="relative flex gap-4" style={{ ...style, willChange: "opacity, transform" }}>
      <div
        className="relative z-10 flex h-[22px] w-[22px] shrink-0 translate-x-[12px] items-center justify-center rounded-full border font-mono text-[10px]"
        style={{
          borderColor: active ? GOLD : LINE,
          background: active ? "oklch(0.19 0.045 265)" : "oklch(0.19 0.045 265)",
          color: active ? GOLD : MUTE,
          boxShadow: active ? `0 0 0 3px oklch(0.76 0.11 84 / 0.12)` : "none",
        }}
      >
        {index}
      </div>
      <div className="flex-1 pb-1">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: MUTE }}>
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}

function Gauge({ sweep, score }: { sweep: number; score: string }) {
  const r = 22
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-[62px] w-[62px] shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke={LINE} strokeWidth="4" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={GREEN}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - sweep * 0.78)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-[15px] leading-none tabular-nums" style={{ color: CREME }}>
          {score}
        </span>
        <span className="text-[7px]" style={{ color: MUTE }}>
          / 10
        </span>
      </div>
    </div>
  )
}
