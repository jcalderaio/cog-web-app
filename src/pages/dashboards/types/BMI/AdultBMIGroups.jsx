import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import GraphQLProvider from 'providers/GraphQL';
import WidgetHeader from 'widgets/WidgetHeader';
import obj2arg from 'graphql-obj2arg';
import Zoom from 'visualizations/Zoom';
// import CustomLabel from 'visualizations/common/CustomLabel';
import AreaChart from 'visualizations/AreaChart';
import PubSub from 'pubsub-js';
import {observable} from 'mobx';
import {observer} from 'mobx-react';

@observer class AdultBMIGroups extends Component {

  // Holds the query results and other such state (mobx as an alternative to setState).
  @observable BMIGroups = {};

  // This component uses a visualization that can show several years and then drill down into a year.
  // We don't want that year filter to be a global dashboard filter. It should belong to the component
  // itself and not affect other visuazliations.
  @observable LocalDashboardFilterStore = {year: null};

  constructor(props) {
    super(props);
    this.state = {};
    this.getQuery = this.getQuery.bind(this);
    this.handleChartClick = this.handleChartClick.bind(this);
    this.handleZoomOutClick = this.handleZoomOutClick.bind(this);
    this.afterGraphQLFetch = this.afterGraphQLFetch.bind(this);

    this.BMIGroups = {
      query: this.getQuery(),
      xAxisKey: 'year',
      xAxisMonthFormatting: false,
      zoomLabel: 'All year(s)',
      zoomState: 0
    };

  }

  componentDidMount(){
    // PubSub as an alternative to redux connect() which led to multiple state
    // updates which led to multiple GraphQL query server requests and re-renders
    // which looked bad.
    PubSub.subscribe('DASHBOARD_FILTER_UPDATE', this.subscriber.bind(this));
  }

  componentWillUnmount() {
    // Remove the listener/subscriber.
    PubSub.unsubscribe(this.token);
  }

  subscriber(msg, data) {
    // Any time the DASHBOARD_FILTER_UPDATE message is passed, be sure to
    // adjust this.BMIGroups.query so that the GraphQLProvider can have
    // its props updated and the visualization can re-render with new data.
    this.BMIGroups.query = this.getQuery(data);
  }

  // Get the query (including filter conditions if any) for data to be provided to all widgets on this dashboard
  getQuery(filters) {
    let fromAge = 18;
    let toAge = 74;

    // const propFilters = (filters !== undefined && filters !== null) ? filters:DashboardFilterStore;
    // if(propFilters.ageRange !== undefined) {
    //   fromAge = propFilters.ageRange[0];
    //   toAge = propFilters.ageRange[1];
    // }
    
    // NOTE: This is for demo purposes. Only so many responses are mocked.
    // There's a mock GraphQL response for 18-74 and for 18-50.
    // This protects the widget from not rendering any data at all for a query not mocked.
    // This dashboard to be deprecated or re-built.
    if (toAge !== 74) {
      toAge = 50;
    }
    fromAge = 18;
    // The year will always be 2016. This is for the "zoomed" in view, month by month.
    // Only 2016 months were mocked.
    let mockYear = null;
    if (this.LocalDashboardFilterStore.year !== null) {
      mockYear = 2016;
    }
    
    let bmiFilters = obj2arg({
      // These are not mocked.
      year: mockYear,
      // year: this.LocalDashboardFilterStore.year,
      // gender: propFilters.gender,
      // serviceRegion: propFilters.serviceRegion,
      fromAge,
      toAge
    }, {keepNulls: false, noOuterBraces: true});
    //console.log('query filters', bmiFilters);
    if(bmiFilters) {
      bmiFilters = `(${bmiFilters})`;
    }
    
    const query = `
    {
      outpatientVisitsMeasures {
        bmi${bmiFilters} {
          bmi_measured,
          total_visits,
          year,
          month,
          underweight,
          normal,
          overweight,
          obese
        }
      }
    }
    `;
    // console.log('NEW QUERY: ', query);
    return query;
  }

  /**
   * After GraphQL retrieves the data, this hook will format the results
   * so that they work with the components used.
   * 
   */
  afterGraphQLFetch(result) {
    result.outpatientVisitsMeasures = result.outpatientVisitsMeasures.bmi;
    //console.log(result);


    // If more than 12, then it's for multiple years. Right now each month is
    // returned for each year. Instead this aggregate should be done server side
    // for performance reasons. For now this larger data set is returned.
    if (result.outpatientVisitsMeasures.length > 12) {
      const grouped = result.outpatientVisitsMeasures.reduce(function(acc, x) {
        const year = acc[x.year];
        if (year) {
          year.bmi_measured += x.bmi_measured;
          year.normal += x.normal;
          year.obese += x.obese;
          year.overweight += x.overweight;
          year.total_visits += x.total_visits;
          year.underweight += x.underweight;
          year.year = x.year;
          year.month = 0;
        } else {
          acc[x.year] = x
          delete x.year
        }
        return acc
      },{});

      const collection = Object.keys(grouped)
      .sort(function(x, y){return +x - +y})
      .map(function(k){return grouped[k]});
      
      result.outpatientVisitsMeasures = collection;
    }

    return result;
  }

