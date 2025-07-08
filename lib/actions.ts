'use client'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  QueryConstraint,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  getTodayEntryFirebase,
  saveTimeEntryFirebase,
  getAllTimeEntriesFirebase,
  db,
} from './firebase'
import type { GeoLocation, TimeEntry } from './types'

// Clock in action (client-side version)
export async function clockIn(
  employee: string,
  selectedTime: string,
  location: GeoLocation | null
) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  try {
    // Check if there's already an entry for today
    let todayEntry = await getTodayEntryFirebase(employee)

    if (todayEntry) {
      // If already clocked in but not out, don't do anything
      if (todayEntry.clockIn && !todayEntry.clockOut) {
        return { success: false, message: 'Já registrou entrada hoje.' }
      }

      // If already completed today's entry (clockIn and clockOut), do nothing
      if (todayEntry.clockIn && todayEntry.clockOut) {
        return {
          success: false,
          message: 'Já registrou entrada e saída hoje.',
        }
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

    return {
      success: true,
      message: 'Entrada registrada com sucesso!',
      refresh: true,
    }
  } catch (error) {
    console.error('Error in clockIn:', error)
    return { success: false, message: 'Erro ao registrar entrada.' }
  }
}

// Clock out action (client-side version)
export async function clockOut(
  employee: string,
  selectedTime: string,
  location: GeoLocation | null
) {
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

      return {
        success: true,
        message: 'Saída registrada com sucesso!',
        refresh: true,
      }
    }

    return {
      success: false,
      message: todayEntry?.clockOut
        ? 'Já registrou saída hoje.'
        : 'Precisa registrar entrada primeiro.',
    }
  } catch (error) {
    console.error('Error in clockOut:', error)
    return { success: false, message: 'Erro ao registrar saída.' }
  }
}

// Get all time entries for admin
export async function getAllTimeEntries() {
  try {
    return await getAllTimeEntriesFirebase()
  } catch (error) {
    console.error('Error getting all time entries:', error)
    return []
  }
}

export async function getAllTimeEntriesFiltered(
  startDateStr?: string,
  endDateStr?: string
): Promise<TimeEntry[]> {
  const entriesCol = collection(db, 'timeEntries')

  const constraints: QueryConstraint[] = [orderBy('date', 'asc')]

  if (startDateStr) {
    constraints.push(where('date', '>=', startDateStr))
  }

  if (endDateStr) {
    constraints.push(where('date', '<=', endDateStr))
  }

  const entriesSnapshot = await getDocs(query(entriesCol, ...constraints))
  return entriesSnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as TimeEntry
  )
}

export async function getEmployeeTimeEntries(
  employee: string
): Promise<TimeEntry[]> {
  const entriesCol = collection(db, 'timeEntries')
  const q = query(
    entriesCol,
    where('employee', '==', employee),
    orderBy('date', 'desc')
  )
  const entriesSnapshot = await getDocs(q)
  return entriesSnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as TimeEntry
  )
}

export async function getTodayEntry(
  employee: string
): Promise<TimeEntry | null> {
  const today = new Date().toISOString().split('T')[0]
  const entriesCol = collection(db, 'timeEntries')
  const q = query(
    entriesCol,
    where('employee', '==', employee),
    where('date', '==', today)
  )
  const entriesSnapshot = await getDocs(q)

  if (entriesSnapshot.empty) {
    return null
  }

  const lastEntry = entriesSnapshot.docs[entriesSnapshot.docs.length - 1]

  return { id: lastEntry.id, ...lastEntry.data() } as TimeEntry
}

export async function saveTimeEntry(entry: TimeEntry): Promise<void> {
  const entryRef = doc(db, 'timeEntries', entry.id)

  const docSnapshot = await getDoc(entryRef)
  if (docSnapshot.exists()) {
    await updateDoc(entryRef, entry)
  } else {
    await setDoc(entryRef, entry)
  }
}
