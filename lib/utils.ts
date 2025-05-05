import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

export function formatTime(dateString: string | null) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(dateString: string | null) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("pt-BR")
}

export function calculateDuration(clockIn: string | null, clockOut: string | null) {
  if (!clockIn || !clockOut) return "-"

  const start = new Date(clockIn).getTime()
  const end = new Date(clockOut).getTime()
  const durationMs = end - start

  // Convert to hours and minutes
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
}
