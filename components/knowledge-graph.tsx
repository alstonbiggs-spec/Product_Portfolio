"use client"

import { interp } from "@/lib/interp"

/**
 * A scroll-reactive Neo4j-style knowledge graph.
 *
 * As `progress` advances the graph builds node-by-node and edge-by-edge, then
 * demonstrates the two retrieval modes the second brain uses:
 *   • Semantic search — a query pulses from the hub and lights up nodes that
 *     are close in *meaning* (their vector embeddings), via dashed gold beams.
 *   • Word search — nodes that literally contain the keyword ring up.
 *
 * Coordinates are in a 0..100 space and rendered with percentage positioning,
 * so the SVG edge layer and the node layer stay aligned at any size.
 */

const INK = "oklch(0.93 0.028 88)" // creme
const GOLD = "oklch(0.76 0.11 84)"
const GREEN = "oklch(0.55 0.07 168)"
const LINE = "oklch(0.76 0.11 84 / 0.35)"

type Node = {
  id: string
  label: string
  x: number
  y: number
  r: number
  hub?: boolean
  semantic?: boolean // lights up during semantic search
  word?: boolean // matches the keyword search
  accent?: "gold" | "green"
}

// Hub in the middle, memories orbiting it.
const NODES: Node[] = [
  { id: "hub", label: "Second Brain", x: 50, y: 50, r: 3.4, hub: true },
  { id: "pricing", label: "Q3 Pricing", x: 50, y: 16, r: 2.4, semantic: true, word: true, accent: "gold" },
  { id: "strategy", label: "Strategy", x: 80, y: 27, r: 2.2, semantic: true, accent: "green" },
  { id: "meetings", label: "Meetings", x: 26, y: 24, r: 2.2, semantic: true },
  { id: "launch", label: "Launch Notes", x: 78, y: 62, r: 2.3, word: true, accent: "gold" },
  { id: "papers", label: "Papers", x: 70, y: 84, r: 2.1 },
  { id: "notes", label: "Daily Notes", x: 18, y: 58, r: 2.1 },
  { id: "ideas", label: "Ideas", x: 33, y: 82, r: 2.2, semantic: true },
  { id: "people", label: "People", x: 88, y: 48, r: 2 },
  { id: "journal", label: "Journal", x: 24, y: 42, r: 1.9 },
  { id: "tasks", label: "Tasks", x: 55, y: 82, r: 1.9 },
]

const NODE_INDEX: Record<string, Node> = Object.fromEntries(NODES.map((n) => [n.id, n]))

const EDGES: [string, string][] = [
  ["hub", "pricing"],
  ["hub", "strategy"],
  ["hub", "meetings"],
  ["hub", "launch"],
  ["hub", "notes"],
  ["hub", "ideas"],
  ["hub", "people"],
  ["hub", "journal"],
  ["hub", "tasks"],
  ["pricing", "strategy"],
  ["pricing", "launch"],
  ["meetings", "journal"],
  ["ideas", "notes"],
  ["launch", "papers"],
  ["strategy", "people"],
  ["ideas", "tasks"],
]

// Semantic hits for the demo query "How did we price the launch?"
const SEMANTIC_HITS = ["pricing", "strategy", "meetings", "launch", "ideas"]
// Literal keyword hits for "launch"
const WORD_HITS = ["launch", "pricing"]

