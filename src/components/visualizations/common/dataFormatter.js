import _ from 'lodash';
import { yyyymmdd, monthsBetween } from "utils/dateUtils";

/**
 * Gets and optionally transforms the data from props.
 * 
 * Data can be passed directly via `props.data` OR come from GraphQL 
 * via `props.graphql.result` (where an object key is referenced).
 * Pssst, this is very handy for unit tests.
 * 
 * Additionally, if no object key is provided, but only one set of
 * data is returned from GraphQL, it will use that instead.
 * GraphQL is great for making multiple queries in one request
 * (this is why we need to be specific in which data set to use),
 * but if there's only one set of data being returned it's extraneous
 * to also provide the key name referencing it. So this helps avoid
 * confusion and makes things more convenient.
 * 
 * @param  {Object}  props           The props passed to the component
 * @return {Array}                   The data array for use by the widget
 */
export function getDataFromProps(props) {
  let data = props.data || [];
  if (props.resultDataKey && props.graphql && props.graphql.result && props.graphql.result[props.resultDataKey]) {
    data = props.graphql.result[props.resultDataKey];
  }
  // Still empty? Look if the result has only one item in the object.
  // Use that if `resultDataKey` was not set.
  if (data.length === 0 && !props.resultDataKey){
    if (props.graphql && props.graphql.result !== undefined && Object.keys(props.graphql.result).length === 1) {
      data = props.graphql.result[Object.keys(props.graphql.result)[0]];
    }
  }
  return data;
}

/**
 * Will zero fill a range of data that has `year` and `month` or `date` keys.
 * For now this will zero fill month by month.
 * If dateUtils gets a yearsBetween() or daysBetween() then this function
 * can easily update to allow an interval key to be passed with options.
 *
 * @param {Array}  data      The data to be charted
 * @param {Object} options
 *                 - dateKey    A specific date key to use with `new Date()`
 *                 - acc        Accumulator field (typically the plotted value, ie. "count")
 *                 - accField   The accumulator returned to a new field if defined, else it will replace existing
 *                              as defined by `acc` option
 *                 - rangeField The date range field name (typically the x-axis, ie. "date" or "name")
 *                              defaults to "_zeroFillDateRange"
 *                 - start      The starting point (perhaps getTime() from a Date)
 *                 - end        The ending point
 *                 - fillLast   If true, instead of 0 the last value from the previous month will be used (good for running totals)
 * @return {Array}
 */
export function zeroFillDateRange(data, options) {
  // There must be an accumulation field and a date field
  if (data !== undefined && options !== undefined && options.acc !== undefined) {
    const acc = options.acc;
    const dateKey = (options.dateKey !== undefined) ? options.dateKey:null;

    // sparse array [ {month: 'YYYY/MM/DD', count: 0} ] to hash { 'YYYY/MM/DD': count }
    const sparseCounts = data.reduce((m, e) => {
      let date_of = null;
      // Try date first (note, sometimes this is not a truncated date)
      if (e.date !== undefined) {
        date_of = new Date(e.date)
      }
      // Try month and year (many count results will use this instead due to SQL group by clauses)
      if (e.year !== undefined && e.month !== undefined) {
        date_of = new Date(`${e.year}/${e.month}/01`);
      }
      // If a specific dateKey was provided
      if (dateKey && e[dateKey] !== undefined) {
        date_of = new Date(e[dateKey]);
      }
      
      if (date_of && e[acc]) {
        m[yyyymmdd(date_of)] = e[acc];
      }
      return m;
    }, {});

    if (options && options.start && options.end) {
      // `_zeroFillDateRange` is the default here when not provided (makes things obvious when using it).
      const rangeField = (options.rangeField !== undefined) ? options.rangeField:'_zeroFillDateRange';
      // It is possible to be non-destructive with the given data provided an `accField` was given.
      // Otherwise it will overwrite the `acc` field.
      const accField = (options.accField !== undefined) ? options.accField:acc;
      let prevVal = 0;
      return monthsBetween(options.start, options.end).map(m => {
        const record = {};
        // Add the potentially new (but possibly overwritten based on options) fields
        record[rangeField] = yyyymmdd(m);
        record[accField] = sparseCounts[yyyymmdd(m)] || (options.fillLast ? prevVal:0);
        prevVal = sparseCounts[yyyymmdd(m)];
        return record;
      });
    }
  }

  // Nothing could be done
  return data;
}

/**
 * Filter a collection based on filter object. 
 * 
 * @param {Object} filter   : { field: 'fieldName', value: X }
 * @param {Object[]} data : [{field1: 1, ...}, ...]
 * @returns filtered Collection
 */
export function filterData(data, filter) {
  if (!filter || _.isEmpty(filter)) {
    return data;
  } else {
    return data.filter(
      (record) => {
        if (filter.field && record[filter.field].toString() === filter.value.toString()) {
          return record;
        }
        return null;
      });
  }
}

