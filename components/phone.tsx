"use client"

import { interp } from "@/lib/interp"
import { IosHome, SIMPLI_ICON_ORIGIN } from "./ios-home"
import { SimpliApp } from "./simpli-app"

export function Phone({ progress }: { progress: number }) {
  const y = interp(progress, [0.06, 0.42], [-125, 0])
  const rotateZ = interp(progress, [0.06, 0.42], [40, 0])
  const rotateY = interp(progress, [0.06, 0.42], [560, 0])
  const scale = interp(progress, [0.06, 0.42], [0.68, 1])
  const opacity = interp(progress, [0.05, 0.13], [0, 1])
  const restTilt = interp(progress, [0.42, 0.62], [0, -4])
  const openT = interp(progress, [0.5, 0.575], [0, 1])
  const appScale = interp(openT, [0, 1], [0.22, 1])
  const appOpacity = interp(openT, [0, 0.35], [0, 1])
  const appRadius = interp(openT, [0, 1], [13, 0])
  const homeOpacity = interp(progress, [0.5, 0.56], [1, 0])
  const homeScale = interp(progress, [0.5, 0.575], [1, 1.25])
  const appT = interp(progress, [0.575, 0.9], [0, 1])

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center md:justify-end md:pr-[7%] pointer-events-none">
      <div style={{ perspective: 1400 }}>
        <div
          style={{
            transform: `translateY(${y}vh) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg) scale(${scale})`,
            opacity,
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
          }}
        >
          <div style={{ transform: `rotateY(${restTilt}deg)` }}>
            <PhoneFrame>
              <div
                className="absolute inset-0"
                style={{ opacity: homeOpacity, transform: `scale(${homeScale})`, transformOrigin: `${SIMPLI_ICON_ORIGIN.x}% ${SIMPLI_ICON_ORIGIN.y}%` }}
              >
                <IosHome />
              </div>
              {progress > 0.5 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    opacity: appOpacity,
                    transform: `scale(${appScale})`,
                    transformOrigin: `${SIMPLI_ICON_ORIGIN.x}% ${SIMPLI_ICON_ORIGIN.y}%`,
                    borderRadius: appRadius,
                  }}
                >
                  <SimpliApp t={appT} />
                </div>
              )}
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-[560px] w-[272px] rounded-[3rem] p-[10px]"
      style={{
        background: "linear-gradient(145deg, oklch(0.34 0.05 264), oklch(0.16 0.04 265))",
        boxShadow:
          "0 40px 80px -20px oklch(0 0 0 / 0.65), 0 0 0 1.5px oklch(0.76 0.11 84 / 0.35), inset 0 1px 2px oklch(0.93 0.028 88 / 0.15)",
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.3rem] bg-[oklch(0.16_0.04_265)]">
        {children}
        <div className="absolute left-1/2 top-3 z-20 h-6 w-20 -translate-x-1/2 rounded-full bg-black/90" />
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(115deg, oklch(1 0 0 / 0.14) 0%, transparent 30%, transparent 70%, oklch(1 0 0 / 0.06) 100%)",
          }}
        />
      </div>
    </div>
  )
}
