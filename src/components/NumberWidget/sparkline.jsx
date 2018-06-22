// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { uniqueId } from 'lodash';
import { format } from 'date-fns';

export default class Sparkline extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    height: PropTypes.number,
    marginLeft: PropTypes.number,
    marginRight: PropTypes.number,
    stroke: PropTypes.arrayOf(PropTypes.string),
    data: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          value: PropTypes.number
        })
      )
    )
  };

  static defaultProps = {
    className: '',
    height: 60,
    marginLeft: 0,
    marginRight: 0,
    stroke: ['#0071bc', '#aeb0b5']
  };

  get series() {
    return this.props.data || [];
  }

  get chartData() {
    const chartData = {};
    this.series.forEach((s, i) => {
      s.forEach(x => {
        const key = format(x.date, 'YYYY-MM');
        const o = chartData[key] || {};
        o.name = key;
        o[`X${i}`] = x.value;
        chartData[key] = o;
      });
    });
    return Object.keys(chartData)
      .sort()
      .map(k => chartData[k]);
  }

  render() {
    const { height, className, marginRight, marginLeft, stroke } = this.props;
    const { chartData, series } = this;
    return (
      <ResponsiveContainer width="100%" height={height} className={className} debounce={100}>
        <AreaChart
          className="sparkline-chart"
          data={chartData}
          margin={{ top: 0, right: marginRight, left: marginLeft, bottom: 2 }}
        >
          {series.map((_, i) => (
            <Area
              key={uniqueId('area-')}
              dataKey={`X${i}`}
              dot={false}
              stroke={stroke[series.length - 1 - i] || '#0071bc'}
              strokeWidth={3}
              fill={`url(#area-${series.length - 1 - i})`}
            />
          ))}

          <defs>
            {series.map((_, i) => {
              return (
                <linearGradient key={uniqueId('gradient-')} id={`area-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stroke[i] || '#0071bc'} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={stroke[i] || '#0071bc'} stopOpacity={0.25} />
                </linearGradient>
              );
            })}
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}
