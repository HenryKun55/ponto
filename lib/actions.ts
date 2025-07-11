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
  saveTimeEntryFirebase,
  getAllTimeEntriesFirebase,
  db,
} from './firebase'
import { GeoLocation, Period, TimeEntry } from './types'

const determinePeriod = (selectedTime: string): Period => {
  const [hours] = selectedTime.split(':')
  const hour = Number.parseInt(hours)

  return hour < 13 ? Period.MORNING : Period.AFTERNOON
}

export const clockIn = async (
  employee: string,
  selectedTime: string,
  location: GeoLocation | null,
  todayEntry: TimeEntry | null | undefined
) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const period = determinePeriod(selectedTime)

  try {
    if (!todayEntry) {
      todayEntry = {
        id: `${employee}-${Date.now()}`,
        employee,
        date: today,
        morningClockIn: null,
        morningClockOut: null,
        morningClockInLocation: null,
        morningClockOutLocation: null,
        realMorningClockInTime: null,
        realMorningClockOutTime: null,
        afternoonClockIn: null,
        afternoonClockOut: null,
        afternoonClockInLocation: null,
        afternoonClockOutLocation: null,
        realAfternoonClockInTime: null,
        realAfternoonClockOutTime: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
    }

    if (period === Period.MORNING) {
      if (todayEntry.morningClockIn && !todayEntry.morningClockOut) {
        return { success: false, message: 'Já registrou entrada da manhã.' }
      }
      if (todayEntry.morningClockIn && todayEntry.morningClockOut) {
        return { success: false, message: 'Período da manhã já finalizado.' }
      }

      todayEntry.morningClockIn = selectedTime
      todayEntry.realMorningClockInTime = now.toISOString()
      todayEntry.morningClockInLocation = location
    } else {
      if (todayEntry.afternoonClockIn && !todayEntry.afternoonClockOut) {
        return { success: false, message: 'Já registrou entrada da tarde.' }
      }
      if (todayEntry.afternoonClockIn && todayEntry.afternoonClockOut) {
        return { success: false, message: 'Período da tarde já finalizado.' }
      }

      todayEntry.afternoonClockIn = selectedTime
      todayEntry.realAfternoonClockInTime = now.toISOString()
      todayEntry.afternoonClockInLocation = location
    }

    todayEntry.updatedAt = now.toISOString()
    await saveTimeEntryFirebase(todayEntry)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error in clockIn:', error)
    return { success: false, message: 'Erro ao registrar entrada.' }
  }
}

export const clockOut = async (
  selectedTime: string,
  location: GeoLocation | null,
  todayEntry: TimeEntry | null | undefined
) => {
  const now = new Date()
  const period = determinePeriod(selectedTime)

  try {
    if (!todayEntry) {
      return {
        success: false,
        message: 'Nenhum registro encontrado para hoje.',
      }
    }

    if (period === Period.MORNING) {
      if (!todayEntry.morningClockIn) {
        return {
          success: false,
          message: 'Precisa registrar entrada da manhã primeiro.',
        }
      }
      if (todayEntry.morningClockOut) {
        return {
          success: false,
          message: 'Já registrou saída da manhã.',
        }
      }

      todayEntry.morningClockOut = selectedTime
      todayEntry.realMorningClockOutTime = now.toISOString()
      todayEntry.morningClockOutLocation = location
    } else {
      if (!todayEntry.afternoonClockIn) {
        return {
          success: false,
          message: 'Precisa registrar entrada da tarde primeiro.',
        }
      }
      if (todayEntry.afternoonClockOut) {
        return {
          success: false,
          message: 'Já registrou saída da tarde.',
        }
      }

      todayEntry.afternoonClockOut = selectedTime
      todayEntry.realAfternoonClockOutTime = now.toISOString()
      todayEntry.afternoonClockOutLocation = location
    }

    todayEntry.updatedAt = now.toISOString()
    await saveTimeEntryFirebase(todayEntry)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error in clockOut:', error)
    return { success: false, message: 'Erro ao registrar saída.' }
  }
}

export const getAllTimeEntries = async () => {
  try {
    return await getAllTimeEntriesFirebase()
  } catch (error) {
    console.error('Error getting all time entries:', error)
    return []
  }
}

export const getAllTimeEntriesFiltered = async (
  startDateStr?: string,
  endDateStr?: string
) => {
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

export const getEmployeeTimeEntries = async (employee: string) => {
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

export const getTodayEntry = async (employee: string) => {
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

export const saveTimeEntry = async (entry: TimeEntry) => {
  const entryRef = doc(db, 'timeEntries', entry.id)

  const docSnapshot = await getDoc(entryRef)
  if (docSnapshot.exists()) {
    await updateDoc(entryRef, entry)
  } else {
    await setDoc(entryRef, entry)
  }
}
