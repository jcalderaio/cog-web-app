// apollo
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// react
import React, { PureComponent } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ContainerDimensions from 'react-container-dimensions';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import LineChartVisualization from '../../../../../../components/visualizations/LineChart/index.jsx';
import Spinner from '../../../../../../components/Spinner.jsx';
import Map from '../../../../../../components/visualizations/Map/index.jsx';
import DataTable from '../../../../../../components/DataTable';

// date functions
import { endOfMonth, isBefore, compareAsc, format } from 'date-fns';
import { yyyymmdd, monthsBetween } from '../../../../../../utils/dateUtils';

// CSS
import '../../../../../../assets/sass/global/_react-table.scss';

// named export for testing w/o hoc
export class RegisteredUsersDetailView extends PureComponent {
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
        Header: 'Month',
        accessor: 'created'
      },
      {
        Header: 'Organization Name',
        accessor: 'orgName'
      },
      {
        Header: 'Users',
        accessor: 'users',
        sortMethod: (a, b) => {
          return compareAsc(a, b);
        }
      }
    ];
  }

  filteredUsers(users, endDate) {
    return users.filter(user => isBefore(user.created, endOfMonth(endDate)));
  }

  transformColumnData(data) {
    return data.map(e => ({
      created: `${e.month}/${e.year}`,
      orgName: e.name,
      users: `${e.count}`
    }));
  }

  render() {
    let monthly_counts = this.props.data ? this.props.data.monthly_counts : [];
    let usersPerOrgPerMonth = this.props.data ? this.props.data.usersPerOrgPerMonth : [];
    let usersPerOrg = this.props.data ? this.props.data.usersPerOrg : [];

    let columnData = usersPerOrgPerMonth ? this.transformColumnData(usersPerOrgPerMonth) : [];

    let map_data = usersPerOrg.filter(e => e.gisLat && e.gisLng).map(e => ({
      name: e.name,
      count: e.count,
      coordinates: [e.gisLng, e.gisLat]
    }));

    const height = DashboardLayout.DEFAULT_ROW_HEIGHT * 6 - 60;

    return (
      <div className="panel-default content-grid-element">
        <Spinner until={this.props.data && !this.props.data.loading}>
          <Tabs
            activeKey={this.props.activeTab}
            onSelect={this.handleSelectTab}
            id="tabs-details"
            className="tabs-content"
          >
            <Tab eventKey={1} title="Trend">
              <LineChartVisualization
                xAxisKey={'month'}
                seriesKeys={[{ count: 'Registered Users' }]}
                data={monthly_counts}
                widgetWidth={this.props.widgetWidth}
                widgetHeight={this.props.widgetHeight}
              />
            </Tab>

            <Tab eventKey={2} title="Data">
              <DataTable data={columnData} columns={this.columns} />
            </Tab>

            <Tab eventKey={3} title="Map">
              <ContainerDimensions>
                {({ width }) => (
                  <Map
                    width={width}
                    height={height}
                    label="Registered Users"
                    data={map_data}
                    groupKey={'name'}
                    countKey={'count'}
                  />
                )}
              </ContainerDimensions>
            </Tab>
          </Tabs>
        </Spinner>
      </div>
    );
  }
}

const query = gql`
  query($criteria: RegisteredUsersQueryCriteria) {
    user {
      stats(criteria: $criteria) {
        usersPerMonth {
          month
          year
          count
        }
        usersPerOrgPerMonth {
          count
          month
          year
          name
        }
        usersPerOrg {
          count
          name
          gisLat
          gisLng
        }
      }
    }
  }
`;

const graphqlSkip = (/* props: */ { filters }) => {
  return filters.startDate ? false : true;
};

const graphqlVariables = (/* props: */ { filters }) => {
  //console.log('FILTERS:', filters);
  return {
    variables: {
      // organization is the sk field, not the name
      criteria: {
        orgSk: filters.organization ? filters.organization.sk : null,
        city: filters.city,
        userType: filters.userType,
        startDate: yyyymmdd(filters.startDate),
        endDate: yyyymmdd(filters.endDate)
      }
    }
  };
};

const graphqlTransform = ({ ownProps, data }) => {
  if (data.loading) {
    return {
      data: {
        loading: true,
        usersPerMonth: [],
        usersPerOrgPerMonth: [],
        usersPerOrg: []
      }
    };
  }

  let usersPerMonth =
    data && data.user && data.user.stats && data.user.stats.usersPerMonth ? data.user.stats.usersPerMonth : [];

  let usersPerOrgPerMonth =
    data && data.user && data.user.stats && data.user.stats.usersPerOrgPerMonth
      ? data.user.stats.usersPerOrgPerMonth
      : [];

  let usersPerOrg =
    data && data.user && data.user.stats && data.user.stats.usersPerOrg ? data.user.stats.usersPerOrg : [];

  // For the line chart visualization
  const sparseMonthlyCounts = usersPerMonth.reduce((m, e) => {
    m[format(new Date(`${e.year}/${e.month}/01`), 'YYYY/MM/DD')] = e.count;
    return m;
  }, {});

  let cumulativeTotal = 0;

  const denseMonthlyCounts = monthsBetween(ownProps.filters.startDate, ownProps.filters.endDate).map(m => {
    cumulativeTotal += sparseMonthlyCounts[yyyymmdd(m)] || 0;

    return {
      month: format(m, 'MM/YYYY'),
      count: cumulativeTotal
    };
  });

  return {
    data: {
      monthly_counts: denseMonthlyCounts,
      usersPerOrgPerMonth,
      usersPerOrg
    }
  };
};

export default graphql(query, {
  skip: graphqlSkip,
  options: graphqlVariables,
  props: graphqlTransform
})(RegisteredUsersDetailView);
