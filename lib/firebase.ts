import { initializeApp } from 'firebase/app'
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
  limit,
  startAfter,
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
    clockIn: data.clockIn ? timestampToISOString(data.clockIn) : null,
    clockOut: data.clockOut ? timestampToISOString(data.clockOut) : null,
    clockInLocation: data.clockInLocation,
    clockOutLocation: data.clockOutLocation,
    date: data.date,
    createdAt: timestampToISOString(data.createdAt),
    realClockInTime: data.realClockInTime
      ? timestampToISOString(data.realClockInTime)
      : null,
    realClockOutTime: data.realClockOutTime
      ? timestampToISOString(data.realClockOutTime)
      : null,
  }
}

export async function getAllTimeEntriesFirebase(): Promise<TimeEntry[]> {
  const entriesCol = collection(db, 'timeEntries')
  const entriesSnapshot = await getDocs(
    query(entriesCol, orderBy('date', 'desc'))
  )
  return entriesSnapshot.docs.map(firestoreToEntry)
}

export async function getTimeEntriesCount(): Promise<number> {
  const entriesCol = collection(db, 'timeEntries')
  const snapshot = await getCountFromServer(entriesCol)
  return snapshot.data().count
}

export async function getPaginatedTimeEntriesFirebase(
  pageSize: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  entries: TimeEntry[]
  lastVisible?: QueryDocumentSnapshot<DocumentData>
}> {
  const entriesCol = collection(db, 'timeEntries')
  const baseQuery = query(entriesCol, orderBy('date', 'desc'), limit(pageSize))
  const paginatedQuery = lastDoc
    ? query(baseQuery, startAfter(lastDoc))
    : baseQuery

  const snapshot = await getDocs(paginatedQuery)
  const entries = snapshot.docs.map(firestoreToEntry)
  const lastVisible = snapshot.docs[snapshot.docs.length - 1]

  return { entries, lastVisible }
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
