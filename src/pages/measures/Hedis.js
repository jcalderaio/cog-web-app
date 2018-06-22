import _ from 'lodash';
// import provider from './HedisMock';
import provider from './HedisGraphQL'

function calculateYearFromMonthData(data, code) {
  const byYear = _.groupBy(data, 'year');
  const yearly = [];
  for (let year of Object.keys(byYear)) {
    yearly.push({
      code: code,
      year,
      total: _.sumBy(byYear[year], 'total'),
      completed: _.sumBy(byYear[year], 'completed')
    });
  }
  return yearly;
}

export default {
  supportsAnalysis(code) {
    return ['W15','BMI','MIPS-236'].includes(code);
  },

  lastReportingPeriod() {
    return new Date().getFullYear() - 1;
  },

  measures() {
    // [ {code, name, description}, {....}, {....}, .... ]
    return Promise.resolve(provider.measures()).then(r => {
      // console.log('R', r);
      const result = {};
      if (r !== undefined) {
        for (const measure of r) {
          result[measure.code] = measure;
        }
      }
      return result;
    });
  },

  yearlyData(code, minYear, maxYear) {
    return Promise.resolve(provider.yearlyData(code, minYear, maxYear))
      .then(r => {
        if (r && Object.keys(r)) return r;
        return Promise.resolve(provider.monthlyData(code, minYear, maxYear)).then(m => {
          const result = {};
          if (m !== undefined) {
            for (let c of Object.keys(m)) {
              result[c] = calculateYearFromMonthData(m[c], c);
            }
          }
          return result;
        });
      })
      .then(m => {
        for (let c of Object.keys(m)) {
          m[c].forEach(d => (d.score = Math.trunc(d.completed / d.total * 100)));
        }
        return m;
      });
  },

  monthlyData(code, minYear, maxYear) {
    return Promise.resolve(provider.monthlyData(code, minYear, maxYear)).then(m => {
      // d: { measureCode1: [{code, year, month, total, completed}....], measureCode2: [...], ...}
      for (let cd of Object.keys(m)) {
        m[cd].forEach(d => (d.score = Math.trunc(d.completed / d.total * 100)));
      }
      return m;
    });
  }
};
