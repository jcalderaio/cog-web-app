import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { differenceInMonths } from 'date-fns';

import NumberWidget from '../../../NumberWidget';
import { monthsBetween, formatMonth, formattedDate } from 'utils/dateUtils';
import withMonthRange from '../monthrange';

export class RegisteredUsersWidget extends React.Component {
  static propTypes = {
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    data: PropTypes.arrayOf(
      PropTypes.shape({
        year: PropTypes.number,
        month: PropTypes.number,
        cumulative: PropTypes.number
      })
    )
  };

  get data() {
    const { startDate, endDate } = this.props;
    let data = this.props.data || [];
    const byMonth = {};
    // Note: month-1 because JavaScript months start with 0. So 1 "January" is really 0.
    data.forEach(r => (byMonth[formatMonth(r.year, r.month-1)] = r || 0));
    let prevCumulative = 0;
    data = monthsBetween(startDate, endDate).map(d => {
      const record = byMonth[formatMonth(d)];
      // Use last known, cumulative/running total, value when a month is missing data.
      prevCumulative = (record && record.cumulative) || prevCumulative;
      const item = { date: d, cumulative: prevCumulative };
      return item;
    });
    return data;
  }

  render() {
    const data = this.data;
    const { startDate, endDate, loading, error } = this.props;
    return (
      <NumberWidget
        title="Registered Users"
        fullPageLink="/dashboard/HIE.Management.RegisteredUsersDetail"
        loading={loading}
        error={error}
        series={[
          {
            aggregate: {
              value: data[data.length - 1].cumulative,
              label: `Registered Users in the last ${differenceInMonths(endDate, startDate) + 1} months`
            },
            items: data.map(i => ({ date: i.date, value: i.cumulative }))
          }
        ]}
      />
    );
  }
}

const query = gql`
  query hieQuery($startDate: String!, $endDate: String!) {
    user {
      history(startDate: $startDate, endDate: $endDate) {
        month
        year
        cumulative
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
    const { loading, error, user } = data;
    return { loading, error, data: user && user.history };
  }
});

export default withMonthRange()(withQuery(RegisteredUsersWidget));
