import React from 'react';
import _ from 'lodash';

import { graphql } from 'providers/GraphQL';
import Meter from 'visualizations/Meter';
import SparkGraph from 'visualizations/SparkGraph';
import Spinner from 'components/Spinner';
import './styles.scss';

class MinimizedMeasure extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {}
    }
  }

  abbreviateNumber(n) {
    var ranges = [
      { divider: 1e9 , suffix: 'B' },
      { divider: 1e6 , suffix: 'M' },
      { divider: 1e3 , suffix: 'K' }
    ];
    for (var i = 0; i < ranges.length; i++) {
      if (n >= ranges[i].divider) {
        var dividedNum = ((n / ranges[i].divider).toString()).split('.')[0];
        return dividedNum.length < 2 ? 
          (n / ranges[i].divider).toString().slice(0,3) + ranges[i].suffix 
          : ((n / ranges[i].divider).toString()).split('.')[0] + ranges[i].suffix;
      }
    }
    return n.toString();
  }

  componentWillReceiveProps(nextProps) {
    if(!_.isEmpty(nextProps.graphql.result)) {
      this.setState({
        data: nextProps.graphql.result
      })
    }
  }

  render() {
    var current = new Date();
    // eslint-disable-next-line max-len
    var lastReportedPeriodData = _.find(this.state.data ? this.state.data.years : {}, {year: (current.getFullYear()-1).toString()});
    // eslint-disable-next-line max-len
    var lastReportedPeriodDataMinusOne = _.find(this.state.data ? this.state.data.years : {}, {year: (current.getFullYear()-2).toString()});
    // eslint-disable-next-line max-len
    var lastReportedPeriodDataMinusTwo = _.find(this.state.data ? this.state.data.years : {}, {year: (current.getFullYear()-3).toString()});
    // eslint-disable-next-line max-len
    var lastReportedPeriodDataMinusThree = _.find(this.state.data ? this.state.data.years : {}, {year: (current.getFullYear()-4).toString()});
    return (
      <Spinner until={!_.isEmpty(this.state.data)}>
      <br/>
      <div className="meter">
        <Meter width={300} height={150} percent={lastReportedPeriodData && lastReportedPeriodData.score} />
      </div>
       <div className="details">
        <h4>
          Completed&nbsp;
              <span className="completed">{lastReportedPeriodData ? 
                this.abbreviateNumber(lastReportedPeriodData.numeratorCount) : 0}</span>
          &nbsp;of&nbsp;
              <span className="total">{lastReportedPeriodData ? 
                this.abbreviateNumber(lastReportedPeriodData.denominatorCount) : 0}</span>
        </h4>
      </div>
      <br/>
       <div className="graph">
            {lastReportedPeriodData && 
              <SparkGraph history={[
                lastReportedPeriodDataMinusThree ? lastReportedPeriodDataMinusThree.score : 0,
                lastReportedPeriodDataMinusTwo ? lastReportedPeriodDataMinusTwo.score : 0,
                lastReportedPeriodDataMinusOne ? lastReportedPeriodDataMinusOne.score : 0,
                lastReportedPeriodData ? lastReportedPeriodData.score : 0
                ]} 
              /> 
            }
          </div>  
      </Spinner>
    );
  }
}

export default graphql(MinimizedMeasure)