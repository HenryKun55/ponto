import { initializeApp } from "firebase/app"
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore"
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
const timestampToISOString = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toISOString()
}

const firestoreToEntry = (doc: any): TimeEntry => {
  const data = doc.data();
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
  };
};

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

  const lastEntry = entriesSnapshot.docs[entriesSnapshot.docs.length - 1]

  return firestoreToEntry(lastEntry)
}

export async function saveTimeEntryFirebase(entry: TimeEntry) {
  const entryRef = doc(db, "timeEntries", entry.id);

  if (await entryExists(entry.id)) {
    // Se o documento já existe, atualiza o documento
    await updateDoc(entryRef, entry);
  } else {
    // Se o documento não existe, cria um novo
    await setDoc(entryRef, entry);
  }
}

async function entryExists(id: string): Promise<boolean> {
  const entryRef = doc(db, "timeEntries", id);
  const docSnapshot = await getDoc(entryRef);
  return docSnapshot.exists();
}
