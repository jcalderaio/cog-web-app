import _ from 'lodash';
import React from 'react';
import { ReferenceLine, Area, AreaChart, XAxis, 
  YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from 'recharts';
// eslint-disable-next-line no-unused-vars
// import Hedis from '../Hedis';

export default class YearChart extends React.Component {

  get data() {
     return this.props.data || JSON.parse(window.localStorage.getItem(this.props.options.code));
  }

  render() {
    return (
      <ResponsiveContainer height={350} width="100%">
        <AreaChart
          data={this.data}
          margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
          <XAxis dataKey="year"/>
          <YAxis type="number" domain={[0, 100]}/>
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip/>
          <Legend payload={[{ id: 'reference', 
            value: `${this.props.average.year} National Average *`, 
            type: 'line', 
            color: 'red'}]}/>
          <ReferenceLine y={this.props.average.value} stroke="red" strokeDasharray="3 3"/>
          <Area type='monotone' dataKey="score" stroke='#8884d8' fill='#8884d8'/>
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}
