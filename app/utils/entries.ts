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
  sheetName: string;
};

const STORAGE_KEY = 'afms_entries';

const isBrowser = () => typeof window !== 'undefined';

const getSheetNameFromDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));

export const getStoredEntries = (): Entry[] => {
  if (!isBrowser()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

export const saveEntry = (entry: Entry) => {
  const existingEntries = getStoredEntries();
  const updatedEntries = [...existingEntries, entry];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));

  return {
    message: 'Entry saved locally in this browser.',
    totalEntries: updatedEntries.length
  };
};

export const getEntriesWithSheets = () =>
  getStoredEntries().map((entry) => ({
    ...entry,
    sheetName: getSheetNameFromDate(entry.date)
  }));

export const getMonthOptions = (entries: EntryWithSheet[]) =>
  Array.from(new Set(entries.map((entry) => entry.sheetName)));

