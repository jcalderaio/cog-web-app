import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import FontAwesome from 'react-fontawesome';

const isZoomedIn = (scaleIndex) => scaleIndex !== 0;

export default class Zoom extends Component {

  render() {
    const { zoomOut, scaleIndex } = this.props;

    const style = {
      display: isZoomedIn(scaleIndex) ? 'block' : 'None'
    }

    return (
      <div className="chart-controls center" style={style}>
        <button
          className="icon-button update"
          onClick={zoomOut}>
          <FontAwesome name="search-minus" /> Zoom Out
        </button>
      </div>
    );
  }
}

Zoom.propTypes = {
  zoomOut: PropTypes.func.isRequired,
  scaleIndex: PropTypes.number
}