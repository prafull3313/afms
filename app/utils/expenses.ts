import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

export const expensePaidByOptions = ['Omkar S', 'Omkar P', 'Prafull'] as const;

export type ExpensePaidBy = (typeof expensePaidByOptions)[number];

export type Expense = {
  paidBy: ExpensePaidBy;
  amount: number;
  details: string;
  date: string;
  settled: boolean;
  settledAt?: number | null;
};

export type ExpenseWithSheet = Expense & {
  id: string;
  createdAt: number;
  sheetName: string;
};

type FirestoreExpense = Expense & {
  createdAt?: number | null;
  settledAt?: number | null;
};

const getSheetNameFromDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));

const getCreatedAtValue = (createdAt?: number | null) =>
  typeof createdAt === 'number' ? createdAt : Date.now();

export const saveExpense = async (expense: Expense) => {
  const db = getFirestoreDb();

  await addDoc(collection(db, 'expenses'), {
    ...expense,
    settled: Boolean(expense.settled),
    settledAt: expense.settled ? Date.now() : null,
    createdAt: Date.now()
  });

  return {
    message: 'Expense saved successfully.'
  };
};

export const updateExpenseSettlement = async (id: string, settled: boolean) => {
  const db = getFirestoreDb();
  const expenseRef = doc(db, 'expenses', id);
  const expenseSnapshot = await getDoc(expenseRef);

  if (!expenseSnapshot.exists()) {
    throw new Error('Expense not found.');
  }

  const existingExpense = expenseSnapshot.data() as FirestoreExpense;

  await updateDoc(expenseRef, {
    ...existingExpense,
    settled,
    settledAt: settled ? Date.now() : null,
    createdAt: getCreatedAtValue(existingExpense.createdAt)
  });

  return {
    message: settled ? 'Expense marked as settled.' : 'Expense marked as pending.'
  };
};

export const getExpensesWithSheets = async (): Promise<ExpenseWithSheet[]> => {
  const db = getFirestoreDb();
  const expensesQuery = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(expensesQuery);

  return snapshot.docs.map((expenseDoc) => {
    const expense = expenseDoc.data() as FirestoreExpense;

    return {
      id: expenseDoc.id,
      paidBy: expense.paidBy,
      amount: Number(expense.amount),
      details: expense.details,
      date: expense.date,
      settled: Boolean(expense.settled),
      settledAt: typeof expense.settledAt === 'number' ? expense.settledAt : null,
      createdAt: getCreatedAtValue(expense.createdAt),
      sheetName: getSheetNameFromDate(expense.date)
    };
  });
};

export const getExpenseMonthOptions = (expenses: ExpenseWithSheet[]) =>
  Array.from(new Set(expenses.map((expense) => expense.sheetName)));
