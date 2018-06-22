/**
 * CustomAxisTick
 * 
 * There can be many custom axis tick functions defined here.
 * These will allow for some common custom ticks, for example months.
 * The `RotatedMonthTick()` will convert 1, 2, 3, etc. into month names
 * as well as tilt them on an angle to better fit.
 * 
 * Many chart widgets, using Recharts, will allow these functions to be
 * passed via props. For example:
 * 
 * <LineChartWidget xAxisProps={{tick: React.createFactory(RotatedMonthTick(-35))}}>
 * 
 */
import React from 'react';
import _ from 'lodash';
import createReactClass from 'create-react-class';


import { Constants as DateConstants, Mappers as DateMappers } from './dateControls';
const months = DateConstants.monthsAbbr;

/**
 * RotatedMonthTick will display a custom axis tick for months
 * of the year, rotated on the given angle.
 * 
 * Use with: React.createFactory(RotatedMonthTick(-35))
 * 
 * @see https://facebook.github.io/react/warnings/legacy-factories.html
 * @param {Function} mapTickValue  Function that maps the tick payload value to some text
 * @param {Number} rotationInteger Degrees to rotate by
 * @param {Object} options         Options for display
 * @param {Array}  options.names   The month names to use (ordered array, ie. 0 = January, 1 = February)
 * @param {Object} options.style   Style object to apply to the `<text>` SVG element
 * @param {Number} options.dy      How much to shift the `<text>` SVG element up/down (to help with spacing)
 * @param {Number} options.dx      How much to shift the `<text>` SVG element left/right (to help with spacing)
 * @return CustomAxisTick          The CustomAxisTick component
 */
export function RotatedTick(
  mapTickValue,
  rotationInteger = -35,
  options = {monthsArray: months, dy: 12, dx: -4, style: {textTransform: 'capitalize', fill: '#666'}}
) {

  return createReactClass({
    render () {
      // eslint-disable-next-line no-unused-vars
      const { x, y, stroke, payload } = this.props;
      let text = mapTickValue !== undefined ? mapTickValue(payload.value) : payload.value;
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={options.dy}
            dx={options.dx}
            textAnchor="end"
            style={options.style}
            transform={`rotate(${rotationInteger})`}
          >
            {text}
          </text>
        </g>
      );
    }
  });
}

export function RotatedMonthTick(rotationInteger, options) {
  return RotatedTick(DateMappers.intToMonthAbbr, rotationInteger, options);
}

export function RotatedMonthTick3(rotationInteger, options) {
  return RotatedTick(DateMappers.intToMonthAbbr3, rotationInteger, options);
}

export function RotatedMonthAndYearTick(rotationInteger, options) {
  return RotatedTick(DateMappers.intToMonthOrYearAbbr, rotationInteger, options);
}

