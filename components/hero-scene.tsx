"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

// Publica el avance del scroll (0 → 1 hasta el final de la página, o una pantalla
// si la página es más larga) como --scroll
// para que los personajes se desplacen con CSS sin re-renderizar React.
export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const range = Math.min(maxScroll, window.innerHeight) || 1
      const progress = Math.min(window.scrollY / range, 1)
      sceneRef.current?.style.setProperty("--scroll", progress.toFixed(4))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div
      ref={sceneRef}
      className="relative mt-auto w-full min-w-[900px] self-center [--scroll:0]"
    >
      <Image
        src="/background.webp"
        alt=""
        width={2944}
        height={1015}
        priority
        className="relative z-10 h-auto w-full select-none"
      />

      {/* El sol asoma detrás del horizonte y avanza hacia la derecha con el scroll.
          `translate` se compone con el `transform` de la animación emerge. */}
      <Image
        src="/the-sun.webp"
        alt="Personaje arcoíris"
        width={855}
        height={1111}
        priority
        style={{ translate: "calc(var(--scroll) * 45vw) 0" }}
        className="absolute bottom-[48%] left-[12.5%] z-0 h-auto w-[18%] animate-emerge select-none"
      />

      {/* Capa exterior: avanza con el scroll (`translate`) y pasea de ida y vuelta
          (`transform`); el video interior da los pasos. */}
      <div
        style={{ translate: "calc(var(--scroll) * -45vw) 0" }}
        className="absolute right-[14%] bottom-[3%] z-20 w-[21%] animate-stroll"
      >
        <video
          src="/mongo-fin.webm"
          poster="/mongo.webp"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Personaje con chaqueta naranja"
          className="h-auto w-full origin-bottom animate-step"
        />
      </div>
    </div>
  )
}
