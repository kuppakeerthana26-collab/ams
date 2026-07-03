import { google } from "googleapis";
import { env } from "../config/env.js";

const header = ["Roll No", "Name", ...Array.from({ length: 31 }, (_value, index) => String(index + 1))];

export const getColumnLetter = (columnIndex) => {
  if (!Number.isInteger(columnIndex) || columnIndex < 1) {
    throw new Error("Column index must be a positive integer");
  }

  let letter = "";
  let index = columnIndex;

  while (index > 0) {
    const remainder = (index - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    index = Math.floor((index - remainder) / 26);
  }

  return letter;
};

const getSheetsClient = () => {
  if (!env.GOOGLE_SHEETS_SPREADSHEET_ID || !env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    const error = new Error("Google Sheets credentials are not configured");
    error.statusCode = 503;
    throw error;
  }

  const auth = new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
};

const getSheetMetadata = async (sheets) => {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
  });
  return response.data.sheets || [];
};

export const ensureMonthlySheet = async (sheetTitle, students) => {
  const sheets = getSheetsClient();
  const existingSheets = await getSheetMetadata(sheets);
  const existing = existingSheets.find((sheet) => sheet.properties.title === sheetTitle);

  if (existing) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    requestBody: {
      requests: [{ addSheet: { properties: { title: sheetTitle } } }],
    },
  });

  const values = [header, ...students.map((student) => [student.rollNo, student.name, ...Array(31).fill("")])];

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: `'${sheetTitle}'!A1:AG${values.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
};

export const updateDayColumn = async ({ sheetTitle, students, day, entries }) => {
  const sheets = getSheetsClient();
  await ensureMonthlySheet(sheetTitle, students);

  const entryByStudent = new Map(entries.map((entry) => [String(entry.student), entry.status]));
  const values = students.map((student) => [entryByStudent.get(String(student._id)) || ""]);
  const columnIndex = day + 2;
  const columnLetter = getColumnLetter(columnIndex);

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: `'${sheetTitle}'!${columnLetter}2:${columnLetter}${students.length + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
};

export const getSheetRows = async (sheetTitle) => {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: `'${sheetTitle}'!A1:AG`,
  });
  return response.data.values || [];
};
