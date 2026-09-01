"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { interp } from "@/lib/interp"
import { JobPipeline } from "./job-pipeline"

/**
 * Project 03 — Python + AI LLM Job Scraper.
 *
 * Transition: a locked diagonal "map pan." This scene enters from the
 * top-right and slides DOWN-AND-LEFT into place while Project 02 drifts out
 * toward the bottom-left by the same vector, so the seam travels together like
 * panning across a zoomed-in map (vertical + horizontal at once).
 *
 * Beats (scene progress 0..1):
 *   0.00 – 0.13  diagonal pan-in (down + left)
 *   0.16 – 0.99  the job pipeline reveals station by station on the right while
 *                Problem / Solution / Tech copy cross-fades one-at-a-time left.
 */

const SECTIONS = [
  {
    tag: "The Problem",
    title: ["The hunt", "is a", "second job."],
    body: "Hundreds of listings, endless tabs, and most of them a poor fit. Reading every posting to find the few worth applying to burns hours you don't have.",
  },
  {
    tag: "The Solution",
    title: ["Only the", "roles worth", "your time."],
    body: "An agent scrapes the boards nightly, reads each role against your resume and career history, and emails you only the matches — with the reason you fit.",
  },
  {
    tag: "The Tech",
    title: ["Python scrapes.", "The LLM", "decides."],
    body: "A Python + Playwright scraper collects and stores roles locally, then an LLM grades each against your resume and emails everything above a 7/10 bar.",
  },
]

const START = 0.16
const END = 0.99
const STEP = (END - START) / SECTIONS.length
const WINDOWS: [number, number][] = SECTIONS.map((_, i) => [START + i * STEP, START + (i + 1) * STEP])

export function ProjectThree() {
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

  // Diagonal map-pan-in, gap-free. The full-screen navy BACKDROP simply fades
  // in (it is never translated, so it can never show a hard rectangle edge or
  // a navy void). The page CONTENT rides in from the top-right and settles
  // DOWN-AND-LEFT with a slight zoom-out, like a map camera panning down-left.
  // While the backdrop is still translucent, Project 02 (drifting down-left
  // underneath) shows through, so both layers move the same way — a real pan.
  const backdropFade = interp(progress, [0, 0.09], [0, 1])
  const cx = interp(progress, [0.01, 0.15], [46, 0])
  const cy = interp(progress, [0.01, 0.15], [-30, 0])
  const cScale = interp(progress, [0.01, 0.15], [1.07, 1])

  return (
    <section ref={ref} className="relative z-20 -mt-[180vh] h-[900vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Full-screen backdrop — fades in, NEVER translates, so the handoff
            has no seam and no void. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 90% at 82% 30%, oklch(0.29 0.06 168 / 0.4), transparent 55%), radial-gradient(120% 120% at 15% 100%, oklch(0.16 0.04 265), oklch(0.19 0.045 265))",
            opacity: backdropFade,
          }}
        />

        {/* All content rides in from the top-right, settling down-and-left. */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${cx}vw, ${cy}vh) scale(${cScale})`,
            transformOrigin: "50% 50%",
            willChange: "transform",
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

          {/* atmospheric engine image, low and behind the pipeline */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[60%] items-center justify-center md:flex"
            style={{ opacity: interp(progress, [0.01, 0.12, 0.9, 1], [0, 0.28, 0.28, 0.14]) }}
            aria-hidden
          >
            <div className="relative aspect-square w-[86%]">
              <Image
                src="/images/job-engine.png"
                alt=""
                fill
                className="object-contain"
                style={{ maskImage: "radial-gradient(62% 62% at 50% 50%, #000 50%, transparent 100%)" }}
              />
            </div>
          </div>

          {/* live pipeline on the right */}
          <div className="absolute inset-y-0 right-0 z-10 hidden w-[52%] items-center justify-center md:flex">
            <JobPipeline progress={progress} />
          </div>

          {/* copy sections, one at a time, on the left */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 md:justify-start md:px-[7%]">
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
                      Project 03 — {s.tag}
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
            03
          </span>
        </div>
      </div>
    </section>
  )
}
