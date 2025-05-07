"use client"
import { getTodayEntryFirebase, saveTimeEntryFirebase, getAllTimeEntriesFirebase } from "./firebase"
import type { GeoLocation } from "./types"

// Clock in action (client-side version)
export async function clockIn(employee: string, selectedTime: string, location: GeoLocation | null) {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  try {
    // Check if there's already an entry for today
    let todayEntry = await getTodayEntryFirebase(employee)

    if (todayEntry) {
      // If already clocked in but not out, don't do anything
      if (todayEntry.clockIn && !todayEntry.clockOut) {
        return { success: false, message: "Já registrou entrada hoje." }
      }

      // If already completed today's entry (clockIn and clockOut), do nothing
      if (todayEntry.clockIn && todayEntry.clockOut) {
        return { success: false, message: "Já registrou entrada e saída hoje." }
      }
    }

    if (!todayEntry) {
      // Create a new entry if no entry exists for today
      todayEntry = {
        id: `${employee}-${Date.now()}`,
        employee,
        date: today,
        clockIn: selectedTime,
        clockOut: null,
        realClockInTime: now.toISOString(),
        realClockOutTime: null,
        clockInLocation: location,
        clockOutLocation: null,
        createdAt: now.toISOString(),
      }
    } else {
      // Update the entry with clockIn if it already exists
      todayEntry.clockIn = selectedTime
      todayEntry.realClockInTime = now.toISOString()
      todayEntry.clockInLocation = location
    }

    // Save the entry (or update it)
    await saveTimeEntryFirebase(todayEntry)

    return { success: true, message: "Entrada registrada com sucesso!", refresh: true }
  } catch (error) {
    console.error("Error in clockIn:", error)
    return { success: false, message: "Erro ao registrar entrada." }
  }
}

// Clock out action (client-side version)
export async function clockOut(employee: string, selectedTime: string, location: GeoLocation | null) {
  const now = new Date()

  try {
    // Check if there's an entry for today
    const todayEntry = await getTodayEntryFirebase(employee)

    if (todayEntry && todayEntry.clockIn && !todayEntry.clockOut) {
      // Update the entry with clock out time
      todayEntry.clockOut = selectedTime
      todayEntry.realClockOutTime = now.toISOString()
      todayEntry.clockOutLocation = location

      await saveTimeEntryFirebase(todayEntry)

      return { success: true, message: "Saída registrada com sucesso!", refresh: true }
    }

    return {
      success: false,
      message: todayEntry?.clockOut ? "Já registrou saída hoje." : "Precisa registrar entrada primeiro.",
    }
  } catch (error) {
    console.error("Error in clockOut:", error)
    return { success: false, message: "Erro ao registrar saída." }
  }
}

// Get all time entries for admin
export async function getAllTimeEntries() {
  try {
    return await getAllTimeEntriesFirebase()
  } catch (error) {
    console.error("Error getting all time entries:", error)
    return []
  }
}
