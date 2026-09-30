import type { Metadata } from "next"
import { IM_Fell_English, Special_Elite } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

import {
  Apparition,
  Flashlight,
  TimeHere,
  Typewriter,
  WatchingEyes,
  Watcher,
} from "@/components/horror"
import { cn } from "@/lib/utils"

const typewriter = Special_Elite({ subsets: ["latin"], weight: "400" })
const fell = IM_Fell_English({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] })

const TITLE = "Miedo"

export const metadata: Metadata = {
  title: TITLE,
  description: "No deberías estar aquí.",
}

// Ruido de película como SVG en línea
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

// Texto con cortes rojo/cian que aparecen cada pocos segundos
function GlitchText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <span aria-hidden="true" className="absolute inset-0 animate-glitch-a text-[#ff2a2a]">
        {children}
      </span>
      <span aria-hidden="true" className="absolute inset-0 animate-glitch-b text-[#2affea]/70">
        {children}
      </span>
    </span>
  )
}

export default function MiedoPage() {
  return (
    <div className={cn(typewriter.className, "bg-black text-[#d8cfc0] selection:bg-[#8a0b0b]")}>
      <Watcher title={TITLE} />

      {/* Grano de película y viñeta sobre toda la página */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        <div
          className="absolute inset-[-50%] animate-grain opacity-[0.13] mix-blend-screen"
          style={{ backgroundImage: GRAIN }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      <Link
        href="/"
        className="fixed top-6 right-6 z-50 text-sm text-[#6d6259] underline underline-offset-4 hover:text-[#d8cfc0]"
      >
        Salir
      </Link>

      <main>
        {/* 1. Oscuridad: solo ves lo que alumbra la linterna */}
        <section id="oscuridad" className="relative h-svh min-h-[34rem] overflow-hidden bg-[#070404]">
          <Flashlight>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#2a1210_0%,#0d0606_60%)]" />

            <p
              className={cn(
                fell.className,
                "absolute top-[12%] left-[6%] -rotate-6 text-[clamp(3rem,9vw,8rem)] leading-none text-[#6e1111]"
              )}
            >
              NO ESTÁS SOLO
            </p>
            <p className="absolute top-[58%] left-[10%] rotate-3 text-xl text-[#8a7b6a]">
              estuvo aquí antes que tú
            </p>
            <p className="absolute right-[34%] bottom-[10%] -rotate-2 text-lg text-[#8a1c1c]">
              detrás de ti
            </p>
            <p className="absolute top-[30%] right-[8%] rotate-12 text-sm text-[#6d6259]">
              ¿lo escuchas respirar?
            </p>

            <Image
              src="/mongo.webp"
              alt="Una figura de pie en la oscuridad"
              width={1405}
              height={2313}
              priority
              className="absolute right-[12%] bottom-0 h-[78%] w-auto brightness-[0.45] contrast-125 saturate-150 sepia hue-rotate-[-35deg]"
            />
          </Flashlight>

          <p className="pointer-events-none absolute top-8 left-1/2 z-10 -translate-x-1/2 text-sm tracking-[0.3em] text-[#6d6259] uppercase">
            Mueve la linterna
          </p>
        </section>

        {/* 2. Ojos que te siguen */}
        <section id="ojos" className="relative flex h-svh min-h-[34rem] items-center justify-center overflow-hidden bg-black">
          <WatchingEyes />
          <p className={cn(fell.className, "relative animate-flicker text-center text-4xl text-[#b8ab98] italic md:text-6xl")}>
            Ellos llegaron primero.
          </p>
        </section>

        {/* 3. Notas a máquina y Mongo parpadeando en la penumbra */}
        <section id="notas" className="relative grid min-h-svh items-center gap-12 overflow-hidden bg-[#0b0707] px-6 py-24 md:grid-cols-2 md:px-16">
          <div className="space-y-8 text-xl leading-relaxed md:text-2xl">
            <p>
              Llevas <TimeHere /> segundos en esta página.
            </p>
            <Typewriter text="Nadie más está leyendo esto." />
            <Typewriter text="Entonces, ¿quién movió el cursor hace un momento?" />
            <Typewriter text="No voltees. Sigue bajando." className="text-[#c01818]" />
          </div>

          <div className="relative mx-auto aspect-[3/4] w-full max-w-md">
            <video
              src="/mongo-fin.webm"
              autoPlay
              loop
              muted
              playsInline
              aria-label="Una figura que parpadea en la oscuridad"
              className="size-full object-contain brightness-[0.55] contrast-150 grayscale"
              style={{
                maskImage: "radial-gradient(ellipse at 45% 35%, black 25%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at 45% 35%, black 25%, transparent 70%)",
              }}
            />
          </div>
        </section>

        {/* 4. Advertencia: si subes, la página lo nota (ver <Watcher />) */}
        <section id="atras" className="flex h-[80svh] min-h-[28rem] flex-col items-center justify-center gap-6 bg-black px-6 text-center">
          <p className={cn(fell.className, "animate-flicker text-5xl text-[#d8cfc0] md:text-7xl")}>
            No mires atrás.
          </p>
          <p className="text-lg text-[#6d6259]">Hablo en serio.</p>
        </section>

        {/* 5. Final */}
        <section id="final" className="relative flex h-svh min-h-[34rem] flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
          <Apparition />
          <h1 className={cn(fell.className, "relative text-[clamp(3rem,10vw,9rem)] leading-none text-[#b30f0f]")}>
            <GlitchText>CIERRA LA PÁGINA</GlitchText>
          </h1>
          <p className="relative mt-8 text-2xl">Ahora.</p>
          <Link
            href="/sin-dopamina"
            className="absolute bottom-8 text-sm text-[#4a423c] underline underline-offset-4 hover:text-[#d8cfc0]"
          >
            o vuelve a un lugar seguro
          </Link>
        </section>
      </main>
    </div>
  )
}
