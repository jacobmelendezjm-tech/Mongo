import { cn } from "@/lib/utils"

// Silueta del personaje arcoíris: arco con degradado, dos ojos y la boca con dientes
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
    >
      <defs>
        <linearGradient id="mongo-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3fc1c9" />
          <stop offset="35%" stopColor="#f07ab8" />
          <stop offset="65%" stopColor="#f29a3a" />
          <stop offset="100%" stopColor="#f2d23a" />
        </linearGradient>
      </defs>
      <path d="M5 31V15a11 11 0 0 1 22 0v16Z" fill="url(#mongo-logo)" />
      <circle cx="13.5" cy="13" r="1.6" fill="#fff" />
      <circle cx="13.5" cy="13" r="0.8" fill="#1d1d1f" />
      <circle cx="21.5" cy="12.5" r="1.3" fill="#fff" />
      <circle cx="21.5" cy="12.5" r="0.65" fill="#1d1d1f" />
      <rect x="15" y="16" width="6" height="3" rx="1.5" fill="#1d1d1f" />
      <rect x="16.4" y="16" width="1.2" height="1.4" rx="0.4" fill="#f6d8b0" />
      <rect x="18.4" y="16" width="1.2" height="1.4" rx="0.4" fill="#f6d8b0" />
    </svg>
  )
}
