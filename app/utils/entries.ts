import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

export type YesNo = 'Yes' | 'No';

export type Entry = {
  date: string;
  customerName: string;
  grainType: string;
  weight: number;
  receivedPayment: YesNo;
  receivedBy: string;
  payment: number;
  depositedOnGirani: YesNo;
};

export type EntryWithSheet = Entry & {
  id: string;
  createdAt: number;
  sheetName: string;
};

type FirestoreEntry = Entry & {
  createdAt?: Timestamp | number | null;
};

const getSheetNameFromDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));

const getCreatedAtValue = (createdAt?: Timestamp | number | null) => {
  if (createdAt instanceof Timestamp) {
    return createdAt.toMillis();
  }

  if (typeof createdAt === 'number') {
    return createdAt;
  }

  return Date.now();
};

export const saveEntry = async (entry: Entry) => {
  const db = getFirestoreDb();

  await addDoc(collection(db, 'entries'), {
    ...entry,
    createdAt: Date.now()
  });

  return {
    message: 'Entry saved successfully.'
  };
};

export const getEntriesWithSheets = async (): Promise<EntryWithSheet[]> => {
  const db = getFirestoreDb();
  const entriesQuery = query(collection(db, 'entries'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(entriesQuery);

  return snapshot.docs.map((doc) => {
    const entry = doc.data() as FirestoreEntry;

    return {
      id: doc.id,
      date: entry.date,
      customerName: entry.customerName,
      grainType: entry.grainType,
      weight: Number(entry.weight),
      receivedPayment: entry.receivedPayment,
      receivedBy: entry.receivedBy,
      payment: Number(entry.payment),
      depositedOnGirani: entry.depositedOnGirani,
      createdAt: getCreatedAtValue(entry.createdAt),
      sheetName: getSheetNameFromDate(entry.date)
    };
  });
};

export const getMonthOptions = (entries: EntryWithSheet[]) =>
  Array.from(new Set(entries.map((entry) => entry.sheetName)));
