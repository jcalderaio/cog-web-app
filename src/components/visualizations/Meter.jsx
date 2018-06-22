import React from 'react';
import PropTypes from 'prop-types';
import Gauge from './Gauge';

/*
function getHexColor(value) {
  var string = value.toString(16);
  return (string.length === 1)
    ? '0' + string
    : string;
}

function getColor(percent) {
  const r = Math.floor(255 * (100 - percent) / 100);
  const g = Math.floor(percent * 2.55);
  const b = 0;
  const colorHex = `#${getHexColor(r)}${getHexColor(g)}${getHexColor(b)}`;
  return colorHex;
}
*/

// function getColor2(percent){
//   const p = Math.floor(percent / 10);
//   switch (p) {
//     case 0: return '#ed0808';
//     case 1: return '#ed2a08';
//     case 2: return '#ed4108';
//     case 3: return '#ed5f08';
//     case 4: return '#ed7608';
//     case 5: return '#eda408';
//     case 6: return '#f8fc0a';
//     case 7: return '#41e00f';
//     case 8: return '#33af0c';
//     case 9: return '#237a08';
//     case 10: return '#237a08';
//     default: return '##ff0090';
//   }
// }

function getColor3(percent){
  const p = percent;
  if(p < 70) return '#ed0808';
  if(p>=70 && p< 75) return '#f8fc0a';
  return '#237a08';
}

export default function Meter(props) {
  const color = getColor3(props.percent);
  return (<Gauge
    value={props.percent}
    width={props.width}
    height={props.height}
    label={props.title}
    color={color}
    valueLabelStyle={{ color: color}}
    />);
}

Meter.propTypes = {
  percent: PropTypes.number.isRequired,
  title: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number
};

Meter.defaultProps = {
  percent: 0,
  title: '',
  height:150,
  width: 250
};
