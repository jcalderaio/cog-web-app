// apollo
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// react
import React, { PureComponent } from 'react';
import { Tabs, Tab, Row, Col } from 'react-bootstrap';
import LineChartVisualization from '../../../../../../components/visualizations/LineChart';
import { CSVLink } from 'react-csv';
import ReactTable from 'react-table';
import Spinner from '../../../../../../components/Spinner.jsx';
import { compareAsc } from 'date-fns';

// recharts
import { PieChart, Pie, Cell } from 'recharts';

// date functions
import { format } from 'date-fns';
import { monthsBetween, yyyymmdd } from '../../../../../../utils/dateUtils';

// CSS
import '../../../../../../assets/sass/global/_react-table.scss';

import { withConfig } from '@cognosante/react-app';

import { Constants as ColorConstants } from 'visualizations/common/colorControls';

// named export for testing w/o hoc
export class MpiidsDetailView extends PureComponent {
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
        accessor: 'month',
        sortMethod: (a, b) => {
          return compareAsc(a, b);
        }
      },
      {
        Header: '# MPIIDs',
        accessor: 'count'
      },
      {
        Header: '% of population',
        accessor: 'percent_population'
      }
    ];
  }

  csvData(filteredData) {
    const csvHeaders = this.columns.map(e => e.Header);
    const csvAccessors = this.columns.map(e => e.accessor);

    return [csvHeaders, ...filteredData.map(e => csvAccessors.map(a => e[a]))];
  }

  render() {
    const monthly_counts = (this.props.data && this.props.data.monthly_counts) || [];

    const last_month = monthly_counts.slice(-1).pop();
    const mpiids = (last_month && last_month.count) || 0;
    const population = (this.props.data && this.props.data.population) || null;
    const percent_in_hie = (population && mpiids / population) || 0;

    const filteredData = monthly_counts.map(e => ({
      month: e.month,
      count: e.count,
      percent_population:
        population &&
        (e.count / population).toLocaleString(
          'en',
          { style: 'percent' }
        )
    }));

    const csvData = this.csvData(filteredData);

    var nf = Intl.NumberFormat();

    const state = this.props.config && this.props.config.state;

    if (!state) {
      console.warn("Please add 'state' to config-app.json");
    }

    const pieNumerator = mpiids;
    const pieDenominator = population;
    const pieNumeratorId = 'MPIIDs';
    const pieDenominatorId = `Population of ${state}`;
    const pieData = [{ name: 'In HIE', value: percent_in_hie }, { name: 'Not in HIE', value: 1.0 - percent_in_hie }];
    const pieSize = this.props.widgetWidth * 0.25;
    const pieColors = [ColorConstants.scheme(0), '#BBBBBB'];

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
                seriesKeys={[{ count: 'MPIIDs' }]}
                data={monthly_counts}
                widgetWidth={this.props.widgetWidth}
                widgetHeight={this.props.widgetHeight}
              />
            </Tab>

            <Tab eventKey={2} title="Data">
              <ReactTable
                data={filteredData}
                columns={this.columns}
                defaultPageSize={10}
                className="-striped -highlight"
              />
              <br />
              <CSVLink data={csvData} filename={'mpiids_detail.csv'} className="btn btn-primary" target="_blank">
                Download CSV
              </CSVLink>
            </Tab>

            <Tab eventKey={3} title="Summary">
              <Row className="details-tab">
                <Col sm={6}>
                  <p>
                    Number of <span className="no-wrap">{pieNumeratorId}</span> compared to{' '}
                    <span className="no-wrap">{pieDenominatorId}</span>.
                  </p>

                  <h3 className="data-value">
                    {nf.format(pieNumerator)}
                    <span>{pieNumeratorId}</span>
                  </h3>
                  <h3 className="data-value">
                    {nf.format(pieDenominator)}
                    <span>{pieDenominatorId}</span>
                  </h3>

                  <br className="visible-xs" />
                </Col>
                <Col sm={6}>
                  <PieChart width={pieSize} height={pieSize}>
                    <text
                      x={pieSize / 2}
                      y={pieSize / 2}
                      textAnchor="middle"
                      dy={pieSize / 12}
                      style={{ fontSize: pieSize / 4 }}
                    >
                      <tspan>
                        {percent_in_hie.toLocaleString(
                          'en',
                          { style: 'percent' }
                        )}
                      </tspan>
                    </text>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      fill={'#8884d8'}
                      innerRadius="70%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={450}
                    >
                      {pieData.map((entry, index) => <Cell key={index} fill={pieColors[index % pieColors.length]} />)}
                    </Pie>
                  </PieChart>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Spinner>
      </div>
    );
  }
}

const query = gql`
  query hieQuery($startDate: String!, $endDate: String!, $state: String!) {
    hie {
      mpiids {
        byMonth(startDate: $startDate, endDate: $endDate) {
          month
          count
        }
      }
      census {
        state(state: $state) {
          population
        }
      }
    }
  }
`;

const graphqlSkip = (/* props: */ { filters }) => {
  return filters.startDate ? false : true;
};

const graphqlVariables = (/* props: */ { filters, config }) => {
  return {
    variables: {
      state: config.state || 'XX',
      startDate: yyyymmdd(filters.startDate),
      endDate: yyyymmdd(filters.endDate)
    }
  };
};

const graphqlTransform = ({ ownProps, data }) => {
  if (data.loading) {
    return {
      data: {
        loading: true,
        monthly_counts: []
      }
    };
  }

  const month_counts = (data.hie && data.hie.mpiids && data.hie.mpiids.byMonth) || [];

  // sparse array [ {month: 'YYYY/MM/DD', count: 0} ] to hash { 'YYYY/MM/DD': count }
  const sparseMonthlyCounts = month_counts.reduce((m, e) => {
    m[e.month] = e.count;
    return m;
  }, {});

  // cumulative is over 24 months, so start as zero
  let cumulativeTotal = 0;

  const denseMonthlyCounts = monthsBetween(ownProps.filters.startDate, ownProps.filters.endDate).map(m => {
    cumulativeTotal += sparseMonthlyCounts[yyyymmdd(m)] || 0;

    return {
      month: format(m, 'MM/YYYY'),
      count: cumulativeTotal
    };
  });

  const population = (data.hie && data.hie.census && data.hie.census.state && data.hie.census.state.population) || null;

  return {
    data: {
      monthly_counts: denseMonthlyCounts,
      population: population
    }
  };
};

export default withConfig(
  graphql(query, {
    skip: graphqlSkip,
    options: graphqlVariables,
    props: graphqlTransform
  })(MpiidsDetailView)
);
