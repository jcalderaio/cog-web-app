import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, Brush, ResponsiveContainer } from 'recharts';
import _ from 'lodash';
import Spinner from 'components/Spinner';
import WidgetConstants from 'visualizations/common/constants';
import { Constants as ColorConstants } from 'visualizations/common/colorControls';
import DF, { Pipe } from 'visualizations/common/dataFormatter';
import { FormatProps } from 'visualizations/common/CustomTooltip';
import { RotatedMonthAndYearTick } from 'visualizations/common/CustomAxisTick';
import { graphql } from 'providers/GraphQL';

// const colors = ColorConstants.scheme20;
const colors = ColorConstants.scheme;

/**
 * TODO: This was all old. the whole scaleField thing is old. This isn't in use and needs to be updated.
 * AreaChartVisualization component - this expects data as array of objects in the following format:
 *  {
 *    [scaleField1]: someVal,
 *    [scaleField2]: someVal,
 *    [dataField1]: someVal,
 *    [dataField2]: someVal
 * }
 * 
 *  There must be minimum 1 scale field and 1 dataField.
 *  
 *  The widget will handle some data manipulation for the purpose of zooming in or out of the data. 
 *  If there are multiple scaleFields, the widget will be zoomable. 
 *  If PropType.stacked == true, the areas (corresponding to dataFields) will be stacked and not overlayed
 * 
 *  see widgets/common/dataFormatter for utils on mapping data
 * 
 * @class AreaChart
 * @extends {Component}
 */
class AreaChartVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bars: [],
      filter: {}
    };

    // on widget creation we need: filter,groupByField,scaleFields and perhaps drilldownLabel.
    // We need to a) map these from the provided data in some way or b) include them in insight form

    this.handlePvBarClick = this.handlePvBarClick.bind(this);
    this.handleLegendClick = this.handleLegendClick.bind(this);
    this.handleTickClick = this.handleTickClick.bind(this);
    this.scaleData = this.scaleData.bind(this);
    this.getSeries = this.getSeries.bind(this);
  }

  /**
   * Gets the <Bar /> component series. Or just one if that's all there is.
   * 
   * @param  {Array} seriesKeys The keys found in the data object that define the series to chart
   * @return {Array} An array of <Bar /> components
   */
  getSeries(seriesKeys, stacked) {
    const stackedProps = stacked ? { stackId: `__${Math.random().toString().slice(3)}` } : {};

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
      // If by some chance the data key was not set, don't return a <Bar /> component.
      // This means bad data was passed.
      if (!dKey) {
        return null;
      }

      let areaProps = this.props.areaProps;
      // If areaProps is a function, it's looking for the field name in order to do something
      // specific for each <Area /> component. This function should return an object.
      if (areaProps && typeof areaProps === 'function') {
        areaProps = this.props.areaProps(dKey);
      }
      // Safety. In case the function did not return an object.
      if (typeof areaProps !== 'object') {
        areaProps = {};
      }
      // console.log('area props', areaProps);
      
      return (
        <Area
          key={i}
          dataKey={dKey}
          name={dKeyName}
          fill={colors(i)}
          {...stackedProps}
          {...areaProps}
        />
      )
    }); 
  }

  scaleData(data, scaleField, dataFields, filter) {
    return (new Pipe())
      .then(DF.filterData, filter)
      .then(DF.groupBy, scaleField)
      .then(DF.merge, dataFields, scaleField)
      .run(data);
  }

  handlePvBarClick(curScaleField) {
    return (data, index) => {
      // console.log('You clicked the Bar!', data, index);
      const nextScaleIndex = this.nextScale();
      this.props.changeProps({
        scaleIndex: nextScaleIndex,
        filter: {
          field: curScaleField,
          value: data.activeLabel
        }
      });
    }
  }

  handleTickClick(data, index) {
    // console.log('you clicked the tick!', data, index)
  }

  handleLegendClick(data, index) {
    // console.log('You clicked the legend!', data, index);
  }

  nextScale() {
    // this should never be -1
    const curIndex = this.props.scaleIndex;
    if (curIndex === this.props.scaleFields.length-1) return null;
    return curIndex+1;
  }

  render() {
    const {
      widgetHeight,
      xAxisMonthFormatting,
      xAxisKey,
      seriesKeys,
      yAxisProps,
      areaChartProps,
      legendProps,
      graphDefs,
      stacked,
      showBrush,
      brushHeight,
      brushProps
    } = this.props;

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

    const legendActionsCls = this.props.onLegendClick ? 'legend-actions' : '';

    // Convenience. The `tick` prop can be passed from the parent in `xAxisProps` too.
    // If not using this `xAxisMonthFormatting` option, also don't forget to consider the tooltip if applicable.
    let xAxisProps = this.props.xAxisProps;
    let tooltipProps = this.props.tooltipProps;
    if (xAxisMonthFormatting) {
      xAxisProps = Object.assign({tick: React.createFactory(RotatedMonthAndYearTick())}, xAxisProps);
      tooltipProps = Object.assign({}, FormatProps.monthOrYearInt, tooltipProps);
    }

    // Optional brush
    let brush = null;
    if (showBrush) {
      brush = ( <Brush dataKey={xAxisKey} height={brushHeight} {...brushProps} /> );
    }

    // Note: getDataFromProps will check for data under this.props.data as well as this.props.graphql.result
    // So passing data directly does work (compatibility thing), but GraphQL is preferred.
    const data = DF.getDataFromProps(this.props);
    //console.log('ARea data',data);
    //console.log('area props', this.props);

    return (
      <Spinner until={!_.isEmpty(data)}>
        <div className={'widget-chart bar-chart-widget unselectable'} style={{height: height+'px', width: '100%'}}>
          {this.props.zoom}
          <div className={`area-chart-wrapper ${legendActionsCls}`.trim()} style={{textAlign: 'right'}}>
            <ResponsiveContainer height={height}>
              <AreaChart
                data={data}
                onClick={this.props.handleChartClick || this.handleChartClick}
                {...areaChartProps}>
                {graphDefs}
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
                {this.getSeries(seriesKeys, stacked)}

                {brush}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Spinner>
    );
  }
}

AreaChartVisualization.defaultProps = {
  stacked: false,
  filter: {},
  seriesKeys: [],
  xAxisProps: {},
  yAxisProps: {},
  tooltipProps: {},
  areaProps: {},
  areaChartProps: {},
  legendProps: {},
  scaleIndex: 0,
  graphDefs: null,
  brushHeight: 30,
};

AreaChartVisualization.propTypes = {
  stacked: PropTypes.bool,
  filter: PropTypes.object,
  seriesKeys: PropTypes.any.isRequired,
  graphDefs: PropTypes.object,
  xAxisProps: PropTypes.object,
  yAxisProps: PropTypes.object,
  areaProps: PropTypes.oneOfType([
    PropTypes.object, PropTypes.func
  ]),
  areaChartProps: PropTypes.object,
  tooltipProps: PropTypes.object,
  legendProps: PropTypes.object,
  data: PropTypes.arrayOf(PropTypes.object),
  dataFields: PropTypes.arrayOf(PropTypes.string),
  scaleIndex: PropTypes.number,
  saveConfig: PropTypes.func,
  brushHeight: PropTypes.number,
};

export default graphql(AreaChartVisualization);