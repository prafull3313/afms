import { saveEntry, updateEntry } from './entries';

export const handleExcel = async (entry) => saveEntry(entry);

export const handleEntryUpdate = async (id, entry) => updateEntry(id, entry);
