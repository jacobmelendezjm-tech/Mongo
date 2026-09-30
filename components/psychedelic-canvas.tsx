"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

// Fondos psicodélicos en WebGL1, reactivos al cursor.
//   tunnel → túnel caleidoscópico de 8 espejos
//   plasma → plasma arcoíris líquido que se ondula alrededor del cursor
//   rings  → anillos op-art en blanco y negro con arcoíris, centrados en el cursor
export type PsychedelicMode = "tunnel" | "plasma" | "rings"

const MODES: Record<PsychedelicMode, number> = { tunnel: 0, plasma: 1, rings: 2 }

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;   // 0..1, y hacia arriba
uniform float u_mode;

const float TAU = 6.28318530718;

// Paleta arcoíris cosenoidal
vec3 rainbow(float t) {
  return 0.5 + 0.5 * cos(TAU * (t + vec3(0.0, 0.33, 0.67)));
}

vec3 tunnel(vec2 p, float t) {
  float r = length(p);
  float a = atan(p.y, p.x) + t * 0.15;
  float seg = TAU / 8.0;
  a = abs(mod(a, seg) - seg * 0.5);
  vec2 q = vec2(cos(a), sin(a)) * r;

  float depth = 0.35 / max(r, 0.02) + t * 0.9;
  float v = sin(depth * 5.0 + sin(q.x * 12.0 + t) * 2.0)
          + sin(q.y * 18.0 - t * 1.4)
          + 0.6 * sin(depth * 2.0 - a * 6.0);
  vec3 col = rainbow(v * 0.18 + depth * 0.08 + t * 0.04);
  col *= 0.35 + 0.65 * smoothstep(0.0, 0.25, r);                 // centro oscuro
  col += 0.25 * rainbow(t * 0.1) * smoothstep(0.08, 0.0, r);      // brillo al fondo
  return col;
}

vec3 plasma(vec2 p, vec2 m, float t) {
  vec2 uv = p * 3.0;
  float d = length(p - m);
  float v = sin(uv.x + t)
          + sin(uv.y * 1.3 + t * 1.1)
          + sin((uv.x + uv.y) * 0.7 + t * 0.7)
          + sin(length(uv) * 1.5 - t)
          + 1.4 * sin(d * 14.0 - t * 3.0) * exp(-d * 2.2);          // onda del cursor
  vec3 col = rainbow(v * 0.16 + t * 0.05);
  return pow(col, vec3(0.9)) * 1.05;
}

vec3 rings(vec2 p, vec2 m, float t) {
  vec2 q = p - m;
  float d = length(q);
  float a = atan(q.y, q.x);
  float wobble = sin(a * 6.0 + t * 1.5) * 0.04 * smoothstep(0.0, 0.6, d);
  float v = sin((d + wobble) * 55.0 - t * 5.0);
  float stripe = smoothstep(-0.15, 0.15, v);
  vec3 col = mix(vec3(0.03), rainbow(d * 0.9 - t * 0.15), stripe);
  return col * (1.0 - 0.35 * smoothstep(0.4, 1.3, length(p)));
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  vec2 m = (u_mouse - 0.5) * u_resolution / u_resolution.y;
  float t = u_time;

  vec3 col;
  if (u_mode < 0.5) {
    col = tunnel(p - m * 0.25, t);
  } else if (u_mode < 1.5) {
    col = plasma(p, m, t);
  } else {
    col = rings(p, m, t);
  }
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed")
  }
  return shader
}

export function PsychedelicCanvas({
  mode,
  className,
}: {
  mode: PsychedelicMode
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false })
    if (!gl || gl.isContextLost()) return

    let program: WebGLProgram
    let vs: WebGLShader
    let fs: WebGLShader
    try {
      vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
      fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
      program = gl.createProgram()!
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "link failed")
      }
    } catch (error) {
      console.warn("[psychedelic] No se pudo iniciar el shader:", error)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPosition = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const uResolution = gl.getUniformLocation(program, "u_resolution")
    const uTime = gl.getUniformLocation(program, "u_time")
    const uMouse = gl.getUniformLocation(program, "u_mouse")
    gl.uniform1f(gl.getUniformLocation(program, "u_mode"), MODES[mode])

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75
      const width = Math.max(1, Math.round(canvas.clientWidth * scale))
      const height = Math.max(1, Math.round(canvas.clientHeight * scale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    // El cursor se sigue con retardo para que el efecto fluya en vez de saltar
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (event.clientY < rect.top || event.clientY > rect.bottom) return
      mouse.tx = (event.clientX - rect.left) / rect.width
      mouse.ty = 1 - (event.clientY - rect.top) / rect.height
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true })

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    let elapsed = 0
    let last = performance.now()
    let onScreen = true

    const render = (now: number) => {
      frame = 0
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (!reducedMotion) elapsed += dt
      const ease = Math.min(dt * 4, 1)
      mouse.x += (mouse.tx - mouse.x) * ease
      mouse.y += (mouse.ty - mouse.y) * ease

      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uTime, elapsed)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      schedule()
    }

    // Solo anima si la sección está en pantalla y la pestaña visible
    const schedule = () => {
      if (!frame && onScreen && !document.hidden) frame = requestAnimationFrame(render)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }
    const resume = () => {
      last = performance.now()
      schedule()
    }
    const onVisibility = () => (document.hidden ? stop() : resume())
    document.addEventListener("visibilitychange", onVisibility)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) resume()
      else stop()
    })
    intersectionObserver.observe(canvas)
    schedule()

    return () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pointermove", onPointerMove)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [mode])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0 block size-full", className)}
    />
  )
}
