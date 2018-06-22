import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import hash from 'object-hash';
import { graphql } from 'providers/GraphQL';
import { Constants as ColorConstants } from '../common/colorControls';
import DF from '../common/dataFormatter';
import Spinner from 'components/Spinner';
import _ from 'lodash';

class RadarChartVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      styleLineHeight: '24px',
      labelOrientation: 'outer',
      drilldownLabel: '',
      componentVisibility: this.defaultComponentVisibility()
    };

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

  mapSeriesToRadars(series) {
    return series.map((item, i) => {
      if(!item.fill) {
        item.fill = ColorConstants.scheme(i);
      }
      if(item.classID === undefined) {
        item.classID = `component-${hash(item)}`;
      }
      return (
        <Radar key={i} {...item} className={this.state.componentVisibility[item.classID]} />
      )
    });
  }

  render () {
    // console.dir(this.props.graphql.query);
    // console.dir(this.props.graphql.result);
    const { axisDataKey, series, widgetHeight } = this.props;
    const data = DF.getDataFromProps(this.props);
    
    // console.log(data);
    const { styleLineHeight } = this.state;

    // Calculate available height. The <ResponsiveWidget /> Component wraps react grid item and will pass along
    // the height style (ie. "203px") so it needs to be parsed. Then from that, we need to substract for some padding.
    // const height = parseInt(style.height, 10) - 16;
    // const height = parseInt(this.props.height, 10) - 16;
    const height = widgetHeight - 80;
    const legendStyle = { lineHeight: styleLineHeight };

    return (
      <Spinner until={!_.isEmpty(data)}>
        <div className={'widget-chart radar-chart-widget unselectable'}>
          <h4 className={'legend-label'} style={{ textAlign: 'center' }}>
            {this.state.drilldownLabel}
          </h4>

          <div className="radar-chart-wrapper" style={{textAlign: 'right', clear: 'left'}}>
            <ResponsiveContainer width="100%" height={height}>
              <RadarChart data={data}>
                {this.mapSeriesToRadars(series)}
                <PolarGrid />
                <Legend wrapperStyle={legendStyle} onClick={this.handleLegendClick}  />
                <PolarAngleAxis dataKey={axisDataKey} />
                <PolarRadiusAxis angle={30} domain={['auto', 'auto']}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Spinner>
    );
  }
}

RadarChartVisualization.defaultProps = {
  data: [],
  maximized: false,
  style: {
    height: '203px'
  },
  query: '',
  queryResultKey: ''
}

// We might need more sophisticated type checking than this
RadarChartVisualization.propTypes = {
  dataField: PropTypes.string,
  style: PropTypes.object,
  data: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  query: PropTypes.string,
  queryResultKey: PropTypes.string,
  legendClick: PropTypes.func,
  hideSeriesOnLegendClick: PropTypes.bool
}

RadarChartVisualization.defaultProps = {
  hideSeriesOnLegendClick: true,
  data: []
};

export default graphql(RadarChartVisualization);