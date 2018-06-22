import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { formattedDate } from 'utils/dateUtils';

export function OrgSelector(props) {
  const { options = [], onChange, filters = {} } = props;
  return (
    <Select
      id="org-selector"
      name="org-selector"
      simpleValue
      options={options}
      value={filters.organization}
      valueKey="id"
      labelKey="name"
      onChange={o => onChange(o)}
      searchable={true}
    />
  );
}

OrgSelector.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })
  ),
  filters: PropTypes.shape({
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
  }),
  onChange: PropTypes.func
};

const query = gql`
  query PatientSearchOrganizations($filter: PatientSearchFilter!) {
    hie {
      searches {
        organizations(filter: $filter) {
          id
          name
        }
      }
    }
  }
`;

export default graphql(query, {
  skip: props => !props.filters,
  options: props => ({
    variables: {
      filter: {
        startDate: formattedDate(props.filters.startDate),
        endDate: formattedDate(props.filters.endDate)
      }
    }
  }),
  props: ({ ownProps, data }) => {
    const { loading, error, hie } = data;
    const options = (hie && hie.searches && hie.searches.organizations) || [];
    return { loading, error, options };
  }
})(OrgSelector);
