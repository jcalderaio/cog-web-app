import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { differenceInMonths } from 'date-fns';

import NumberWidget from '../../../NumberWidget';
import { monthsBetween, formatMonth, formattedDate } from 'utils/dateUtils';
import withMonthRange from '../monthrange';

export class StreamletsWidget extends React.Component {
  static propTypes = {
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    data: PropTypes.arrayOf(
      PropTypes.shape({
        year: PropTypes.number,
        month: PropTypes.number,
        count: PropTypes.number
      })
    )
  };

  get data() {
    const { startDate, endDate } = this.props;
    let data = this.props.data || [];
    const byMonth = {};
    data.forEach(r => (byMonth[formatMonth(r.year, r.month)] = r || 0));
    let total = 0;
    data = monthsBetween(startDate, endDate).map(d => {
      const record = byMonth[formatMonth(d)];
      total += (record && record.count) || 0;
      const item = { date: d, count: total };
      return item;
    });
    return data;
  }

  render() {
    const data = this.data;
    const { startDate, endDate, loading, error } = this.props;
    return (
      <NumberWidget
        title="Data Streamlets"
        fullPageLink="/dashboard/HIE.Management.StreamletsByFacilityDetail"
        loading={loading}
        error={error}
        series={[
          {
            aggregate: {
              value: data[data.length - 1].count,
              label: `Data Streamlets in the last ${differenceInMonths(endDate, startDate) + 1} months`
            },
            items: data.map(i => ({ date: i.date, value: i.count }))
          }
        ]}
      />
    );
  }
}

const query = gql`
  query hieQuery($startDate: String!, $endDate: String!) {
    hie {
      streamlets {
        history(startDate: $startDate, endDate: $endDate) {
          month
          year
          count
        }
      }
    }
  }
`;

const withQuery = graphql(query, {
  options: props => ({
    variables: {
      startDate: formattedDate(props.startDate),
      endDate: formattedDate(props.endDate)
    }
  }),
  props: ({ data /*, ownProps*/ }) => {
    const { loading, error, hie } = data;
    return { loading, error, data: hie && hie.streamlets && hie.streamlets.history };
  }
});

export default withMonthRange()(withQuery(StreamletsWidget));
