import React from 'react';
import _ from 'lodash';

const ChartTypeProps = {
  bar: ['textAnchor', 'fill', 'width', 'height', 'x', 'y'],
  default: ['textAnchor', 'fill', 'width', 'height', 'x', 'y']
}

const Identity = (val) => _.isArray(val) ? val[1] : val;

/**
 * Custom rechart label renderer HOC - allows creation of renderers
 * as a function of the label props. Most labels are <text /> elements but some
 * might be different depending on the chart type. Most labels will only need
 * the current labels values which are typically an Array like object
 * 
 * @param {any} type - corresponds to type of chart
 * @param {any} [mapToValue=Identity] 
 * @returns {any}
 */
function CustomLabel(type, mapToValue=Identity, optProps={}) {
  return (props) => {
    const value = mapToValue(props.value, props.payload, props);
    const textProps = _.pick(props, (ChartTypeProps[type] || ChartTypeProps.default))
    return <text className="recharts-text" fillOpacity={1} {...textProps} value={value} {...optProps}>{value}</text>;
  }
}

export default CustomLabel;