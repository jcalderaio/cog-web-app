import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import LineChartVisualization from 'visualizations/LineChart';
import TreeMap from './TreeMap';
import ReactTable from 'react-table';
import { CSVLink } from 'react-csv';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { orderBy } from 'lodash';
import { endOfMonth, isBefore, format } from 'date-fns';
import { monthsBetween, yyyymmdd } from 'utils/dateUtils';
import { zeroFillDateRange } from 'visualizations/common/dataFormatter';
import Spinner from 'components/Spinner.jsx';

// import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
// import ContainerDimensions from 'react-container-dimensions';

import '../../../../../../assets/sass/global/_react-table.scss';

export class StreamletsByFacilityDetailView extends Component {
  constructor(props) {
    super(props);

    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  state = {};

  handleSelectTab(key) {
    this.props.updateActiveTab(key);
  }

  get columns() {
    return [
      {
        Header: 'Gateway',
        accessor: 'gateway'
      },
      {
        Header: 'Facility',
        accessor: 'facility'
      },
      {
        Header: 'Streamlet Type',
        accessor: 'type'
      },
      {
        Header: 'Streamlet Count',
        accessor: 'count'
      }
    ];
  }

  transformTreeMap(filteredRecords) {
    let facilityArr = [];
    filteredRecords.filter(e => {
      if (!facilityArr.includes(e.facility)) {
        facilityArr.push(e.facility);
      }
    });

    // Here is the final array of objects that will be read by the TreeMap
    var treeMap = []; // Stores the nodes of the tree type
    var nodeObj = {}; // Each node stores the name of the facility

    facilityArr.map(e => {
      // Filters the list for current facility
      var filteredArr = []; // stores the array for each facility
      filteredRecords.filter(f => {
        // filters the entire list of records by the current facility and adds to filteredArr
        if (f['facility'] === e) {
          filteredArr.push(f);
        }
      });

      if (filteredArr.length > 0) {
        // Add facility to name of node
        nodeObj = {};
        nodeObj['name'] = e;

        // Adds up all types for the list
        var result = [];
        filteredArr.forEach(function(a) {
          if (!this[a.type]) {
            this[a.type] = { name: a.type, size: 0 }; // Counts up each type of streamlet
            result.push(this[a.type]);
          }
          this[a.type].size += a.count;
        }, Object.create(null));

        nodeObj['children'] = result;
        treeMap.push(nodeObj);
      }
    });

    // Returns the facility array and the treeMap data
    return {
      treeMap,
      facilityArr
    };
  }

  monthlyDocumentsCount(documents, startDate, endDate) {
    return monthsBetween(startDate, endDate).map(month => ({
      month: format(month, 'MM/YYYY'),
      count: documents.filter(document => isBefore(document.created, endOfMonth(month))).length
    }));
  }

  filteredRecords(records, endDate) {
    if (records) {
      return records.filter(record => isBefore(record.date, endOfMonth(endDate)));
    }
  }

  csvData(filteredDocuments) {
    if (filteredDocuments) {
      const csvHeaders = this.columns.map(e => e.Header);
      const csvAccessors = this.columns.map(e => e.accessor);

      return [csvHeaders, ...filteredDocuments.map(e => csvAccessors.map(a => e[a]))];
    }
  }

  render() {
    // let startDate = this.props.filters.startDate;
    // let endDate = this.props.filters.endDate;

    // table records for streamlets
    let records = this.props.data.streamlets;
    //let filteredRecords = this.filteredRecords(records, endDate);
    let csvData = this.csvData(records);

    console.log('Records Before Tree Transform: ', records);
    // Takes the filtered records from the filter, and transforms it into
    // a data type that can be read by the TreeMap
    let treeMapData = this.transformTreeMap(records);

    console.log('Tree Map Data: ', treeMapData);

    const streamletsCount = zeroFillDateRange(this.props.data.streamletsCount || [], {
      acc: 'cumulative',
      start: this.props.filters.startDate,
      end: this.props.filters.endDate,
      // fill using last value (ie. for cumulative/running total situations)
      fillLast: true
    }).map(e => ({
      date: format(new Date(e._zeroFillDateRange), 'MM/YYYY'),
      cumulative: e.cumulative
    }));
    // console.log('streamletsCount', streamletsCount);

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
                seriesKeys={[{ cumulative: 'streamlets' }]}
                data={streamletsCount}
                widgetWidth={this.props.widgetWidth}
                widgetHeight={this.props.widgetHeight}
              />
            </Tab>
            <Tab eventKey={2} title="Data">
              <ReactTable data={records} columns={this.columns} defaultPageSize={10} />
              <br />
              <CSVLink
                data={csvData}
                filename={'streamlets_by_facility.csv'}
                className="btn btn-primary"
                target="_blank"
              >
                Download CSV
              </CSVLink>
            </Tab>
            <Tab eventKey={3} title="Tree">
              <TreeMap
                width={this.props.widgetWidth - 32}
                height={this.props.widgetHeight - 102}
                data={treeMapData.treeMap}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                facilityLength={treeMapData.facilityArr.length}
                properties={this.props}
              />
            </Tab>
          </Tabs>
        </Spinner>
      </div>
    );
  }
}

const query = gql`
  query hieQuery($startDate: String!, $endDate: String!, $facility: String, $type: String, $gateway: String) {
    hie {
      streamlets {
        list(startDate: $startDate, endDate: $endDate, type: $type, facility: $facility, gateway: $gateway) {
          facility
          gateway
          type
          count
        }
        history(startDate: $startDate, endDate: $endDate, type: $type, facility: $facility, gateway: $gateway) {
          month
          year
          count
          cumulative
        }
      }
    }
  }
`;

const graphqlVariables = (/* props: */ { filters }) => ({
  variables: {
    startDate: yyyymmdd(filters.startDate),
    endDate: yyyymmdd(filters.endDate),
    facility: filters.organization,
    type: filters.type,
    gateway: filters.gateway
  }
});

const graphqlTransform = ({ ownProps, data }) => {
  let streamlets = [];
  let streamletsCount = [];

  if (!data.loading && data.hie && data.hie.streamlets && data.hie.streamlets.list) {
    let prev = 0;
    streamlets = data.hie.streamlets.list.map(e => {
      const transformed = {
        ...e,
        cumulative: e.count + prev
      };
      prev += e.count;
      return transformed;
    });
    // streamlets = _.orderBy(streamlets, ['_date'], ['asc']);
    // console.log('STREAMLETS:', streamlets)

    streamletsCount = data.hie.streamlets.history.map(e => {
      return {
        ...e,
        date: format(new Date(e.year, e.month - 1, 1), 'MM/DD/YYYY'),
        _date: new Date(e.year, e.month - 1, 1)
      };
    });
    streamletsCount = orderBy(streamletsCount, ['_date'], ['asc']);
  }

  return {
    data: {
      loading: data.loading,
      streamlets,
      streamletsCount
    }
  };
};

export default graphql(query, {
  options: graphqlVariables,
  props: graphqlTransform
})(StreamletsByFacilityDetailView);
