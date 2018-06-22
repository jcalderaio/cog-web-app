import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import GraphQLProvider from 'providers/GraphQL';
import {Responsive, WidthProvider} from 'react-grid-layout';
import ResponsiveWidget from 'widgets/ResponsiveWidget';
import WidgetHeader from 'widgets/WidgetHeader';
import BackLink from 'components/BackLink';
import RadarChartWidget from 'visualizations/RadarChart';
import ScatterChartWidget from 'visualizations/ScatterChart';
import ComposedChartWidget from 'visualizations/ComposedChart';
// import { Constants as ColorConstants } from 'visualizations/common/colorControls';
import { RotatedMonthTick } from 'visualizations/common/CustomAxisTick';
import DashboardFilter from 'components/DashboardFilter';
// import PuertoRicoRegionsFilter from 'components/dashboardFilters/PuertoRicoRegions';
import GenderFilter from 'components/dashboardFilters/Gender';
import YearFilter from 'components/dashboardFilters/Year';
// import MonthFilter from 'components/dashboardFilters/Month';
import CustomLabel from 'visualizations/common/CustomLabel';
import PubSub from 'pubsub-js';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import obj2arg from 'graphql-obj2arg';
import _ from 'lodash';
import { Label } from 'recharts';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

@observer class W15Dashboard extends Component {

  // Holds the query results and other such state (mobx as an alternative to setState).
  @observable W15 = {query: null};

  token = null;

  constructor(props) {
    super(props);
    this.state = {};
    this.getQuery = this.getQuery.bind(this);
  }

  componentDidMount(){
    // PubSub and mobx are being used as an alternative to redux connect() which led 
    // to multiple state updates which led to multiple GraphQL query server requests
    // and re-renders which looked bad. There's a lot less boilerplate code and a lot
    // more control over things with this.
    //
    // Any time the DASHBOARD_FILTER_UPDATE message is passed, be sure to
    // adjust this.BMIAssessment.query so that the GraphQLProvider can have
    // its props updated and the visualization can re-render with new data.
    this.token = PubSub.subscribe('DASHBOARD_FILTER_UPDATE', (msg, data) => {
      // console.log('Received filter update:', data);
      this.W15.query = this.getQuery(data)
    });

    // Query on initial load:
    // Typically, each visualization would be its own component subscribed to DASHBOARD_FILTER_UPDATE
    // Each with their own query. So then each of those get sent to the server.
    // In other words this component becomes a container component and several <GraphQLProviders> are used.
    //
    // The hard part about the query being here is on direct page load/reload/hotload it won't catch this event.
    // So it won't make the query.
    // If this.W15.query = this.getQuery() is set here it will work...
    // HOWEVER, on route change (coming from another tab), it WILL then see the message and this.W15
    // will be set a second time. So that will double query.
    //
    // forUpdate() works...if maybe a little ugly.
    this.W15.query = this.getQuery()
  }

  componentWillUnmount() {
    // Remove the listener/subscriber.
    PubSub.unsubscribe(this.token);
  }

  onBreakpointChange(breakpoint, cols) {
    // console.log('onBreakpointChange', breakpoint, cols);
    // this.setState({breakpoint: breakpoint, cols: cols});
  };

  onLayoutChange(layout) {
    // console.log('onLayoutChange', layout);
    // this.setState({layout: layout});
  };

