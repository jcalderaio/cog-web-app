import React, { Component } from 'react';
import PropTypes from 'prop-types';

/*eslint-disable */
// Ensure d3 v3 is used and not v4 (current). It's aliased to react-d3-map-core's d3 dependency.
import * as d3 from 'd3v3';
/*eslint-enable */
export default class MapLegend extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  // TODO: Do this the react way and set a state rather than using d3 DOM selector and maninpulation here.
  toggleSeries(series) {
    const element = d3.select(`g#participation-layer-${series}`)[0][0];
    if (element) {
      let currentOpacity = element.style.opacity;
      if (currentOpacity === '') {
        currentOpacity = 1;
      }
      currentOpacity = 1 - currentOpacity;
      element.style.opacity = currentOpacity;
    }
  }

  render() {
    const demoLegend = (
      <div className={'legend-horizontal center'}>
        <h5 className={'legend-label legend-horizontal-item'}>
            <span className="series-legend choropleth q0-6-background"></span><br/>
            <span>1k</span>
        </h5>
        <h5 className={'legend-label legend-horizontal-item'}>
            <span className="series-legend choropleth q1-6-background"></span><br/>
            <span>2k</span>            
        </h5>
        <h5 className={'legend-label legend-horizontal-item'}>
            <span className="series-legend choropleth q2-6-background"></span><br/>
            <span>3k</span>                        
        </h5>
        <h5 className={'legend-label legend-horizontal-item'}>
            <span className="series-legend choropleth q3-6-background"></span><br/>
            <span>4k</span>
        </h5>
        <h5 className={'legend-label legend-horizontal-item'}>
            <span className="series-legend choropleth q4-6-background"></span><br/>
            <span>5k</span>            
        </h5>
        <h5 className={'legend-label legend-horizontal-item'}>
            <span className="series-legend choropleth q5-6-background"></span><br/>
            <span>6k</span>                        
        </h5>        
      </div>
    );

    return (
      <div className={'map-controls center'} ref={(node) => this.props.returnRef(node, 'MapLegend')}>
        <h4 className={'legend-label'}><span className="stateface stateface-al"></span> 
          Potential HIE Providers {this.props.mapTitle}</h4>
        {demoLegend}
      </div>
    );
  }

}

// Default MapLegend props
MapLegend.defaultProps = {
  mapTitle: '',
  returnRef: () => {}
};

// Props validation
MapLegend.propTypes = {
  mapTitle: PropTypes.string,
  returnRef: PropTypes.func
};
