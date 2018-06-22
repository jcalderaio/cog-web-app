import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';
import { ResponsiveContainer, ComposedChart, Line, Bar, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, Brush } from 'recharts';
  // eslint-disable-next-line no-unused-vars
import { scaleLog } from 'd3-scale';
import hash from 'object-hash';
import Zoom from 'visualizations/Zoom';
import { Constants as ColorConstants } from '../common/colorControls';
import DF from '../common/dataFormatter';
import { graphql } from 'providers/GraphQL';
import Spinner from 'components/Spinner';
import _ from 'lodash';

class ComposedChartWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formattedData: [],
      drilldownLabel: '',
      opacity: 1,
      componentVisibility: this.defaultComponentVisibility()
    };

    this.handleTickClick = this.handleTickClick.bind(this);
    this.handleLegendClick = this.handleLegendClick.bind(this);
    this.isZoomedIn = this.isZoomedIn.bind(this);
    this.drillTo = this.drillTo.bind(this);
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

  componentWillMount() {
    // TODO: temporary. to support old HIE dashboard as well as new graphql based data.
    // ultimately this will be removed and formatData() would be passed as a function to dataTransform prop
    // if there were any transformations required.
    if(this.props.data) {
      // console.log('format data', this.props.data);
      this.formatData(this.props, {});
    }
  }

  // TODO: Pull this out of here. Allow a `dataTransform` prop to define a function like this instead.
  // Not everything using a LineChart widget will go through this formatting. The original data fed
  // to this component was for demo purposes before GraphQL in a less than ideal format.
  formatData(currentProps, filter, scaleField) {
    // TODO: if groupByField - render bars as groupBy columns, otherwise use barField
    // push logic into dataFormatter
    // eslint-disable-next-line no-unused-vars
    const { data, currentScaleField, scaleFields, groupByField, dataField } = currentProps;
    if(data) {
      scaleField = scaleField || currentScaleField;
      const filteredData = DF.filterData(data, filter);
      const groupedData = DF.groupBy(filteredData, groupByField);
      const series = Object.keys(groupedData);
      const keyValueMetrics = DF.mapFieldToValue(filteredData, {field: 'metric', valueField: 'value'})
      const groupedByField = DF.groupBy(keyValueMetrics, scaleField);
      

      this.setState({
        formattedData: DF.mergeData(groupedByField, series),
        drilldownLabel: DF.getScaleLabel(filter, scaleField)
      });
    }
  }

  handleBarAnimationStart() {
    // console.log('Animation start');
  }

  handleBarAnimationEnd() {
    // console.log('Animation end');
  }

  isZoomedIn(scaleField) {
    // assume scaleFields are ordered Highest level -> lowest level
    return this.props.scaleFields[0] !== scaleField;
  }

  drillTo(drillToField, filter) {
    filter = filter || {};
    this.formatData(this.props, filter, drillToField);
  }

  handleLegendClick(data, index) {
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

  handleTickClick(data) {
    // this needs to handle reformatting data if this tick can be 'zoomed' in
    // e.g. if this is a year, zoom in to view the data by month of that year
    console.log('you clicked the tick!')
    // if (can zoom in) {
    //   this.formatData(
    //     this.props.data, 
    //     { field: this.currentScaleField, value: data.value },
    //     // zoomed-in scale field  
    //     )  
    // }
  }

  /**
   * Returns <Line />, <Bar />, and <Area /> components to use from a series prop.
   * Each series object passed in the `series` array argument will be spread
   * on each component as props. So `onClick` events and any prop for Rechart's 
   * <Line />, <Bar/>, or <Area /> can be used to control styles, etc.
   * 
   * @see http://recharts.org/#/en-US/api/Line
   * @param  {Object[]} series The series options, props, and `dataKey` that references which key to use from `data`.
   *                           Each item in `series` gets passed to <Line /> props.
   * @param  {string}   series[].composedType - The composed chart plotted type (this function looks for a value of 'line')
   * @param  {string}   series[].dataKey      - The key for the series found in `data` (on <LineChart />)
   * @param  {string}   series[].name         - The series name (shown in the legend)
   * @return {Array}           The composed chart <Line /> components
   */
  mapSeriesToTypes(series) {
    if(!series) {
      return [];
    }

    return series.map((item, i) => {
      let component = null;
      // Stroke color can be automatically generated if not defined.
      if(!item.stroke) {
        item.stroke = ColorConstants.scheme(i);
      }
      if(!item.fill) {
        item.fill = ColorConstants.scheme(i);
      }
      if(item.classID === undefined) {
        item.classID = `component-${hash(item)}`;
      }
      switch (item.composedType) {
        case 'line':
          component = (
            <Line key={i} {...item} className={this.state.componentVisibility[item.classID]} />
          )
          break;
        case 'bar':
          component = (
            <Bar key={i} {...item} className={this.state.componentVisibility[item.classID]} />
          )
          break;
        case 'area':
          component = (
            <Area key={i} {...item} className={this.state.componentVisibility[item.classID]} />
          )
          break;
        default:
          component = null;
          break;
      }
      return component;
    });
    
  }

  render() {
    const { widgetHeight, currentScaleField, brushDataField } = this.props;
    // Calculate available height.
    const height = widgetHeight - 100;

    let data = DF.getDataFromProps(this.props);

    // TODO: temporary to support old way of passing data.
    if(this.state.formattedData.length > 0) {
      data = this.state.formattedData;
    }
    // console.log(data);

    let plottedSeries = this.mapSeriesToTypes(this.props.series);
    
    const brushHeight = 30;
    return (
      <Spinner until={!_.isEmpty(data)}>
        <div className={'widget-chart line-chart-widget unselectable'} style={{height: height+brushHeight+'px'}}>
          <h4 className={'legend-label'} style={{ textAlign: 'center' }}>
            {this.state.drilldownLabel}
          </h4>

          { // if data is currently zoomed, provide Zoom out button. Assuming first scale field is hightest level
            (this.isZoomedIn(this.state.scaleField) ?
              <Zoom
                zoomOut={() => this.drillTo(this.props.scaleFields[0])}
                scaleIndex={this.props.scaleFields.indexOf(this.state.scaleField)}
              /> : null
          )}

          <div className='line-chart-wrapper'>
            <ResponsiveContainer width="100%" height={height}>
              <ComposedChart data={data} {...this.props.composedChartProps}>
                {(this.props.grid === true) ? (<CartesianGrid stroke='#f5f5f5' />):this.props.grid}
                <XAxis
                  type="category"
                  dataKey={currentScaleField}
                  height={40}
                  onClick={this.handleTickClick}
                  {...this.props.xAxisProps}
                />
                <YAxis type="number" {...this.props.yAxisProps} />
                {
                  (this.props.secondYAxisProps) ?
                  <YAxis yAxisId="secondYAxis" type="number" {...this.props.secondYAxisProps} />
                  : null
                }
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ lineHeight: '40px' }}
                  onClick={this.handleLegendClick} 
                  onMouseEnter={this.handleLegendMouseEnter}
                  onMouseLeave={this.handleLegendMouseLeave}
                  {...this.props.legendProps}
                />
                <Tooltip />
                {plottedSeries}
                <Brush dataKey={brushDataField} height={brushHeight} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Spinner>
    );
  }
}


ComposedChartWidget.propTypes = {
  filter: PropTypes.object,
  maximized: PropTypes.bool,
  scaleFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  groupByField: PropTypes.string,
  dataField: PropTypes.string,
  currentScaleField: PropTypes.string.isRequired,
  xAxisProps: PropTypes.object,
  yAxisProps: PropTypes.object,
  grid: PropTypes.any,
  secondYAxisProps: PropTypes.object,
  composedChartProps: PropTypes.object,
  legendProps: PropTypes.object,
  legendClick: PropTypes.func,
  hideSeriesOnLegendClick: PropTypes.bool
};

ComposedChartWidget.defaultProps = {
  hideSeriesOnLegendClick: true,
  grid: true
};

export default graphql(ComposedChartWidget);