  // Get the query (including filter conditions if any) for data to be provided to all widgets on this dashboard
  getQuery(newFilters) {
    // console.log('building query', this.props.filters)
    const propFilters = {};
    if (newFilters) {
      newFilters.forEach((value, key, map) => {
        propFilters[key] = value;
      });
    }

    // NOTE: month, year, and serviceRegion filtering are now disabled because GraphQL responses are mocked.
    // Not all possible filter combinations are mocked. This prevents widgets from not rendering any data when using
    // filter settings without mocked responses.
    // This dashbord is deprecated and will ultimately be removed or re-built.
    // What is mocked?
    // ONLY 2016, both male and female.
    // No service regions, no other years, no months, etc.
    // Found here:
    // hie-datavis/public/mock/6f575a9217890ba0f45f35a7387da6ca7c69cde78dca314ff4b6bc1408bd8f59.json
    // hie-datavis/public/mock/294afdf1e417f2cc76ff8bf9e04925a26521f9e6a74ae004b0a7f14b48b419c7.json
    propFilters.month = null;
    propFilters.year = 2016;
    propFilters.serviceRegion = null;

    let filters = obj2arg(propFilters, {keepNulls: false, noOuterBraces: true});
    if(filters) {
      filters = `(${filters})`;
    }

    // these filters have no gender arg
    let hedisMonthlyComplianceFilters = obj2arg({
      month: propFilters.month,
      year: propFilters.year,
      gender: propFilters.gender,
      serviceRegion: propFilters.serviceRegion,
      // always this code for this dashboard
      code: 'W15'
    }, {keepNulls: false, noOuterBraces: true});
    hedisMonthlyComplianceFilters = `(${hedisMonthlyComplianceFilters})`;    
    
    const query = `
    {
      wellChildVisits${filters} {
        visits
        total
        pcp
        nonpcp
      }
      wellChildVisitsByMonth${filters} {
        visits
        total
        pcp
        month
        year
      }
      wellChildHeadCircumference${filters} {
        total
        zika
        circumference
        age
        gender
      }
      wellChildMonthlyZikaVsHedis${hedisMonthlyComplianceFilters} {
        total
        completed
        percentageCompleted
        incomplete
        zikaCases
        month
        year
        code
      }
      wellChildMonthlyZika${filters} {
        total
        zika
        nonzika
        year
        month
      }
      wellChildWeight${filters} {
        age
        weight
        total
        zika
        gender
      }
      wellChildLength${filters} {
        age
        length
        total
        zika
        gender
      }
    }
    `;
    // console.log('NEW QUERY: ', query);
    return query;
  }

  // need to combine some data sets
  afterGraphQLFetch(result) {
    const hedisTrendByMonth = result['wellChildMonthlyZikaVsHedis'];
    const visitsByMonth = result['wellChildVisitsByMonth'];
    
    const newData = [];
    hedisTrendByMonth.forEach((measure) => {
      const combined = measure;
      // add the wellchild visits
      visitsByMonth.forEach((visit) => {        
        if(visit.month === combined.month && visit.year === combined.year) {
          combined[visit.visits] = visit.total;
        }
      });
      newData.push(combined);
    });
    // console.log('new combined result set', newData);
    result['trendVsVisit'] = newData;

    // break up single result into multiple series for scatter chart
    const wellChildHeadCircumference_zika_m = [];
    const wellChildHeadCircumference_nonzika_m = [];
    const wellChildHeadCircumference_zika_f = [];
    const wellChildHeadCircumference_nonzika_f = [];
    result['wellChildHeadCircumference'].forEach((record) => {
      record.circumference = Math.round(record.circumference * 10) / 10;
      if(record.gender === 'M') {
        if(record.zika) {
          wellChildHeadCircumference_zika_m.push(Object.assign({z: record.total}, record));
        } else {
          wellChildHeadCircumference_nonzika_m.push(Object.assign({z: record.total}, record));
        }
      }
      if(record.gender === 'F') {
        if(record.zika) {
          wellChildHeadCircumference_zika_f.push(Object.assign({z: record.total}, record));
        } else {
          wellChildHeadCircumference_nonzika_f.push(Object.assign({z: record.total}, record));
        }
      }
    });
    // now becomes an object
    result['wellChildHeadCircumference'] = {
      wellChildHeadCircumference_zika_m: _.sortBy(wellChildHeadCircumference_zika_m, 'age'),
      wellChildHeadCircumference_nonzika_m: _.sortBy(wellChildHeadCircumference_nonzika_m, 'age'),
      wellChildHeadCircumference_zika_f: _.sortBy(wellChildHeadCircumference_zika_f, 'age'),
      wellChildHeadCircumference_nonzika_f: _.sortBy(wellChildHeadCircumference_nonzika_f, 'age')
    }
    // console.log(result['wellChildHeadCircumference']);

    // same thing for weight and length
    const wellChildLength_zika_m = [];
    const wellChildLength_zika_f = [];
    const wellChildLength_nonzika_m = [];
    const wellChildLength_nonzika_f = [];
    result['wellChildLength'].forEach((record) => {
      record.length = Math.round(record.length);
      if(record.gender === 'M') {
        if(record.zika) {
          wellChildLength_zika_m.push(Object.assign({z: record.total}, record));
        } else {
          wellChildLength_nonzika_m.push(Object.assign({z: record.total}, record));
        }
      }
      if(record.gender === 'F') {
        if(record.zika) {
          wellChildLength_zika_f.push(Object.assign({z: record.total}, record));
        } else {
          wellChildLength_nonzika_f.push(Object.assign({z: record.total}, record));
        }
      }
    });
    // now becomes an object
    result['wellChildLength'] = {
      wellChildLength_zika_m,
      wellChildLength_zika_f,
      wellChildLength_nonzika_m,
      wellChildLength_nonzika_f
    }

    const wellChildWeight_zika_m = [];
    const wellChildWeight_zika_f = [];
    const wellChildWeight_nonzika_m = [];
    const wellChildWeight_nonzika_f = [];
    result['wellChildWeight'].forEach((record) => {
      record.weight = Math.ceil(record.weight*2)/2;
      if(record.gender === 'M') {
        if(record.zika) {
          wellChildWeight_zika_m.push(Object.assign({z: record.total}, record));
        } else {
          wellChildWeight_nonzika_m.push(Object.assign({z: record.total}, record));
        }
      }
      if(record.gender === 'F') {
        if(record.zika) {
          wellChildWeight_zika_f.push(Object.assign({z: record.total}, record));
        } else {
          wellChildWeight_nonzika_f.push(Object.assign({z: record.total}, record));
        }
      }
    });
    // now becomes an object
    result['wellChildWeight'] = {
      wellChildWeight_zika_m,
      wellChildWeight_zika_f,
      wellChildWeight_nonzika_m,
      wellChildWeight_nonzika_f
    }

    return result;
  }