  /**
   * Handles a click on the chart in order to adjust the query.
   * This handles the drill down functionality.
   * 
   * Note: `data` can be null depending on where the user clicked.
   * You should always check if data exists before blindly using it.
   * However `proxy` should always be set.
   * 
   * `proxy` will give you the SyntheticMouseEvent which helps with
   * targeting clicks on "DOM" elements not otherwise handled.
   * 
   * @param {Object} data  The chart click handler includes X, Y position clicked, label, and more
   * @param {Object} proxy This includes [[Target]] which should be a SyntheticMouseEvent
   */
  handleChartClick(data, proxy) {
    if (data) {
      let args = {};
      let xAxis = 'year';
      // We're after the label. This is the element in the chart that was clicked.
      // In this case, it'll be greater than 12 if it's a year. Otherwise it'll be
      // 1-12 for each month. This is specific to the data set used by this widget,
      // which is why this handler exists here and not inside the BarChartVisualization
      // component itself.
      if (data.activeLabel && data.activeLabel > 12) {
        args.year = data.activeLabel;
        xAxis = 'month';
      } else {
        xAxis = 'year';
      }
      this.LocalDashboardFilterStore.year = args.year;
      this.BMIGroups = {
        query: this.getQuery(null, args.year),
        xAxisKey: xAxis,
        xAxisMonthFormatting: true,
        zoomState: 1,
        zoomLabel: 'Month(s) for year ' + data.activeLabel
      };
    }
  }

  /**
   * Similar to `handleChartClick()` we are given the opportunity
   * to instruct the BarChartVisualization when the user clicks its,
   * optional, "zoom out" (or it could be a 'go back', etc.) button.
   * 
   * @param {String} chart   The chart or key for the state to update query, zoomLabel, etc.
   */
  handleZoomOutClick() {
    this.LocalDashboardFilterStore.year = null;
    this.BMIGroups = {
      query: this.getQuery(null, null),
      xAxisKey: 'year',
      xAxisMonthFormatting: false,
      zoomLabel: 'All year(s)',
      zoomState: 0
    };
  }

  /**
   * Returns the <Zoom /> component for use with the BarChartVisualization.
   * This parent component needs to control the zoom, the line chart component
   * will place the control if it's present in the props, but it has no knowledge
   * of how the control is to work.
   * 
   */
  getZoom() {
    return(
      <div>
        <h4 className={'legend-label'} style={{ textAlign: 'center'}}>
          {this.BMIGroups.zoomLabel}
        </h4>
        <Zoom
          zoomOut={this.handleZoomOutClick}
          scaleIndex={this.BMIGroups.zoomState}
        />
      </div>
    );
  }

  render() {

    const rangeStrokes = {
      underweight: '#5C6DA9',
      normal: '#237a08',
      overweight: '#f8fc0a',
      obese: '#ed0808'
    }
    const areaProps = (fieldName) => ({
      dot: false,
      fillOpacity: 1,
      fill: `url(#color-${fieldName})`,
      stroke: rangeStrokes[fieldName],
      // NOTE: Recharts update made this value simply the total number/value and NOT the entire data object.
      // That means we can't get all the data necessary for this custom label.
      // The custom label was putting a colored number in the area chart. Sometimes this was hard to read too.
      // It should be re-addressed.
      //
      // label: CustomLabel('bar', (value) => {
      //   // place a label on November data or 2015 year
      //   // indicating the range thresholds for BMI
      //   if (parseInt(value.data.month, 10) === 11 || parseInt(value.data.year, 10) === 2015) {
      //     const obese = value.data.obese;
      //     const overweight = value.data.overweight;
      //     if (value[1] === obese) return '30'; // obese
      //     else if (value[0] === obese) return '25'; // overweight;
      //     else if (value[0] === obese + overweight) return '18.5'; // normal
      //   }
      //   return null;
      // }, {
      //   style: {
      //     fontWeight: 'bold',
      //     fontSize: '16px'
      //   }
      // }),
    });



    const graphDefs = (
      <defs>
        <linearGradient id="color-underweight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={rangeStrokes.underweight} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={rangeStrokes.underweight} stopOpacity={0.3}/>
        </linearGradient>
        <linearGradient id="color-normal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={rangeStrokes.normal} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={rangeStrokes.normal} stopOpacity={0.3}/>
        </linearGradient>

        <linearGradient id="color-overweight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={rangeStrokes.overweight} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={rangeStrokes.overweight} stopOpacity={0.3}/>
        </linearGradient>
        <linearGradient id="color-obese" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={rangeStrokes.obese} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={rangeStrokes.obese} stopOpacity={0.3}/>
        </linearGradient>
      </defs>
    );

    return (
      <div>
        <WidgetHeader title="BMI - Body Mass Index" />
        <GraphQLProvider
          query={this.BMIGroups.query}
          providerService={'demo'}
          afterFetch={this.afterGraphQLFetch}
        >
          <AreaChart
            widgetHeight={470}
            xAxisKey={this.BMIGroups.xAxisKey}
            xAxisMonthFormatting={this.BMIGroups.xAxisMonthFormatting}
            handleChartClick={this.handleChartClick}
            zoom={this.getZoom()}
            seriesKeys={[
              {'underweight': 'Under Weight'},
              {'normal': 'Normal'},
              {'overweight': 'Over Weight'}, 
              {'obese': 'Obese'}
            ]}
            areaProps={areaProps}
            graphDefs={graphDefs}
            areaChartProps={{layout: 'horizontal'}}
            legendProps={{iconType: 'square'}}
            stacked
            {...this.props}
          />
        </GraphQLProvider> 
      </div>
    );
  }

}

// Defines the default props
AdultBMIGroups.defaultProps = {
  filters: {}
};

// Defines propTypes
AdultBMIGroups.propTypes = {
  filters: PropTypes.object
};

export default AdultBMIGroups;