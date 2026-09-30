import type { Metadata } from "next"
import { Newsreader } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

// Página deliberadamente aburrida: sin animaciones, sin autoplay, sin colores
// saturados, sin contadores ni llamadas a la acción. Solo texto para leer despacio.
const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"] })

export const metadata: Metadata = {
  title: "Sin dopamina",
  description: "Una página que no quiere tu atención.",
}

const absent = [
  "Animaciones que se mueven solas.",
  "Videos que empiezan sin que se lo pidas.",
  "Notificaciones, contadores o números rojos.",
  "Scroll infinito. Esta página se termina.",
  "Botones que te piden hacer clic ahora.",
  "Colores que gritan.",
]

export default function SinDopaminaPage() {
  return (
    <div className={`${serif.className} min-h-svh bg-[#f3f0e8] text-[#2e2c28]`}>
      <header className="mx-auto flex max-w-2xl items-baseline justify-between px-6 pt-10 text-sm text-[#6b6760]">
        <span>Sin dopamina</span>
        <Link href="/" className="underline decoration-[#c9c4b8] underline-offset-4 hover:text-[#2e2c28]">
          Volver
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-32 text-lg leading-[1.8]">
        <section className="pt-32 pb-24">
          <h1 className="text-4xl leading-tight font-normal md:text-5xl">
            Nada que ver aquí.
          </h1>
          <p className="mt-8 text-[#55524b]">
            Esta página no quiere tu atención. No tiene nada que venderte, nada
            que mostrarte de golpe y nada que se mueva cuando no miras. Puedes
            leerla despacio, o no leerla.
          </p>
        </section>

        <hr className="border-[#dcd7cb]" />

        <section className="py-24">
          <h2 className="text-2xl font-normal">Lo que no vas a encontrar</h2>
          <ul className="mt-8 space-y-3 text-[#55524b]">
            {absent.map((item) => (
              <li key={item} className="flex gap-4">
                <span className="text-[#a8a397]">—</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-[#dcd7cb]" />

        <section className="py-24">
          <h2 className="text-2xl font-normal">Respira</h2>
          <p className="mt-8 text-[#55524b]">
            Si quieres, antes de seguir:
          </p>
          <ol className="mt-6 space-y-3 text-[#55524b]">
            <li>Inhala por la nariz mientras cuentas hasta cuatro.</li>
            <li>Sostén el aire otros cuatro.</li>
            <li>Suéltalo por la boca contando hasta seis.</li>
          </ol>
          <p className="mt-6 text-[#55524b] italic">
            Tres veces es suficiente. No hay temporizador; el ritmo es tuyo.
          </p>
        </section>

        <hr className="border-[#dcd7cb]" />

        <section className="py-24">
          <figure>
            <Image
              src="/mongo.webp"
              alt="Mongo, de pie, sin hacer nada"
              width={1405}
              height={2313}
              className="mx-auto h-auto w-48 opacity-80 grayscale contrast-75"
            />
            <figcaption className="mt-6 text-center text-base text-[#8a857a] italic">
              Mongo, quieto. No va a caminar ni a parpadear.
            </figcaption>
          </figure>
        </section>

        <hr className="border-[#dcd7cb]" />

        <section className="pt-24">
          <p className="text-[#55524b]">
            Eso es todo. No hay más abajo.
          </p>
          <p className="mt-4 text-[#55524b]">
            Puedes cerrar esta pestaña, o{" "}
            <Link
              href="/"
              className="underline decoration-[#c9c4b8] underline-offset-4 hover:text-[#2e2c28]"
            >
              volver al inicio
            </Link>{" "}
            cuando quieras.
          </p>
        </section>
      </main>
    </div>
  )
}
