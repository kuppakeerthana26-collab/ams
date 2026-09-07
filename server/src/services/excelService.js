import ExcelJS from "exceljs";
import fs from "fs/promises";
import path from "path";
import { env } from "../config/env.js";
import { getMonthMeta } from "../utils/dateUtils.js";
import Student from "../models/Student.js";
import AttendanceSubmission from "../models/AttendanceSubmission.js";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BRANCH_NAMES = {
  CSE: "Computer Science & Engineering (CSE)",
  ECE: "Electronics & Communication Engineering (ECE)",
  MECH: "Mechanical Engineering (MECH)",
  IT: "Information Technology (IT)",
  EEE: "Electrical & Electronics Engineering (EEE)",
  CIVIL: "Civil Engineering (CIVIL)",
  AIDS: "Artificial Intelligence & Data Science (AI&DS)",
  AIML: "Artificial Intelligence & Machine Learning (AIML)",
};

let workbookQueue = Promise.resolve();

const workbookPath = () => path.resolve(process.cwd(), env.ATTENDANCE_WORKBOOK_PATH);

const withWorkbookLock = (task) => {
  const result = workbookQueue.then(task, task);
  workbookQueue = result.catch(() => undefined);
  return result;
};

const loadWorkbook = async () => {
  const workbook = new ExcelJS.Workbook();
  const filePath = workbookPath();

  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return workbook;
    throw error;
  }

  await workbook.xlsx.readFile(filePath);
  return workbook;
};

const saveWorkbook = async (workbook) => {
  const filePath = workbookPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await workbook.xlsx.writeFile(filePath);
};

