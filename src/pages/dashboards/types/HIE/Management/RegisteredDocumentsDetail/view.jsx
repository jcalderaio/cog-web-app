import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import LineChartVisualization from 'visualizations/LineChart';
import ReactTable from 'react-table';
import { CSVLink } from 'react-csv';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';
import { format } from 'date-fns';
import { monthsBetween, yyyymmdd } from 'utils/dateUtils';
import Spinner from 'components/Spinner.jsx';
import ContainerDimensions from 'react-container-dimensions';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import Map from '../../../../../../components/visualizations/Map';


// CSS
import '../../../../../../assets/sass/global/_react-table.scss';

export class RegisteredDocumentsDetailsView extends Component {
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
        Header: 'Registered Documents',
        accessor: 'count'
      }
    ];
  }

  monthlyDocumentCounts(count, startDate, endDate) {
    // sparse array [ {month: 'YYYY/MM/DD', count: 0} ] to hash { 'YYYY/MM/DD': count }
    count = count ? count : [];

    const sparseCounts = count.reduce((m, e) => {
      m[e.month] = e.count;
      return m;
    }, {});

    let cumulativeTotal = sparseCounts['before'] || 0;

    const denseCounts = monthsBetween(startDate, endDate).map(m => {
      cumulativeTotal += sparseCounts[yyyymmdd(m)] || 0;
      return {
        month: format(m, 'MM/YYYY'),
        count: cumulativeTotal
      };
    });

    return denseCounts;
  }

  csvData(filteredDocuments) {
    filteredDocuments = filteredDocuments ? filteredDocuments : [];

    const csvHeaders = this.columns.map(e => e.Header);
    const csvAccessors = this.columns.map(e => e.accessor);

    return [csvHeaders, ...filteredDocuments.map(e => csvAccessors.map(a => e[a]))];
  }

  render() {
    let startDate = this.props.filters.startDate;
    let endDate = this.props.filters.endDate;

    let count = this.props.data ? this.props.data.count : [];
    let monthlyDocumentCounts = this.monthlyDocumentCounts(count, startDate, endDate);

    let list = this.props.data ? this.props.data.list : [];

    // csv
    let csvData = this.csvData(list);

    // map
    let organization_counts = this.props.data ? this.props.data.list : [];

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
                seriesKeys={[{ count: 'Registered Documents' }]}
                data={monthlyDocumentCounts}
                widgetWidth={this.props.widgetWidth}
                widgetHeight={this.props.widgetHeight}
              />
            </Tab>

            <Tab eventKey={2} title="Data">
              <ReactTable data={list} columns={this.columns} defaultPageSize={10} className="-striped -highlight" />
              <br />
              <CSVLink
                data={csvData}
                filename={'registered_documents_detail.csv'}
                className="btn btn-primary"
                target="_blank"
              >
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
      documents {
        count(startDate: $startDate, endDate: $endDate, organization: $organization, city: $city) {
          month
          count
        }
        list(startDate: $startDate, endDate: $endDate, organization: $organization, city: $city) {
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

const graphqlVariables = (/* props: */ { filters }) => ({
  variables: {
    startDate: yyyymmdd(filters.startDate),
    endDate: yyyymmdd(filters.endDate),
    organization: filters.organization,
    city: filters.city
  }
});

const graphqlTransform = ({ ownProps, data }) => {
  if (data.loading) {
    return {
      data: {
        loading: true,
        count: [],
        list: []
      }
    };
  }

  const documents_count = (data.hie && data.hie.documents && data.hie.documents.count) || [];
  const documents_list = (data.hie && data.hie.documents && data.hie.documents.list) || [];

  return {
    data: {
      count: documents_count,
      list: documents_list
    }
  };
};

export default graphql(query, {
  skip: graphqlSkip,
  options: graphqlVariables,
  props: graphqlTransform
})(RegisteredDocumentsDetailsView);
