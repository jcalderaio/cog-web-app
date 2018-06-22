import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';  
import _ from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

/*eslint-disable */
// Ensure d3 v3 is used and not v4 (current). It's aliased to react-d3-map-core's d3 dependency.
import * as d3 from 'd3v3';
/*eslint-enable */
@observer class MapLegend extends Component {

  @observable entityType = {providers: true, ehr: true}

  subscriber(msg, data){
    if (data.revealAllSeries) {
      this.revealAllSeries();
    } else if(data.entityType) { 
      this.setState({
        entityType: data.entityType
      })
        _.each(this.entityType, (type,key) => {
          this.toggleSeries(key, true);
      });
    }
  }

  componentDidMount() {
    PubSub.subscribe('FILTER_MAP', this.subscriber.bind(this));
  }

  componentWillUnmount(){
    PubSub.unsubscribe(this.token);
  }

  revealAllSeries(){
    // This gets called async so you can't set state here.
    // We don't know when this will actually occur.
    // Really, we may not even really need to hold the entityType object in state
    // or anywhere really. We could probably simply toggle elements with d3
    // without the need to keep track of what's there.
    _.each(this.entityType, (seriesValue,index) => {
      // this.setState({entityType: Object.assign(this.state.entityType, {[index]: true})})
      this.entityType = Object.assign(this.entityType, {[index]: true});

      let element = d3.select(`g#participation-layer-${index}`)[0][0];
      if (element) {
        element.style.opacity = 1;
      }
    })
  }

  // TODO: Do this the react way and set a state rather than using d3 DOM selector and maninpulation here.
  toggleSeries(series, published) {
    if(!published) {
      this.entityType = Object.assign(this.entityType, {
        [series] : !this.entityType[series]
      });
    }
    const element = d3.select(`g#participation-layer-${series}`)[0][0];
    if (element) {
      if (this.entityType[series]) {
        element.style.opacity = 0;
      } else {
        element.style.opacity = 1;
      }
    }
  }

  render() {
    const participationLegend = (
      <div className={'legend-horizontal center'}>
        {/* <h5 className={'legend-label legend-horizontal-item'}>
          <button className="icon-button" onClick={() => { this.toggleSeries('hospital'); }}>
            <span className="series-legend hospital"></span> Hospitals
          </button>
        </h5> */}
        {/* <h5 className={'legend-label legend-horizontal-item'}>
          <button className="icon-button" onClick={() => { this.toggleSeries('pcp'); }}>
            <span className="series-legend pcp"></span> PCPs
          </button>
        </h5> */}
        {/* <h5 className={'legend-label legend-horizontal-item'}>
          <button className="icon-button" onClick={() => { this.toggleSeries('others'); }}>
            <span className="series-legend others"></span> Others
          </button>
        </h5> */}
        <h5 className={'legend-label legend-horizontal-item'}>
          <button className="icon-button" onClick={() => { this.toggleSeries('clinical-providers'); }}>
            <span className="series-legend clinical-providers"></span> Clinical Providers
          </button>
        </h5>
        <h5 className={'legend-label legend-horizontal-item'}>
          <button className="icon-button" onClick={() => { this.toggleSeries('ehr-providers'); }}>
          <span className="series-legend ehr-providers"></span> EHR Providers 
          </button>
        </h5>
      </div>
    );

    const ehrLegend = (
      <div className={'legend-horizontal center'}>
      <h5 className={'legend-label legend-horizontal-item'}>
          <span className="series-legend ehr-providers"></span> Providers 
      </h5>
    </div>
    )


    return (
      <div className={'map-controls center'} ref={(node) => this.props.returnRef(node, 'MapLegend')}>
        <h4 className={'legend-label'}><span className="stateface stateface-mo"></span> {this.props.mapTitle}</h4>
        {(this.props.options.name === 'participationByRegion' && participationLegend)}
        {(this.props.options.name === 'ehrProvidersByRegion' && ehrLegend)}
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

export default MapLegend;