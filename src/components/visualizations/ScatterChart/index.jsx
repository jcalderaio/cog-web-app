import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import ReactDOM from 'react-dom';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import hash from 'object-hash';
import { graphql } from 'providers/GraphQL';
import WidgetConstants from 'visualizations/common/constants';
import { Constants as ColorConstants } from '../common/colorControls';
import DF from '../common/dataFormatter';
import Spinner from 'components/Spinner';
import _ from 'lodash';

/**
 * The ScatterChartWidget class.
 * 
 * @class ScatterChartWidget
 * @extends React.Component
 */
class ScatterChartWidget extends Component {

  constructor(props) {
    super(props);
    this.state = {
      styleLineHeight: '24px',
      labelOrientation: 'outer',
      drilldownLabel: '',
      componentVisibility: this.defaultComponentVisibility(),
      parentElHeight: 0
    };

    this.mapSeriesToScatters = this.mapSeriesToScatters.bind(this);
    this.handleLegendClick = this.handleLegendClick.bind(this);
    this.defaultComponentVisibility = this.defaultComponentVisibility.bind(this);
  }

  /**
   * By default, all of the chart components (<Bar />, <Line />, <Area />, etc.)
   * are visible. Optionally, when the legend is clicked, the state will change from
   * `visible` to `hidden` to toggle visibility via CSS. This legend behavior is on
   * by default, but disabled with the `hideSeriesOnLegendClick` prop set to false.
   * 
   * @return {Object}
   */
  defaultComponentVisibility() {
    const visible = {};
    for(let x in this.props.series) {
      if(this.props.series[x]) {
        // eslint-disable-next-line max-len
        const id = this.props.series[x].classID ? this.props.series[x].classID:`component-${hash(this.props.series[x])}`;
        visible[id] = 'visible';
      }
    }
    return visible;
  }

  handleLegendClick(data, index) {
    console.log('legend click', data);
    // default is to hide on click
    if(this.props.hideSeriesOnLegendClick) {
      const current = this.state.componentVisibility[data.payload.classID];
      const componentVisibility = Object.assign({}, this.state.componentVisibility);
      // current could be undefined, it always starts out visible, so check for hidden explicitly
      componentVisibility[data.payload.classID] = (current === 'hidden') ? 'visible':'hidden';
      this.setState({componentVisibility: componentVisibility});
    }

    // user defined legend click handler
    if(this.props.legendClick) {
      this.props.legendClick(data, index);
    }
  }

  /**
   * Returns <Scatter /> components to use from a series prop.
   * Each series object passed in the `series` array argument will be spread
   * on the <Scatter /> component as props. So `onClick` events and any prop
   * for Rechart's <Scatter /> can be used to control styles, etc.
   * 
   * @method mapSeriesToScatters
   * @memberof ScatterChartWidget
   * @see http://recharts.org/#/en-US/api/Scatter
   * @param  {Object[]} series The series options, props, and `dataKey` that references which key to use from `data`.
   *                           Each item in `series` gets passed to <Scatter /> props.
   * @param  {string}   series[].dataKey - The key for the series found in `data`
   * @param  {Function} series[].dataTransform - A transform function to be applied to `data` for the series
   * @param  {string}   series[].name - The series name (shown in the legend)
   * @param  {Mixed}    data   The data object with arrays for each series (or perhaps an array to be transformed into keyed series)
   * @return {Array}           The scatter chart <Scatter /> components with data (possibly transformed)
   */
  mapSeriesToScatters(series, data, scatterClick) {
    if(!data) {
      return [];
    }
    if (!scatterClick) {
      scatterClick = function() {}
    }
    // console.log('incoming series', series);
    // console.log('data for that', data);
    
    return series.map((item, i) => {
      // Fill color can be automatically generated if not defined.
      if(!item.fill) {
        item.fill = ColorConstants.scheme(i);
      }
      if(item.classID === undefined) {
        item.classID = `component-${hash(item)}`;
      }
      // NOTE: It's often more useful to leverage `GraphQLProvider.afterFetch()` to
      // create multiple data sets from one set instead of using this data transform
      // because this will ultimately be working on the same data set for each "series"
      // otherwise. So trying to assign a z axis key from various other keys will
      // just result in overwritten values instead of copied data.
      if(typeof(item.dataTransform) === 'function') {
        data = item.dataTransform(data, i);
      }
      
      const seriesData = (item.dataKey && data[item.dataKey]) ? data[item.dataKey]:data;
      
      return (
        <Scatter
          key={i}
          {...item}
          className={this.state.componentVisibility[item.classID]}
          onClick={scatterClick} data={seriesData}
        />
      )
    });
  }

  /**
   * Returns an array for use with <Lagend /> payload attribute if a `legendPayload` 
   * key was provided in any of the series for the chart. Otherwise, a default
   * will be used.
   * 
   * @see http://recharts.org/#/en-US/api/Legend
   * @param  {Object[]} series The series options
   * @return {Array}           The payload array for <Legend />
   */
  mapSeriesToLegendPayload(series) {
    const payload = [];
    if(series) {
      series.forEach((item) => {
        if(item.legendPayload) {
          payload.push(item.legendPayload);
        }
      });
    }
    return payload;
    // [{ value: 'item name', type: 'line', id: 'ID01' }]
  }

  componentDidMount() {
    // This helps with figuring out the height for the <ScatterChart> automatically.
    // One of the challenges with SVG is that it must have dimensions specified.
    // So Recharts requires these values as props. Great, but we want more dynamic dimensions
    // and we also want to simplify things a bit and not have to pass those values at all.
    // Enter ReactDOM: It conveniently lets us figure out the parent node's height so we can
    // automatically set it. Cool!
    // HOWEVER: We also don't want to prevent us from actually setting a specific height either.
    // So we won't destroy the original Recharts functionality. A `widgetHeight` prop can be passed.
    // If it's not passed, then the height gets calculated based on the following here.
    this.setState({'parentElHeight': parseInt(ReactDOM.findDOMNode(this).parentNode.style.height, 10)});
  }

