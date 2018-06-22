import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { differenceInMonths } from 'date-fns';

import NumberWidget from '../../../NumberWidget';
import { monthsBetween, formatMonth, formattedDate } from 'utils/dateUtils';
import withMonthRange from '../monthrange';

export class MrnWidget extends React.Component {
  static propTypes = {
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    data: PropTypes.arrayOf(
      PropTypes.shape({
        month: PropTypes.string,
        total: PropTypes.number
      })
    )
  };

  get data() {
    const { startDate, endDate } = this.props;
    let data = this.props.data || [];
    const byMonth = {};
    data.forEach(r => (byMonth[formatMonth(r.month)] = r || 0));
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
        title="MRNs"
        fullPageLink="/dashboard/HIE.Management.MrnsDetail"
        loading={loading}
        error={error}
        series={[
          {
            aggregate: {
              value: (data && data.length && data[data.length - 1].count) || 0,
              label: `MRNs in the last ${differenceInMonths(endDate, startDate) + 1} months`
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
      mrns {
        byMonth(startDate: $startDate, endDate: $endDate) {
          month
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
    return { loading, error, data: hie && hie.mrns && hie.mrns.byMonth };
  }
});

export default withMonthRange()(withQuery(MrnWidget));
