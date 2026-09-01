"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { interp } from "@/lib/interp"
import { DefenseNetwork } from "./defense-network"

/**
 * Project 04 — Defense Network.ai (the finale, a launched company).
 *
 * Transition: a "converge" assemble-in. Unlike the lateral / diagonal pans
 * before it, the whole scene grows toward the viewer from slightly small while
 * fading up, as the network nodes fly in and connect — the network assembling.
 *
 * Beats (scene progress 0..1):
 *   0.00 – 0.15  converge-in
 *   0.16 – 0.80  network assembles on the right; Problem / Solution / Tech
 *                copy cross-fades one-at-a-time on the left
 *   0.82 – 1.00  brand payoff lockup fades in center — "LinkedIn for the
 *                Defense World," Live.
 */

const SECTIONS = [
  {
    tag: "The Problem",
    title: ["The defense", "world runs on", "who you know."],
    body: "Founders, operators, and capital are scattered across closed circles. The people who could move a mission forward can't find each other.",
  },
  {
    tag: "The Solution",
    title: ["One network.", "Every side", "of the table."],
    body: "Defense startups, active-duty special forces, consultants, accelerators, SBIR writers, and dual-use capital — connected in one trusted, verified place.",
  },
  {
    tag: "The Tech",
    title: ["Built, launched,", "and growing", "with my CTO."],
    body: "A purpose-built professional network for the defense and dual-use ecosystem — verified members, warm introductions, and the deal flow that follows.",
  },
]

const START = 0.16
const END = 0.8
const STEP = (END - START) / SECTIONS.length
const WINDOWS: [number, number][] = SECTIONS.map((_, i) => [START + i * STEP, START + (i + 1) * STEP])

export function ProjectFour() {
  const ref = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const top = el.offsetTop
      const scrollable = el.offsetHeight - window.innerHeight
      const p = scrollable > 0 ? (window.scrollY - top) / scrollable : 0
      setProgress(Math.min(1, Math.max(0, p)))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Converge-in: full-screen backdrop only fades (never translates → no seam),
  // content grows from slightly small toward the viewer while fading up.
  const backdropFade = interp(progress, [0, 0.1], [0, 1])
  const cScale = interp(progress, [0.01, 0.15], [0.9, 1])
  const cFade = interp(progress, [0.01, 0.12], [0, 1])

  // Network runs on its own 0..1 window mapped from the copy's active range.
  const netT = interp(progress, [0.12, 0.82], [0, 1])

  // Brand payoff at the very end.
  const payoff = interp(progress, [0.82, 0.92], [0, 1])
  const payoffLift = interp(progress, [0.82, 0.95], [24, 0])
  // Fade the working scene back so the payoff reads cleanly.
  const sceneDim = interp(progress, [0.82, 0.94], [1, 0.12])
  const veil = interp(progress, [0.82, 0.94], [0, 0.72])

  return (
    <section ref={ref} className="relative z-30 -mt-[180vh] h-[900vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Full-screen backdrop — fades in, never translates. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 95% at 78% 28%, oklch(0.29 0.055 264 / 0.55), transparent 58%), radial-gradient(120% 120% at 20% 100%, oklch(0.16 0.04 265), oklch(0.19 0.045 265))",
            opacity: backdropFade,
          }}
        />

        {/* Converging content */}
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${cScale})`,
            opacity: cFade,
            transformOrigin: "50% 50%",
            willChange: "transform, opacity",
          }}
        >
          {/* persistent name badge */}
          <div className="absolute left-6 top-6 z-30 md:left-10 md:top-9">
            <span
              className="font-serif text-lg tracking-wide text-foreground md:text-xl"
              style={{
                textShadow:
                  "0 1px 0 oklch(0.76 0.11 84 / 0.5), 0 2px 3px oklch(0 0 0 / 0.5), 0 3px 6px oklch(0 0 0 / 0.4)",
              }}
            >
              Alston Biggs
            </span>
          </div>

          {/* atmospheric globe network behind everything */}
          <div
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
            style={{ opacity: interp(progress, [0.01, 0.14, 0.8, 1], [0, 0.22, 0.22, 0.1]) * sceneDim }}
            aria-hidden
          >
            <div className="relative aspect-square w-[70%] max-w-[820px]">
              <Image
                src="/images/defense-network.png"
                alt=""
                fill
                className="object-contain"
                style={{ maskImage: "radial-gradient(60% 60% at 50% 50%, #000 45%, transparent 100%)" }}
              />
            </div>
          </div>

          {/* live persona network on the right */}
          <div
            className="absolute inset-y-0 right-0 z-10 hidden w-[52%] items-center justify-center pr-[3%] md:flex"
            style={{ opacity: sceneDim }}
          >
            <DefenseNetwork t={netT} />
          </div>

          {/* copy sections, one at a time, on the left */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 md:justify-start md:px-[7%]"
            style={{ opacity: sceneDim }}
          >
            <div className="relative w-full max-w-md">
              {SECTIONS.map((s, i) => {
                const [a, b] = WINDOWS[i]
                const span = b - a
                const y = interp(progress, [a, a + span * 0.28, b - span * 0.28, b], [280, 0, 0, -280])
                const opacity = interp(progress, [a, a + span * 0.2, b - span * 0.26, b], [0, 1, 1, 0])
                return (
                  <div
                    key={s.tag}
                    className="absolute inset-x-0 top-1/2 text-center md:text-left"
                    style={{
                      transform: `translateY(calc(-50% + ${y}px))`,
                      opacity,
                      willChange: "opacity, transform",
                    }}
                  >
                    <p className="mb-4 font-sans text-xs uppercase tracking-[0.35em] text-primary/80">
                      Project 04 — {s.tag}
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

          {/* ghosted watermark */}
          <span
            className="pointer-events-none absolute bottom-4 left-6 z-0 font-serif text-[22vw] leading-none text-foreground/[0.04] md:left-10 md:text-[14vw]"
            aria-hidden
          >
            04
          </span>
        </div>

        {/* Veil to separate the payoff from the working scene */}
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{ background: "oklch(0.16 0.04 265)", opacity: veil }}
          aria-hidden
        />

        {/* Brand payoff lockup — centered, over the dimmed scene */}
        <div
          className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: payoff, transform: `translateY(${payoffLift}px)`, willChange: "opacity, transform" }}
        >
          <div className="mb-6 flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: "var(--gold)" }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--gold)" }} aria-hidden />
            <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-primary">Live</span>
          </div>
          <h2 className="font-serif text-6xl leading-none text-foreground md:text-8xl">
            Defense Network<span className="text-primary">.ai</span>
          </h2>
          <p className="mt-6 font-sans text-base tracking-wide text-muted-foreground md:text-lg">
            LinkedIn for the Defense World.
          </p>
        </div>
      </div>
    </section>
  )
}
