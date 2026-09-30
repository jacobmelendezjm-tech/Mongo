// Renderer WebGL de un agujero negro: cada píxel lanza un rayo de luz que se
// curva por la gravedad (aproximación de Schwarzschild), atraviesa el disco de
// acreción y, si escapa, muestra el campo de estrellas lensado detrás.

type RendererOptions = {
  canvas: HTMLCanvasElement
  /** Fracción de la resolución CSS a la que se renderiza (menos = más rápido) */
  renderScale?: number
}

export type BlackHoleRenderer = {
  ready: Promise<void>
  dispose: () => void
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

const float DISK_INNER = 2.6;
const float DISK_OUTER = 8.0;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float hash3(vec3 p) {
  return hash(p.xy + p.z * 17.17);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

vec3 stars(vec3 dir) {
  vec3 grid = dir * 180.0;
  vec3 cell = floor(grid);
  float h = hash3(cell);
  // Punto brillante en el centro de la celda, no la celda entera
  float falloff = smoothstep(0.35, 0.0, length(fract(grid) - 0.5));
  float star = smoothstep(0.9975, 1.0, h) * falloff * 3.0;
  vec3 tint = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 0.85, 0.7), hash3(cell + 3.1));
  float glow = 0.02 * fbm(dir.xy * 3.0 + dir.z * 2.0);
  return tint * star + vec3(0.25, 0.15, 0.45) * glow;
}

vec3 diskColor(vec3 p, vec3 rayDir, out float alpha) {
  float d = length(p.xz);
  float t = (d - DISK_INNER) / (DISK_OUTER - DISK_INNER);
  float angle = atan(p.z, p.x);

  // Gira más rápido cerca del centro (rotación kepleriana)
  float swirl = angle + uTime * 2.2 / pow(d, 1.5);
  float bands = fbm(vec2(d * 2.2, swirl * 3.0));
  float fine = noise(vec2(d * 9.0, swirl * 12.0));

  float intensity = pow(1.0 - t, 1.6) * (0.55 + 0.9 * bands) * (0.8 + 0.3 * fine);
  intensity *= smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.7, t);

  // Efecto Doppler: el lado que se acerca brilla más
  vec3 orbit = normalize(vec3(-p.z, 0.0, p.x));
  float doppler = 1.0 + 0.75 * dot(orbit, -rayDir);

  vec3 hot = vec3(1.0, 0.92, 0.78);
  vec3 warm = vec3(1.0, 0.48, 0.16);
  vec3 cool = vec3(0.55, 0.12, 0.05);
  vec3 col = mix(hot, warm, smoothstep(0.0, 0.45, t));
  col = mix(col, cool, smoothstep(0.45, 1.0, t));

  alpha = clamp(intensity * 1.3, 0.0, 0.95);
  return col * intensity * doppler * doppler * 2.4;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // Cámara orbitando lentamente, un poco por encima del plano del disco
  float orbitAngle = uTime * 0.05;
  vec3 ro = vec3(sin(orbitAngle) * 15.0, 2.2, -cos(orbitAngle) * 15.0);
  vec3 forward = normalize(-ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);
  vec3 rd = normalize(forward + (uv.x * right + uv.y * up) * 0.9);

  vec3 pos = ro;
  vec3 vel = rd;
  vec3 h = cross(pos, vel);
  float h2 = dot(h, h);

  vec3 col = vec3(0.0);
  float transmittance = 1.0;
  bool captured = false;

  for (int i = 0; i < 260; i++) {
    float r2 = dot(pos, pos);
    float r = sqrt(r2);
    if (r < 1.0) {
      captured = true;
      break;
    }
    if (r > 40.0) break;

    float dt = clamp(0.06 * r, 0.02, 0.6);
    vec3 acc = -1.5 * h2 * pos / (r2 * r2 * r);
    vec3 prev = pos;
    vel += acc * dt;
    pos += vel * dt;

    // Cruce con el plano del disco
    if (prev.y * pos.y < 0.0) {
      float k = prev.y / (prev.y - pos.y);
      vec3 hit = mix(prev, pos, k);
      float d = length(hit.xz);
      if (d > DISK_INNER && d < DISK_OUTER) {
        float a;
        vec3 dc = diskColor(hit, normalize(vel), a);
        col += transmittance * dc;
        transmittance *= 1.0 - a;
        if (transmittance < 0.02) break;
      }
    }
  }

  if (!captured) {
    col += transmittance * stars(normalize(vel));
  }

  // Tone mapping + gamma
  col = 1.0 - exp(-col * 1.1);
  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error("No se pudo crear el shader")
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Error compilando shader: ${log}`)
  }
  return shader
}

const noopRenderer = (): BlackHoleRenderer => ({
  ready: Promise.resolve(),
  dispose: () => {},
})

// Si WebGL no está disponible o el shader falla, la sección queda en negro
// en vez de romper la página.
export function createRenderer(options: RendererOptions): BlackHoleRenderer {
  try {
    return setup(options)
  } catch (error) {
    console.warn("[black-hole] No se pudo iniciar WebGL:", error)
    return noopRenderer()
  }
}

function setup({ canvas, renderScale = 0.6 }: RendererOptions): BlackHoleRenderer {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false })
  if (!gl || gl.isContextLost()) return noopRenderer()

  const program = gl.createProgram()!
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Error enlazando programa: ${gl.getProgramInfoLog(program)}`)
  }
  gl.useProgram(program)

  // Triángulo que cubre toda la pantalla
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPosition = gl.getAttribLocation(program, "aPosition")
  gl.enableVertexAttribArray(aPosition)
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

  const uResolution = gl.getUniformLocation(program, "uResolution")
  const uTime = gl.getUniformLocation(program, "uTime")

  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * renderScale
    const width = Math.max(1, Math.round(canvas.clientWidth * scale))
    const height = Math.max(1, Math.round(canvas.clientHeight * scale))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
    }
    gl.uniform2f(uResolution, canvas.width, canvas.height)
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  // Solo anima mientras el canvas está en pantalla
  let visible = true
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && !frame) frame = requestAnimationFrame(render)
  })
  intersectionObserver.observe(canvas)

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const start = performance.now()
  let frame = 0
  let resolveReady: () => void
  const ready = new Promise<void>((resolve) => (resolveReady = resolve))

  function render(now: number) {
    frame = 0
    const time = reducedMotion ? 0 : (now - start) / 1000
    gl!.uniform1f(uTime, time)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    resolveReady()
    if (visible && !reducedMotion) frame = requestAnimationFrame(render)
  }
  frame = requestAnimationFrame(render)

  return {
    ready,
    dispose() {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      // No se llama a loseContext(): en desarrollo React monta el componente dos
      // veces y el segundo montaje reutiliza el mismo canvas y su contexto.
    },
  }
}
