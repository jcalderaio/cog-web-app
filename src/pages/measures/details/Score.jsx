import React from 'react';
import Meter from '../Meter';

export default function Score(props) {
  const current = props.ytd || {score: 0};
  const last = props.last || {score: 0};
  const min = props.min || {score: 0};
  const max = props.max || {score: 0};
  const width=150, height=130;
  return (
    <div style={{textAlign: 'center'}}>
      <Meter percent={last.score} title={'Last('+last.year+')'} width={width} height={height}  />
      <Meter percent={current.score} title={'YTD('+current.year+')'} width={width} height={height}  />
      <Meter percent={min.score} title={'Lowest('+min.year+')'} width={width} height={height}  />
      <Meter percent={max.score} title={'Highest('+max.year+')'} width={width} height={height}  />
    </div>
  );
}