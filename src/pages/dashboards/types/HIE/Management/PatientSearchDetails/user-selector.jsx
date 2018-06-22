import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { formattedDate } from 'utils/dateUtils';

export function UserSelector(props) {
  const { options = [], onChange, filters = {} } = props;
  return (
    <Select
      id="user-selector"
      name="user-selector"
      simpleValue
      options={options}
      value={filters.user}
      valueKey="id"
      labelKey="name"
      onChange={u => onChange(u)}
      searchable={true}
    />
  );
}

UserSelector.propTypes = {
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
  query PatientSearchUsers($filter: PatientSearchFilter!) {
    hie {
      searches {
        users(filter: $filter) {
          id
          name
        }
      }
    }
  }
`;

export default graphql(query, {
  skip: props => !props.filters || !props.filters.organization,
  options: props => ({
    variables: {
      filter: {
        startDate: formattedDate(props.filters.startDate),
        endDate: formattedDate(props.filters.endDate),
        organization: props.filters.organization
      }
    }
  }),
  props: ({ ownProps, data }) => {
    const { loading, error, hie } = data;
    const options = (hie && hie.searches && hie.searches.users) || [];
    return { loading, error, options };
  }
})(UserSelector);
