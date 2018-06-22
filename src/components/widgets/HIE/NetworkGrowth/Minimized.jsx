import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import _ from 'lodash';
import Spinner from 'components/Spinner';
import SparkLineGrowth from 'visualizations/SparkLineGrowth';
import DF from 'visualizations/common/dataFormatter';
import { graphql } from 'providers/GraphQL';

class NetworkGrowthMinimized extends Component {

  render() {
    const data = DF.getDataFromProps(this.props);

    const headingStyle = {
      textAlign: 'center',
      clear: 'both',
      paddingTop: '1em'
    }

    return (
      <div className="hie-network-growth-line-wrapper">
        <Spinner until={(data.length !== 0)}>
          <h4 style={headingStyle}>{this.props.year}</h4>
          <SparkLineGrowth
            data={data}
            dataField="total_hie_participants"
            xAxisField="month"
            {...this.props}
          />
        </Spinner>
      </div>
    );
  }
}

NetworkGrowthMinimized.propTypes = {
  updateInsightState: PropTypes.func
}

export default graphql(NetworkGrowthMinimized);