export function KnowledgeGraph({ progress }: { progress: number }) {
  // Build phase: nodes/edges appear across this window.
  const build = interp(progress, [0.1, 0.44], [0, 1])
  // Semantic search phase.
  const semantic = interp(progress, [0.44, 0.62, 0.82, 0.9], [0, 1, 1, 0.15])
  // Word search phase.
  const word = interp(progress, [0.66, 0.82], [0, 1])

  // Query chip text reveal.
  const queryChars = Math.round(interp(progress, [0.42, 0.56], [0, QUERY.length]))
  const queryVisible = interp(progress, [0.4, 0.46, 0.86, 0.92], [0, 1, 1, 0])
  const wordChipVisible = interp(progress, [0.64, 0.7], [0, 1])

  const nodeReveal = (i: number) => {
    // Hub first, then the rest staggered across the build window.
    const from = i === 0 ? 0 : 0.06 + (i / NODES.length) * 0.8
    return interp(build, [from, from + 0.16], [0, 1])
  }

  return (
    <div className="relative aspect-square w-[86%] max-w-[540px]">
      {/* Edge layer */}
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {EDGES.map(([aId, bId], i) => {
          const a = NODE_INDEX[aId]
          const b = NODE_INDEX[bId]
          const appear = interp(build, [0.12 + (i / EDGES.length) * 0.72, 0.24 + (i / EDGES.length) * 0.72], [0, 1])
          if (appear <= 0) return null
          const isSem = SEMANTIC_HITS.includes(aId) && SEMANTIC_HITS.includes(bId)
          return (
            <line
              key={`${aId}-${bId}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={LINE}
              strokeWidth={0.35}
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 1 - appear,
                opacity: isSem ? 0.6 + semantic * 0.4 : 0.6,
              }}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}

        {/* Semantic beams: animated dashed pulses from hub to meaning-matches */}
        {SEMANTIC_HITS.map((id) => {
          const n = NODE_INDEX[id]
          const hub = NODE_INDEX.hub
          const draw = interp(semantic, [0, 0.6], [0, 1])
          if (draw <= 0) return null
          return (
            <line
              key={`beam-${id}`}
              x1={hub.x}
              y1={hub.y}
              x2={n.x}
              y2={n.y}
              stroke={GOLD}
              strokeWidth={0.6}
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: "0.08 0.06",
                strokeDashoffset: -progress * 4,
                opacity: draw * 0.9,
                filter: "drop-shadow(0 0 1px oklch(0.76 0.11 84 / 0.8))",
              }}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>

      {/* Node layer */}
      {NODES.map((n, i) => {
        const reveal = nodeReveal(i)
        if (reveal <= 0) return null
        const semLit = n.semantic ? semantic : 0
        const wordLit = n.word ? word : 0
        const baseColor = n.accent === "green" ? GREEN : n.hub ? INK : GOLD
        const glow = Math.max(semLit, wordLit)
        return (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%`, opacity: reveal }}
          >
            {/* word-search ring */}
            {n.word && wordLit > 0 && (
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: `${n.r * 5.2}vmin`,
                  height: `${n.r * 5.2}vmin`,
                  border: `1px solid ${GREEN}`,
                  opacity: wordLit,
                  transform: `translate(-50%, -50%) scale(${0.7 + wordLit * 0.3})`,
                }}
                aria-hidden
              />
            )}
            {/* node dot */}
            <span
              className="block rounded-full"
              style={{
                width: `${n.r * (n.hub ? 2.2 : 1.9)}vmin`,
                height: `${n.r * (n.hub ? 2.2 : 1.9)}vmin`,
                background: baseColor,
                boxShadow: n.hub
                  ? `0 0 ${6 + glow * 10}px oklch(0.93 0.028 88 / 0.7)`
                  : `0 0 ${3 + glow * 12}px ${n.accent === "green" ? GREEN : GOLD}`,
                transform: `scale(${(reveal < 1 ? 0.6 + reveal * 0.4 : 1) + glow * 0.18})`,
              }}
              aria-hidden
            />
            {/* label */}
            <span
              className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-sans text-[9px] tracking-wide md:text-[10px]"
              style={{
                color: glow > 0.15 ? INK : "oklch(0.72 0.03 88)",
                opacity: reveal * (0.5 + glow * 0.5),
                fontWeight: n.hub ? 600 : 400,
              }}
            >
              {n.label}
            </span>
          </div>
        )
      })}

      {/* Query chip (semantic search) */}
      <div
        className="absolute left-1/2 top-[2%] w-[80%] -translate-x-1/2"
        style={{ opacity: queryVisible, transform: `translate(-50%, ${(1 - queryVisible) * -8}px)` }}
      >
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm"
          style={{ borderColor: LINE, background: "oklch(0.19 0.045 265 / 0.7)" }}
        >
          <span className="text-[10px]" style={{ color: GOLD }}>
            ✦
          </span>
          <span className="font-sans text-[10px] leading-none md:text-[11px]" style={{ color: INK }}>
            {QUERY.slice(0, queryChars)}
            <span style={{ opacity: queryChars < QUERY.length ? 1 : 0, color: GOLD }}>|</span>
          </span>
          <span
            className="ml-auto font-sans text-[8px] uppercase tracking-[0.15em]"
            style={{ color: "oklch(0.72 0.03 88)" }}
          >
            semantic
          </span>
        </div>
      </div>

      {/* Word-search chip */}
      <div
        className="absolute bottom-[1%] left-1/2 -translate-x-1/2"
        style={{ opacity: wordChipVisible, transform: `translate(-50%, ${(1 - wordChipVisible) * 8}px)` }}
      >
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1.5"
          style={{ borderColor: "oklch(0.55 0.07 168 / 0.5)", background: "oklch(0.19 0.045 265 / 0.7)" }}
        >
          <span className="font-sans text-[10px] leading-none" style={{ color: GREEN }}>
            "launch"
          </span>
          <span
            className="font-sans text-[8px] uppercase tracking-[0.15em]"
            style={{ color: "oklch(0.72 0.03 88)" }}
          >
            keyword match
          </span>
        </div>
      </div>
    </div>
  )
}

const QUERY = "How did we price the launch?"
