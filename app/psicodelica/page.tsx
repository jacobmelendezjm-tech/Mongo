import type { Metadata } from "next"
import { Shrikhand } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowLeft, Eye, Sparkles, Waves } from "lucide-react"

import { Logo } from "@/components/logo"
import { PsychedelicCanvas } from "@/components/psychedelic-canvas"
import { cn } from "@/lib/utils"

const groovy = Shrikhand({ subsets: ["latin"], weight: "400" })

export const metadata: Metadata = {
  title: "Mongo Trip",
  description: "Un viaje psicodélico por el mundo de Mongo.",
}

// Texto con degradado arcoíris que se desplaza sin parar
const rainbowText =
  "bg-[linear-gradient(90deg,#ff3cac,#ffd23f,#3fffa8,#3cb4ff,#b83cff,#ff3cac)] bg-[length:200%_100%] bg-clip-text text-transparent animate-rainbow-text"

const marqueeRows = [
  { words: ["Color", "Vibra", "Fluye", "Sueña"], reverse: false, tilt: "-rotate-3" },
  { words: ["Paz", "Amor", "Mongo", "Trip"], reverse: true, tilt: "rotate-2" },
  { words: ["Derrite", "Gira", "Brilla", "Flota"], reverse: false, tilt: "-rotate-1" },
]

const cards = [
  {
    icon: Eye,
    title: "Mira",
    text: "Los colores cambian cuando dejas de mirarlos. Y también cuando los miras.",
  },
  {
    icon: Waves,
    title: "Fluye",
    text: "Mueve el cursor y el plasma se ondula a tu alrededor como agua caliente.",
  },
  {
    icon: Sparkles,
    title: "Brilla",
    text: "Cada criatura de este mundo tiene su propio arcoíris escondido.",
  },
]

export default function PsicodelicaPage() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-6">
        <nav className="mx-auto flex max-w-3xl items-center justify-between rounded-full border border-white/30 bg-black/30 py-2 pr-2 pl-3 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl backdrop-saturate-[1.8]">
          <a href="#viaje" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Logo />
            <span className={groovy.className}>Mongo Trip</span>
          </a>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/85"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </nav>
      </header>

      <main className="bg-black text-white">
        {/* 1. Túnel caleidoscópico */}
        <section
          id="viaje"
          className="relative flex h-svh min-h-[34rem] items-center justify-center overflow-hidden px-6"
        >
          <PsychedelicCanvas mode="tunnel" />
          <div className="relative text-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <p className="text-sm font-semibold tracking-[0.4em] uppercase">
              Bienvenido al
            </p>
            <h1
              className={cn(
                groovy.className,
                rainbowText,
                "mt-2 text-[clamp(4rem,14vw,11rem)] leading-[0.9]"
              )}
            >
              Mongo Trip
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg text-white/90">
              Un viaje por el color. Mueve el cursor y deja que el túnel te
              arrastre.
            </p>
          </div>

          <div className="absolute right-[6%] bottom-[-4%] w-[clamp(7rem,16vw,14rem)] animate-float">
            <Image
              src="/the-sun.webp"
              alt="Personaje arcoíris"
              width={855}
              height={1111}
              priority
              className="h-auto w-full animate-hue select-none"
            />
          </div>

          <a
            href="#marquesina"
            aria-label="Bajar"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce rounded-full border border-white/40 bg-black/30 p-3 backdrop-blur"
          >
            <ArrowDown className="size-5" />
          </a>
        </section>

        {/* 2. Marquesina de palabras en direcciones opuestas */}
        <section
          id="marquesina"
          className="relative flex min-h-[80svh] flex-col justify-center gap-10 overflow-hidden py-24"
        >
          {marqueeRows.map((row, i) => (
            <div key={i} className={cn("w-[120%] -ml-[10%]", row.tilt)}>
              <div
                className={cn(
                  "flex w-max",
                  row.reverse ? "animate-marquee-reverse" : "animate-marquee"
                )}
              >
                {/* Dos copias para que el bucle no tenga corte */}
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
                    {[...row.words, ...row.words].map((word, j) => (
                      <span
                        key={j}
                        className={cn(
                          groovy.className,
                          "px-6 text-6xl md:text-8xl",
                          j % 2 === 0
                            ? rainbowText
                            : "text-transparent [-webkit-text-stroke:2px_#fff]"
                        )}
                      >
                        {word} ✺
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pointer-events-none absolute top-1/2 left-1/2 w-[clamp(10rem,24vw,18rem)] -translate-x-1/2 -translate-y-1/2">
            <div className="animate-float">
              <Image
                src="/monster-isolated.webp"
                alt="Monstruo naranja con bigote"
                width={959}
                height={1351}
                className="h-auto w-full animate-hue drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] select-none"
              />
            </div>
          </div>
        </section>

        {/* 3. Plasma arcoíris con tarjetas de vidrio */}
        <section
          id="plasma"
          className="relative flex min-h-svh items-center overflow-hidden px-6 py-28"
        >
          <PsychedelicCanvas mode="plasma" />
          <div className="relative mx-auto w-full max-w-5xl">
            <h2
              className={cn(
                groovy.className,
                "text-center text-[clamp(3rem,8vw,6rem)] leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              )}
            >
              Derrite la realidad
            </h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {cards.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-white/40 bg-black/25 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-white text-black">
                    <Icon className="size-6" />
                  </span>
                  <h3 className={cn(groovy.className, "mt-5 text-3xl")}>{title}</h3>
                  <p className="mt-2 leading-relaxed text-white/90">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Anillos hipnóticos que siguen al cursor */}
        <section
          id="hipnosis"
          className="relative flex h-svh min-h-[34rem] flex-col items-center justify-center overflow-hidden px-6"
        >
          <PsychedelicCanvas mode="rings" />
          <div className="relative w-[clamp(9rem,22vw,16rem)] animate-float">
            <Image
              src="/mongo.webp"
              alt="Mongo"
              width={1405}
              height={2313}
              className="h-auto w-full animate-hue drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] select-none"
            />
          </div>
          <p className="relative mt-8 rounded-full bg-black px-6 py-3 text-center text-lg font-medium">
            Mira fijo al centro… y mueve el cursor
          </p>
        </section>

        {/* 5. Sol de rayos girando y regreso a la landing */}
        <section
          id="regreso"
          className="relative flex min-h-[80svh] items-center justify-center overflow-hidden px-6 py-24"
        >
          <div className="absolute top-1/2 left-1/2 size-[250vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slow bg-[repeating-conic-gradient(#ff3cac_0deg_10deg,#ffd23f_10deg_20deg,#3fffa8_20deg_30deg,#3cb4ff_30deg_40deg,#b83cff_40deg_50deg)]" />
          <div className="relative rounded-[2.5rem] bg-black px-10 py-12 text-center shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <h2 className={cn(groovy.className, rainbowText, "text-[clamp(2.5rem,6vw,4.5rem)] leading-none")}>
              ¿Listo para volver?
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-white/80">
              El viaje termina aquí, pero los colores se quedan contigo.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-black transition-transform hover:scale-105"
            >
              <ArrowLeft className="size-5" />
              Volver a la tierra
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
