import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import LineChartVisualization from 'visualizations/LineChart/index.jsx';
import ReactTable from 'react-table';
import { CSVLink } from 'react-csv';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { find, orderBy } from 'lodash';
import { endOfMonth, isBefore, compareAsc, format } from 'date-fns';
import { monthsBetween } from 'utils/dateUtils';
import { zeroFillDateRange } from 'visualizations/common/dataFormatter';
import Spinner from 'components/Spinner.jsx';
import Map from 'visualizations/Map/index.jsx';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import ContainerDimensions from 'react-container-dimensions';

import '../../../../../../assets/sass/global/_react-table.scss';

export class DirectSecureMessagesDetailView extends Component {
  constructor(props) {
    super(props);

    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  handleSelectTab(key) {
    this.props.updateActiveTab(key);
  }

  get columns() {
    return [
      {
        Header: 'Date',
        accessor: 'date',
        sortMethod: (a, b) => {
          return compareAsc(a, b);
        }
      },
      {
        Header: 'User Name',
        accessor: 'user'
      },
      {
        Header: 'Organization',
        accessor: 'name'
      },
      {
        Header: 'Messages Sent',
        accessor: 'messagesSent'
      }
    ];
  }

  monthlyDocumentsCount(documents, startDate, endDate) {
    return monthsBetween(startDate, endDate).map(month => ({
      month: format(month, 'MM/YYYY'),
      count: documents.filter(document => isBefore(document.created, endOfMonth(month))).length
    }));
  }

  filteredRecords(records, endDate) {
    return records ? records.filter(record => isBefore(record.date, endOfMonth(endDate))) : [];
  }

  csvData(filteredDocuments) {
    const csvHeaders = this.columns.map(e => e.Header);
    const csvAccessors = this.columns.map(e => e.accessor);

    return [csvHeaders, ...filteredDocuments.map(e => csvAccessors.map(a => e[a]))];
  }

  render() {
    // let startDate = this.props.filters.startDate;
    let endDate = this.props.filters.endDate;

    // table records for messagesByUser
    let records = this.props.data.messagesByUser;
    let filteredRecords = this.filteredRecords(records, endDate);
    let csvData = this.csvData(filteredRecords);

    const mapHeight = DashboardLayout.DEFAULT_ROW_HEIGHT * 6 - 60;

    const directMessagesAggregate = zeroFillDateRange(this.props.data.directMessagesAggregate || [], {
      acc: 'messagesDelivered',
      start: this.props.filters.startDate,
      end: this.props.filters.endDate
    }).map(e => ({
      date: format(new Date(e._zeroFillDateRange), 'MM/YYYY'),
      messagesDelivered: e.messagesDelivered
    }));

    return (
      <div className="panel-default content-grid-element">
        <Spinner until={!this.props.data.loading}>
          <Tabs
            activeKey={this.props.activeTab}
            onSelect={this.handleSelectTab}
            id="tabs-details"
            className="tabs-content"
          >
            <Tab eventKey={1} title="Trend">
              <LineChartVisualization
                xAxisKey="date"
                seriesKeys={[{ messagesDelivered: 'messages delivered' }]}
                data={directMessagesAggregate}
                widgetWidth={this.props.widgetWidth}
                widgetHeight={this.props.widgetHeight}
              />
            </Tab>
            <Tab eventKey={2} title="Data">
              <ReactTable data={filteredRecords} columns={this.columns} defaultPageSize={10} />
              <br />
              <CSVLink
                data={csvData}
                filename={'direct_secure_messages.csv'}
                className="btn btn-primary"
                target="_blank"
              >
                Download CSV
              </CSVLink>
            </Tab>
            <Tab eventKey={3} title="Map">
            {
              // Note: This prevents warnings when mouseover on the map area while on different tabs.
              // Apparently content is rendering, just not seen. So when a user hovers the mouse over the content area
              // on another tab, it tries to interact with the Mapbox map and that causes errors because it's not visible.
              // This does mean that the following components won't be rendered until the tab is selected, so there could
              // be some flickering, slower performance, etc. Switching to the Map tab for example now takes longer.
              (this.props.activeTab === 3) ? (
              <ContainerDimensions>
                {({ width }) => (
                  <Map
                    width={width}
                    height={mapHeight}
                    label="Messages Delivered"
                    data={this.props.data.directMessagesByOrganization}
                    groupKey={'organization'}
                    countKey={'messagesDelivered'}
                  />
                )}
              </ContainerDimensions>
              ):null
            }
            </Tab>
          </Tabs>
        </Spinner>
      </div>
    );
  }
}

const query = gql`
  query hieQuery($startDate: String, $endDate: String, $organization: String) {
    hie {
      directMessagesAggregate(startDate: $startDate, endDate: $endDate, organization: $organization) {
        date
        month
        year
        messagesOriginated
        messagesDelivered
      }
      directMessagesByUser(startDate: $startDate, endDate: $endDate, organization: $organization) {
        date
        month
        year
        user
        organization
        messagesSent
      }
      directMessagesByOrganization(startDate: $startDate, endDate: $endDate, organization: $organization) {
        date
        month
        year
        messagesDelivered
        organization
      }
    }
    organization {
      list {
        id
        directDomain
        name
        gisLat
        gisLng
      }
    }
  }
`;

const graphqlVariables = (/* props: */ { filters }) => ({
  variables: {
    startDate: filters.startDate,
    endDate: filters.endDate,
    organization: filters.organization
  }
});

const graphqlTransform = ({ ownProps, data }) => {
  let messagesByUser = [];
  let directMessagesByOrganization = [];
  let directMessagesAggregate = [];

  if (!data.loading && data.hie) {
    //console.log(data);

    // Format user name to remove @domain
    messagesByUser = data.hie.directMessagesByUser.map(e => {
      // lookup org name from `organizations` array by domain name
      const org = find(data.organization.list, { directDomain: e.organization });
      return {
        ...e,
        user: e.user.replace(/@.*/i, ''),
        date: format(new Date(e.date), 'MM/DD/YYYY'),
        name: org ? org.name : null
      };
    });

    // Format date to just use month/year because thes are monthly reports
    directMessagesByOrganization = data.hie.directMessagesByOrganization.map(e => {
      // lookup org lat/lng from `organizations` array by domain name
      // {"coordinates":[-86.19729232788093, 32.071439589317855],"name":"Alabama TEST","class":"LL5","mass":"700","year":2001},
      const org = find(data.organization.list, function(o) {
        return e.organization === o.directDomain;
      });
      return {
        ...e,
        date: format(new Date(e.date), 'MM/YYYY'),
        name: org ? org.name : null,
        coordinates: [org ? org.gisLng : 0, org ? org.gisLat : 0]
      };
    });

    directMessagesAggregate = data.hie.directMessagesAggregate.map(m => {
      return {
        ...m,
        date: format(new Date(m.date), 'MM/YYYY')
      };
    });

    directMessagesAggregate = orderBy(directMessagesAggregate, ['date'], ['asc']);
  }

  return {
    data: {
      loading: data.loading,
      messagesByUser,
      directMessagesByOrganization,
      directMessagesAggregate
    }
  };
};

export default graphql(query, {
  options: graphqlVariables,
  props: graphqlTransform
})(DirectSecureMessagesDetailView);
