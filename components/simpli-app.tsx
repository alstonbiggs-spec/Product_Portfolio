"use client"

import { interp } from "@/lib/interp"
import { useLayoutEffect, useRef, useState } from "react"

/**
 * A live recreation of the "Simpli Finance" budgeting app, driven entirely by a
 * single 0..1 progress value `t` supplied by the phone.
 *
 * Instead of flipping between screens, the whole app is ONE tall page that
 * translates upward as `t` advances — exactly like scrolling a real app. There
 * is a single pause in the timeline: when the Spending Pace chart is centered in
 * the phone, the page holds still while the two cumulative lines draw in, then
 * scrolling resumes down through the donuts and money flow.
 */

// ---- palette (sampled from the reference screenshots) ---------------------
const INK = "#1c3b2e" // deep forest green — values, Needs, primary text
const GOLD = "#a9822f" // gold accent — sync link, plus signs, Wants
const GOLD_SOFT = "#c3a35c"
const SAGE = "#93a58f"
const SAGE_LIGHT = "#bcc4b2"
const MUTE = "#8d8877" // muted uppercase labels
const FAINT = "#bab5a6" // faint gray — the "/ $budget" figure
const LINE = "#d8d2c3" // hairline dividers
const RED = "#a8503a" // delete
const PAGE_TOP = "#f4f1e8"
const PAGE_BOT = "#efe8d9"

const CATEGORIES = [
  {
    label: "NEEDS",
    spent: "6,410.51",
    budget: "5,581",
    open: true,
    items: [
      { label: "Rent", spent: "2,550", budget: "2,550" },
      { label: "Utilities", spent: "106.52", budget: "100" },
      { label: "Gas / Tolls", spent: "295.28", budget: "400" },
      { label: "Groceries", spent: "674.64", budget: "900" },
      { label: "Eating Out", spent: "282.36", budget: "200" },
      { label: "Phone Bill", spent: "148.03", budget: "141" },
      { label: "Wifi", spent: "65.56", budget: "65" },
      { label: "Gym", spent: "64.95", budget: "65" },
      { label: "Insurance", spent: "186.4", budget: "200" },
      { label: "Chiropractor", spent: "0", budget: "110" },
      { label: "massage", spent: "0", budget: "250" },
    ],
  },
  { label: "WANTS", spent: "1,858.8", budget: "2,400" },
  { label: "SAVINGS", spent: "396.93", budget: "3,300" },
  { label: "INCOME", spent: "5,199.72", budget: "0" },
] as const

const OVERALL = [
  { label: "Needs", pct: 68, color: INK },
  { label: "Wants", pct: 27, color: GOLD },
  { label: "Savings", pct: 5, color: SAGE },
]

const NEEDS_BREAKDOWN = [
  { label: "Rent", pct: 49, color: INK },
  { label: "Groceries", pct: 18, color: GOLD },
  { label: "Shopping", pct: 7, color: SAGE },
  { label: "Gas / Tolls", pct: 7, color: SAGE_LIGHT },
  { label: "Other", pct: 6, color: "#2f5a45" },
  { label: "Insurance", pct: 3, color: GOLD_SOFT },
  { label: "Phone Bill", pct: 3, color: "#7d9079" },
  { label: "Eating Out", pct: 3, color: "#a9b3a0" },
  { label: "Utilities", pct: 2, color: "#244b39" },
  { label: "Wifi", pct: 1, color: "#b8923a" },
  { label: "Gym", pct: 1, color: SAGE },
]

const FLOW = [
  { label: "Rent", value: "2,550", n: 2550, color: INK },
  { label: "Groceries", value: "936", n: 936, color: SAGE },
  { label: "Shopping", value: "382", n: 382, color: SAGE },
  { label: "Gas / Tolls", value: "350", n: 350, color: SAGE },
  { label: "Other", value: "306", n: 306, color: SAGE },
  { label: "Insurance", value: "175", n: 175, color: SAGE },
  { label: "Phone Bill", value: "152", n: 152, color: SAGE },
  { label: "Eating Out", value: "142", n: 142, color: SAGE },
  { label: "Utilities", value: "110", n: 110, color: SAGE },
  { label: "Wifi", value: "66", n: 66, color: SAGE },
  { label: "Gym", value: "65", n: 65, color: SAGE },
  { label: "Wife", value: "1,176", n: 1176, color: GOLD },
  { label: "Alston", value: "866", n: 866, color: GOLD },
  { label: "HYSA", value: "300", n: 300, color: GOLD_SOFT },
  { label: "INTEREST", value: "122", n: 122, color: GOLD_SOFT },
]

