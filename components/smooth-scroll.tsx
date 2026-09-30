"use client"

import Lenis from "lenis"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

// Rutas que usan el scroll nativo del navegador, sin inercia
const NATIVE_SCROLL_ROUTES = ["/sin-dopamina"]

// Scroll suave con inercia para toda la página. Los enlaces #ancla también se
// animan con Lenis y se detienen debajo del header fijo.
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (NATIVE_SCROLL_ROUTES.includes(pathname)) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.08,
      anchors: { offset: -96 },
    })
    return () => lenis.destroy()
  }, [pathname])

  return null
}
