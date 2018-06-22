import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { ReferenceLine, Line, LineChart, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const current = new Date();
export default class MonthChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  get years() {
    var yearsArr = [];
    for(var i = 0; i < 5; i++) {
      yearsArr.push(current.getFullYear() - i);
    }
    return yearsArr;
  }


  get data() {
    const monthNames = moment.monthsShort();

    var monthData = {}, formattedData = [];
    _.each(this.props.data, (data) => {
      if (!monthData[data.month]) {
        monthData[data.month] = [];
      }
      let year = data.year
      monthData[data.month].push({ 
        month: monthNames[data.month - 1], 
        year: year, score: data.denominator !== 0 ? Math.round(data.numerator / data.denominator * 100) : 0 
      });

    });
    _.each(monthData, monthByYear => {
      formattedData.push(_.reduce(monthByYear, (monthObj, value, key) => {
        if (!monthObj.month) {
          monthObj.month = value.month;
        }
        monthObj[value.year] = value.score;
        return monthObj;
      }, { month: '' }));
    });

    return formattedData;
  }

  render() {
    return (
      <ResponsiveContainer height={350} width="100%">
        <LineChart
          data={this.data}
          margin={{ top: 3, right: 1, left: 1, bottom: 3 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />>
        <ReferenceLine y={72} stroke="red" strokeDasharray="3 3" />
          {this.years.map(y => <Line type="monotone" key={y} dataKey={y} stroke={this.getRandomColor()} />)}
        </LineChart >
      </ResponsiveContainer>
    );
  }
}

MonthChart.propTypes = {
  code: PropTypes.string.isRequired,
}

