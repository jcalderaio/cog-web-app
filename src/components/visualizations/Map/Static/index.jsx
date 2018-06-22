import React, { Component } from 'react';
import ReactMapGL from 'react-map-gl';
import {setParameters} from 'luma.gl';
// import DeckGL from 'deck.gl';
import { graphql } from 'providers/GraphQL';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import PubSub from 'pubsub-js';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import USStateBoundingBoxes from 'visualizations/Map/data/USStateBoundingBoxes';
import geoViewport from '@mapbox/geo-viewport';
// wayyyy too slow
// import darkMapStyleV9 from '../map-style-dark-v9';
// import basicMapStyleV9 from '../map-style-basic-v9';
// import _ from 'lodash';
// import { polygon, bbox } from '@turf/turf';
import LineLayer from '../Layers/LineLayer';


// todo: put under config
const TOKEN = 'pk.eyJ1IjoidG9tY29nbm9zYW50ZSIsImEiOiJjamRrd3l6ZWMwMGJmMnFvMnVyM3g1cTNzIn0.uNu_MqinYGxukmoek7--6w'; // Set your mapbox token here

/**
 * The StaticMap component will render a Mapbox map with a fixed position and zoom level.
 * As the browser window resizes, the map viewport adjusts to remain fixed on the same spot.
 * Zoom is not an option either, as this map will take a US State centroid and ensure that
 * it is visible in its entirety.
 * 
 * TODO: Support more than just US states.
 * See: Map/data/USStateBoundingBoxes.js
 * 
 */
@observer class StaticMap extends Component {

  // In ReactMapGL, Uber often uses Immutable.js' fromJS() on this. We have the same thing here with mobx's observable.map()
  //@observable mapStyle = basicMapStyleV9;

  // mapStyles = darkMapStyleV9;

  // Not using state for now. The updates on window resize were breaking lifecycle.
  // React also doesn't care about its parent container. Nor does it really care about the iframe map.
  // So there's not much reason to force those through React's state and lifecycle.
  // ReactMapGL has its own callback for re-rendering based on updates. So we use that.
  @observable viewport = {
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 6,
    maxZoom: 16,
    width: window.innerWidth,
    height: window.innerHeight,
    hasInteracted: false
  };

  static defaultProps = {
  };

  // constructor(props) {
  //   super(props);

  //   // Get the styles once. They won't change.
  //   const { styleLayers = [] } = this.props;
    
  //   // console.log('mapstyles:', this.mapStyles)
  //   // If styleLayers was defined, then only keep those.
  //   // Boy this is slow. WAY too slow. Publish styles in Mapbox and use URL.
  //   // https://www.mapbox.com/help/studio-manual-publish/
  //   // Will be a lot faster.
  //   //   if (styleLayers.length > 0) {
  //   //     // Always keep the background
  //   //     styleLayers.push('background');
  //   //     const layersToKeep = _.filter(this.mapStyles.layers, function(layer) {
  //   //       let keep = false;
  //   //       styleLayers.forEach((match) => {
  //   //         // console.log(layer.id);
  //   //         if(layer.id.match(new RegExp(match)) || layer.id === match) {
  //   //           // console.log('found a match for:', layer)
  //   //           keep = true;
  //   //         }
  //   //       });
  //   //       return keep;
  //   //     });
  //   //     this.mapStyles.layers = layersToKeep;
  //   //   }
  // }

  componentWillMount() {
    disableBodyScroll(document.body);
    // Make sure this component tells its great great grandparent to knock it off with the footer and the container padding and other nonsense.
    PubSub.publish('DASHBOARD_LAYOUT_UPDATE', observable({ showFooter: false, gridLayout: false }));
  }

  /**
   * Figure out the new dimensions for the map viewport.
  */
  updateDimensions() {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight - window.HeaderComponent.clientHeight;

    // This is how it becomes interactive...this and the _onViewportChange()
    if (!this.viewport.hasInteracted) {
      // Also update the position, have to keep it centered over the location.
      // Note: It's a bit hard to always maximize the screen space. The states should all fit.
      // however, sometimes they could be zoomed in closer. Sometimes there could be panels
      // on top with controls, so more space may be needed. Allow props to adjust and tweak
      // the zoom/position a bit in these scenarios. It's a fine tune adjustment as needed
      // for when the default automatic calculation doesn't get us completely there.
      //
      // TODO: Think about auto adjusting the zoom levels at different breakpoints.
      // The thing is at smaller sizes it makes sense, but at larger sizes the desire is to
      // zoom in...but then smaller screens won't see the whole state.
      const { stateName = 'Alabama', minZoom = 4, maxZoom = 16, defaultZoom = 6, pitch = 0, bearing = 0 } = this.props;
      // Allow bitch and bearing to be set as well. Default to top down view.
      // Would also be cool to animate this... Maybe if an array is passed, we can adjust somehow over time.
      this.viewport.pitch = pitch;
      this.viewport.bearing = bearing;

      const stateBox = USStateBoundingBoxes[stateName].boundingbox;
      // state `boundingbox` coords are: [S, N, W, E]
      // geoViewport wants them as "WSEN" so the docs say, but that wasn't found to be true.
      // It was actually: S, W, N, E

      const bounds = geoViewport.viewport(
        [stateBox[0], // S
        stateBox[2],  // W
        stateBox[1],  // N
        stateBox[3]   // E
      ], [this.viewport.height, this.viewport.width], minZoom, maxZoom);
      
      // 8.714,54.2638,11582.4
      this.viewport.latitude = bounds.center[0];
      this.viewport.longitude = bounds.center[1];
      //this.viewport.latitude = 50.1602;
      //this.viewport.longitude = 8.1119;

      // Some calculations through viewport() don't even return a zoom level (like Arizona) so default to 6.
      this.viewport.zoom = bounds.zoom || defaultZoom;
      // console.log(this.viewport);

      // this.viewport.latitude = 47.65;
      // this.viewport.longitude = 7;
      // this.viewport.zoom = 4.5;
      // this.viewport.maxZoom = 16;
      // this.viewport.pitch = 50;
    }
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    enableBodyScroll(document.body);
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  _initialize(gl) {
    setParameters(gl, {
      blendFunc: [gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE],
      blendEquation: gl.FUNC_ADD
    });
  }

  _onViewportChange(viewport) {
    this.viewport = viewport;
    this.viewport.hasInteracted = true;
  }

  render() {
    // 
    // mapStyle="mapbox://styles/mapbox/dark-v9"   <-- slooow
    return (
      <ReactMapGL
        mapStyle="mapbox://styles/mapbox/dark-v9"
        {...this.viewport}
        mapboxApiAccessToken={TOKEN}
        onViewportChange={this._onViewportChange.bind(this)}
      >
        <LineLayer
        viewport={this.viewport}
        strokeWidth={3}
        
        arcs={this.props.data}
         />
      </ReactMapGL>
    );
  }
}

export default graphql(StaticMap);