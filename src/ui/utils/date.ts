/**
 * Date utilities
 * Functions for date range generation, difference calculation, and formatting.
 */

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

export const getDateRange = (
  start: string | Date,
  end: string | number | Date,
  steps = 1
) => {
  const range: Date[] = [];
  let curr = new Date(start);

  if (isNaN(curr.getTime())) return range;

  if (typeof end === "number") {
    const tmp = new Date(start);
    tmp.setUTCDate(tmp.getUTCDate() + end);
    end = tmp;
  }

  const endDate = new Date(end);
  if (isNaN(endDate.getTime())) return range;

  while (curr <= endDate) {
    range.push(new Date(curr));
    curr.setUTCDate(curr.getUTCDate() + steps);
  }

  return range;
};

export const getDayDiff = (start: string | Date, end: string | Date) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startUTC = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const endUTC = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  const diff = Math.floor((endUTC - startUTC) / _MS_PER_DAY);
  return diff;
};

export const addDays = (date: string | Date, steps = 0) => {
  const newDate = new Date(date);
  if (isNaN(newDate.getTime())) return newDate;
  newDate.setUTCDate(newDate.getUTCDate() + steps);
  return newDate;
};

export const convertShortISO = (dateString: string) => {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(5, 7);
  const day = dateString.slice(8, 10);
  return `${month}/${day}/${year}`;
};
