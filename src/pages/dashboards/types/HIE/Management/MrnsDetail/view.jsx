// apollo
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// react
import React, { PureComponent } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import LineChartVisualization from '../../../../../../components/visualizations/LineChart/index.jsx';
import { CSVLink } from 'react-csv';
import ReactTable from 'react-table';
import Spinner from '../../../../../../components/Spinner.jsx';
import ContainerDimensions from 'react-container-dimensions';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import Map from '../../../../../../components/visualizations/Map/index.jsx';

// date functions
import { format } from 'date-fns';
import { monthsBetween, yyyymmdd } from '../../../../../../utils/dateUtils';

// CSS
import '../../../../../../assets/sass/global/_react-table.scss';

// named export for testing w/o hoc
export class MrnsDetailView extends PureComponent {
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
        Header: 'Organization',
        accessor: 'organization'
      },
      {
        Header: 'Address',
        accessor: 'address'
      },
      {
        Header: 'City',
        accessor: 'city'
      },
      {
        Header: '# MRNs',
        accessor: 'count'
      }
    ];
  }

  csvData(filteredUsers) {
    const csvHeaders = this.columns.map(e => e.Header);
    const csvAccessors = this.columns.map(e => e.accessor);

    return [csvHeaders, ...filteredUsers.map(e => csvAccessors.map(a => e[a]))];
  }

  render() {
    let monthly_counts = this.props.data ? this.props.data.monthly_counts : [];
    let organization_counts = this.props.data ? this.props.data.organization_counts : [];

    let csvData = this.csvData(organization_counts);

    // map
    const height = DashboardLayout.DEFAULT_ROW_HEIGHT * 6 - 60;

    let map_data = organization_counts.filter(e => e.gisLat && e.gisLng).map(e => ({
      name: e.organization,
      count: e.count,
      coordinates: [e.gisLng, e.gisLat]
    }));

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
                seriesKeys={[{ count: 'MRNs' }]}
                data={monthly_counts}
                widgetWidth={this.props.widgetWidth}
                widgetHeight={this.props.widgetHeight}
              />
            </Tab>

            <Tab eventKey={2} title="Data">
              <ReactTable
                data={organization_counts}
                columns={this.columns}
                defaultPageSize={10}
                className="-striped -highlight"
              />
              <br />
              <CSVLink data={csvData} filename={'mrns_detail.csv'} className="btn btn-primary" target="_blank">
                Download CSV
              </CSVLink>
            </Tab>

            <Tab eventKey={3} title="Map">
              <ContainerDimensions>
                {({ width }) => (
                  <Map
                    width={width}
                    height={height}
                    label="MRNs"
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
  query hieQuery($startDate: String!, $endDate: String!, $organization: String, $city: String) {
    hie {
      mrns {
        byMonth(startDate: $startDate, endDate: $endDate, organization: $organization, city: $city) {
          month
          count
        }
        byOrganization(startDate: $startDate, endDate: $endDate, organization: $organization, city: $city) {
          organization
          address
          city
          gisLng
          gisLat
          count
        }
      }
    }
  }
`;

const graphqlSkip = (/* props: */ { filters }) => {
  return filters.startDate ? false : true;
};

const graphqlVariables = (/* props: */ { filters }) => {
  return {
    variables: {
      startDate: yyyymmdd(filters.startDate),
      endDate: yyyymmdd(filters.endDate),
      organization: filters.organization,
      city: filters.city
    }
  };
};

const graphqlTransform = ({ ownProps, data }) => {
  if (data.loading) {
    return {
      data: {
        loading: true,
        monthly_counts: [],
        organization_counts: []
      }
    };
  }

  let month_counts = data && data.hie && data.hie.mrns && data.hie.mrns.byMonth ? data.hie.mrns.byMonth : [];

  // sparse array [ {month: 'YYYY/MM/DD', count: 0} ] to hash { 'YYYY/MM/DD': count }
  const sparseMonthlyCounts = month_counts.reduce((m, e) => {
    m[e.month] = e.count;
    return m;
  }, {});

  let cumulativeTotal = sparseMonthlyCounts['before'] || 0;

  const denseMonthlyCounts = monthsBetween(ownProps.filters.startDate, ownProps.filters.endDate).map(m => {
    cumulativeTotal += sparseMonthlyCounts[yyyymmdd(m)] || 0;

    return {
      month: format(m, 'MM/YYYY'),
      count: cumulativeTotal
    };
  });

  // eslint-disable-next-line max-len
  const organization_counts =
    data && data.hie && data.hie.mrns && data.hie.mrns.byOrganization ? data.hie.mrns.byOrganization : [];

  return {
    data: {
      monthly_counts: denseMonthlyCounts,
      organization_counts: organization_counts
    }
  };
};

export default graphql(query, {
  skip: graphqlSkip,
  options: graphqlVariables,
  props: graphqlTransform
})(MrnsDetailView);
