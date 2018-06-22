import React from 'react';
import PropTypes from 'prop-types';
import {Sparklines, SparklinesLine,SparklinesBars, SparklinesSpots} from 'react-sparklines';

export default class SparkGraph extends React.Component {
  render() {
    return (
      <div>
        <Sparklines  data={this.props.history} height={40} width={200} margin={5}>
          <SparklinesBars style={{ stroke: "white", fill: "#41c3f9", fillOpacity: ".25" }} />
          <SparklinesLine style={{ stroke: "#41c3f9", fill: "none" }} />
          <SparklinesSpots />
        </Sparklines>
        <div>
          <p>Trend</p>
        </div>
      </div>
    );
  }
}

SparkGraph.propTypes = {
  history: PropTypes.arrayOf(PropTypes.number)
}

SparkGraph.defaultProps = {
  history: []
};