// cumulative daily spend, day 0..30
const AUG = [
  0, 180, 2600, 2760, 2900, 3050, 3180, 3350, 3520, 3680, 3820, 4000, 4600, 4780, 4950, 5100, 5250,
  5380, 5520, 5680, 5800, 5950, 6100, 6250, 6420, 6600, 6780, 6950, 7080, 7200, 7275,
]
const JUL = [
  0, 300, 2950, 3120, 3280, 3450, 3650, 3820, 4000, 4600, 4780, 4950, 5600, 5780, 5950, 6100, 6280,
  6450, 6600, 6780, 6950, 7100, 7250, 7400, 7550, 7700, 7850, 7980, 8080, 8150, 8183,
]

export function SimpliApp({ t }: { t: number }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const [m, setM] = useState({ viewportH: 0, contentH: 0, chartCenter: 0, flowTop: 0 })

  useLayoutEffect(() => {
    const measure = () => {
      const vp = viewportRef.current
      const content = contentRef.current
      const chart = chartRef.current
      const flow = flowRef.current
      if (!vp || !content || !chart || !flow) return
      setM({
        viewportH: vp.clientHeight,
        contentH: content.scrollHeight,
        chartCenter: chart.offsetTop + chart.offsetHeight / 2,
        flowTop: flow.offsetTop,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (contentRef.current) ro.observe(contentRef.current)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const maxScroll = Math.max(0, m.contentH - m.viewportH)
  const pauseScroll = Math.min(maxScroll, Math.max(0, m.chartCenter - m.viewportH / 2))

  // Single continuous scroll with one hold while the chart draws.
  const PAUSE_A = 0.4
  const PAUSE_B = 0.58
  const scroll = interp(t, [0, PAUSE_A, PAUSE_B, 1], [0, pauseScroll, pauseScroll, maxScroll])
  const chartDraw = interp(t, [PAUSE_A + 0.01, PAUSE_B], [0, 1])

  // Money-flow "snake" reveal: streams grow to the right as the section
  // scrolls up into view (enters at the viewport bottom, done just past center).
  const enter = m.flowTop - m.viewportH * 0.92
  const done = m.flowTop - m.viewportH * 0.3
  const flowDraw = done > enter ? Math.min(1, Math.max(0, (scroll - enter) / (done - enter))) : 0

  return (
    <div
      className="relative h-full w-full overflow-hidden font-sans"
      style={{ background: `linear-gradient(180deg, ${PAGE_TOP} 0%, ${PAGE_BOT} 100%)` }}
    >
      <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
        <div
          ref={contentRef}
          className="absolute left-0 top-0 w-full"
          style={{ transform: `translateY(${-scroll}px)`, willChange: "transform" }}
        >
          <div className="px-5 pb-8 pt-11">
            <Masthead />
            <Overview />
            <Totals />
            <PlanVsActual />
            <SpendingPace chartRef={chartRef} draw={chartDraw} />
            <Donuts />
            <MoneyFlow flowRef={flowRef} draw={flowDraw} />
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  )
}

// ---------------------------------------------------------------------------

function StatusBar() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pt-2.5 text-[11px] font-semibold text-[#101a12]">
      <span>8:27</span>
      <div className="flex items-center gap-1.5">
        <svg width="15" height="10" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" opacity="0.35" />
        </svg>
        <svg width="14" height="10" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M1 4.2C4.8 1 11.2 1 15 4.2M3.4 6.8C5.8 4.6 10.2 4.6 12.6 6.8M6 9.4C7.1 8.4 8.9 8.4 10 9.4" strokeLinecap="round" />
        </svg>
        <svg width="22" height="11" viewBox="0 0 26 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.5" />
          <rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor" />
          <rect x="24" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </div>
  )
}

function Masthead() {
  return (
    <div className="flex items-center justify-between">
      <span className="font-serif text-[22px] leading-none text-[#16332a]">Simpli Finance</span>
      <div className="flex flex-col gap-[5px]" aria-hidden>
        <span className="block h-px w-6" style={{ background: INK }} />
        <span className="block h-px w-6" style={{ background: INK }} />
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.28em]" style={{ color: MUTE }}>
      {children}
    </p>
  )
}

function Overview() {
  return (
    <div className="mt-9">
      <Label>Household Overview · August 2026</Label>
      <h1 className="mt-2 font-serif text-[48px] leading-[0.95] text-[#16332a]">Budget</h1>

      <div className="mt-5 flex flex-col items-end gap-1.5">
        <span
          className="rounded-[6px] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ border: `1px solid ${LINE}`, color: INK }}
        >
          Connect an account
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: GOLD }}>
          Sync transactions
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.16em]" style={{ color: MUTE }}>
          Connected accounts (16) ⌄
        </span>
        <span className="text-[10px]" style={{ color: MUTE }}>
          Transactions synced.
        </span>
      </div>
    </div>
  )
}

