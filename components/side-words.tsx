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

const SECTIONS = [
  {
    tag: "The Problem",
    title: ["Budgeting", "felt like", "a chore."],
    body: "Most finance apps bury people in spreadsheets and noise — cold numbers with no sense of the story behind them.",
  },
  {
    tag: "The Solution",
    title: ["A calm,", "glanceable", "money story."],
    body: "Simpli turns raw transactions into a living picture — plan versus actual, spending pace, and where every dollar went.",
  },
  {
    tag: "The Tech",
    title: ["Built for", "sixty frames", "a second."],
    body: "React Native with Plaid sync and a hand-tuned charting layer — smooth donuts, cumulative lines, and money-flow streams.",
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
          return (
            <div
              key={s.tag}
              className="absolute inset-x-0 top-1/2 text-center md:text-left"
              style={{ transform: `translateY(calc(-50% + ${y}px))`, opacity, willChange: "opacity, transform" }}
            >
              <p className="mb-4 font-sans text-xs uppercase tracking-[0.35em] text-primary/80">
                Project 01 — {s.tag}
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
