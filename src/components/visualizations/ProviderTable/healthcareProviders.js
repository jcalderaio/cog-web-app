import _ from 'lodash';
import hash from 'object-hash';

const defaultFields = `
  npi
  entityType
  hieParticipant
  firstName
  lastName
  fullAddress
  organizationName
  city
  county
  state
  zip
  phone
  email
  score
  description1
  geolocationType
  longitude
  latitude`;

function serializeFilters(filtersObject) {
  return _.toPairs(filtersObject)
    .map((filterPair) => {
      const key = filterPair[0];
      const val = filterPair[1];

      if (typeof val === 'string') {
        return `${key}: "${val}"`
      } else {
        return `${key}: ${val}`
      }
    }).join(',');
}

export default {
  query: `{
    providers#{filter} {
      total
      #{fields}
    }
  }`,
  defaultQuery: `{
    providers {
      total
      ${defaultFields}
    }
  }`,
  filterQuery: (query, props) => {
    let fieldString = props.fields ? props.fields.join('\n') : defaultFields;
    const filtersCSV = serializeFilters(props.queryFilters);
    const filterString = filtersCSV ? `(${filtersCSV})` : '';
    return query.replace('#{fields}', fieldString).replace('#{filter}', filterString);
  },
  shouldQuery(thisProps, nextProps) {
    if (!nextProps || !thisProps.queryFilters) return true;
    return hash(thisProps.queryFilters) !== hash(nextProps.queryFilters);
  }
}