  /**
   * Renders the component
   *
   * @method render
   * @memberof ScatterChartWidget
   */
  render () {
    // console.dir(this.props.graphql.query);
    // console.dir(this.props.graphql.result);
    const { widgetHeight } = this.props;
    // Calculate available height. It'll be the available widgetHeight minus some space for the legend, etc.
    // TODO: calculate this automatically, right now its just a hard coded number.
    // const height = widgetHeight - 78;

    const height = WidgetConstants.CalcWidgetHeight(
      WidgetConstants.BRUSH_HEIGHT,
      WidgetConstants.LEGEND_HEIGHT,
      WidgetConstants.DEF_PADDING_MARGIN
    )(widgetHeight || this.state.parentElHeight);

    // TODO: This is also hard coded because 100% was too large for this chart. Yet ok for everything else oddly.
    // It's been reduced to give it some padding. Maybe use actual padding. ... now <ScatterChart> uses margin.
    // Though the same problem here exists -- automatic sizing (and in conjunction with <ResponsiveContainer>)
    // isn't perfect. Labels also complicate the matter and need to be figured out. Expecially the X Axis label
    // that is added on the right by default. If the label is lengthy, it'll be clipped. 
    const width = '100%';

    const data = DF.getDataFromProps(this.props);
    
    // The series for scatter charts is a bit different than some other chart components in that each take 
    // their own data rather than the parent component being given the data object.
    const scatterSeries = this.mapSeriesToScatters(this.props.series, data, this.props.scatterClick);
    // But then for this particular chart, we need to know what to use for
    // the x, y, and z axes. <-- random fact, this is the only plural word for 3 nouns. Go English!
    // The props for each Axis component have a default `dataKey` value of 'x' 'y' and 'z'
    // but can have other values passed through using `xAxis`, `yAxis`, and `zAxis`

    // fake
    // const data01 = [{x: 100, y: 200, z: 200}, {x: 120, y: 100, z: 260},
    //               {x: 170, y: 300, z: 400}, {x: 140, y: 250, z: 280},
    //               {x: 150, y: 400, z: 500}, {x: 110, y: 280, z: 200}];
    // const data02 = [{x: 200, y: 260, z: 240}, {x: 240, y: 290, z: 220},
    //               {x: 190, y: 290, z: 250}, {x: 198, y: 250, z: 210},
    //               {x: 180, y: 280, z: 260}, {x: 210, y: 220, z: 230}]
    
    // This is how GraphQL returns the data. From it we're pulling series from different keys.
    // [
    //  {  
    //   circumference: 50
    //   month: 6
    //   nonzika: 33
    //   total: 49
    //   year: 2015
    //   zika: 16
    //   }
    // ]

    return (
      <Spinner until={!_.isEmpty(data)}>
        <div className={'widget-chart scatter-chart-widget unselectable'}>
          <h4 className={'legend-label'} style={{ textAlign: 'center' }}>
            {this.state.drilldownLabel}
          </h4>

          <div className="scatter-chart-wrapper" style={{textAlign: 'right', clear: 'left'}}>
            <ResponsiveContainer width={width} height={height}>
              <ScatterChart {...this.props.scatterChartProps}>
                <XAxis {...this.props.xAxis}>
                  {this.props.xAxisLabel} 
                </XAxis>
                <YAxis {...this.props.yAxis}>
                  {this.props.yAxisLabel}
                </YAxis>
                <ZAxis {...this.props.zAxis} />
                {(this.props.grid === true) ? (<CartesianGrid stroke='#f5f5f5' />):this.props.grid}
                <Tooltip cursor={{strokeDasharray: '3 3'}} />
                <Legend onClick={this.handleLegendClick} {...this.props.legendProps} />
                {scatterSeries}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Spinner>
    );
  }
}

/**
 * The component's default props.
 * 
 * @memberof ScatterChartWidget
 * @type {Object}
 * @property {Array}  defaultProps.data  - The data for the chart if not from GraphQL
 * @property {Object} defaultProps.xAxis - Props handed down to the XAxis Component
 * @property {Object} defaultProps.yAxis - Props handed down to the YAxis Component
 * @property {Object} defaultProps.zAxis - Props handed down to the ZAxis Component
 */
ScatterChartWidget.defaultProps = {
  data: [],
  maximized: false,
  style: {
    height: '203px'
  },
  query: '',
  queryResultKey: '',
  xAxis: {
    dataKey: 'x'
  },
  yAxis: {
    dataKey: 'y',
    domain: ['dataMin', 'dataMax']
  },
  zAxis: {
    dataKey: 'z'
  },
  hideSeriesOnLegendClick: true,
  scatterChartProps: {
    margin: {
      top: 24, right: 48
    }
  },
  grid: true
};

/**
 * The component's propTypes.
 * 
 * @memberof ScatterChartWidget
 * @type     {Object}
 * @property {Object} propTypes.data
 */
ScatterChartWidget.propTypes = {
  dataField: PropTypes.string,
  style: PropTypes.object,
 // data: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  query: PropTypes.string,
  queryResultKey: PropTypes.string,
  xAxis: PropTypes.object,
  yAxis: PropTypes.object,
  zAxis: PropTypes.object,
  legendClick: PropTypes.func,
  hideSeriesOnLegendClick: PropTypes.bool,
  scatterChartProps: PropTypes.object,
  legendProps: PropTypes.object,
  grid: PropTypes.any
};

export default graphql(ScatterChartWidget);