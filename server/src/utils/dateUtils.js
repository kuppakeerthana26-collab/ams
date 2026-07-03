const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const normalizeDate = (value) => {
  const date = value ? new Date(`${value}T00:00:00.000Z`) : new Date();
  if (Number.isNaN(date.getTime())) {
    const error = new Error("Invalid attendance date");
    error.statusCode = 400;
    throw error;
  }
  return date.toISOString().slice(0, 10);
};

export const getMonthMeta = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  return {
    day: date.getUTCDate(),
    month,
    year,
    monthName: monthNames[month - 1],
  };
};

export const buildClassName = ({ branch, year, section, className }) => {
  if (className) return className.trim().replace(/\s+/g, "_");
  return `${branch}_${year}_${section}`.replace(/\s+/g, "_");
};

export const buildSheetTitle = (className, dateString) => {
  const { monthName, year } = getMonthMeta(dateString);
  return `${className}_${monthName}_${year}`.replace(/\s+/g, "_");
};