  render() {
    const layouts = { lg: [
      { i: 'a', x: 0, y: 0, w: 6, h: 3, static: true },
      { i: 'b', x: 6, y: 0, w: 6, h: 3, minH: 3, static: true },
      { i: 'c', x: 0, y: 3, w: 6, h: 3, static: true },
      { i: 'd', x: 6, y: 3, w: 6, h: 3, static: true },
      { i: 'e', x: 0, y: 6, w: 6, h: 3, static: true },
      { i: 'f', x: 6, y: 6, w: 6, h: 3, static: true }
    ] };
    // const colors = ColorConstants.scheme;
    
    // Each of the scatter charts in this case use the same props for their XAxis component
    const scatterXAxis = {
      dataKey: 'age',
      type: 'number',
      // label: "age mo.",
    };
    const scatterXAxisLabel = (<Label
      value="age mo."
      style={{fill: "rgb(102, 102, 102)"}}
      offset={0}
      position="insideBottom"
    />);

    // head size scatter chart settings.
    // TODO: Find maybe a nicer way to set this...?? I suppose the query would return
    // fields with generic x, y, z keys?
    const headSizeYAxis = {
      // dataKey: 'total',
      dataKey: 'circumference',
      unit: 'cm',
      name: 'circumference',
      // label: 'cm',
      domain: ['dataMin', 'auto']
    };
    const headSizeZAxis = {
      dataKey: 'z',
      name: 'children',
      range: [50, 1000],
      scale: 'auto'
    };
    const headSizeScatterSeries = [
      // {
      //   name: 'Total Population',
      //   dataKey: 'wellChildHeadCircumference_total'
      // },
      {
        name: 'Zika (male)',
        dataKey: 'wellChildHeadCircumference_zika_m',
        fill: 'rgba(255, 0, 0, 0.5)',
        shape: 'cross',
        legendPayload: {
          dataKey: 'wellChildHeadCircumference_zika_m',

          value: 'item name', type: 'line'
        }
      },
      {
        name: 'Non-Zika (male)',
        dataKey: 'wellChildHeadCircumference_nonzika_m',
        fill: 'rgba(31, 119, 180, 0.5)',
        shape: 'cross'
      },
      {
        name: 'Zika (female)',
        dataKey: 'wellChildHeadCircumference_zika_f',
        fill: 'rgba(255, 0, 0, 0.5)',
        shape: 'triangle'
      },
      {
        name: 'Non-Zika (female)',
        dataKey: 'wellChildHeadCircumference_nonzika_f',
        fill: 'rgba(31, 119, 180, 0.5)',
        shape: 'triangle'
      }
    ];
    // This will define a content prop function that will allow greater control over the legend.
    // Used to adjust the corresponding shape for each series.
    // TODO: This. Though this isn't completely working because the click handler gets lost.
    // Which then doesn't allow each series to be toggled by clicking the legend item. Somehow
    // that click handler has to be added back.
    /*const headSizeScatterLegendProps = {
      content: (props) => {
        const { payload } = props;
        return (
          <ul>
            {
              payload.map((entry, index) => (
                <li key={`item-${index}`}>{entry.value} FOO</li>
              ))
            }
          </ul>
        );
      }
    };*/
    
    const radarSeries = [
      {name: 'Seen by PCP', dataKey: 'pcp', stroke: '#82ca9d', fill: '#82ca9d', fillOpacity: 0.3},
      {name: 'Other', dataKey: 'nonpcp', stroke: '#8884d8', fill: '#8884d8', fillOpacity: 0.3}
    ];

    // for the line chart graphing compliance
    
    const hedisMonthlyComplianceSeries = [
      {
        composedType: 'bar',
        yAxisId: "hedisCompliance",
        name: 'HEDIS Compliance %',
        fill: '#1f77b4',
        label: CustomLabel('bar', function(val){ return `${Number(val).toPrecision(2)}%`; }),
        dataKey: 'percentageCompleted'
      },
      {
        composedType: 'line',
        name: 'Zika Diagnoses',
        dataKey: 'zikaCases',
        fill: '#ff7f0e',
        strokeWidth: 2,
        stroke: '#ff7f0e'}
    ];

    // for the composed chart HEDIS Trend vs. Well Child Visits
    const hedisTrendSeries = [
      {composedType: 'bar', stackId: 'h', dataKey: 'incomplete', name: 'Target Population'},
      {composedType: 'bar', stackId: 'h', dataKey: 'completed', name: 'Eligible Population'},
      {composedType: 'line', name: '0 Visits', dataKey: '0', strokeWidth: 2, yAxisId: 'visits'},
      {composedType: 'line', name: '1 Visit', dataKey: '1', strokeWidth: 2, yAxisId: 'visits'},
      {composedType: 'line', name: '2 Visits', dataKey: '2', strokeWidth: 2, yAxisId: 'visits'},
      {composedType: 'line', name: '3 Visits', dataKey: '3', strokeWidth: 2, yAxisId: 'visits'},
      {composedType: 'line', name: '4 Visits', dataKey: '4', strokeWidth: 2, yAxisId: 'visits'},
      {composedType: 'line', name: '5 Visits', dataKey: '5', strokeWidth: 2, yAxisId: 'visits'},
      {composedType: 'line', name: '6+ Visits', dataKey: '6+', strokeWidth: 2, yAxisId: 'visits'}
    ];

    // weight and length
    const weightScatterSeries = [
      {
        name: 'Non-Zika (male)',
        dataKey: 'wellChildWeight_nonzika_m',
        fill: 'rgba(31, 119, 180, 0.5)',
        shape: 'cross'
      },
      {
        name: 'Non-Zika (female)',
        dataKey: 'wellChildWeight_nonzika_f',
        fill: 'rgba(31, 119, 180, 0.5)',
        shape: 'triangle'
      },
      {
        name: 'Zika (male)',
        dataKey: 'wellChildWeight_zika_m',
        fill: 'rgba(255, 0, 0, 0.5)',
        shape: 'cross'
      },
      {
        name: 'Zika (female)',
        dataKey: 'wellChildWeight_zika_f',
        fill: 'rgba(255, 0, 0, 0.5)',
        shape: 'triangle'
      }
    ];
    const weightYAxis = {
      // dataKey: 'total',
      dataKey: 'weight',
      unit: 'kg',
      name: 'weight',
      // label: 'kg',
      domain: ['dataMin', 'auto']
    };
    const lengthScatterSeries = [
      {
        name: 'Non-Zika (male)',
        dataKey: 'wellChildLength_nonzika_m',
        fill: 'rgba(31, 119, 180, 0.5)',
        shape: 'cross'
      },
       {
        name: 'Non-Zika (female)',
        dataKey: 'wellChildLength_nonzika_f',
        fill: 'rgba(31, 119, 180, 0.5)',
        shape: 'triangle'
      },
      {
        name: 'Zika (male)',
        dataKey: 'wellChildLength_zika_m',
        fill: 'rgba(255, 0, 0, 0.5)',
        shape: 'cross'
      },
      {
        name: 'Zika (female)',
        dataKey: 'wellChildLength_zika_f',
        fill: 'rgba(255, 0, 0, 0.5)',
        shape: 'triangle'
      }
    ];
    const lengthYAxis = {
      dataKey: 'length',
      unit: 'cm',
      name: 'length',
      // label: 'cm',
      domain: ['dataMin', 'auto']
    };

    return (
      <div>
        <div id="page-header">
          <h2 className="page-heading">Well Child Visits in the First 15 Months of Life</h2>
          <BackLink />
        </div>
        <DashboardFilter>
          <YearFilter initialValue={2016} min={2016} max={2016} />
          { /* <MonthFilter /> */ }
          <GenderFilter />
          { /* <PuertoRicoRegionsFilter /> */ }
        </DashboardFilter>
        <GraphQLProvider query={this.W15.query} providerService={'mock'} afterFetch={this.afterGraphQLFetch}>
          <ResponsiveReactGridLayout
            className="layout"
            breakpoints={{ lg: 1200, md: 952, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 6, sm: 6, xs: 6 }}
            layouts={layouts}>

            <ResponsiveWidget key={'a'}>
                <WidgetHeader
                title="Number of Visits" />
                <RadarChartWidget axisDataKey={'visits'} series={radarSeries} resultDataKey={'wellChildVisits'} />
            </ResponsiveWidget>

            <ResponsiveWidget key={'b'}>
                <WidgetHeader
                title="Head Size Correlation" />
                <ScatterChartWidget
                  scatterChartProps={{margin: {top: 24, right: 60}}}
                  resultDataKey={'wellChildHeadCircumference'}
                  grid={true}
                  xAxisLabel={scatterXAxisLabel}
                  series={headSizeScatterSeries}
                  xAxis={scatterXAxis}
                  yAxis={headSizeYAxis}
                  zAxis={headSizeZAxis}
                />
            </ResponsiveWidget>

            <ResponsiveWidget key={'c'}>
                <WidgetHeader
                title="Compliance vs. Zika" />
                <ComposedChartWidget
                  resultDataKey={'wellChildMonthlyZikaVsHedis'}
                  series={hedisMonthlyComplianceSeries}
                  scaleFields={[]}
                  currentScaleField={'month'}
                  xAxisProps={{tick: React.createFactory(RotatedMonthTick(-35))}}
                  secondYAxisProps={{
                      orientation: "right",
                      yAxisId: "hedisCompliance",
                      tick: {fill: '#1f77b4'},
                      tickFormatter: (tick) => { return `${tick}%`; },
                      dataKey: "percentageCompleted"}}
                  yAxisProps={{orientation: "left", tick: {fill: '#ff7f0e'}, dataKey: "zikaCases"}}
                />
            </ResponsiveWidget>

            <ResponsiveWidget key={'d'}>
                <WidgetHeader
                title="HEDIS Trend Graph" />
                <ComposedChartWidget
                  resultDataKey={'trendVsVisit'}
                  series={hedisTrendSeries}
                  scaleFields={[]}
                  currentScaleField={'month'}
                  xAxisProps={{tick: React.createFactory(RotatedMonthTick(-35))}}
                  secondYAxisProps={{
                      orientation: "right",
                      yAxisId: "visits"
                      }}
                />
            </ResponsiveWidget>

            <ResponsiveWidget key={'e'}>
                <WidgetHeader
                title="Weight Correlation" />
                <ScatterChartWidget
                  resultDataKey={'wellChildWeight'}
                  series={weightScatterSeries}
                  grid={true}
                  xAxisLabel={scatterXAxisLabel}
                  xAxis={scatterXAxis}
                  yAxis={weightYAxis}
                  zAxis={headSizeZAxis}
                />
            </ResponsiveWidget>

            <ResponsiveWidget key={'f'}>
                <WidgetHeader
                title="Length Correlation" />
                <ScatterChartWidget
                  resultDataKey={'wellChildLength'}
                  series={lengthScatterSeries}
                  grid={true}
                  xAxisLabel={scatterXAxisLabel}
                  xAxis={scatterXAxis}
                  yAxis={lengthYAxis}
                  zAxis={headSizeZAxis}
                />
            </ResponsiveWidget>
            
          </ResponsiveReactGridLayout>
        </GraphQLProvider>
      </div>
    );
  }

}

// Defines the default props
W15Dashboard.defaultProps = {
  filters: {}
};

// Defines propTypes
W15Dashboard.propTypes = {
  filters: PropTypes.object
};

export default W15Dashboard;