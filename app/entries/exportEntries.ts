import { utils, writeFile } from 'xlsx';
import type { EntryWithSheet } from '../utils/entries';

const FILE_NAME = 'afms.xlsx';

const SHEET_HEADERS = [
  'दिनांक',
  'नाव',
  'धान्य',
  'वजन',
  'पैसे मिळाले का?',
  'पैसे कोणी घेतले?',
  'किती पैसे मिळाले?',
  'पैसे गिरणीवर जमा केले का?'
] as const;

const mapRowsForSheet = (entries: EntryWithSheet[]) =>
  entries.map((entry) => [
    entry.date,
    entry.customerName,
    entry.grainType,
    entry.weight,
    entry.receivedPayment,
    entry.receivedBy,
    entry.payment,
    entry.depositedOnGirani
  ]);

export const downloadEntriesWorkbook = (entries: EntryWithSheet[]) => {
  const workbook = utils.book_new();
  const groupedEntries = new Map<string, EntryWithSheet[]>();

  entries.forEach((entry) => {
    const sheetEntries = groupedEntries.get(entry.sheetName) ?? [];
    sheetEntries.push(entry);
    groupedEntries.set(entry.sheetName, sheetEntries);
  });

  groupedEntries.forEach((sheetEntries, sheetName) => {
    const worksheet = utils.aoa_to_sheet([[...SHEET_HEADERS], ...mapRowsForSheet(sheetEntries)]);
    utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  writeFile(workbook, FILE_NAME);
};
