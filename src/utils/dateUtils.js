import { startOfMonth, endOfMonth, isBefore, isAfter, addMonths, format } from 'date-fns';
import { last } from 'lodash';

export const monthsBetween = (xstartDate, xendDate) => {
  var result = [];

  let startDate = startOfMonth(xstartDate);
  let endDate = endOfMonth(xendDate);

  if (isBefore(endDate, startDate)) {
    startDate = startOfMonth(endDate);
  }

  while (isBefore(startDate, endDate)) {
    result.push(startDate);
    startDate = addMonths(startDate, 1);
  }

  return result;
};

export const findLastMonthValue = (month, monthsValues) => {
  return last(
    monthsValues.filter(d => {
      return !isAfter(d.month, endOfMonth(month));
    })
  );
};

export const yyyymmdd = date => {
  return format(date, 'YYYY/MM/DD');
};

export { format };

export const formatMonth = function() {
  let date;
  if (arguments.length === 2) {
    const year = arguments[0];
    const month = arguments[1];
    date = new Date(year, month - 1, 1);
  } else {
    date = arguments[0];
  }
  const s = format(date, 'YYYYMM');
  return s;
};

export function formattedDate(date) {
  return format(date, 'YYYY/MM/DD');
}
