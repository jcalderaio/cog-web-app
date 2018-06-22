import StringUtils from '../../../utils/stringUtils';


const Months = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];
const MonthFields = ['month', 'mon'];
const YearFields = ['year', 'yr'];
const DayFields = ['day'];
const DateFields = ['date', 'timestamp'];

/**
 * Determine if a field corresponds to a date field
 * @export
 * @param {string} field 
 * @returns Boolean
 */
export function isDateField(field) {
  const lowerField = field.toLowerCase();
  return (
    DateFields.includes(lowerField) ||
    YearFields.includes(lowerField) ||
    MonthFields.includes(lowerField) ||
    DayFields.includes(lowerField));
}

export const Constants = {
  months: Months,
  monthsAbbr: Months.map(abbrev(1)),
  monthsAbbr3: Months.map(abbrev(3))
}

function mapIntToMonth(options={}) {
  const defaultOptions = {
    monthsArray: Constants.monthsAbbr,
    defaultVal: undefined
  };
  // passed options overwrite defaults
  const finalOptions = Object.assign({}, defaultOptions, options)
  return (val) => (
    (val <= 12 && val > 0) ?
      StringUtils.capitalize(finalOptions.monthsArray[val-1]) :
      (val || finalOptions.defaultVal))
}

export const Mappers = {
  intToMonthAbbr: mapIntToMonth({defaultVal: '!!ERROR-INVALID MONTH INT!!'}),
  intToMonthAbbr3: mapIntToMonth({defaultVal: '!!ERROR-INVALID MONTH INT!!', monthsArray: Constants.monthsAbbr3}),
  intToMonthOrYearAbbr: mapIntToMonth(),
  intToMonth: mapIntToMonth({defaultVal: '!!ERROR-INVALID MONTH INT!!', monthsArray: Months}),
  intToMonthOrYear: mapIntToMonth({monthsArray: Months})
}

function abbrev(len) {
  return (s) => s.slice(0, len);
}


export default {
  Mappers,
  Constants,
  isDateField
};