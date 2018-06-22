import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { formattedDate } from 'utils/dateUtils';
import Spinner from 'components/Spinner.jsx';
import DataTable from 'components/DataTable.jsx';
import ErrorDisplay from 'components/ErrorDisplay';
import '../../../../../../assets/sass/global/_react-table.scss';
import Filter from './filter';

export class View extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    filters: PropTypes.shape(Filter.propTypes),
    data: PropTypes.arrayOf(
      PropTypes.shape({
        organization: PropTypes.string,
        count: PropTypes.number
      })
    )
  };

  get columns() {
    return [
      { Header: 'Organization', accessor: 'organization' },
      { Header: 'User', accessor: 'user' },
      { Header: 'Search Count', accessor: 'count' }
    ];
  }

  render() {
    const { loading, error, data = [] } = this.props;
    return (
      <div className="panel-default content-grid-element">
        {error ? (
          <ErrorDisplay
            header="Server Error"
            message="An error was encountered while fetching data from server."
            details={error}
          />
        ) : (
          <Spinner until={!loading}>
            <DataTable data={data} columns={this.columns} />
          </Spinner>
        )}
      </div>
    );
  }
}

const query = gql`
  query($filter: PatientSearchFilter!) {
    hie {
      searches {
        detailsByOrganization(filter: $filter) {
          organization
          user
          count
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
        endDate: formattedDate(props.filters.endDate),
        organization: props.filters.organization,
        user: props.filters.user
      }
    }
  }),
  props: ({ ownProps, data }) => {
    const { loading, error, hie } = data;
    const records = (hie && hie.searches && hie.searches.detailsByOrganization) || [];
    return { loading, error, data: records };
  }
})(View);
