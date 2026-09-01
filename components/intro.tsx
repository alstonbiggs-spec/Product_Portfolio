"use client"

import { interp } from "@/lib/interp"

export function Intro({ progress }: { progress: number }) {
  const opacity = interp(progress, [0.06, 0.14], [1, 0])
  const y = interp(progress, [0, 0.14], [0, -8])
  const hintOpacity = interp(progress, [0, 0.05], [1, 0])
  const hintY = interp(progress, [0, 0.05], [0, 12])

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
      style={{ opacity, transform: `translateY(${y}vh)`, willChange: "opacity, transform" }}
    >
      <h1 className="font-serif text-[22vw] leading-none text-foreground md:text-[15rem]">
        Product Portfolio
      </h1>
      <div
        className="mt-6 flex flex-col items-center gap-2"
        style={{ opacity: hintOpacity, transform: `translateY(${hintY}px)` }}
      >
        <p
          className="animate-scroll-hint font-sans text-xs uppercase tracking-[0.4em] text-primary"
          style={{ willChange: "transform" }}
        >
          Scroll down
        </p>
        <svg
          className="animate-scroll-hint"
          style={{ animationDelay: "0.1s", willChange: "transform" }}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 5l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />
        </svg>
      </div>
    </div>
  )
}
