import React from 'react';
// import PropTypes from 'prop-types';
import LineChartVisualization from 'visualizations/LineChart/index.jsx';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
// import { format } from 'date-fns';
import { formattedDate, monthsBetween, formatMonth, format } from 'utils/dateUtils';
import Spinner from 'components/Spinner.jsx';
import ErrorDisplay from 'components/ErrorDisplay';

export function HistoricalGraph(props) {
  const { loading, error, widgetWidth, widgetHeight, filters, history } = props;
  const { startDate, endDate } = filters || {};
  let data = history || [];
  const byMonth = {};
  data.forEach(r => {
    const monthString = formatMonth(r.year, r.month);
    byMonth[monthString] = r;
  });
  data = monthsBetween(startDate, endDate).map(d => {
    const record = byMonth[formatMonth(d)];
    return {
      month: format(d, 'MM/YY'),
      count: (record && record.count) || 0
    };
  });

  return (
    <Spinner until={!loading}>
      {error ? (
        <ErrorDisplay
          header="Server Error"
          message="An error was encountered while fetching data from server."
          details={error}
        />
      ) : (
        <LineChartVisualization
          xAxisKey="month"
          seriesKeys={[{ count: 'Patient Searches' }]}
          data={data}
          widgetWidth={widgetWidth}
          widgetHeight={widgetHeight}
        />
      )}
    </Spinner>
  );
}

const query = gql`
  query($filter: PatientSearchFilter!) {
    hie {
      searches {
        history(filter: $filter) {
          year
          month
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
    const history = (hie && hie.searches && hie.searches.history) || [];
    return { loading, error, history };
  }
})(HistoricalGraph);
