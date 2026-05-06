import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

export const expensePaidByOptions = ['Omkar S', 'Omkar P', 'Prafull'] as const;

export type ExpensePaidBy = (typeof expensePaidByOptions)[number];

export type Expense = {
  paidBy: ExpensePaidBy;
  amount: number;
  details: string;
  date: string;
};

export type ExpenseWithSheet = Expense & {
  id: string;
  createdAt: number;
  sheetName: string;
};

type FirestoreExpense = Expense & {
  createdAt?: number | null;
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
    createdAt: Date.now()
  });

  return {
    message: 'Expense saved successfully.'
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
      createdAt: getCreatedAtValue(expense.createdAt),
      sheetName: getSheetNameFromDate(expense.date)
    };
  });
};

export const getExpenseMonthOptions = (expenses: ExpenseWithSheet[]) =>
  Array.from(new Set(expenses.map((expense) => expense.sheetName)));
