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

const getCurrentPeriod = (): Period => {
  const now = new Date()
  const hour = now.getHours()
  return hour < 13 ? Period.MORNING : Period.AFTERNOON
}

const isValidTimeForPeriod = (
  selectedTime: string,
  period: Period
): boolean => {
  const [hours] = selectedTime.split(':')
  const hour = Number.parseInt(hours)

  if (period === Period.MORNING) {
    return hour >= 6 && hour < 13 // Manhã: 06:00 às 12:59
  } else {
    return hour >= 13 && hour < 23 // Tarde: 13:00 às 22:59
  }
}

export const clockIn = async (
  employee: string,
  selectedTime: string,
  location: GeoLocation | null,
  period: 'morning' | 'afternoon'
) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentPeriod = period
    ? period === 'morning'
      ? Period.MORNING
      : Period.AFTERNOON
    : getCurrentPeriod()

  // if (!isValidTimeForPeriod(selectedTime, currentPeriod)) {
  //   const periodName = currentPeriod === Period.MORNING ? 'manhã' : 'tarde'
  //   const timeRange =
  //     currentPeriod === Period.MORNING ? '06:00 às 12:59' : '13:00 às 22:59'
  //   return {
  //     success: false,
  //     message: `Horário inválido para o período da ${periodName}. Selecione um horário entre ${timeRange}.`,
  //   }
  // }

  let todayEntry = await getTodayEntry(employee)

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

    if (currentPeriod === Period.MORNING) {
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
  employee: string,
  selectedTime: string,
  location: GeoLocation | null,
  period: 'morning' | 'afternoon'
) => {
  const now = new Date()
  const currentPeriod = period
    ? period === 'morning'
      ? Period.MORNING
      : Period.AFTERNOON
    : getCurrentPeriod()

  // if (!isValidTimeForPeriod(selectedTime, currentPeriod)) {
  //   const periodName = currentPeriod === Period.MORNING ? 'manhã' : 'tarde'
  //   const timeRange =
  //     currentPeriod === Period.MORNING ? '06:00 às 12:59' : '13:00 às 22:59'
  //   return {
  //     success: false,
  //     message: `Horário inválido para o período da ${periodName}. Selecione um horário entre ${timeRange}.`,
  //   }
  // }

  let todayEntry = await getTodayEntry(employee)

  try {
    if (!todayEntry) {
      return {
        success: false,
        message: 'Nenhum registro encontrado para hoje.',
      }
    }

    if (currentPeriod === Period.MORNING) {
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

      if (selectedTime <= todayEntry.morningClockIn) {
        return {
          success: false,
          message: 'Horário de saída deve ser posterior ao de entrada.',
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

      if (selectedTime <= todayEntry.afternoonClockIn) {
        return {
          success: false,
          message: 'Horário de saída deve ser posterior ao de entrada.',
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
