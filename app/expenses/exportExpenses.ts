import { utils, writeFile } from 'xlsx';
import type { ExpenseWithSheet } from '../utils/expenses';

const getDatedFileName = () => {
  const currentDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
    .format(new Date())
    .replace(/ /g, '-');

  return `afms-expenses-${currentDate}.xlsx`;
};

const SHEET_HEADERS = [
  'Expense Date',
  'Expense Paid By',
  'Expense Amount',
  'Expense Details',
  'Settlement Status'
] as const;

const mapRowsForSheet = (expenses: ExpenseWithSheet[]) =>
  expenses.map((expense) => [
    expense.date,
    expense.paidBy,
    expense.amount,
    expense.details,
    expense.settled ? 'Settled' : 'Pending'
  ]);

export const downloadExpensesWorkbook = (expenses: ExpenseWithSheet[]) => {
  const workbook = utils.book_new();
  const groupedExpenses = new Map<string, ExpenseWithSheet[]>();

  expenses.forEach((expense) => {
    const sheetExpenses = groupedExpenses.get(expense.sheetName) ?? [];
    sheetExpenses.push(expense);
    groupedExpenses.set(expense.sheetName, sheetExpenses);
  });

  groupedExpenses.forEach((sheetExpenses, sheetName) => {
    const worksheet = utils.aoa_to_sheet([
      [...SHEET_HEADERS],
      ...mapRowsForSheet(sheetExpenses)
    ]);
    utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  writeFile(workbook, getDatedFileName());
};
