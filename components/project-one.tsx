"use client"

import { useEffect, useRef, useState } from "react"
import { interp } from "@/lib/interp"
import { Phone } from "./phone"
import { SideWords } from "./side-words"
import { Intro } from "./intro"

export function ProjectOne() {
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

  // As Project 01 ends, the entire scene pans off to the LEFT (it does not
  // scroll up), handing off to Project 02 which pans in from the right — a
  // horizontal filmstrip transition rather than a vertical scroll.
  const exitX = interp(progress, [0.9, 1.0], [0, -100])

  return (
    <section ref={ref} className="relative h-[900vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ transform: `translateX(${exitX}vw)`, willChange: "transform" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 78% 40%, oklch(0.3 0.06 264 / 0.6), transparent 60%), radial-gradient(100% 100% at 20% 100%, oklch(0.16 0.04 265), oklch(0.19 0.045 265))",
            }}
          />
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
          <Intro progress={progress} />
          <SideWords progress={progress} />
          <Phone progress={progress} />
        </div>
      </div>
    </section>
  )
}