// Converts 1-based column index to Excel column letter (1->A, 2->B, 28->AB, 35->AI)
export const getColLetter = (col) => {
  let letter = "";
  let temp = col;
  while (temp > 0) {
    let mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
};

export const parseClassDetails = (classNameInput = "") => {
  const rawClass = typeof classNameInput === "string" ? classNameInput : classNameInput?.className || "";
  const safeClassName = String(rawClass || "").trim();
  const parts = safeClassName.split("_").filter(Boolean);

  if (parts.length >= 3) {
    const rawBranch = String(parts[0] || "").toUpperCase();
    const yearNum = String(parts[1] || "1");
    const sec = String(parts[2] || "A").toUpperCase();
    return {
      branchCode: rawBranch,
      branchName: BRANCH_NAMES[rawBranch] || rawBranch,
      year: `Year ${yearNum}`,
      section: `Section ${sec}`,
      classLabel: `${rawBranch} - Year ${yearNum} - Sec ${sec}`,
    };
  }

  const cleanStr = safeClassName || "CSE_1_A";
  const upper = cleanStr.toUpperCase();
  return {
    branchCode: upper,
    branchName: BRANCH_NAMES[upper] || cleanStr,
    year: "Year 1",
    section: "Section A",
    classLabel: cleanStr,
  };
};

/**
 * Builds the clean, professional GKCE Attendance worksheet
 */
export const buildFullWorksheet = (worksheet, { className, dateString, students = [], existingEntries = new Map() }) => {
  const safeDateString = dateString || new Date().toISOString().slice(0, 10);
  const dateMeta = getMonthMeta(safeDateString);
  const month = Number(dateMeta?.month) || (new Date().getUTCMonth() + 1);
  const year = Number(dateMeta?.year) || new Date().getUTCFullYear();
  const monthName = String(dateMeta?.monthName || "September");
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate() || 30;
  const classInfo = parseClassDetails(className);

  const totalCols = 2 + daysInMonth + 3; // Col 1: Roll No, Col 2: Name + daysInMonth + 3 summary cols
  const lastColLetter = getColLetter(totalCols);
  const firstDayColLetter = "C";
  const lastDayColLetter = getColLetter(2 + daysInMonth);
  const totalPColLetter = getColLetter(3 + daysInMonth);
  const totalAColLetter = getColLetter(4 + daysInMonth);
  const percentColLetter = getColLetter(5 + daysInMonth);

  // Freeze top 4 rows and first 2 columns (Roll No, Name)
  worksheet.views = [{ state: "frozen", xSplit: 2, ySplit: 4 }];

  // -------------------------------------------------------------
  // Row 1: College Header
  // -------------------------------------------------------------
  const titleRow = worksheet.getRow(1);
  titleRow.height = 30;
  worksheet.getCell("A1").value = "GOKULA KRISHNA COLLEGE OF ENGINEERING (GKCE)";
  worksheet.mergeCells(`A1:${lastColLetter}1`);
  worksheet.getCell("A1").font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }, // Navy Blue
  };

  // -------------------------------------------------------------
  // Row 2: Branch, Year, Section, Month, Class
  // -------------------------------------------------------------
  const subTitleRow = worksheet.getRow(2);
  subTitleRow.height = 24;
  const branchHeader = String(classInfo?.branchName || "Computer Science & Engineering (CSE)").toUpperCase();
  const yearHeader = String(classInfo?.year || "Year 1").toUpperCase();
  const sectionHeader = String(classInfo?.section || "Section A").toUpperCase();
  const monthHeader = String(monthName || "September").toUpperCase();
  const classHeader = String(className || "CSE_1_A");

  worksheet.getCell("A2").value = `BRANCH: ${branchHeader}    |    ${yearHeader}    |    ${sectionHeader}    |    MONTH: ${monthHeader} ${year}    |    CLASS: ${classHeader}`;
  worksheet.mergeCells(`A2:${lastColLetter}2`);
  worksheet.getCell("A2").font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getCell("A2").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A8A" }, // Deep Blue
  };

  // -------------------------------------------------------------
  // Row 3: Column Headers: Roll No | Student Name | 01 | 02 | 03... | Total Present | Total Absent | Attendance %
  // -------------------------------------------------------------
  const headerRow1 = worksheet.getRow(3);
  headerRow1.height = 24;

  headerRow1.getCell(1).value = "Roll No";
  headerRow1.getCell(2).value = "Student Name";

  for (let d = 1; d <= daysInMonth; d++) {
    const colIdx = d + 2;
    headerRow1.getCell(colIdx).value = d < 10 ? `0${d}` : `${d}`;
  }

  headerRow1.getCell(3 + daysInMonth).value = "Total Present";
  headerRow1.getCell(4 + daysInMonth).value = "Total Absent";
  headerRow1.getCell(5 + daysInMonth).value = "Attendance %";

  for (let c = 1; c <= totalCols; c++) {
    const cell = headerRow1.getCell(c);
    cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };

    if (c === 1 || c === 2) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    } else if (c >= 3 && c <= 2 + daysInMonth) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    } else if (c === 3 + daysInMonth) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16A34A" } }; // Green
    } else if (c === 4 + daysInMonth) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDC2626" } }; // Red
    } else {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
    }

    cell.border = {
      top: { style: "thin", color: { argb: "FF94A3B8" } },
      left: { style: "thin", color: { argb: "FF94A3B8" } },
      bottom: { style: "thin", color: { argb: "FF94A3B8" } },
      right: { style: "thin", color: { argb: "FF94A3B8" } },
    };
  }

  // -------------------------------------------------------------
  // Row 4: Day Names Sub-headers (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
  // -------------------------------------------------------------
  const headerRow2 = worksheet.getRow(4);
  headerRow2.height = 20;

  headerRow2.getCell(1).value = "";
  headerRow2.getCell(2).value = "Day of Week";

  for (let d = 1; d <= daysInMonth; d++) {
    const colIdx = d + 2;
    const dayOfWeek = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    headerRow2.getCell(colIdx).value = DAYS_SHORT[dayOfWeek];
  }

  headerRow2.getCell(3 + daysInMonth).value = "Total (P)";
  headerRow2.getCell(4 + daysInMonth).value = "Total (A)";
  headerRow2.getCell(5 + daysInMonth).value = "% Rate";

  for (let c = 1; c <= totalCols; c++) {
    const cell = headerRow2.getCell(c);
    cell.alignment = { vertical: "middle", horizontal: "center" };

    if (c >= 3 && c <= 2 + daysInMonth) {
      const d = c - 2;
      const dayOfWeek = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
      if (dayOfWeek === 0) {
        cell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FFDC2626" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
      } else {
        cell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FF334155" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
      }
    } else {
      cell.font = { name: "Arial", size: 8.5, bold: true, color: { argb: "FF64748B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    }

    cell.border = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
  }

  // Column Widths
  worksheet.getColumn(1).width = 15; // Roll No
  worksheet.getColumn(2).width = 28; // Student Name
  for (let d = 1; d <= daysInMonth; d++) {
    worksheet.getColumn(d + 2).width = 5.5; // Day columns
  }
  worksheet.getColumn(3 + daysInMonth).width = 14; // Total Present
  worksheet.getColumn(4 + daysInMonth).width = 14; // Total Absent
  worksheet.getColumn(5 + daysInMonth).width = 16; // Attendance %

  // -------------------------------------------------------------
  // Rows 5+: Student Records
  // -------------------------------------------------------------
  students.forEach((student, index) => {
    const rowNum = 5 + index;
    const row = worksheet.getRow(rowNum);
    row.height = 22;

    // Roll No
    row.getCell(1).value = student.rollNo;
    row.getCell(1).font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF0F172A" } };
    row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

    // Student Name
    row.getCell(2).value = student.name;
    row.getCell(2).font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF1E293B" } };
    row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };

    // Fill days 1 to daysInMonth
    for (let d = 1; d <= daysInMonth; d++) {
      const colIdx = d + 2;
      const cell = row.getCell(colIdx);
      cell.alignment = { vertical: "middle", horizontal: "center" };

      const dayOfWeek = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
      const isSunday = dayOfWeek === 0;

      const key = `${student.rollNo}_${d}`;
      const status = existingEntries.get(key) || "";
      cell.value = status;

      if (status === "P") {
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF15803D" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
      } else if (status === "A") {
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFDC2626" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
      } else if (isSunday) {
        cell.font = { name: "Arial", size: 9, color: { argb: "FFDC2626" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } };
      } else {
        cell.font = { name: "Arial", size: 9, color: { argb: "FF64748B" } };
      }

      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    }

    // Formulas for Totals
    const pCell = row.getCell(3 + daysInMonth);
    pCell.value = { formula: `COUNTIF(${firstDayColLetter}${rowNum}:${lastDayColLetter}${rowNum}, "P")` };
    pCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF15803D" } };
    pCell.alignment = { vertical: "middle", horizontal: "center" };
    pCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDF4" } };

    const aCell = row.getCell(4 + daysInMonth);
    aCell.value = { formula: `COUNTIF(${firstDayColLetter}${rowNum}:${lastDayColLetter}${rowNum}, "A")` };
    aCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFDC2626" } };
    aCell.alignment = { vertical: "middle", horizontal: "center" };
    aCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } };

    const percentCell = row.getCell(5 + daysInMonth);
    percentCell.value = {
      formula: `IF((${totalPColLetter}${rowNum}+${totalAColLetter}${rowNum})>0, ROUND((${totalPColLetter}${rowNum}/(${totalPColLetter}${rowNum}+${totalAColLetter}${rowNum}))*100, 1) & "%", "-")`,
    };
    percentCell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF1E3A8A" } };
    percentCell.alignment = { vertical: "middle", horizontal: "center" };
    percentCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };

    for (let c = 1; c <= totalCols; c++) {
      row.getCell(c).border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    }
  });

  return worksheet;
};

