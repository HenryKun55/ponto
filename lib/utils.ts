import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  const date = parseISO(dateString)
  return format(date, "dd/MM/yyyy")
}

export function formatTime(dateString: string | null) {
  if (!dateString) return "-"
  const date = parseISO(dateString)
  return format(date, "HH:mm")
}

export function formatDateTime(dateString: string | null) {
  if (!dateString) return "-"
  const date = parseISO(dateString)
  return format(date, "dd/MM/yyyy HH:mm")
}

export function calculateDuration(clockIn: string | null, clockOut: string | null) {
  if (!clockIn || !clockOut) return "-"

  const start = parseISO(clockIn).getTime()
  const end = parseISO(clockOut).getTime()
  const durationMs = end - start

  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
}
