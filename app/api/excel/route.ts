import { existsSync } from 'fs';
import { mkdir, readFile, writeFile as writeFileFs } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { read, utils, write } from 'xlsx';

const FILE_NAME = 'afms.xlsx';

type ExcelRow = {
  date: string;
  customerName: string;
  grainType: string;
  weight: number;
  receivedPayment: 'Yes' | 'No';
  receivedBy: string;
  payment: number;
  depositedOnGirani: 'Yes' | 'No';
};

type SheetEntry = {
  date: string;
  customerName: string;
  grainType: string;
  weight: number;
  receivedPayment: string;
  receivedBy: string;
  payment: number;
  depositedOnGirani: string;
};

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

const getExcelFilePath = () => path.join(process.cwd(), 'public', FILE_NAME);

const getSheetNameFromDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));

const mapRowsForSheet = (rows: ExcelRow[]) =>
  rows.map((row) => [
    row.date,
    row.customerName,
    row.grainType,
    row.weight,
    row.receivedPayment,
    row.receivedBy,
    row.payment,
    row.depositedOnGirani
  ]);

const createWorksheet = (rows: ExcelRow[]) =>
  utils.aoa_to_sheet([[...SHEET_HEADERS], ...mapRowsForSheet(rows)]);

const createWorkbookBuffer = (sheetName: string, rows: ExcelRow[]) => {
  const worksheet = createWorksheet(rows);
  const workbook = utils.book_new();

  utils.book_append_sheet(workbook, worksheet, sheetName);

  return write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

const appendRowsToSheet = (
  workbook: ReturnType<typeof read>,
  sheetName: string,
  rows: ExcelRow[]
) => {
  const sheetExists = workbook.SheetNames.includes(sheetName);

  if (!sheetExists) {
    const newWorksheet = createWorksheet(rows);
    utils.book_append_sheet(workbook, newWorksheet, sheetName);

    return {
      sheetCreated: true,
      totalRows: rows.length
    };
  }

  const worksheet = workbook.Sheets[sheetName];
  const existingRows = utils.sheet_to_json<ExcelRow>(worksheet, { defval: null });

  utils.sheet_add_json(worksheet, rows, {
    origin: -1,
    skipHeader: existingRows.length > 0
  });

  return {
    sheetCreated: false,
    totalRows: existingRows.length + rows.length
  };
};

const groupRowsBySheet = (rows: ExcelRow[]) => {
  const rowsBySheet = new Map<string, ExcelRow[]>();

  rows.forEach((row) => {
    const sheetName = getSheetNameFromDate(row.date);
    const sheetRows = rowsBySheet.get(sheetName) ?? [];
    sheetRows.push(row);
    rowsBySheet.set(sheetName, sheetRows);
  });

  return rowsBySheet;
};

const getWorkbookEntries = async () => {
  const filePath = getExcelFilePath();

  if (!existsSync(filePath)) {
    return [];
  }

  const fileBuffer = await readFile(filePath);
  const workbook = read(fileBuffer, { type: 'buffer' });

  return workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetRows = utils.sheet_to_json<(string | number)[]>(worksheet, {
      header: 1,
      defval: ''
    });

    const rows = sheetRows.slice(1).map((row) => ({
      date: String(row[0] ?? ''),
      customerName: String(row[1] ?? ''),
      grainType: String(row[2] ?? ''),
      weight: Number(row[3] ?? 0),
      receivedPayment: String(row[4] ?? ''),
      receivedBy: String(row[5] ?? ''),
      payment: Number(row[6] ?? 0),
      depositedOnGirani: String(row[7] ?? '')
    }));

    return {
      sheetName,
      rows
    };
  });
};

export async function GET() {
  try {
    const sheets = await getWorkbookEntries();
    const allEntries = sheets.flatMap((sheet) =>
      sheet.rows.map((row) => ({
        ...row,
        sheetName: sheet.sheetName
      }))
    );

    return NextResponse.json({
      fileName: FILE_NAME,
      totalEntries: allEntries.length,
      sheets,
      entries: allEntries
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error while reading Excel file.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rows: ExcelRow[] = Array.isArray(body?.data) ? body.data : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No data provided to append.' },
        { status: 400 }
      );
    }

    const publicDir = path.join(process.cwd(), 'public');
    const filePath = getExcelFilePath();
    const fileExists = existsSync(filePath);
    const rowsBySheet = groupRowsBySheet(rows);

    await mkdir(publicDir, { recursive: true });

    if (!fileExists) {
      const [firstSheetName, firstSheetRows] = Array.from(rowsBySheet.entries())[0];
      const workbookBuffer = createWorkbookBuffer(firstSheetName, firstSheetRows);
      const workbook = read(workbookBuffer, { type: 'buffer' });

      Array.from(rowsBySheet.entries())
        .slice(1)
        .forEach(([sheetName, sheetRows]) => {
          appendRowsToSheet(workbook, sheetName, sheetRows);
        });

      const finalBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
      await writeFileFs(filePath, finalBuffer);

      const sheetNames = Array.from(rowsBySheet.keys()).join(', ');

      return NextResponse.json({
        exists: false,
        sheetNames: Array.from(rowsBySheet.keys()),
        appendedRows: rows.length,
        message: `${FILE_NAME} was created with ${sheetNames} and ${rows.length} rows were added.`
      });
    }

    const existingBuffer = await readFile(filePath);
    const workbook = read(existingBuffer, { type: 'buffer' });

    const sheetResults = Array.from(rowsBySheet.entries()).map(([sheetName, sheetRows]) => ({
      sheetName,
      ...appendRowsToSheet(workbook, sheetName, sheetRows)
    }));

    const workbookBuffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await writeFileFs(filePath, workbookBuffer);

    const createdSheets = sheetResults
      .filter((result) => result.sheetCreated)
      .map((result) => result.sheetName);
    const sheetSummary = sheetResults.map((result) => result.sheetName).join(', ');

    const message =
      createdSheets.length > 0
        ? `${createdSheets.join(', ')} sheet was created in ${FILE_NAME} and ${rows.length} rows were added.`
        : `${rows.length} rows were appended to ${sheetSummary} in ${FILE_NAME}.`;

    return NextResponse.json({
      exists: true,
      sheetNames: sheetResults.map((result) => result.sheetName),
      sheetCreated: createdSheets.length > 0,
      appendedRows: rows.length,
      totalRowsBySheet: sheetResults,
      message
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error while updating Excel file.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
