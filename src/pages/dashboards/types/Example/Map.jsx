import React, {Component} from 'react';
import ReactMapGL from 'react-map-gl';
import {Layer} from 'deck.gl';

import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PubSub from 'pubsub-js';

// todo: put under config
const TOKEN = 'pk.eyJ1IjoidG9tY29nbm9zYW50ZSIsImEiOiJjamRrd3l6ZWMwMGJmMnFvMnVyM3g1cTNzIn0.uNu_MqinYGxukmoek7--6w'; // Set your mapbox token here

@observer class Map extends Component {

  state = {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8
    }
  };

  componentWillMount() {
    // Make sure this component tells its great great grandparent to knock it off with the footer and the container padding and other nonsense.
    PubSub.publish('DASHBOARD_LAYOUT_UPDATE', observable({showFooter: false, gridLayout: false}));
  }  

  render() {
    const showMyLayer = true;
    const layers = [
        new Layer({data: {}, visible: showMyLayer})
      ];

    return (
      <ReactMapGL
        {...this.state.viewport}
        onViewportChange={(viewport) => this.setState({viewport})}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxApiAccessToken={TOKEN}
        layers={layers}
      />
    );
  }
}

export default Map;