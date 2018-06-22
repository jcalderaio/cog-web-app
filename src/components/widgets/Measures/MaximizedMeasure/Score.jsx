import React from 'react';
import moment from 'moment';
import Meter from 'visualizations/Meter';

export default function Score(props) {
  const current = props.ytd || {score: 0};
  const last = props.last || {score: 0};
  const min = props.min || {score: 0};
  const max = props.max || {score: 0};
  const width=145, height=130;
  const monthNames = moment.monthsShort();
  return (
    <div style={{textAlign: 'center'}}>
      <Meter percent={last.score} 
        title={'Last('+monthNames[last.month-1]+' '+last.year+')'} width={width} height={height}  />
      <Meter percent={current.score} 
        title={'YTD('+current.year+')'} width={width} height={height}  />
      <Meter percent={min.score} 
        title={'Lowest('+monthNames[min.month-1]+' '+min.year+')'} width={width} height={height}  />
      <Meter percent={max.score} 
        title={'Highest('+monthNames[max.month-1]+' '+max.year+')'} width={width} height={height}  />
    </div>
  );
}