/**
 * Extracts all existing attendance entries from any worksheet format
 */
export const extractExistingEntries = (worksheet) => {
  const map = new Map();
  if (!worksheet) return map;

  let rollNoCol = 1;
  let startRow = 5;

  worksheet.eachRow((row, rowNumber) => {
    const val1 = String(row.getCell(1).value || "").trim().toLowerCase();
    if (val1 === "roll no" || val1 === "rollno") {
      rollNoCol = 1;
      startRow = rowNumber + 2; // skip day-names row
    }
  });

  for (let r = startRow; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r);
    const rollNo = String(row.getCell(rollNoCol).value || "").trim();
    if (!rollNo || rollNo.toLowerCase().includes("total") || rollNo.toLowerCase().includes("daily") || rollNo.toLowerCase().includes("roll")) {
      continue;
    }

    for (let d = 1; d <= 31; d++) {
      const cellVal = String(row.getCell(d + 2).value || "").trim().toUpperCase();
      if (cellVal === "P" || cellVal === "A") {
        map.set(`${rollNo}_${d}`, cellVal);
      }
    }
  }

  return map;
};

/**
 * Synchronizes and ensures the worksheet exists and is up to date with MongoDB
 */
export const ensureWorksheetSynced = async ({ className, date }) => {
  const safeDate = date || new Date().toISOString().slice(0, 10);
  const dateMeta = getMonthMeta(safeDate);
  const month = Number(dateMeta?.month) || (new Date().getUTCMonth() + 1);
  const year = Number(dateMeta?.year) || new Date().getUTCFullYear();
  const monthName = String(dateMeta?.monthName || "September");
  const sheetTitle = `${className}_${monthName}_${year}`.slice(0, 31);

  return withWorkbookLock(async () => {
    const workbook = await loadWorkbook();
    let existingWorksheet = workbook.getWorksheet(sheetTitle);

    // Fetch students and submissions from MongoDB
    const students = await Student.find({ className, isActive: true }).sort({ rollNo: 1 });
    const submissions = await AttendanceSubmission.find({ className, month, year });

    const existingEntries = extractExistingEntries(existingWorksheet);

    // Overlay database submissions (ground truth)
    submissions.forEach((sub) => {
      const day = sub.day;
      sub.entries.forEach((entry) => {
        if (entry.rollNo && entry.status) {
          existingEntries.set(`${entry.rollNo}_${day}`, entry.status);
        }
      });
    });

    if (existingWorksheet) {
      workbook.removeWorksheet(existingWorksheet.id);
    }

    const newWorksheet = workbook.addWorksheet(sheetTitle);
    buildFullWorksheet(newWorksheet, {
      className,
      dateString: safeDate,
      students,
      existingEntries,
    });

    await saveWorkbook(workbook);
    return { sheetTitle, worksheet: newWorksheet, students, dateMeta };
  });
};

