"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { interp } from "@/lib/interp"
import { KnowledgeGraph } from "./knowledge-graph"

/**
 * Project 02 — AI Second Brain.
 *
 * Follows the same scroll-only, single-`progress` pattern as Project 01: a tall
 * section with a sticky scene and a self-computed 0..1 progress value.
 *
 * Beats:
 *   0.00 – 0.12  the "page" slides in from the right (new page to the right)
 *   0.10 – 0.45  the Neo4j-style knowledge graph builds node by node
 *   0.42 – 0.66  semantic search — beams light up meaning-related nodes
 *   0.64 – 0.86  word search — exact keyword matches ring up
 * Problem / Solution / Tech copy cross-fades one-at-a-time across the whole
 * scene on the left, never overlapping the graph on the right.
 */

const SECTIONS = [
  {
    tag: "The Problem",
    title: ["Notes go in.", "Nothing", "comes back."],
    body: "Ideas scatter across apps, docs, and highlights. Folders and keyword search miss the connection you actually remember — the meaning, not the exact words.",
  },
  {
    tag: "The Solution",
    title: ["A brain that", "remembers", "for you."],
    body: "Every note becomes a node in a living knowledge graph. Ask a question in plain language and related thoughts surface — even when they share no words.",
  },
  {
    tag: "The Tech",
    title: ["A graph that", "thinks in", "vectors."],
    body: "A Neo4j knowledge graph with vector embeddings on every node, blending semantic (meaning) search with classic keyword search to retrieve what matters.",
  },
]

const START = 0.14
const END = 0.99
const STEP = (END - START) / SECTIONS.length
const WINDOWS: [number, number][] = SECTIONS.map((_, i) => [START + i * STEP, START + (i + 1) * STEP])

export function ProjectTwo() {
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

  // Entry: slides in from the right, synced to Project 01's exit-left.
  // Exit: a SMALL down-and-left parallax drift + slight zoom-out, staying as
  // the full-cover base while Project 03's opaque panel sweeps in from the
  // top-right. Because P2 only drifts a little (and P3 covers the vacated
  // top-right corner first), the diagonal map-pan has no navy gap.
  // The negative margin (-180vh) overlaps this section's pin with its
  // neighbours; progress 0 -> 0.1 lines up with Project 01's 0.9 -> 1.0.
  const panX = interp(progress, [0, 0.1, 0.85, 1], [100, 0, 0, -22])
  const panY = interp(progress, [0, 0.1, 0.85, 1], [0, 0, 0, 13])
  const scale = interp(progress, [0.85, 1], [1, 0.94])

  return (
    <section ref={ref} className="relative z-10 -mt-[180vh] h-[900vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* The whole page (opaque backdrop + content) slides in as one panel,
            covering Project 01 as it pans away underneath. */}
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${panX}vw, ${panY}vh) scale(${scale})`, willChange: "transform" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 20% 20%, oklch(0.28 0.06 168 / 0.45), transparent 55%), radial-gradient(100% 100% at 80% 100%, oklch(0.16 0.04 265), oklch(0.19 0.045 265))",
            }}
          />
          {/* Persistent name badge, matching Project 01 */}
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

          {/* Atmospheric brain image, low and behind the live graph */}
          <BrainAtmosphere progress={progress} />

          {/* Live, scroll-reactive knowledge graph on the right */}
          <div className="absolute inset-y-0 right-0 z-10 hidden w-[58%] items-center justify-center md:flex">
            <KnowledgeGraph progress={progress} />
          </div>
          {/* On mobile the graph sits full-width behind the copy */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 md:hidden">
            <KnowledgeGraph progress={progress} />
          </div>

          {/* Copy sections, one at a time, on the left */}
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
                      Project 02 — {s.tag}
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

          {/* Big ghosted "02" watermark */}
          <span
            className="pointer-events-none absolute bottom-4 left-6 z-0 font-serif text-[22vw] leading-none text-foreground/[0.04] md:left-10 md:text-[14vw]"
            aria-hidden
          >
            02
          </span>
        </div>
      </div>
    </section>
  )
}

function BrainAtmosphere({ progress }: { progress: number }) {
  const opacity = interp(progress, [0.05, 0.2, 0.9, 1], [0, 0.35, 0.35, 0.18])
  const scale = interp(progress, [0.05, 0.45], [1.08, 1])
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[62%] items-center justify-center md:flex"
      style={{ opacity, willChange: "opacity" }}
      aria-hidden
    >
      <div className="relative aspect-square w-[80%]" style={{ transform: `scale(${scale})` }}>
        <Image
          src="/images/second-brain.png"
          alt="An AI second brain visualized as a glowing knowledge graph shaped like a human brain"
          fill
          className="object-contain"
          style={{ maskImage: "radial-gradient(60% 60% at 50% 50%, #000 55%, transparent 100%)" }}
          priority
        />
      </div>
    </div>
  )
}
