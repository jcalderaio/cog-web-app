import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { sum } from 'lodash';
import gql from 'graphql-tag';
import { differenceInMonths } from 'date-fns';

import NumberWidget from '../../../NumberWidget';
import withMonthRange from '../monthrange';
import { monthsBetween, formatMonth } from 'utils/dateUtils';

export class PatientSearchesWidget extends React.Component {
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
    data = monthsBetween(startDate, endDate).map(d => {
      const record = byMonth[formatMonth(d)];
      return {
        date: d,
        count: (record && record.count) || 0
      };
    });
    return data;
  }

  render() {
    const data = this.data;
    const { startDate, endDate, loading, error } = this.props;
    return (
      <NumberWidget
        title="Patient Searches"
        fullPageLink="/dashboard/HIE.Management.PatientSearchDetails"
        loading={loading}
        error={error}
        series={[
          {
            aggregate: {
              value: sum(data.map(i => i.count)),
              label: `Patient Searches in the last ${differenceInMonths(endDate, startDate) + 1} months`
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
      searches {
        history(filter: { startDate: $startDate, endDate: $endDate }) {
          year
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
      startDate: props.startDate,
      endDate: props.endDate
    }
  }),
  props: ({ data /*, ownProps*/ }) => {
    const { loading, error, hie } = data;
    return { loading, error, data: hie && hie.searches && hie.searches.history };
  }
});

export default withMonthRange()(withQuery(PatientSearchesWidget));
