"use client"

import { interp } from "@/lib/interp"

/**
 * Three sequential copy blocks for Project 01 — The Problem, The Solution,
 * The Tech — shown ONE AT A TIME, floating in the center of the scene.
 *
 * Timing: the phone lands at progress ~0.42 and the scene ends at 1.0. That
 * 0.42 → 1.0 range is split into three equal windows so each paragraph is on
 * screen for the same amount of time. Block 1 appears as the phone lands, then
 * scrolls up and is replaced by block 2, then block 3.
 */

const LAND = 0.42
const END = 1.0

const TECH = [
  { name: "Plaid", slug: "plaid" },
  { name: "Supabase", slug: "supabase" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "Vercel", slug: "vercel" },
  { name: "OAuth", slug: "oauth" },
  { name: "Cloudflare", slug: "cloudflare" },
  { name: "GitHub", slug: "github" },
  { name: "VS Code", slug: "visual-studio-code" },
  { name: "Claude Code", slug: "claude-code" },
]

const SECTIONS = [
  {
    tag: "The Problem",
    title: ["Budgeting apps", "are too", "rigid."],
    body: "A billing date could throw off the whole month. Transfers to savings inflate spending totals. Categories are not flexible enough.",
  },
  {
    tag: "The Solution",
    title: ["A fully", "customizable", "finance app."],
    body: "Dates, amounts, and names are editable on any transaction. Categories and subcategories are fully custom. Rules can be made by card, merchant, or both — charges from a specific card or company route automatically to the right category. Net worth, market exposure, and portfolio diversification are tracked alongside day-to-day spending.",
  },
  {
    tag: "The Tech",
    title: ["Built on:"],
    body: "Plaid · Supabase · Next.js · Vercel · OAuth · Cloudflare · GitHub · VS Code · Claude Code",
  },
]

// Three equal windows across the phone-landing → end range.
const STEP = (END - LAND) / SECTIONS.length
const WINDOWS: [number, number][] = SECTIONS.map((_, i) => [LAND + i * STEP, LAND + (i + 1) * STEP])

export function SideWords({ progress }: { progress: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 md:justify-start md:px-[8%]">
      <div className="relative w-full max-w-md">
        {SECTIONS.map((s, i) => {
          const [a, b] = WINDOWS[i]
          const span = b - a
          const y = interp(progress, [a, a + span * 0.3, b - span * 0.3, b], [300, 0, 0, -300])
          const opacity = interp(progress, [a, a + span * 0.22, b - span * 0.26, b], [0, 1, 1, 0])
          const isTech = s.tag === "The Tech"
          const popStart = a + span * 0.26
          const popWindow = span * 0.16
          const perIcon = popWindow / TECH.length
          return (
            <div
              key={s.tag}
              className="absolute inset-x-0 top-1/2 text-center md:text-left"
              style={{ transform: `translateY(calc(-50% + ${y}px))`, opacity, willChange: "opacity, transform" }}
            >
              <p className="mb-4 font-sans text-xs uppercase tracking-[0.35em] text-primary/80">Product 1</p>
              <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/70">
                {s.tag}
              </p>
              <div className="font-serif text-5xl leading-[0.95] text-foreground md:text-6xl">
                {s.title.map((line, j) => (
                  <span key={j} className="block text-balance">
                    {line}
                  </span>
                ))}
              </div>
              <p className="mx-auto mt-6 max-w-sm font-sans text-sm leading-relaxed text-muted-foreground md:mx-0">
                {s.body}
              </p>

              {isTech && (
                <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3 md:mx-0 md:grid-cols-3">
                  {TECH.map((t, j) => {
                    const start = popStart + j * perIcon
                    const reveal = interp(progress, [start, start + perIcon * 0.7], [0, 1])
                    return (
                      <div
                        key={t.slug}
                        className="flex flex-col items-center gap-1.5"
                        style={{
                          opacity: reveal,
                          transform: `translateY(${(1 - reveal) * 14}px) scale(${0.6 + reveal * 0.4})`,
                          willChange: "opacity, transform",
                        }}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 p-1.5 shadow-sm">
                          <img
                            src={`https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${t.slug}/default.svg`}
                            alt={t.name}
                            className="h-full w-full object-contain"
                          />
                        </span>
                        <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                          {t.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