export const updateDayColumn = async ({ sheetTitle, students, day, entries, className, date }) =>
  withWorkbookLock(async () => {
    const workbook = await loadWorkbook();
    const existingWorksheet = workbook.getWorksheet(sheetTitle);

    const existingEntries = extractExistingEntries(existingWorksheet);

    const entryByStudent = new Map(entries.map((entry) => [String(entry.student), entry.status]));
    students.forEach((student) => {
      const status = entryByStudent.get(String(student._id));
      if (status) {
        existingEntries.set(`${student.rollNo}_${day}`, status);
      }
    });

    if (existingWorksheet) {
      workbook.removeWorksheet(existingWorksheet.id);
    }

    const newWorksheet = workbook.addWorksheet(sheetTitle);
    buildFullWorksheet(newWorksheet, {
      className: className || sheetTitle,
      dateString: date,
      students,
      existingEntries,
    });

    await saveWorkbook(workbook);
  });

export const getSheetData = async ({ className, date }) => {
  const { dateMeta, students } = await ensureWorksheetSynced({ className, date });
  const month = Number(dateMeta?.month) || (new Date().getUTCMonth() + 1);
  const year = Number(dateMeta?.year) || new Date().getUTCFullYear();
  const monthName = String(dateMeta?.monthName || "September");
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate() || 30;
  const classInfo = parseClassDetails(className);

  const workbook = await loadWorkbook();
  const sheetTitle = `${className}_${monthName}_${year}`.slice(0, 31);
  const worksheet = workbook.getWorksheet(sheetTitle);

  if (!worksheet) {
    return {
      meta: { className, classInfo, monthName, year, daysInMonth, totalStudents: students.length },
      headers: { dates: [], days: [] },
      students: [],
      rows: [],
    };
  }

  // Extract raw rows
  const rawRows = worksheet.getSheetValues().slice(1).map((row) =>
    (row || []).slice(1).map((value) => {
      if (value == null) return "";
      if (typeof value === "object" && value.formula) return value.result || "";
      return value;
    }),
  );

  // Build structured response for clean mobile display
  const dateHeaders = [];
  const dayHeaders = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dateHeaders.push(d < 10 ? `0${d}` : `${d}`);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    dayHeaders.push(DAYS_SHORT[dayOfWeek]);
  }

  // Submissions map
  const existingEntries = extractExistingEntries(worksheet);
  const structuredStudents = students.map((s, idx) => {
    const attendance = {};
    let presentCount = 0;
    let absentCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const status = existingEntries.get(`${s.rollNo}_${d}`) || "";
      attendance[d] = status;
      if (status === "P") presentCount++;
      if (status === "A") absentCount++;
    }

    const totalMarked = presentCount + absentCount;
    const percentage = totalMarked > 0 ? `${Math.round((presentCount / totalMarked) * 100)}%` : "-";

    return {
      sNo: idx + 1,
      rollNo: s.rollNo,
      name: s.name,
      attendance,
      totalP: presentCount,
      totalA: absentCount,
      percentage,
    };
  });

  return {
    meta: {
      collegeName: "Gokula Krishna College of Engineering (GKCE)",
      departmentName: classInfo.branchName,
      branch: classInfo.branchCode,
      year: classInfo.year,
      section: classInfo.section,
      className,
      monthName,
      year,
      daysInMonth,
      totalStudents: students.length,
    },
    headers: {
      dates: dateHeaders,
      days: dayHeaders,
      summary: ["Total (P)", "Total (A)", "Attendance %"],
    },
    students: structuredStudents,
    rows: rawRows,
  };
};