/**
 * Group a collection by a property.
 * E.g. [{metric: 'A', ...}, {metric: 'B', ...}, ...]
 *  grouped by property='metric' =
 *    {
 *      A: [{metric: 'A', ...}, ...],
 *      B: [{metric: 'B', ...}, ...]
 *    }
 * 
 * @param {Object[]} data   : Collection
 * @param {string} property : property to group by
 * @returns {Object} { group1: object[], ... }
 */
export function groupBy(data, property) {
  if (!property) return data;

  return data.reduce((groups, element) => {
    if (!groups[element[property]]) {
      groups[element[property]] = [];
    }
    groups[element[property]].push(element);
    return groups;
  }, {});
}

// /**
//  * Map a collection to new collection where records of selected fields
//  * 
//  * @param {string[]} fields 
//  * @param {object[]} data 
//  * @returns {Array}
//  */
// function mapPick(data, fields) {
//   return data.map((record) => _.pick(fields, record))
// }

/**
 * Map data to a new collection where field and its value are now key-value pair
 * 
 * @param {string[]} metrics : metrics to include 
 * @param {object[]} data    : Collection
 * @param {string} [field='metric'] 
 * @param {string} [valueField='value'] 
 * @returns {Array}
 */
export function mapFieldToValue(data, options) {
  if (!options || !options.field || !options.valueField) return data;
  const { field, valueField } = options;
  return data.map((record) => {
    let newRecord = Object.assign({}, record);
    newRecord[record[field]] = record[valueField];
    delete newRecord[field];
    delete newRecord[valueField];
    return newRecord;
  })
}

/**
 * Build Scale Labels for Graph Data levels
 * 
 * @param {Object} filter  : { field: 'fieldName', value: X }
 * @param {string} topLabel
 * @returns {string}
 */
export function getScaleLabel(filter, levelLabel) {
  if (filter.value !== undefined) {
    
    if (levelLabel) {
      return `${levelLabel}(s) for ${filter.field} ${filter.value}`;
    }

    return `For ${filter.field} ${filter.value}`;
  } else {
    
    if (levelLabel) return `All ${levelLabel}(s)`;

    return 'All';
  }
}

/**
 * An abstract form of mergeData that will merge fields
 * based on merge function
 * 
 * @param {any} data 
 * @param {any} fields 
 * @param {any} mergeFunc 
 * @returns {Object}
 */
const Sum = (a, b) => a + b;
function merge(data, fields, scaleField, options={}) {
  const initVal = options.initVal || 0;
  const mergeFunc = options.mergeFunc || Sum;


  return Object.keys(data).map((groupKey) => {

    const groupCol = {
      [scaleField]: groupKey
    };

    fields.forEach((field) => {
      groupCol[field] = data[groupKey].reduce((acc, row) => {
        return mergeFunc(acc, row[field])
      }, initVal);
    });

    return groupCol;
  });
}

/**
 * Merge data... TODO: update this
 * 
 * @param {any} series 
 * @param {any} groupedData 
 * @returns {Array}
 */
export function mergeData(groupedData, series) {

  const mergedData = [];
  for (const x in groupedData) {
    if (groupedData[x] !== undefined) {
      // this is fine if there's only one value... like by month. one total for each in the series.
      // but in the year view there's 12 of each in the series. those 12 need to be added together
      // for the sum. so assign() won't work there.

      let sums = {};
      for (const i in groupedData[x]) {
        if (groupedData[x][i] !== undefined) {
          // console.log("record group", grouped[x][i])
          for (const n in series) {
            if (sums[series[n]] === undefined) {
              sums[series[n]] = 0;
            }
            // assuming theres a series for this record group to add
            if (groupedData[x][i][series[n]] !== undefined) {
              // console.log("add", grouped[x][i][series[n]])
              // console.log("to", sums[series[n]])
              // console.log("for", series[n])
              sums[series[n]] += groupedData[x][i][series[n]];
            }
          }
        }
      }
      // console.log("sums", sums)

      // merge each of the records in the group
      let mergedGroupRecords = Object.assign({}, ...groupedData[x]);
      // then set each series sum value (assign() doesn't add values, it replaces/merges)
      for (const i in sums) {
        if (sums[i] !== undefined) {
          mergedGroupRecords[i] = sums[i];
        }
      }

      mergedData.push(mergedGroupRecords);
    }
  }

  return mergedData;
}


/**
 * Helper class for chaining data formmatting tasks
 * 
 * @class Pipe
 */
export class Pipe {
  constructor() {
    this._stepQueue = [];

    this.then = this.then.bind(this);
    this.run = this.run.bind(this);
  }

  then(func, ...funcArgs) {
    this._stepQueue.push({
      func: func,
      args: funcArgs
    });
    return this;
  }

  run(data) {
    if (this._stepQueue !== undefined) {
      return this._stepQueue.reduce((prevData, curStep) => {
        const f = curStep.func;
        const args = curStep.args;
        return f(prevData, ...args);
      }, data);
    }
  }
}

export default {
  filterData,
  groupBy,
  mapFieldToValue,
  merge,
  mergeData,
  getScaleLabel,
  getDataFromProps
}