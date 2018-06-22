import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { ReferenceLine, Line, LineChart, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import Hedis from '../Hedis';


export default class MonthChart extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: []
    }
  }

   getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

  componentDidMount() {
    Hedis
      .monthlyData(this.props.code)
      .then(r => {
        this.setState({
          code: this.props.code,
          name: this.props.name,
          data: _.groupBy(r[this.props.code], 'year'),
        })
      });
  }

  get years() {
    return Object
      .keys(this.state.data)
      .sort((a, b) => Number(b) - Number(a));
  }

  get data() {
    const chartData = moment.monthsShort().map(m => { return {month: m }});
    for(const year of this.years){
      for(const monthData of this.state.data[year]){
        const item = chartData[monthData.month-1];
        item[year] = Math.trunc(monthData.completed / monthData.total * 100);
      }
    }
    return chartData;
  }

  render() {
    return (
      <ResponsiveContainer height={350} width="100%">
      <LineChart
        data={this.data}
        margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
        <XAxis dataKey="month"/>
        <YAxis />
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <Legend />>
        <ReferenceLine y={75} stroke="red" strokeDasharray="3 3"/>
        { this.years.map(y => <Line type="monotone" key={y} dataKey={y} stroke={this.getRandomColor()} />) }
      </LineChart >
      </ResponsiveContainer>
    );
  }
}

MonthChart.propTypes = {
  code: PropTypes.string.isRequired,
}

