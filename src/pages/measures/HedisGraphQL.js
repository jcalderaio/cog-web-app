import _ from 'lodash';
import axios from 'axios';
import Sha256 from '../../utils/sha256';

// NOTE: This is bad practice.
//import { fetch } from 'providers/GraphQL';

// Really, we should use <GraphQLProvider /> but since this was all just stand alone AJAX requests
// keep it as such. It's prototype/demo anyway.
const fetch = (query) => {
  const noWSQuery = query.replace(/[\t\n\r\s]+/g, '');
  const mockFileName = Sha256.hash(noWSQuery);
  const httpClient = axios.create({});  
  return httpClient.get(`/mock/${mockFileName}.json`);
}

// TODO: Fix. This runs even before you log into the app.
// const measures = fetch(
//   `{
//     hedisMeta {
//       code
//       name
//       description
//     }
//   }`)
//   // was: r.hedisMeta
//   // now: r.data.data.hedisMeta
//   .then((r) => { return (r.hedisMeta !== undefined) ? r.hedisMeta:r.data.data.hedisMeta; });

// function aggregateRegion(data, code) {
//   const result = [];
//   const dataByCode = _.groupBy(data, 'code');
//   for (const mCode in dataByCode) {
//     if (dataByCode.hasOwnProperty(mCode)) {
//       let byMonth = _.groupBy(dataByCode[mCode] || [], v => v.year * 100 + v.month);
//       for (const key in byMonth) {
//         if (byMonth.hasOwnProperty(key)) {
//           const month = key % 100;
//           const year = Math.trunc(key / 100);
//           result.push({
//             code: mCode,
//             year: year,
//             month: month,
//             total: _.sumBy(byMonth[key], 'total'),
//             completed: _.sumBy(byMonth[key], 'completed'),
//           });
//         }
//       }
//     }
//   }
//   return _.groupBy(result, 'code');
// }

export default {
  measures() {
    return fetch(
    `{
      hedisMeta {
        code
        name
        description
      }
    }`)
    // was: r.hedisMeta
    // now: r.data.data.hedisMeta
    .then((r) => { return (r.hedisMeta !== undefined) ? r.hedisMeta:r.data.data.hedisMeta; });
  },
  yearlyData(code, minYear, maxYear) {
    return null;
  },
  monthlyData(code, minYear = -1, maxYear) {
    return Promise.all([
        this.measures,
        fetch(
          `{
            hedisMonthlyCompliance ${ code ? `(code:"${code}")` : '' }   {
                code
                year
                month
                total
                completed
            }
        }`)
      ])
      .then(r => {
        if(r !== undefined) {
          let hedisMonthlyCompliance = [];
          // was: r[1].hedisMonthlyCompliance
          // now: r[1].data.data.hedisMonthlyCompliance
          if (r[1].hedisMonthlyCompliance !== undefined) {
            hedisMonthlyCompliance = r[1].hedisMonthlyCompliance;
          }
          if (r[1].data && r[1].data.data !== undefined && r[1].data.data.hedisMonthlyCompliance) {
            hedisMonthlyCompliance = r[1].data.data.hedisMonthlyCompliance;
          }
          
          const result = hedisMonthlyCompliance.filter(a => {
            let ok = true;
            ok = minYear ? ok && a.year >= minYear : ok;
            ok = maxYear ? ok && a.year <= maxYear : ok;
            return ok;
          });
          return _.groupBy(result, 'code');
        }
      });
}
}
