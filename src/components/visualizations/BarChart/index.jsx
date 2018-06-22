import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { BarChart, Bar, Brush, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import _ from 'lodash';
import './styles.scss';
import WidgetConstants from 'visualizations/common/constants';
import { Constants as ColorConstants } from 'visualizations/common/colorControls';
import DF from 'visualizations/common/dataFormatter';
import { RotatedMonthAndYearTick } from 'visualizations/common/CustomAxisTick';
import { RotatedMonthTick3 } from 'visualizations/common/CustomAxisTick';
import { FormatProps } from 'visualizations/common/CustomTooltip';
import Spinner from 'components/Spinner';
import { graphql } from 'providers/GraphQL';

// const colors = ColorConstants.scheme20;
const colors = ColorConstants.scheme;

/**
 * BarChartVisualization component - this expects data as array of objects in the following format:
 * [{
 *    queries: 289,
 *    queriesNoResult: 9,
 *    submissions: 8,
*     year: 2017
 * }, { ... }]
 * 
 * The `xAxisKey` prop will choose which to use for the X Axis.
 * Also, a `seriesKeys` prop is required in order to render each bar.
 * 
 * @see     widgets/common/dataFormatter for utils on mapping data
 * @class   BarChartVisualization
 * @extends {Component}
 */
class BarChartVisualization extends Component {
  constructor(props) {
    super(props);

    this.state = {
      parentElHeight: 0
    }

    this.handleChartClick = this.handleChartClick.bind(this);
    this.handleLegendClick = this.handleLegendClick.bind(this);
    this.handleTickClick = this.handleTickClick.bind(this);
    this.getSeries = this.getSeries.bind(this);
  }

  transformKeyToDisplay(transformMap) {
    return (field) => (
      (field in transformMap) ?
        transformMap[field] : field)
  }

  /**
   * Gets the <Bar /> component series. Or just one if that's all there is.
   * 
   * @param  {Array} seriesKeys The keys found in the data object that define the series to chart
   * @param  {Array} seriesGroups Optional groups for series (objects with key being series name value array of seriesKeys to group)
   * @return {Array} An array of <Bar /> components
   */
  getSeries(seriesKeys, seriesGroups) {
    // Support one series with the same code below
    if (!Array.isArray(seriesKeys)) {
      seriesKeys = [seriesKeys];
    }
    return seriesKeys.map((item, i) => {
      let dKey = false;
      let dKeyName = false;
      let yAxisId = false;
      // Numbers can technically be used as keys. Most likely we'll see a string here.
      if (typeof item === 'string' || item instanceof String || Number.isInteger(item)) {
        dKey = item;
        dKeyName = item;
      }
      // Objects a referring to a key and label.
      if (typeof item === 'object' && item !== null) {
        dKey = Object.keys(item)[0];
        dKeyName = item[Object.keys(item)[0]];
      }
      // If by some chance the data key was not set, don't return a <Bar /> component.
      // This means bad data was passed.
      if (!dKey) {
        return null;
      }

      let barProps = this.props.barProps;
      // If barProps is a function, it's looking for the field name in order to do something
      // specific for each <Bar /> component. This function should return an object.
      if (barProps && typeof areaProps === 'function') {
        barProps = this.props.areaProps(dKey);
      }
      // Safety. In case the function did not return an object.
      if (typeof barProps !== 'object') {
        barProps = {};
      }

      // Nope! Doesn't belong here.
      // This is supposed to be a re-usable component.
      // TODO: Fix. Can't hard code 'submissions' ... this component now only supports 2 Y axes for queries and submissions widget
      // ...or anything using a 'submissions' data key. which could actually be other things.
      if (dKey === 'submissions') {
        yAxisId = 2;
      } else {
        yAxisId = 1;
      }
      // console.log('bar props', barProps);

      // Optionally add to the barProps, the stackId
      if (seriesGroups && seriesGroups.length > 0) {
        seriesGroups.forEach((group) => {
          // group = {"groupName": ["seriesKeyA", "seriesKeyB"]}
          let stackId = Object.keys(group)[0];
          let seriesDataKeys = group[Object.keys(group)[0]];
          if (_.includes(seriesDataKeys, dKey)) {
            barProps.stackId = stackId;
          } else {
            barProps.stackId = null;
          }
        });
      }

      return (
        <Bar
          key={i}
          dataKey={dKey}
          name={dKeyName}
          yAxisId={yAxisId}
          fill={colors(i)}
          {...barProps}
        />
      )
    }); 
  }

  /**
   * Reference handler for clicking on chart elements.
   * This does nothing and it should do nothing.
   * The parent component should pass a handler along because
   * it's the one that knows what to do.
   */
  handleChartClick(data, index) {
    // console.log('Handle chart element click', data);
  }

  handleTickClick(data, index) {
    // console.log('Handle tick click', data, index)
  }

  handleLegendClick(data, index) {
    if (this.props.onLegendClick) {
      this.props.onLegendClick(data, index);
    }
    console.log('You clicked the legend!', data, index);
  }

  getSecondaryYAxisProps (data) {
    // let maxDomain = Math.ceil((Math.max.apply(Math,data.map(function(o){return o.submissions;})))*1.1);
    return {
      orientation: "right"
      // domain: [0, maxDomain]
    }
  }

  componentDidMount() {
    // This exists purely for flexibility and convenience.
    // Let's say you wanted to wrap this <BarChartVisualization> component with a <GraphQLProvider>
    // to provide it a query directly. Without this (and without a default `widgetHeight` prop)
    // there would be no height set in props to pass along to Recharts. This would create a problem
    // for the <ResponsiveContainer> component and ultimately the chart. It needs a height defined.
    // Sorry, but that's Recharts.
    // We automatically provide this `widgetHeight` prop from our <ResponsiveWidget> component.
    // It gets passed along. HOWEVER -- IF <GraphQLProvider> is the child of <ResponsiveWidget>
    // and then this widget is the child of <GraphQLProvider>...this widget becomes a grandchild
    // of <ResponsiveWidget> and it no longer gets the height passed through.
    // So we can use ReactDOM to find the parent element's height.
    // Alternatively, manually set `widgetHeight` prop when using this component OR move
    // <GraphQLProvider> up higher in hierarchy so that it doesn't swallow the prop.
    // Keep in mind that <ResponsiveWidget> inherits from <ResponsiveReactGridLayout>
    // so <GraphQLProvider> will need to be above that. Which means it's a query for
    // the entire dashboard basically.
    //
    // The problem with moving the provider up is that what if you want to make multiple GraphQL
    // queries? You might want a new query for each visualization/widget instead of for the entire
    // dashboard. Typically GraphQL likes you making one HTTP request, that's kinda the point.
    // That's why we have our visualization components look at data keys...because each visualization
    // component is being handed the data for multiple visualizations.
    // But sometimes we want multiple requests to the API...Or different APIs.
    //
    // Note: You still can not wrap <ResponsiveWidget> with <GraphQLProvider>, you must put
    // <GraphQLProvider> inside the responsive widget around this component.
    //
    // So it's nice to have this automatic height...But it's up to each visualization component
    // to figure this out. Otherwise, Recharts is going to have nothing, you'll see NaN errors
    // in the console and a whole lot of slowness in the application and nothing rendering.
    // It would be a lote nicer if Recharts handled this of course.
    //
    // You can begin the timeless debate of convention over configuration now.
    // ...but if you aren't aware of this and you don't have the height configured, boy does it take
    // a long time to figure out why things aren't working.
    this.setState({'parentElHeight': parseInt(ReactDOM.findDOMNode(this).parentNode.style.height, 10)});
  }

  render() {
    const {
      widgetHeight,
      barChartProps,
      seriesKeys,
      seriesGroups,
      yAxisProps,
      legendProps,
      xAxisMonthFormatting,
      xAxisKey,
      showBrush,
      brushHeight,
      brushProps
    } = this.props;

    // Note: getDataFromProps will check for data under this.props.data as well as this.props.graphql.result
    // So passing data directly does work (compatibility thing), but GraphQL is preferred.
    const data = DF.getDataFromProps(this.props);
    // Calculate available height. The <ResponsiveWidget /> Component wraps react grid item and will pass along
    // the widgetHeight. Then from that, we need to substract the other items we've added such as the 
    // <Brush /> component. Those aren't factored in by Recharts' <ResponsiveContainer /> for some reason 
    // (despite it wrapping everything). Fortunately we've set those height values so we know how much to 
    // substract by.
    // const height = WidgetConstants.CalcWidgetHeight(
    //   WidgetConstants.BRUSH_HEIGHT,
    //   WidgetConstants.LEGEND_HEIGHT,
    //   WidgetConstants.DEF_PADDING_MARGIN
    // )(widgetHeight || this.state.parentElHeight);

    // Figure out height (this is all that WidgetConstants.CalcWidgetHeight is doing basically)
    let height = (widgetHeight || this.state.parentElHeight) - [
      WidgetConstants.BRUSH_HEIGHT,
      WidgetConstants.LEGEND_HEIGHT,
      WidgetConstants.DEF_PADDING_MARGIN
    ].reduce((accum, current) => accum + current);
    // Here, we'll add a default height of 100 though.
    // If it's 0 (and can be in test cases regardless of setting widgetHeight prop),
    // default it to 100.
    // TODO: look into that, it seems to render a few times and loses the prop.
    // TODO: Figure out some better way to calculate height.
    // It's not bad to have it done here because it's a re-usable component, it's
    // not like we'll be writing this code over and over...but it is pretty common
    // for all visualization components. Some won't have brush bars, etc. but
    // it's just something that can be improved.
    height = height > 0 ? height:100;
    
    const legendStyle = { lineHeight: `${WidgetConstants.LEGEND_HEIGHT}px`}
    const secondaryYAxisProps = this.getSecondaryYAxisProps(data)
    // Convenience. The `tick` prop can be passed from the parent in `xAxisProps` too.
    // If not using this `xAxisMonthFormatting` option, also don't forget to consider the tooltip if applicable.
    let xAxisProps = this.props.xAxisProps;
    let tooltipProps = this.props.tooltipProps;
    if (xAxisMonthFormatting) {
      if (this.props.maximized) {
        xAxisProps = Object.assign({tick: React.createFactory(RotatedMonthTick3())}, xAxisProps);        
      }
      else {
        xAxisProps = Object.assign({tick: React.createFactory(RotatedMonthAndYearTick())}, xAxisProps);
      }
      
      tooltipProps = Object.assign({}, FormatProps.monthOrYearInt, tooltipProps);
    }

    const legendActionsCls = this.props.onLegendClick ? 'legend-actions' : '';
    // Optional brush
    let brush = null;
    if (showBrush) {
      brush = ( <Brush dataKey={xAxisKey} height={brushHeight} {...brushProps} /> );
    }
    
    //always ensure that a responsiveContainer's parent element has width and height set. Otherwise, on IE11, it bounces repeatedly. 
    return (
      <Spinner until={!_.isEmpty(data)}>
        <div className={'widget-chart bar-chart-widget unselectable'} style={{height: height+'px', width: '100%'}}>
          
          {this.props.zoom}

          <div className={`bar-chart-wrapper ${legendActionsCls}`.trim()} style={{textAlign: 'right'}}>
            <ResponsiveContainer height={height}>
              <BarChart
                data={data}
                onClick={this.props.handleChartClick || this.handleChartClick}
                {...barChartProps}>
                {(this.props.grid === true) ? (<CartesianGrid stroke='#f5f5f5' />):this.props.grid}
                <XAxis
                  dataKey={xAxisKey}
                  height={WidgetConstants.XAXIS_HEIGHT}
                  onClick={this.handleTickClick}
                  {...xAxisProps}
                >
                  {this.props.xAxisLabel}
                </XAxis>
                <YAxis yAxisId={1} {...yAxisProps} stroke="#0071bc" />
                <YAxis yAxisId={2} {...secondaryYAxisProps} stroke="#000">
                  {this.props.yAxisLabel}
                </YAxis>
                <Legend
                  verticalAlign="top"
                  wrapperStyle={legendStyle}
                  onClick={this.handleLegendClick}
                  {...legendProps} />
                <Tooltip {...tooltipProps} />
                {this.getSeries(seriesKeys, seriesGroups)}

                {brush}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Spinner>
    );
  }
}

BarChartVisualization.defaultProps = {
  xAxisProps: {},
  xAxisLabel: null,
  yAxisProps: {},
  yAxisLabel: null,
  tooltipProps: {},
  seriesKeys: [],
  seriesGroups: [],
  legendProps: {},
  barProps: {},
  barChartProps: {},
  xAxisMonthFormatting: false,
  showBrush: false,
  brushHeight: 30,
  brushProps: {},
  grid: true
  // widgetHeight: 470 // <-- alternative to using ReactDOM to automagically determine height.
  // A default value the normal size of our small widgets. Manually set larger as needed.
};

BarChartVisualization.propTypes = {
  xAxisProps: PropTypes.object,
  xAxisLabel: PropTypes.object,
  yAxisProps: PropTypes.object,
  yAxisLabel: PropTypes.object,
  barProps: PropTypes.object,
  barChartProps: PropTypes.object,
  groupByField: PropTypes.string,
  tooltipProps: PropTypes.object,
  seriesKeysLabelTransform: PropTypes.object,
  legendProps: PropTypes.object,
  data: PropTypes.oneOfType(
    [PropTypes.arrayOf(PropTypes.object), PropTypes.object]
  ),
  seriesKeys: PropTypes.any.isRequired,
  seriesGroups: PropTypes.array,
  zoom: PropTypes.object,
  onLegendClick: PropTypes.func,
  xAxisMonthFormatting: PropTypes.bool,
  showBrush: PropTypes.bool,
  brushHeight: PropTypes.number,
  brushProps: PropTypes.object,
  grid: PropTypes.any
};

export default graphql(BarChartVisualization);