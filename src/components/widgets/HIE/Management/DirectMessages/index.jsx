// import React from 'react';
// import NumberWidget from '../../../../NumberWidget';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { monthsBetween } from 'utils/dateUtils';
import moment from 'moment';

function DirectMessages(props) {
  return null;
  // (
  // <NumberWidget
  // title="Direct Secure e-mail by Account"
  // format="abbrev"
  // data={props.data}
  // series={["messagesOriginated", "messagesReceived"]}
  // labels={["Originated", "Received"]}
  // fullPageLink="/dashboard/HIE.Management.DirectSecureMessagesDetail"
  // />
  // );
}

const query = gql`
  query hieQuery($startDate: String, $endDate: String) {
    hie {
      directMessagesAggregate(startDate: $startDate, endDate: $endDate) {
        date
        month
        year
        messagesReceived
        messagesOriginated
      }
    }
  }
`;

const graphqlVariables = (/* props: */ { filters }) => ({
  variables: {
    startDate: format(startOfMonth(subMonths(new Date(), 23)), 'YYYY/MM/DD'),
    endDate: format(startOfMonth(new Date()), 'YYYY/MM/DD')
  }
});

const graphqlTransform = ({ ownProps, data }) => {
  if (data.loading) {
    return {
      data
    };
  }

  // define the range
  const startDate = format(startOfMonth(subMonths(new Date(), 23)), 'YYYY/MM/DD');
  const endDate = format(endOfMonth(new Date()), 'YYYY/MM/DD');

  // for each month in range ...
  const range = monthsBetween(startDate, endDate).map(e => {
    // Filter data result to show data points for the date range only.
    const foundForDate = data.hie.directMessagesAggregate.filter(m => {
      if (moment.utc(e).format('YYYY-MM-DD') === moment.utc(m.date).format('YYYY-MM-DD')) {
        return m;
      }
    });

    return foundForDate && foundForDate.length > 0
      ? foundForDate[0]
      : {
          date: e,
          messagesOriginated: 0,
          messagesReceived: 0,
          month: e.getMonth(),
          year: e.getYear()
        };
  });

  return {
    data: range.map(e => {
      return {
        ...e,
        name: e.date
      };
    })
  };
};

export default graphql(query, {
  options: graphqlVariables,
  props: graphqlTransform
})(DirectMessages);

export { graphqlTransform };