export const getSheetRows = async (sheetTitle, { className, date } = {}) => {
  if (className && date) {
    const data = await getSheetData({ className, date });
    return data.rows;
  }

  const workbook = await loadWorkbook();
  const worksheet = workbook.getWorksheet(sheetTitle);
  if (!worksheet) return [];

  return worksheet.getSheetValues().slice(1).map((row) =>
    (row || []).slice(1).map((value) => {
      if (value == null) return "";
      if (typeof value === "object" && value.formula) return value.result || "";
      return value;
    }),
  );
};

export const getMonthlySheetBuffer = async (sheetTitle, { className, date } = {}) => {
  let targetClassName = className;
  let targetDate = date;

  if (!targetClassName || !targetDate) {
    const parts = String(sheetTitle || "").split("_");
    if (parts.length >= 3) {
      targetClassName = parts.slice(0, 3).join("_");
      const monthName = parts[3] || "September";
      const year = parts[4] || String(new Date().getFullYear());
      targetDate = `${year}-${monthName}-01`;
    } else {
      targetClassName = "CSE_1_A";
      targetDate = new Date().toISOString().slice(0, 10);
    }
  }

  await ensureWorksheetSynced({ className: targetClassName, date: targetDate });

  return withWorkbookLock(async () => {
    const sourceWorkbook = await loadWorkbook();
    const dateMeta = getMonthMeta(targetDate);
    const computedTitle = `${targetClassName}_${dateMeta.monthName}_${dateMeta.year}`.slice(0, 31);
    const source = sourceWorkbook.getWorksheet(sheetTitle) || sourceWorkbook.getWorksheet(computedTitle);

    if (!source) return null;

    // Build pristine export workbook
    const downloadWorkbook = new ExcelJS.Workbook();
    downloadWorkbook.creator = "Gokula Krishna College of Engineering (GKCE)";
    downloadWorkbook.lastModifiedBy = "GKCE Attendance Monitoring System";
    downloadWorkbook.created = new Date();
    downloadWorkbook.modified = new Date();

    const targetSheet = downloadWorkbook.addWorksheet(source.name);
    const existingEntries = extractExistingEntries(source);

    const students = await Student.find({ className: targetClassName, isActive: true }).sort({ rollNo: 1 });

    buildFullWorksheet(targetSheet, {
      className: targetClassName,
      dateString: targetDate,
      students,
      existingEntries,
    });

    return downloadWorkbook.xlsx.writeBuffer();
  });
};
