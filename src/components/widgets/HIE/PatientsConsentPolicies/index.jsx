import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { differenceInMonths } from 'date-fns';

import NumberWidget from '../../../NumberWidget';
import { monthsBetween, formatMonth, formattedDate } from 'utils/dateUtils';
import withMonthRange from '../monthrange';

export class PatientConsentWidget extends React.Component {
  static propTypes = {
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    data: PropTypes.arrayOf(
      PropTypes.shape({
        month: PropTypes.string,
        active: PropTypes.number,
        inactive: PropTypes.number
      })
    )
  };

  get data() {
    const { startDate, endDate } = this.props;
    let data = this.props.data || [];

    const byMonth = {};
    data.forEach(r => (byMonth[formatMonth(r.month)] = r || 0));

    let cumulativeActive = 0;
    let cumulativeInactive = 0;
    
    data = monthsBetween(startDate, endDate).map(d => {
      const record = byMonth[formatMonth(d)];
      cumulativeActive += (record && record.active) || 0;
      cumulativeInactive += (record && record.inactive) || 0;

      return {
        date: d,
        active: cumulativeActive,
        inactive: cumulativeInactive
      };
    });

    return data;
  }

  render() {
    const data = this.data;
    const { startDate, endDate, loading, error } = this.props;

    return (
      <NumberWidget
        title="Patients w/ MPI Consent Policies"
        fullPageLink="/dashboard/HIE.Management.PatientsConsentPoliciesDetail"
        loading={loading}
        error={error}
        series={[
          // {
          //   aggregate: {
          //     value: (data.length && data[data.length - 1].inactive) || 0,
          //     label: `Inactive`
          //   },
          //   items: data.map(i => ({ date: i.date, value: i.inactive }))
          // },
          {
            aggregate: {
              value: (data.length && data[data.length - 1].active) || 0,
              label: `Patients w/ MPI Consent Policies in the last ${differenceInMonths(endDate, startDate) + 1} months`
            },
            items: data.map(i => ({ date: i.date, value: i.active }))
          },
          
        ]}
      />
    );
  }
}

const query = gql`
  query hieQuery($startDate: String!, $endDate: String!) {
    hie {
      patientsMpiConsentPolicies {
        byMonth(startDate: $startDate, endDate: $endDate) {
          month
          active
          inactive
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
    return {
      loading,
      error,
      data: hie && hie.patientsMpiConsentPolicies && hie.patientsMpiConsentPolicies.byMonth
    };
  }
});

export default withMonthRange()(withQuery(PatientConsentWidget));
