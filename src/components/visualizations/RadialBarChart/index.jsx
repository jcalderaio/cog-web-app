import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import './styles.scss';
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Constants as ColorConstants } from 'visualizations/common/colorControls';
import { graphql } from 'providers/GraphQL';
const colors = ColorConstants.scheme;

class RadialBarChartVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      styleLineHeight: '24px',
      labelOrientation: 'outer',
      drilldownLabel: ''
    };
  }

  render () {
    const { data, widgetHeight, dataField, radialBarProps, radialBarChartProps, rainbow } = this.props;
    const { labelOrientation } = this.state;

    data.map((item, index) => {
      if (item.name !== "") {
        item.fill = colors(index);
      }
      return item;
    });

    // Calculate available height.
    const height = widgetHeight - 100;
    // Apparently not needed anymore?
    // const legendStyle = { lineHeight: this.state.styleLineHeight };
    const label = { orientation: labelOrientation };

    // The radial bar chart will be a complete circle unless `startAngle` and `endAngle`
    // are provided. To shortcut this to 180 degree, a prop "rainbow" is available.
    const rainbowProps = {};
    const rainbowBarProps = {};
    if (rainbow) {
      rainbowProps.startAngle = 180;
      rainbowProps.endAngle = 0;
      // and the bar itself should probably go clockwise, by default it goes counter clockwise
      rainbowBarProps.clockWise = true;
    }
    // `radialBarProps` and `radialBarChartProps` also exist so the parent component
    // using this one could set these props manually too. Rainbow is just convenience.
    
    return (
      <div className={'widget-chart radial-bar-chart-widget unselectable'}>
        <h4 className={'legend-label'} style={{ textAlign: 'center' }}>
          {this.state.drilldownLabel}
        </h4>

        <div className="radial-bar-chart-wrapper" style={{textAlign: 'right', clear: 'left'}}>
          <ResponsiveContainer width="100%" height={height}>
            <RadialBarChart
              data={data}
              cx="50%"
              cy="70%"
              innerRadius="20%"
              outerRadius="100%"
              {...radialBarChartProps}
              {...rainbowProps}
            >
              <RadialBar {...radialBarProps} {...rainbowBarProps} label={label} background dataKey={dataField} />
              <Legend iconSize={10} layout="horizontal" verticalAlign="bottom"  />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}

RadialBarChartVisualization.defaultProps = {
  data: [],
  maximized: false,
  style: {
    height: '203px'
  }
};

// We might need more sophisticated type checking than this
RadialBarChartVisualization.propTypes = {
  dataField: PropTypes.string.isRequired,
  style: PropTypes.object,
  data: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired
};

export default graphql(RadialBarChartVisualization);