import fs from 'fs'
import path from 'path'
import type { TimeEntry } from './types'

const dataFilePath = path.join(process.cwd(), 'data', 'timeEntries.json')

// Ensure data directory exists
export function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]))
  }
}

// Get all time entries
export function getTimeEntries(): TimeEntry[] {
  ensureDataDir()
  const data = fs.readFileSync(dataFilePath, 'utf8')
  return JSON.parse(data)
}

// Get time entries for a specific employee
export function getEmployeeTimeEntries(employee: string): TimeEntry[] {
  const entries = getTimeEntries()
  return entries.filter((entry) => entry.employee === employee)
}

// Get today's entry for an employee
export function getTodayEntry(employee: string): TimeEntry | null {
  const entries = getTimeEntries()
  const today = new Date().toISOString().split('T')[0]

  return (
    entries.find(
      (entry) => entry.employee === employee && entry.date === today
    ) || null
  )
}

// Save time entries
export function saveTimeEntries(entries: TimeEntry[]) {
  ensureDataDir()
  fs.writeFileSync(dataFilePath, JSON.stringify(entries, null, 2))
}

// Add or update a time entry
export function saveTimeEntry(entry: TimeEntry) {
  const entries = getTimeEntries()
  const index = entries.findIndex((e) => e.id === entry.id)

  if (index >= 0) {
    entries[index] = entry
  } else {
    entries.push(entry)
  }

  saveTimeEntries(entries)
  return entry
}
