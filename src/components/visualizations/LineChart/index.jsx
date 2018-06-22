import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, Brush, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
// import { ResponsiveContainer } from 'recharts';
import _ from 'lodash';
import './styles.scss';

import WidgetConstants from 'visualizations/common/constants';
import { Constants as ColorConstants } from 'visualizations/common/colorControls';
import DF from 'visualizations/common/dataFormatter';
import { RotatedMonthAndYearTick } from 'visualizations/common/CustomAxisTick';
import { FormatProps } from 'visualizations/common/CustomTooltip';
import Spinner from 'components/Spinner';
import { graphql } from 'providers/GraphQL';

import ContainerDimensions from 'react-container-dimensions'

// const colors = ColorConstants.scheme20;
const colors = ColorConstants.scheme;

/**
 * LineChartVisualization component - this expects data as array of objects in the following format:
 * [{
 *    queries: 289,
 *    queriesNoResult: 9,
 *    submissions: 8,
*     year: 2017
 * }, { ... }]
 * 
 * The `xAxisKey` prop will choose which to use for the X Axis.
 * Also, a `seriesKeys` prop is required in order to render each line.
 * 
 * @see     widgets/common/dataFormatter for utils on mapping data
 * @class   LineChartVisualization
 * @extends {Component}
 */
class LineChartVisualization extends Component {
  constructor(props) {
    super(props);

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
   * Gets the <Line /> component series. Or just one if that's all there is.
   * 
   * @param  {Array} seriesKeys The keys found in the data object that define the series to chart
   * @return {Array} An array of <Line /> components
   */
  getSeries(seriesKeys) {
    // Support one series with the same code below
    if (!Array.isArray(seriesKeys)) {
      seriesKeys = [seriesKeys];
    }
    return seriesKeys.map((item, i) => {
      let dKey = false;
      let dKeyName = false;
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
      // If by some chance the data key was not set, don't return a <Line /> component.
      // This means bad data was passed.
      if (!dKey) {
        return null;
      }
      return (
        <Line
          key={i}
          dataKey={dKey}
          name={dKeyName}
          stroke={colors(i)}
          isAnimationActive={false}          
          {...this.props.lineProps}
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

  render() {
    const {
      widgetHeight,
      lineProps,
      seriesKeys,
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
    const height = WidgetConstants.CalcWidgetHeight(
      WidgetConstants.BRUSH_HEIGHT,
      WidgetConstants.LEGEND_HEIGHT,
      WidgetConstants.DEF_PADDING_MARGIN
    )(widgetHeight);

    const legendStyle = { lineHeight: `${WidgetConstants.LEGEND_HEIGHT}px`}

    // Convenience. The `tick` prop can be passed from the parent in `xAxisProps` too.
    // If not using this `xAxisMonthFormatting` option, also don't forget to consider the tooltip if applicable.
    let xAxisProps = this.props.xAxisProps;
    let tooltipProps = this.props.tooltipProps;
    if (xAxisMonthFormatting) {
      xAxisProps = Object.assign({tick: React.createFactory(RotatedMonthAndYearTick())}, xAxisProps);
      tooltipProps = Object.assign({}, FormatProps.monthOrYearInt, tooltipProps);
    }

    const legendActionsCls = this.props.onLegendClick ? 'legend-actions' : '';

    let brush = null;
    if (showBrush) {
      brush = ( <Brush dataKey={xAxisKey} height={brushHeight} {...brushProps} /> );
    }
    //always ensure that a responsiveContainer's parent element has width and height set. Otherwise, on IE11, it bounces repeatedly. 
    return (
      <Spinner until={!_.isEmpty(data)}>
        <div className={'widget-chart line-chart-widget unselectable'} style={{width: '100%', height: height + 'px'}} >
          
          {this.props.zoom}

          <div className={`line-chart-wrapper ${legendActionsCls}`.trim()} style={{textAlign: 'right'}}>
          <ContainerDimensions>      
          { ({ width }) => 

            <div>
              {/* <ResponsiveContainer height={height}>             */}
                {/* [{width},{height}] */}

                <LineChart
                width={width}
                height={height}
                data={data}
                onClick={this.props.handleChartClick || this.handleChartClick}
                {...lineProps}>
                {(this.props.grid === true) ? (<CartesianGrid stroke='#f5f5f5' />):this.props.grid}
                <XAxis
                  dataKey={xAxisKey}
                  height={WidgetConstants.XAXIS_HEIGHT}
                  onClick={this.handleTickClick}
                  {...xAxisProps}
                />
                <YAxis {...yAxisProps} />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={legendStyle}
                  onClick={this.handleLegendClick}
                  {...legendProps} />
                <Tooltip {...tooltipProps} />
                {this.getSeries(seriesKeys)}

                {brush}
              </LineChart>
              </div>
            }
            </ContainerDimensions>
            </div>
    
            {/* </ResponsiveContainer> */}
          </div>
      </Spinner>
    );
  }
}

LineChartVisualization.defaultProps = {
  xAxisProps: {},
  yAxisProps: {},
  tooltipProps: {},
  seriesKeys: [],
  legendProps: {},
  lineProps: {
    type: "monotone"
  },
  xAxisMonthFormatting: false,
  showBrush: false,
  brushHeight: 30,
  brushProps: {},
  grid: true
};

LineChartVisualization.propTypes = {
  xAxisProps: PropTypes.object,
  yAxisProps: PropTypes.object,
  lineProps: PropTypes.object,
  groupByField: PropTypes.string,
  tooltipProps: PropTypes.object,
  seriesKeysLabelTransform: PropTypes.object,
  legendProps: PropTypes.object,
  data: PropTypes.oneOfType(
    [PropTypes.arrayOf(PropTypes.object), PropTypes.object]
  ),
  seriesKeys: PropTypes.any.isRequired,
  zoom: PropTypes.object,
  onLegendClick: PropTypes.func,
  xAxisMonthFormatting: PropTypes.bool,
  showBrush: PropTypes.bool,
  brushHeight: PropTypes.number,
  brushProps: PropTypes.object,
  grid: PropTypes.any
};

export default graphql(LineChartVisualization);