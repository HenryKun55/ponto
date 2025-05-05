import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, query, where, type Timestamp, orderBy } from "firebase/firestore"
import type { TimeEntry } from "./types"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Convert Firestore timestamp to ISO string
const timestampToISOString = (timestamp: Timestamp) => {
  return timestamp.toDate().toISOString()
}

// Convert TimeEntry to Firestore format
const entryToFirestore = (entry: TimeEntry) => {
  return {
    employee: entry.employee,
    clockIn: entry.clockIn ? new Date(entry.clockIn) : null,
    clockOut: entry.clockOut ? new Date(entry.clockOut) : null,
    date: entry.date,
    createdAt: new Date(entry.createdAt),
  }
}

// Convert Firestore document to TimeEntry
const firestoreToEntry = (doc: any): TimeEntry => {
  const data = doc.data()
  return {
    id: doc.id,
    employee: data.employee,
    clockIn: data.clockIn ? timestampToISOString(data.clockIn) : null,
    clockOut: data.clockOut ? timestampToISOString(data.clockOut) : null,
    date: data.date,
    createdAt: timestampToISOString(data.createdAt),
  }
}

// Get all time entries
export async function getAllTimeEntriesFirebase(): Promise<TimeEntry[]> {
  const entriesCol = collection(db, "timeEntries")
  const entriesSnapshot = await getDocs(query(entriesCol, orderBy("date", "desc")))
  return entriesSnapshot.docs.map(firestoreToEntry)
}

// Get time entries for a specific employee
export async function getEmployeeTimeEntriesFirebase(employee: string): Promise<TimeEntry[]> {
  const entriesCol = collection(db, "timeEntries")
  const q = query(entriesCol, where("employee", "==", employee), orderBy("date", "desc"))
  const entriesSnapshot = await getDocs(q)
  return entriesSnapshot.docs.map(firestoreToEntry)
}

// Get today's entry for an employee
export async function getTodayEntryFirebase(employee: string): Promise<TimeEntry | null> {
  const today = new Date().toISOString().split("T")[0]
  const entriesCol = collection(db, "timeEntries")
  const q = query(entriesCol, where("employee", "==", employee), where("date", "==", today))
  const entriesSnapshot = await getDocs(q)

  if (entriesSnapshot.empty) {
    return null
  }

  return firestoreToEntry(entriesSnapshot.docs[0])
}

// Add or update a time entry
export async function saveTimeEntryFirebase(entry: TimeEntry): Promise<TimeEntry> {
  const entriesCol = collection(db, "timeEntries")

  // If entry has an ID and it's not a generated one, try to update
  if (entry.id && !entry.id.includes("-")) {
    // For simplicity in this example, we'll just add a new document
    // In a real app, you'd use doc() and setDoc() to update
  }

  // Add new document
  const firestoreEntry = entryToFirestore(entry)
  const docRef = await addDoc(entriesCol, firestoreEntry)

  return {
    ...entry,
    id: docRef.id,
  }
}
