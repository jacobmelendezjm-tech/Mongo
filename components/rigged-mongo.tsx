import { cn } from "@/lib/utils"

// Mongo articulado: la imagen original está cortada en piezas (public/mongo-rig)
// que giran alrededor de sus articulaciones. Todas las coordenadas son píxeles
// de la imagen original (1405 × 2313) y se convierten a porcentajes.
const W = 1405
const H = 2313

type Box = { x: number; y: number; w: number; h: number }

const PARTS: Record<string, Box> = {
  body: { x: 27, y: 2, w: 1378, h: 1869 },
  "near-thigh": { x: 380, y: 1765, w: 221, h: 160 },
  "near-shin": { x: 283, y: 1880, w: 385, h: 422 },
  "far-thigh": { x: 600, y: 1765, w: 354, h: 155 },
  "far-shin": { x: 600, y: 1875, w: 415, h: 435 },
  "near-hand": { x: 0, y: 1775, w: 354, h: 374 },
  "far-hand": { x: 925, y: 1790, w: 379, h: 419 },
  "eyes-half": { x: 236, y: 250, w: 384, h: 152 },
  "eyes-closed": { x: 236, y: 250, w: 384, h: 152 },
}

// Articulaciones (en píxeles de la imagen original)
const JOINTS = {
  nearHip: [478, 1768],
  nearKnee: [515, 1902],
  farHip: [822, 1768],
  farKnee: [858, 1897],
  nearWrist: [232, 1795],
  farWrist: [1098, 1825],
  pelvis: [650, 1768],
} as const

const pct = (value: number, total: number) => `${(value / total) * 100}%`

// Grupo del tamaño de toda la figura que gira alrededor de una articulación
function Joint({
  at,
  className,
  style,
  children,
}: {
  at: readonly [number, number]
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div
      className={cn("absolute inset-0", className)}
      style={{ transformOrigin: `${pct(at[0], W)} ${pct(at[1], H)}`, ...style }}
    >
      {children}
    </div>
  )
}

function Part({ name, className }: { name: keyof typeof PARTS; className?: string }) {
  const box = PARTS[name]
  return (
    // eslint-disable-next-line @next/next/no-img-element -- piezas pequeñas con posición exacta
    <img
      src={`/mongo-rig/${name}.webp`}
      alt=""
      draggable={false}
      className={cn("absolute max-w-none select-none", className)}
      style={{
        left: pct(box.x, W),
        top: pct(box.y, H),
        width: pct(box.w, W),
        height: pct(box.h, H),
      }}
    />
  )
}

function Leg({ side, delay }: { side: "near" | "far"; delay: string }) {
  const hip = side === "near" ? JOINTS.nearHip : JOINTS.farHip
  const knee = side === "near" ? JOINTS.nearKnee : JOINTS.farKnee
  return (
    <Joint at={hip} className="animate-hip" style={{ animationDelay: delay }}>
      <Joint at={knee} className="animate-knee" style={{ animationDelay: delay }}>
        <Part name={`${side}-shin`} />
      </Joint>
      <Part name={`${side}-thigh`} />
    </Joint>
  )
}

export function RiggedMongo({
  className,
  walking = true,
  cycle = "1.3s",
}: {
  className?: string
  walking?: boolean
  /** Duración de un ciclo completo (dos pasos) */
  cycle?: string
}) {
  const half = `calc(${cycle} / -2)`
  return (
    <div
      role="img"
      aria-label="Mongo caminando"
      className={cn("relative aspect-[1405/2313]", !walking && "[&_*]:[animation-play-state:paused]", className)}
      style={{ "--walk": cycle } as React.CSSProperties}
    >
      <Joint at={JOINTS.pelvis} className="animate-bob">
        {/* De atrás hacia adelante: mano lejana, pierna lejana, pierna cercana, mano cercana, cuerpo */}
        <Joint at={JOINTS.farWrist} className="animate-arm" style={{ animationDelay: half }}>
          <Part name="far-hand" />
        </Joint>
        <Leg side="far" delay={half} />
        <Leg side="near" delay="0s" />
        <Joint at={JOINTS.nearWrist} className="animate-arm">
          <Part name="near-hand" />
        </Joint>
        <Part name="body" />
        <Part name="eyes-half" className="animate-blink-half opacity-0" />
        <Part name="eyes-closed" className="animate-blink-closed opacity-0" />
      </Joint>
    </div>
  )
}
