import React from 'react';
import _ from 'lodash';
import MeasureDetails from './MeasureDetails';
import Hedis from '../Hedis';
import Spinner from 'components/Spinner';

export default class MeasureWidget extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      measure: null,
    }
  }

  componentDidMount() {
    const code = this.props.params.code;
    Promise.all([Hedis.measures(), Hedis.yearlyData(code, new Date().getFullYear() - 4)])
    .then(results => {
        this.setState({
          measure: results[0][code],
          yearData: results[1][code]
        })
    });
  }

  render() {
     /* eslint-disable */
    return (
      <Spinner until={this.state}>
          { this.state.measure && <MeasureDetails dashboard={this.props.dashboard} yearData={this.state.yearData} {... this.state.measure}/> }
      </Spinner>
    );
  }
}