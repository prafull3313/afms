import { utils, writeFile } from 'xlsx';
import type { ExpenseWithSheet } from '../utils/expenses';

const FILE_NAME = 'afms-expenses.xlsx';

const SHEET_HEADERS = [
  'Expense Date',
  'Expense Paid By',
  'Expense Amount',
  'Expense Details'
] as const;

const mapRowsForSheet = (expenses: ExpenseWithSheet[]) =>
  expenses.map((expense) => [
    expense.date,
    expense.paidBy,
    expense.amount,
    expense.details
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

  writeFile(workbook, FILE_NAME);
};
