import { initializeApp } from 'firebase/app'
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  QueryConstraint,
} from 'firebase/firestore'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import type { TimeEntry } from './types'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

const timestampToISOString = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toISOString()
}

export const firestoreToEntry = (doc: any): TimeEntry => {
  const data = doc.data()
  return {
    id: doc.id,
    employee: data.employee,
    date: data.date,
    createdAt: timestampToISOString(data.createdAt),

    morningClockIn: data.morningClockIn
      ? timestampToISOString(data.morningClockIn)
      : null,
    morningClockOut: data.morningClockOut
      ? timestampToISOString(data.morningClockOut)
      : null,
    morningClockInLocation: data.morningClockInLocation || null,
    morningClockOutLocation: data.morningClockOutLocation || null,
    realMorningClockInTime: data.realMorningClockInTime
      ? timestampToISOString(data.realMorningClockInTime)
      : null,
    realMorningClockOutTime: data.realMorningClockOutTime
      ? timestampToISOString(data.realMorningClockOutTime)
      : null,

    afternoonClockIn: data.afternoonClockIn
      ? timestampToISOString(data.afternoonClockIn)
      : null,
    afternoonClockOut: data.afternoonClockOut
      ? timestampToISOString(data.afternoonClockOut)
      : null,
    afternoonClockInLocation: data.afternoonClockInLocation || null,
    afternoonClockOutLocation: data.afternoonClockOutLocation || null,
    realAfternoonClockInTime: data.realAfternoonClockInTime
      ? timestampToISOString(data.realAfternoonClockInTime)
      : null,
    realAfternoonClockOutTime: data.realAfternoonClockOutTime
      ? timestampToISOString(data.realAfternoonClockOutTime)
      : null,
    updatedAt: data.updatedAt,
  }
}

export async function getAllTimeEntriesFirebase(): Promise<TimeEntry[]> {
  const entriesCol = collection(db, 'timeEntries')
  const entriesSnapshot = await getDocs(
    query(entriesCol, orderBy('date', 'desc'))
  )
  return entriesSnapshot.docs.map(firestoreToEntry)
}

export async function getAllTimeEntriesFilteredFirebase(
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
  return entriesSnapshot.docs.map((doc) => doc.data() as TimeEntry)
}

export async function getEmployeeTimeEntriesFirebase(
  employee: string
): Promise<TimeEntry[]> {
  const entriesCol = collection(db, 'timeEntries')
  const q = query(
    entriesCol,
    where('employee', '==', employee),
    orderBy('date', 'desc')
  )
  const entriesSnapshot = await getDocs(q)
  return entriesSnapshot.docs.map(firestoreToEntry)
}

export async function getTodayEntryFirebase(
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

  return firestoreToEntry(lastEntry)
}

export async function saveTimeEntryFirebase(entry: TimeEntry) {
  const entryRef = doc(db, 'timeEntries', entry.id)

  if (await entryExists(entry.id)) {
    await updateDoc(entryRef, entry)
  } else {
    await setDoc(entryRef, entry)
  }
}

async function entryExists(id: string): Promise<boolean> {
  const entryRef = doc(db, 'timeEntries', id)
  const docSnapshot = await getDoc(entryRef)
  return docSnapshot.exists()
}
