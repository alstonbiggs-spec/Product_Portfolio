"use client"

export const SIMPLI_ICON_ORIGIN = { x: 21, y: 40 }

type Icon = { color: string; label: string; glyph?: string; creme?: boolean }

const APPS: Icon[] = [
  { color: "linear-gradient(160deg,#3a5a45,#1f3a2b)", label: "Health" },
  { color: "linear-gradient(160deg,#c9a24a,#9c7a2c)", label: "Wallet" },
  { color: "linear-gradient(160deg,#7c8f79,#5c6d59)", label: "Notes" },
  { color: "linear-gradient(160deg,#2b3f63,#182740)", label: "Weather" },
  { creme: true, glyph: "$", color: "", label: "Simpli" },
  { color: "linear-gradient(160deg,#b9673f,#8f4a2a)", label: "Photos" },
  { color: "linear-gradient(160deg,#3f6d6a,#264744)", label: "Maps" },
  { color: "linear-gradient(160deg,#8a5c86,#5f3d5c)", label: "Music" },
  { color: "linear-gradient(160deg,#4a6b8a,#2c4560)", label: "Files" },
  { color: "linear-gradient(160deg,#b0894a,#856429)", label: "Clock" },
  { color: "linear-gradient(160deg,#586e52,#3a4a37)", label: "Mail" },
  { color: "linear-gradient(160deg,#6b6f76,#45484d)", label: "Settings" },
  { color: "linear-gradient(160deg,#9aa892,#748069)", label: "Camera" },
  { color: "linear-gradient(160deg,#2b3f63,#182740)", label: "Books" },
  { color: "linear-gradient(160deg,#c9a24a,#9c7a2c)", label: "Stocks" },
  { color: "linear-gradient(160deg,#3a5a45,#1f3a2b)", label: "Home" },
]

const DOCK: Icon[] = [
  { color: "linear-gradient(160deg,#3f6d6a,#264744)", label: "Phone" },
  { color: "linear-gradient(160deg,#4a6b8a,#2c4560)", label: "Messages" },
  { color: "linear-gradient(160deg,#586e52,#3a4a37)", label: "Safari" },
  { color: "linear-gradient(160deg,#b9673f,#8f4a2a)", label: "Mail" },
]

function AppIcon({ icon, size = 46 }: { icon: Icon; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center justify-center rounded-[13px]"
        style={{
          width: size,
          height: size,
          background: icon.creme ? "linear-gradient(160deg,#f6f1e4,#e7ddc7)" : icon.color,
          boxShadow: icon.creme
            ? "inset 0 1px 1px rgba(255,255,255,0.7), 0 2px 5px rgba(0,0,0,0.35)"
            : "inset 0 1px 1px rgba(255,255,255,0.18), 0 2px 5px rgba(0,0,0,0.35)",
        }}
      >
        {icon.glyph && (
          <span className="font-serif text-2xl leading-none" style={{ color: "#1f4032" }}>
            {icon.glyph}
          </span>
        )}
      </div>
      {icon.label && (
        <span className="text-[8px] font-sans text-white/90" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
          {icon.label}
        </span>
      )}
    </div>
  )
}

export function IosHome() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 80% at 30% 15%, #2f5241 0%, #1c3327 45%, #14202a 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(90% 60% at 70% 90%, rgba(201,162,74,0.18), transparent 60%)" }}
      />
      <div className="absolute inset-x-0 top-14 flex flex-col items-center">
        <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-white/70">
          Saturday, August 31
        </span>
        <span className="font-serif text-[52px] leading-none text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
          8:27
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-[104px] top-[150px] px-5">
        <div className="grid h-full grid-cols-4 content-start gap-y-4">
          {APPS.map((icon, i) => (
            <div key={i} className="flex justify-center">
              <AppIcon icon={icon} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-5">
        <div
          className="flex items-center justify-around rounded-[26px] px-3 py-3"
          style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}
        >
          {DOCK.map((icon, i) => (
            <AppIcon key={i} icon={{ ...icon, label: "" }} />
          ))}
        </div>
      </div>
    </div>
  )
}