function Totals() {
  const stats = [
    { label: "Total Income", value: "$9,657.12", strong: false },
    { label: "Total Spent", value: "$7,275.11", strong: true },
    { label: "Total Saved", value: "$402.82", strong: false },
  ]
  return (
    <div className="mt-8 flex items-center justify-between border-y py-5" style={{ borderColor: LINE }}>
      {stats.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-center">
          {i > 0 && <span className="mr-4 h-9 w-px shrink-0" style={{ background: LINE }} aria-hidden />}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p
              className="text-[8px] uppercase tracking-[0.14em]"
              style={{ color: s.strong ? INK : MUTE, fontWeight: s.strong ? 700 : 500 }}
            >
              {s.label}
            </p>
            <p
              className="font-serif leading-none"
              style={{ color: INK, fontSize: s.strong ? 21 : 16, fontWeight: s.strong ? 700 : 400 }}
            >
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PlanVsActual() {
  return (
    <div className="mt-9">
      <div className="flex items-end justify-between">
        <div>
          <Label>Plan vs Actual</Label>
          <h2 className="mt-1.5 font-serif text-[30px] leading-none text-[#16332a]">August 2026</h2>
        </div>
        <span className="text-[11px]" style={{ color: MUTE }}>
          Spent / budget
        </span>
      </div>

      <span
        className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px]"
        style={{ border: `1px solid ${LINE}`, color: INK }}
      >
        Last Month
        <span className="text-[9px] leading-none" style={{ color: MUTE }}>
          ⌄
        </span>
      </span>

      <div className="mt-4">
        {CATEGORIES.map((c) => (
          <div key={c.label}>
            <CategoryRow category={c} />
            {"items" in c && c.items && (
              <div className="pb-2">
                {c.items.map((it) => (
                  <ItemRow key={it.label} item={it} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryRow({ category }: { category: (typeof CATEGORIES)[number] }) {
  const open = "open" in category && category.open
  return (
    <div className="flex items-center justify-between border-b py-3.5" style={{ borderColor: LINE }}>
      <div className="flex items-center gap-3">
        <span className="text-[15px] leading-none" style={{ color: GOLD }}>
          {open ? "−" : "+"}
        </span>
        <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: INK }}>
          {category.label}
        </span>
      </div>
      <span className="font-serif text-[15px]" style={{ color: INK }}>
        ${category.spent} <span style={{ color: FAINT }}>/ ${category.budget}</span>
      </span>
    </div>
  )
}

function ItemRow({ item }: { item: { label: string; spent: string; budget: string } }) {
  return (
    <div className="flex items-center justify-between border-b py-3 pl-6" style={{ borderColor: LINE }}>
      <div className="flex items-center gap-3">
        <span className="text-[13px] leading-none" style={{ color: GOLD }}>
          +
        </span>
        <span className="text-[13px]" style={{ color: "#3c4a3f" }}>
          {item.label}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="whitespace-nowrap font-serif text-[13px]" style={{ color: INK }}>
          ${item.spent} <span style={{ color: FAINT }}>/ ${item.budget}</span>
        </span>
        <div className="flex w-11 flex-col items-end gap-1">
          <span className="text-[8px] font-semibold uppercase tracking-[0.1em]" style={{ color: MUTE }}>
            Edit
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-[0.1em]" style={{ color: RED }}>
            Delete
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function SpendingPace({
  chartRef,
  draw,
}: {
  chartRef: React.RefObject<HTMLDivElement | null>
  draw: number
}) {
  return (
    <div className="mt-12">
      <Label>Spending Pace</Label>
      <h2 className="mt-1.5 font-serif text-[30px] leading-[1.02] text-[#16332a]">
        Needs + Wants,
        <br />
        cumulative
      </h2>

      <div className="mt-5 flex flex-col gap-2.5">
        <PaceSelect dot={INK} name="August 2026 (this month)" value="$7,275" vs />
        <PaceSelect dot={GOLD} name="July 2026" value="$8,183" />
      </div>

      <div ref={chartRef} className="mt-6">
        <PaceChart draw={draw} />
      </div>

      <div className="mt-8 flex items-end justify-between border-t pt-5" style={{ borderColor: LINE }}>
        <p className="text-[9px] font-medium uppercase tracking-[0.2em]" style={{ color: MUTE }}>
          Total Spend + Saved
        </p>
        <p className="font-serif text-[26px] leading-none" style={{ color: INK }}>
          $7,677.93
        </p>
      </div>
    </div>
  )
}

function PaceSelect({
  dot,
  name,
  value,
  vs,
}: {
  dot: string
  name: string
  value: string
  vs?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
      <span
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px]"
        style={{ border: `1px solid ${LINE}`, color: INK }}
      >
        {name}
        <span className="text-[8px]" style={{ color: MUTE }}>
          ⌄
        </span>
      </span>
      <span className="font-serif text-[16px]" style={{ color: INK }}>
        {value}
      </span>
      {vs && (
        <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: FAINT }}>
          vs
        </span>
      )}
    </div>
  )
}

function PaceChart({ draw }: { draw: number }) {
  const W = 252
  const H = 200
  const padL = 30
  const padR = 8
  const padT = 8
  const padB = 24
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const maxV = 10000
  const days = 30

  const toX = (i: number) => padL + (i / days) * plotW
  const toY = (v: number) => padT + plotH - (v / maxV) * plotH

  const line = (data: number[]) => `M ${data.map((v, i) => `${toX(i)},${toY(v)}`).join(" L ")}`
  const augPath = line(AUG)
  const julPath = line(JUL)

  const yTicks = [
    { v: 10000, label: "$10k" },
    { v: 7500, label: "$7.5k" },
    { v: 5000, label: "$5k" },
    { v: 2500, label: "$2.5k" },
    { v: 0, label: "$0" },
  ]
  const xTicks = [1, 5, 10, 15, 20, 25, 30]
  const todayX = toX(days)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {yTicks.map((tk) => (
        <g key={tk.v}>
          <line x1={padL} x2={W - padR} y1={toY(tk.v)} y2={toY(tk.v)} stroke={INK} strokeOpacity={0.08} strokeWidth={1} />
          <text x={padL - 5} y={toY(tk.v) + 3} textAnchor="end" fontSize="8" fill={MUTE}>
            {tk.label}
          </text>
        </g>
      ))}

      {xTicks.map((d) => (
        <text key={d} x={toX(d - 1)} y={H - 8} textAnchor="middle" fontSize="8" fill={MUTE}>
          {d}
        </text>
      ))}

      {/* Today marker */}
      <line x1={todayX} x2={todayX} y1={padT} y2={padT + plotH} stroke={INK} strokeOpacity={0.28} strokeWidth={1} strokeDasharray="3 3" />
      <text x={todayX - 3} y={padT + 8} textAnchor="end" fontSize="8" fill={MUTE}>
        Today
      </text>

      {/* July — dashed gold */}
      <path
        d={julPath}
        fill="none"
        stroke={GOLD}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 3"
        pathLength={1}
        style={{ strokeDasharray: `${draw} ${1 - draw}`, strokeDashoffset: 0 }}
        opacity={0.9}
      />
      {/* August — solid green (drawn with pathLength reveal) */}
      <path
        d={augPath}
        fill="none"
        stroke={INK}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw }}
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------

function Donuts() {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-center">
        <Donut segments={OVERALL} size={172} thickness={26} />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {OVERALL.map((s) => (
          <span key={s.label} className="flex items-center gap-2 text-[13px]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="font-bold" style={{ color: INK }}>
              {s.label}
            </span>
            <span style={{ color: FAINT }}>{s.pct}%</span>
          </span>
        ))}
      </div>

      <div className="mt-12">
        <Label>Needs Breakdown</Label>
        <div className="mt-5 flex items-center justify-center">
          <Donut segments={NEEDS_BREAKDOWN} size={168} thickness={22} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2.5">
          {NEEDS_BREAKDOWN.map((s) => (
            <span key={s.label} className="flex items-center gap-2 text-[12px]">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              <span style={{ color: INK }}>{s.label}</span>
              <span style={{ color: FAINT }}>{s.pct}%</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Donut({
  segments,
  size,
  thickness,
}: {
  segments: { label: string; pct: number; color: string }[]
  size: number
  thickness: number
}) {
  const gap = 1.4
  let cursor = 0
  const parts: string[] = []
  segments.forEach((s) => {
    const start = cursor
    const end = cursor + s.pct
    parts.push(`${s.color} ${start}% ${Math.max(start, end - gap)}%`)
    parts.push(`transparent ${Math.max(start, end - gap)}% ${end}%`)
    cursor = end
  })
  const gradient = `conic-gradient(from -90deg, ${parts.join(", ")})`
  const holeR = size / 2 - thickness

  return (
    <div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: gradient,
        WebkitMaskImage: `radial-gradient(circle at center, transparent ${holeR}px, black ${holeR + 0.5}px)`,
        maskImage: `radial-gradient(circle at center, transparent ${holeR}px, black ${holeR + 0.5}px)`,
      }}
    />
  )
}

// ---------------------------------------------------------------------------

function MoneyFlow({
  flowRef,
  draw,
}: {
  flowRef: React.RefObject<HTMLDivElement | null>
  draw: number
}) {
  const rowH = 34
  const svgH = FLOW.length * rowH
  const labelX = 158
  const startX = 4
  const endX = 150
  const maxN = Math.max(...FLOW.map((f) => f.n))

  return (
    <div ref={flowRef} className="mt-14">
      <Label>Money Flow</Label>
      <div className="mt-1.5 flex items-start justify-between">
        <h2 className="font-serif text-[30px] leading-none text-[#16332a]">August 2026</h2>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-[9px] font-medium uppercase tracking-[0.2em]" style={{ color: MUTE }}>
          Where it went
        </p>
        <p className="font-serif text-[24px] leading-none" style={{ color: INK }}>
          $7,677.93
        </p>
      </div>

      <div className="relative mt-6" style={{ height: svgH }}>
        <svg viewBox={`0 0 252 ${svgH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {FLOW.map((f, i) => {
            const y = i * rowH + rowH / 2
            const y0 = 14 + (i / (FLOW.length - 1)) * (svgH - 28)
            const w = 1 + (f.n / maxN) * 8
            const c1 = startX + (endX - startX) * 0.45
            const c2 = startX + (endX - startX) * 0.7
            // stagger each stream so they snake to the right in sequence
            const from = (i / FLOW.length) * 0.5
            const local = Math.min(1, Math.max(0, (draw - from) / 0.5))
            return (
              <path
                key={f.label}
                d={`M ${startX},${y0} C ${c1},${y0} ${c2},${y} ${endX},${y}`}
                fill="none"
                stroke={f.color}
                strokeWidth={w}
                strokeLinecap="round"
                opacity={0.85}
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: 1 - local }}
              />
            )
          })}
        </svg>
        {FLOW.map((f, i) => {
          const from = (i / FLOW.length) * 0.5
          const local = Math.min(1, Math.max(0, (draw - from) / 0.5))
          return (
            <div
              key={f.label}
              className="absolute flex flex-col justify-center"
              style={{
                left: labelX,
                top: i * rowH,
                height: rowH,
                opacity: local,
                transform: `translateX(${(1 - local) * 8}px)`,
              }}
            >
              <span className="text-[12px] leading-tight" style={{ color: INK }}>
                {f.label}
              </span>
              <span className="text-[11px] leading-tight" style={{ color: MUTE }}>
                ${f.value}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-8 border-t pt-5" style={{ borderColor: LINE }}>
        <span
          className="inline-flex w-full items-center justify-center rounded-[6px] py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ border: `1px solid ${LINE}`, color: INK }}
        >
          View all transactions →
        </span>
      </div>
    </div>
  )
}
