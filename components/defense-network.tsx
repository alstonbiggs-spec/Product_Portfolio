"use client"

import { interp } from "@/lib/interp"

/**
 * The Defense Network — a radial "connection graph" that assembles as the user
 * scrolls. A central Defense Network.ai hub, six persona nodes orbiting it,
 * hub spokes that draw outward, then cross-links between personas that light up
 * to show the network effect. Driven entirely by the `t` (0..1) prop.
 */

type Persona = {
  short: string
  sub: string
  color: string
}

// Six sides of the defense-tech marketplace, ordered clockwise from top.
const PERSONAS: Persona[] = [
  { short: "Defense Startups", sub: "Founders & primes", color: "var(--gold)" },
  { short: "Special Forces", sub: "Active-duty operators", color: "var(--creme)" },
  { short: "Consultants", sub: "Defense advisors", color: "var(--gold)" },
  { short: "VC & Family Offices", sub: "Dual-use capital", color: "var(--creme)" },
  { short: "SBIR Writers", sub: "Proposal & grants", color: "var(--gold)" },
  { short: "Accelerators", sub: "Programs & labs", color: "var(--creme)" },
]

const CX = 200
const CY = 200
const R = 148

function nodePos(i: number) {
  const angle = (-90 + i * 60) * (Math.PI / 180)
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) }
}

// Cross-links between personas (indices) — the "network effect" web.
const CROSS: [number, number][] = [
  [0, 2],
  [0, 3],
  [1, 4],
  [2, 5],
  [3, 5],
  [1, 3],
  [0, 4],
]

export function DefenseNetwork({ t }: { t: number }) {
  // Beat map (within this component's own 0..1 window):
  //   0.00–0.30  hub + persona nodes pop in, spokes draw
  //   0.30–0.62  cross-links weave in (network effect)
  //   0.55–1.00  a member counter + verified pulse settle
  const hubIn = interp(t, [0, 0.1], [0, 1])
  const members = Math.round(interp(t, [0.55, 1], [0, 4820]))

  return (
    <div className="relative aspect-square w-full max-w-[520px]">
      <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
        {/* faint orbit ring */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="var(--creme)"
          strokeOpacity={0.1}
          strokeWidth={1}
          style={{ opacity: hubIn }}
        />

        {/* hub spokes */}
        {PERSONAS.map((_, i) => {
          const p = nodePos(i)
          const draw = interp(t, [0.08 + i * 0.02, 0.28 + i * 0.02], [0, 1])
          return (
            <line
              key={`spoke-${i}`}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke="var(--gold)"
              strokeOpacity={0.5}
              strokeWidth={1.4}
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw }}
            />
          )
        })}

        {/* cross-links (network effect) */}
        {CROSS.map(([a, b], i) => {
          const pa = nodePos(a)
          const pb = nodePos(b)
          const start = 0.32 + i * 0.035
          const draw = interp(t, [start, start + 0.12], [0, 1])
          return (
            <line
              key={`cross-${i}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="var(--creme)"
              strokeOpacity={0.16}
              strokeWidth={1}
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw }}
            />
          )
        })}

        {/* persona nodes */}
        {PERSONAS.map((persona, i) => {
          const p = nodePos(i)
          const appear = interp(t, [0.06 + i * 0.03, 0.2 + i * 0.03], [0, 1])
          return (
            <g key={`node-${i}`} style={{ opacity: appear }}>
              <circle cx={p.x} cy={p.y} r={11} fill="var(--navy-deep)" stroke={persona.color} strokeWidth={1.6} />
              <circle cx={p.x} cy={p.y} r={4} fill={persona.color} />
            </g>
          )
        })}

        {/* central hub */}
        <g style={{ opacity: hubIn }}>
          <circle cx={CX} cy={CY} r={30} fill="var(--navy)" stroke="var(--gold)" strokeWidth={2} />
          <circle cx={CX} cy={CY} r={30} fill="none" stroke="var(--gold)" strokeOpacity={0.25} strokeWidth={8} />
          <text
            x={CX}
            y={CY + 5}
            textAnchor="middle"
            className="font-serif"
            style={{ fill: "var(--creme)", fontSize: 15, fontWeight: 600 }}
          >
            DN
          </text>
        </g>
      </svg>

      {/* HTML persona labels, positioned over the SVG nodes */}
      {PERSONAS.map((persona, i) => {
        const p = nodePos(i)
        const appear = interp(t, [0.1 + i * 0.03, 0.24 + i * 0.03], [0, 1])
        const leftPct = (p.x / 400) * 100
        const topPct = (p.y / 400) * 100
        // push label outward from hub so it clears the node
        const outX = p.x < CX - 10 ? "-100%" : p.x > CX + 10 ? "0%" : "-50%"
        const outY = p.y < CY ? "-130%" : "30%"
        return (
          <div
            key={`label-${i}`}
            className="absolute whitespace-nowrap"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: `translate(${outX}, ${outY})`,
              opacity: appear,
              textAlign: p.x < CX - 10 ? "right" : "left",
            }}
          >
            <p className="font-sans text-[11px] font-semibold tracking-wide text-foreground">{persona.short}</p>
            <p className="font-sans text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{persona.sub}</p>
          </div>
        )
      })}

      {/* live member counter chip, center-bottom */}
      <div
        className="absolute left-1/2 top-[calc(50%+64px)] -translate-x-1/2 rounded-full border px-3 py-1.5"
        style={{
          borderColor: "var(--gold)",
          background: "oklch(0.19 0.045 265 / 0.85)",
          opacity: interp(t, [0.55, 0.66], [0, 1]),
        }}
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-primary">
          {members.toLocaleString()} verified members
        </span>
      </div>
    </div>
  )
}
