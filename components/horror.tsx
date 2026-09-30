"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// ---------------------------------------------------------------------------
// Linterna: la sección está a oscuras y solo se ve lo que ilumina el cursor.
// La luz tiembla un poco y, muy de vez en cuando, se apaga un instante.
// ---------------------------------------------------------------------------
export function Flashlight({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = prefersReducedMotion()
    const light = { x: 0.5, y: 0.8, tx: 0.5, ty: 0.8, radius: 150, off: false }

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      light.tx = (event.clientX - rect.left) / rect.width
      light.ty = (event.clientY - rect.top) / rect.height
    }
    window.addEventListener("pointermove", onMove, { passive: true })

    // Apagones cortos y aleatorios (no es un estrobo: uno cada varios segundos)
    let blackout: ReturnType<typeof setTimeout>
    const scheduleBlackout = () => {
      blackout = setTimeout(() => {
        light.off = true
        setTimeout(() => {
          light.off = false
          scheduleBlackout()
        }, 180 + Math.random() * 250)
      }, 5000 + Math.random() * 7000)
    }
    if (!reduced) scheduleBlackout()

    let frame = 0
    const tick = (now: number) => {
      light.x += (light.tx - light.x) * 0.12
      light.y += (light.ty - light.y) * 0.12
      const flicker = reduced ? 0 : Math.sin(now / 90) * 4 + (Math.random() - 0.5) * 6
      const radius = light.off ? 0 : light.radius + flicker
      el.style.setProperty("--x", `${light.x * 100}%`)
      el.style.setProperty("--y", `${light.y * 100}%`)
      el.style.setProperty("--r", `${radius}px`)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(blackout)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  return (
    <div ref={ref} className="absolute inset-0 cursor-none [--r:150px] [--x:50%] [--y:80%]">
      {children}
      {/* Oscuridad con un agujero de luz donde está el cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black"
        style={{
          maskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 45%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 45%, black 100%)",
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ojos en la oscuridad que siguen al cursor y parpadean a destiempo.
// ---------------------------------------------------------------------------
type Eye = { x: number; y: number; size: number; delay: number }

// Posiciones fijas (pseudoaleatorias) para que el servidor y el cliente coincidan
const EYES: Eye[] = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => {
    const s = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453
    return s - Math.floor(s)
  }
  // Redondeados: con muchos decimales el navegador reescribe el estilo y la
  // hidratación de React ve una diferencia con el HTML del servidor
  return {
    x: Math.round((4 + r(1) * 92) * 10) / 10,
    y: Math.round((8 + r(2) * 84) * 10) / 10,
    size: Math.round(18 + r(3) * 34),
    delay: Math.round(r(4) * 40) / 10,
  }
})

export function WatchingEyes() {
  const ref = useRef<HTMLDivElement>(null)
  const [awake, setAwake] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const pupils = Array.from(el.querySelectorAll<HTMLElement>("[data-pupil]"))
    const eyes = Array.from(el.querySelectorAll<HTMLElement>("[data-eye]"))
    let cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let visible = false

    const onMove = (event: PointerEvent) => (cursor = { x: event.clientX, y: event.clientY })
    window.addEventListener("pointermove", onMove, { passive: true })

    // Se "despiertan" (aparecen) cuando la sección entra en pantalla
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) setAwake(true)
      },
      { threshold: 0.35 }
    )
    observer.observe(el)

    let frame = 0
    const tick = () => {
      if (visible) {
        for (const pupil of pupils) {
          const rect = pupil.parentElement!.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const angle = Math.atan2(cursor.y - cy, cursor.x - cx)
          const reach = rect.width * 0.22
          pupil.style.transform = `translate(${Math.cos(angle) * reach}px, ${Math.sin(angle) * reach}px)`
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    // Parpadeos aleatorios, cada ojo por su cuenta
    const timers: ReturnType<typeof setTimeout>[] = []
    if (!prefersReducedMotion()) {
      eyes.forEach((eye) => {
        const blink = () => {
          eye.style.transform = "scaleY(0.05)"
          timers.push(setTimeout(() => (eye.style.transform = "scaleY(1)"), 140))
          timers.push(setTimeout(blink, 2500 + Math.random() * 6000))
        }
        timers.push(setTimeout(blink, Math.random() * 5000))
      })
    }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      timers.forEach(clearTimeout)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0">
      {EYES.map((eye, i) => (
        <div
          key={i}
          className="absolute flex gap-[0.35em] transition-opacity duration-[3000ms]"
          style={{
            left: `${eye.x}%`,
            top: `${eye.y}%`,
            fontSize: eye.size,
            opacity: awake ? 0.85 : 0,
            transitionDelay: `${eye.delay}s`,
          }}
        >
          {[0, 1].map((side) => (
            <div
              key={side}
              data-eye
              className="relative grid h-[0.55em] w-[1em] place-items-center overflow-hidden rounded-[50%] bg-[#e9dfc8] shadow-[0_0_18px_rgba(255,40,40,0.35)] transition-transform duration-100"
            >
              <span data-pupil className="block size-[0.42em] rounded-full bg-[#140303]">
                <span className="block size-[0.16em] translate-x-[0.14em] translate-y-[0.06em] rounded-full bg-[#b31212]" />
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Texto que se escribe letra por letra cuando entra en pantalla.
// ---------------------------------------------------------------------------
export function Typewriter({
  text,
  className,
  speed = 55,
}: {
  text: string
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.8 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    if (prefersReducedMotion()) {
      setCount(text.length)
      return
    }
    if (count >= text.length) return
    // Pausas irregulares, como si alguien dudara al escribir
    const pause = text[count] === "." || text[count] === "," ? speed * 8 : speed + Math.random() * speed
    const id = setTimeout(() => setCount((c) => c + 1), pause)
    return () => clearTimeout(id)
  }, [started, count, text, speed])

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span aria-hidden="true" className="ml-0.5 inline-block w-[0.5ch] animate-pulse bg-current">
        &nbsp;
      </span>
    </p>
  )
}

// ---------------------------------------------------------------------------
// Cuenta los segundos que llevas en la página.
// ---------------------------------------------------------------------------
export function TimeHere() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="text-[#c01818] tabular-nums">{seconds}</span>
}

// ---------------------------------------------------------------------------
// Si vuelves a subir después de haber bajado, la página lo nota.
// También cambia el título de la pestaña cuando te vas a otra.
// ---------------------------------------------------------------------------
export function Watcher({ title }: { title: string }) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const messages = [
      "Te dije que no miraras atrás.",
      "Ya no está donde lo dejaste.",
      "Sigue bajando. No te detengas.",
    ]
    let lastY = window.scrollY
    let deepest = 0
    let cooldown = false
    let hideTimer: ReturnType<typeof setTimeout>
    let index = 0

    const onScroll = () => {
      const y = window.scrollY
      deepest = Math.max(deepest, y)
      const goingUp = y < lastY - 4
      lastY = y
      if (goingUp && deepest > window.innerHeight * 1.5 && !cooldown) {
        cooldown = true
        setMessage(messages[index++ % messages.length])
        clearTimeout(hideTimer)
        hideTimer = setTimeout(() => setMessage(null), 3200)
        setTimeout(() => (cooldown = false), 9000)
      }
    }

    let restoreTimer: ReturnType<typeof setTimeout>
    const onVisibility = () => {
      clearTimeout(restoreTimer)
      if (document.hidden) {
        document.title = "No te vayas…"
      } else {
        document.title = "Sabía que volverías."
        restoreTimer = setTimeout(() => (document.title = title), 3500)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      clearTimeout(hideTimer)
      clearTimeout(restoreTimer)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("visibilitychange", onVisibility)
      document.title = title
    }
  }, [title])

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-10 z-50 text-center text-2xl text-[#d41c1c] transition-opacity duration-700 md:text-3xl",
        message ? "opacity-100" : "opacity-0"
      )}
    >
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Una cara que aparece un instante, de vez en cuando, y desaparece.
// ---------------------------------------------------------------------------
export function Apparition() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    let timer: ReturnType<typeof setTimeout>
    const loop = () => {
      timer = setTimeout(() => {
        setShown(true)
        timer = setTimeout(() => {
          setShown(false)
          loop()
        }, 220)
      }, 4500 + Math.random() * 5000)
    }
    loop()
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        shown ? "opacity-30" : "opacity-0"
      )}
    >
      <Image
        src="/monster-isolated.webp"
        alt=""
        width={959}
        height={1351}
        className="h-[110%] w-auto max-w-none scale-x-[-1] contrast-200 grayscale invert sepia"
      />
    </div>
  )
}
