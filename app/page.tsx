import Image from "next/image"

import { HeroScene } from "@/components/hero-scene"
import { Logo } from "@/components/logo"
import { SilkBackground } from "@/components/silk-background"
import BlackHole from "@/components/ui/black-hole"

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#seccion-1", label: "Sección 1" },
  { href: "#seccion-2", label: "Sección 2" },
  { href: "/psicodelica", label: "Trip" },
  { href: "/sin-dopamina", label: "Calma" },
  { href: "/miedo", label: "Miedo" },
]

export default function Page() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-6">
        {/* Vidrio translúcido: desenfoque + saturación del fondo, borde fino y brillo interior */}
        <nav className="mx-auto flex max-w-3xl items-center justify-between rounded-full border border-white/40 bg-white/25 py-2 pr-2 pl-3 text-[#1d1d1f] shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl backdrop-saturate-[1.8]">
          <a
            href="#inicio"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <Logo />
            Mongo
          </a>
          <ul className="hidden items-center gap-1 text-sm font-medium md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-4 py-2 text-[#1d1d1f]/75 transition-colors hover:bg-white/40 hover:text-[#1d1d1f]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#seccion-1"
            className="rounded-full bg-[#c8374a] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#d9475a]"
          >
            Empezar
          </a>
        </nav>
      </header>

      <main>
        <section
          id="inicio"
          className="relative flex min-h-svh flex-col overflow-hidden bg-[#0a0a12]"
        >
          {/* Fondo animado de seda en WebGL, reactivo al cursor */}
          <SilkBackground />
          <HeroScene />
        </section>

        <section
          id="seccion-1"
          className="relative grid overflow-hidden bg-neutral-700 md:h-[60svh] md:min-h-[26rem] md:grid-cols-2"
        >
          {/* Video de fondo invertido horizontalmente */}
          <video
            src="/caballo.webm"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="absolute inset-0 size-full -scale-x-100 object-cover"
          />
          {/* Overlay blanco sobre el video */}
          <div className="absolute inset-0 bg-white/60" />

          <div className="relative flex items-center px-6 py-16 md:justify-end md:pr-12 md:pl-8">
            <h2 className="max-w-[9.5em] text-5xl leading-none font-bold tracking-tighter text-[#3a3a3a] md:text-[65px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </h2>
          </div>

          {/* Rectángulo gris centrado verticalmente en su columna */}
          <div className="relative flex items-center px-6 pb-16 md:pr-8 md:pb-0 md:pl-0">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-neutral-700 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] md:max-w-[36rem]">
              <video
                src="/caballo.webm"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Caballo robot animado"
                className="size-full object-cover"
              />
            </div>
          </div>
        </section>

        <section
          id="seccion-2"
          // overflow-x-clip recorta solo a los lados: la cabeza puede salirse por arriba
          className="relative z-10 h-[60svh] min-h-[26rem] overflow-x-clip bg-[#c8374a]"
        >
          {/* Monstruo a la izquierda, también desbordando hacia la sección de arriba */}
          <Image
            src="/monster-isolated.webp"
            alt="Monstruo naranja con bigote"
            width={959}
            height={1351}
            className="absolute bottom-0 left-[6%] h-[125%] w-auto max-w-none select-none"
          />
        </section>

        {/* Agujero negro renderizado en WebGL */}
        <section id="seccion-3" className="h-svh min-h-[28rem] bg-black">
          <BlackHole />
        </section>
      </main>
    </>
  )
}
