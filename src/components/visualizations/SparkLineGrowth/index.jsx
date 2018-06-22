import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';
import FontAwesome from 'react-fontawesome';
import { ResponsiveContainer, XAxis, LineChart, Line, Tooltip } from 'recharts';
  // eslint-disable-next-line no-unused-vars
import WidgetConstants from 'visualizations/common/constants';
import { Constants as ColorConstants } from 'visualizations/common/colorControls';
const colors = ColorConstants.scheme;

const Defaults = {
  ICON_SIZE: '2x',
  increaseIcon: {
    name: 'arrow-up',
    style: {
      color: '#237a08'
    }
  },
  decreaseIcon: {
    name: 'arrow-down',
    style: {
      color: '#ed0808'
    }
  }
};

export default class SparkLineGrowthWidget extends Component {

  calcGrowth(data, dataField) {
    if (data.length < 2) {
      return null;
    }
    const finalDataPoint = data[data.length-1][dataField];
    const prevDataPoint = data[data.length-2][dataField];
    return (finalDataPoint - prevDataPoint) / prevDataPoint;
  }

  getIcon(hasGrowth) {
    return (
      hasGrowth ?
        <FontAwesome className="widget-control" size={Defaults.ICON_SIZE} {...Defaults.increaseIcon} /> :
        <FontAwesome className="widget-control" size={Defaults.ICON_SIZE} {...Defaults.decreaseIcon} />
      );
  }

  showGrowth(growth) {
    if (!growth || growth === 0) {
      return '0 %';
    }

    let growthStr = growth.toFixed(2).slice(-2);
    if (growthStr[0] === '0') {
      growthStr = growthStr[1];
    }

    return (
      <div className="growth-icon">
          {this.getIcon((growth >= 0))}
          <h4>{`${growthStr} %`}</h4>
      </div>
    );
  }

  render() {
    const {
      data,
      dataField,
      xAxisField,
      lineProps,
      cursorStyle,
      tooltipProps,
      widgetHeight,
      style
    } = this.props;
    const height = WidgetConstants.CalcWidgetHeight(
      0, 0, WidgetConstants.DEF_PADDING_MARGIN)(widgetHeight);
    return (
      <div className="widget-chart sparkline-widget" style={style}>
        {this.showGrowth(this.calcGrowth(data, dataField))}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
              <XAxis
                dataKey={xAxisField}
                hide
              />
            <Line dataKey={dataField} {...lineProps} />
            <Tooltip cursor={cursorStyle} {...tooltipProps} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

SparkLineGrowthWidget.defaultProps = {
  lineProps: {
    type: "monotone",
    stroke: colors(0),
    strokeWidth: 3
  },
  style: {
    textAlign: "center",
    width: "75%",
    margin: "0 auto"
  },
  cursorStyle: {
    style: {
      display: 'none'
    }
  },
  tooltipProps: {}
}

SparkLineGrowthWidget.propTypes = {
  dataField: PropTypes.string.isRequired,
  xAxisField: PropTypes.string.isRequired,
  lineProps: PropTypes.object,
  tooltipProps: PropTypes.object,
  cursorStyle: PropTypes.object
};
