"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

import { cn } from "@/lib/utils"

// Modelo 3D de Mongo con esqueleto y animación de caminar (generado a partir de
// mongo.webp). Si el archivo todavía no existe, se muestra `fallback`.
export const MONGO_MODEL_URL = "/mongo-3d/mongo.glb"

const MODEL_HEIGHT = 2 // unidades de mundo
const WALK_SPEED = 0.75 // unidades por segundo
const TURN_SPEED = 2.2 // radianes por segundo
const CAMERA_FOV = 25
// Algunos generadores exportan el modelo mirando hacia atrás (−Z). Si Mongo
// camina de espaldas, cambia esto a Math.PI.
const MODEL_YAW_OFFSET = 0

async function modelExists(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD" })
    const type = res.headers.get("content-type") ?? ""
    return res.ok && !type.includes("text/html")
  } catch {
    return false
  }
}

export function Mongo3D({
  className,
  style,
  fallback,
}: {
  className?: string
  style?: React.CSSProperties
  fallback: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"checking" | "3d" | "fallback">("checking")

  useEffect(() => {
    let cancelled = false
    modelExists(MONGO_MODEL_URL).then((ok) => {
      if (!cancelled) setStatus(ok ? "3d" : "fallback")
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (status !== "3d") return
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    renderer.domElement.style.display = "block"
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
    // Distancia para que Mongo ocupe ~55 % de la altura del canvas
    const visibleHeight = MODEL_HEIGHT / 0.55
    const distance = visibleHeight / (2 * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)))
    camera.position.set(0, 1.25, distance)
    camera.lookAt(0, 1.2, 0)

    // Luz de cielo + sol cálido de atardecer que proyecta sombra real en el suelo
    scene.add(new THREE.HemisphereLight(0xf4d9ff, 0x7fa9cc, 1.3))
    const sun = new THREE.DirectionalLight(0xffe2c4, 2.4)
    sun.position.set(-4, 7, 5)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -12
    sun.shadow.camera.right = 12
    sun.shadow.camera.top = 6
    sun.shadow.camera.bottom = -2
    sun.shadow.radius = 4
    scene.add(sun)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 20),
      new THREE.ShadowMaterial({ opacity: 0.28 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    let mixer: THREE.AnimationMixer | null = null
    let walkAction: THREE.AnimationAction | null = null
    const mongo = new THREE.Group()
    scene.add(mongo)

    // Recorrido: de su lugar original (~75 % del ancho) hacia la izquierda y vuelta
    const patrol = { from: 0, to: 0 }
    let halfWidth = 1
    const updatePatrol = () => {
      halfWidth = (visibleHeight * camera.aspect) / 2
      patrol.from = halfWidth * 0.5
      patrol.to = halfWidth * -0.1
    }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      updatePatrol()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let direction = -1 // -1 camina a la izquierda, 1 a la derecha
    let targetYaw = -Math.PI / 2
    mongo.position.x = patrol.from
    mongo.rotation.y = reducedMotion ? 0 : targetYaw

    let disposed = false
    new GLTFLoader().load(
      MONGO_MODEL_URL,
      (gltf) => {
        if (disposed) return
        const model = gltf.scene
        model.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            obj.castShadow = true
            obj.receiveShadow = true
          }
        })
        // Normaliza: altura MODEL_HEIGHT, pies en y = 0 y centrado en x/z
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        model.scale.setScalar(MODEL_HEIGHT / size.y)
        const scaled = new THREE.Box3().setFromObject(model)
        const center = scaled.getCenter(new THREE.Vector3())
        model.position.set(-center.x, -scaled.min.y, -center.z)
        const facing = new THREE.Group()
        facing.rotation.y = MODEL_YAW_OFFSET
        facing.add(model)
        mongo.add(facing)

        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model)
          const clip =
            gltf.animations.find((c) => /walk|camina/i.test(c.name)) ?? gltf.animations[0]
          walkAction = mixer.clipAction(clip)
          walkAction.play()
        } else {
          console.warn("[mongo-3d] El modelo no trae animaciones: se verá quieto.")
        }
      },
      undefined,
      (error) => {
        console.warn("[mongo-3d] No se pudo cargar el modelo:", error)
        setStatus("fallback")
      }
    )

    const clock = new THREE.Clock()
    let frame = 0
    let onScreen = true

    const render = () => {
      frame = 0
      const dt = Math.min(clock.getDelta(), 0.05)

      if (!reducedMotion) {
        // Gira de verdad sobre su eje: interpola el ángulo hacia el objetivo
        const diff = targetYaw - mongo.rotation.y
        const turning = Math.abs(diff) > 0.01
        mongo.rotation.y += Math.sign(diff) * Math.min(Math.abs(diff), TURN_SPEED * dt)

        if (!turning) {
          mongo.position.x += direction * WALK_SPEED * dt
          const reachedLeft = direction < 0 && mongo.position.x <= patrol.to
          const reachedRight = direction > 0 && mongo.position.x >= patrol.from
          if (reachedLeft || reachedRight) {
            direction *= -1
            targetYaw = direction < 0 ? -Math.PI / 2 : Math.PI / 2
          }
        }
        // Mientras gira da pasos más cortos y lentos
        if (walkAction) walkAction.timeScale = turning ? 0.55 : 1
        mixer?.update(dt)
      }

      renderer.render(scene, camera)
      schedule()
    }

    const schedule = () => {
      if (!frame && onScreen && !document.hidden) frame = requestAnimationFrame(render)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }
    const onVisibility = () => {
      if (document.hidden) stop()
      else {
        clock.getDelta()
        schedule()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) {
        clock.getDelta()
        schedule()
      } else stop()
    })
    intersectionObserver.observe(container)
    schedule()

    return () => {
      disposed = true
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        mesh.geometry?.dispose()
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((m) => m?.dispose())
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [status])

  if (status === "fallback") return <>{fallback}</>

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Mongo caminando en 3D"
      className={cn("pointer-events-none", status === "checking" && "invisible", className)}
      style={style}
    />
  )
}
