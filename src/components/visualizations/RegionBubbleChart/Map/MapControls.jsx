import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';  
import FontAwesome from 'react-fontawesome';

/*eslint-disable */
// Ensure d3 v3 is used and not v4 (current). It's aliased to react-d3-map-core's d3 dependency.
import * as d3 from 'd3v3';
/*eslint-enable */
export default class MapControls extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  revealAllSeries() {
    PubSub.publish('FILTER_MAP', {revealAllSeries: true});
  }

  render() {
    let upToParentLink = (
      <div>
        <button className="icon-button" type="submit" onClick={this.props.handleToParentRegion}>
          <FontAwesome name="search-minus" /> Zoom Out
        </button>
      </div>
    );

    // <button
    //   type="button"
    //   onClick={this.props.handleToParentRegion}
    //   style={{ float: 'right' }}
    // >
    //   Back <FontAwesome name="angle-double-up" />
    // </button>

    if (this.props.atParentLevel) {
      upToParentLink = null;
    }

    return (
      <div className={'map-controls center'} 
        onClick={this.revealAllSeries} ref={(node) => this.props.returnRef(node, 'MapControls')}>
        {upToParentLink}
      </div>
    );
  }

}

// Default MapControls props
MapControls.defaultProps = {
  handleToParentRegion: () => {},
  atParentLevel: true,
  returnRef: () => {}
};

// Props validation
MapControls.propTypes = {
  handleToParentRegion: PropTypes.func,
  atParentLevel: PropTypes.bool,
  returnRef: PropTypes.func
};
