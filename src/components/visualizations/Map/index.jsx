import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ReactMapGL from 'react-map-gl';
import USStateBoundingBoxes from 'visualizations/Map/data/USStateBoundingBoxes';
import geoViewport from '@mapbox/geo-viewport';
import StateIconCountLayer from './Layers/StateIconCountLayer';
import AlabamaGeo from '../../../assets/data/Alabama.geo.json';
import IconMapping from './data/location-icon-mapping-large.json';
import FontAwesome from 'react-fontawesome';
import {token} from 'utils/mapUtils';
import abbreviate from 'number-abbreviate';

// Quick notes on Deck.gl and ReactMapGL
// 1. "Layers" are part of `deck.gl` and they use WebGL. You can't put HTML in there.
// 2. "Overlays" are part of `react-map-gl` and they can display HTML.
//    These overlays actually become "underlays" when used with Deck.gl. So you can't click on them.
// 3. "DeckGL" component is a container for "Layers" that can live within "ReactMapGL"
// 4. "Layer" order matters. They can block clicks of other layers.
//    It might be a good idea to put filled gejson polygons at the bottom for example.
// 5. Click handlers can be applied to "Layers", "ReactMapGL", and "DeckGL" components.
//    This gets confusing.
// 6. Layers MUST set a `pickable` prop to true if they want to register click handlers.
//    They will not even respond to clicks otherwise.
// 7. Layers use `onClick` prop.
// 8. DeckGL uses `onLayerClick` prop (I believe it passes the handler function down to children Layers).
// 9. You can use click handlers on ReactMapGL as well...but ONLY for controlling the underlying
//    Mapbox component...Which you could also control to a degree (the `viewport`) outside of that
//    component and with local state, etc.
//
// 10. Using multiple DeckGL components will cover others. While you may be able to see through them,
//     you will not be able to click on the ones underneath. You also won't get information from them
//     when clicking on the other DeckGL components.
//
//     So use one DeckGL component with all the Layers you need.
//
// More info about picking: https://github.com/uber/deck.gl/blob/master/docs/advanced/picking.md
// Note that hovering is different than clicking.
//
// It may be possible to manually query the layers below...
// To return what is "under" a certain coordinate for each layer.
// https://github.com/uber/deck.gl/blob/master/docs/get-started/interactivity.md
// https://github.com/uber/deck.gl/blob/master/docs/api-reference/react/deckgl.md
//
// tl;dr? Set `pickable` to true on Layers you want info from. Use an `onLayerClick` prop/handler on DeckGL.
// Don't bother with overlays.
// Watch out for hiding things you want to click on.
//
// What about an actual "overlay" for controls?
// Put component outside of ReatMapGL, as a sibling, absolute position with CSS to float on top.
// Don't even try to put controls into a Layer or Overlay or anything at all with Uber's packages.
// Unless you want to work with WebGL.

// IconLayer documentation:
// https://github.com/uber/deck.gl/blob/5.1-release/docs/layers/icon-layer.md

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.handleViewportChange = this.handleViewportChange.bind(this);
    this.calculateViewPort = this.calculateViewPort.bind(this);
    this.onDeckGLLayerClick = this.onDeckGLLayerClick.bind(this);
    this.onDeckGLLayerHover = this.onDeckGLLayerHover.bind(this);
    this.handleMapZoomOutClick = this.handleMapZoomOutClick.bind(this);    
  }

  state = {
    viewport: {
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8,
      maxZoom: 8,
      pitch: 0,
      bearing: 0
    },
    toolTipX: 0,
    toolTipY: 0,
    hoveredObject: null,
    zoomed: false
  };

  onDeckGLLayerClick(info, pickedInfos, event) {
    if (!this.state.zoomed && info && info.lngLat) {
      const newViewport = this.state.viewport;
      newViewport.longitude = info.lngLat[0];
      newViewport.latitude = info.lngLat[1];
      newViewport.zoom = 8;
      newViewport.maxZoom = 8;
      this.setState({ viewport: newViewport, zoomed: true });
    }

    // So many ways to zoom out. Seriously.
    // Mouse wheel scrolling was disbled, but double clicking can zoom out.
    // Catch that here.
    if (this.state.viewport.zoom === 5) {
      this.setState({ zoomed: false });
    }
  }

  onDeckGLLayerHover(info, pickedInfos, event) {
    if (info && info.object && info.object.points) {
      this.setState({
        toolTipX: info.pixel[0],
        toolTipY: info.pixel[1],
        hoveredObject: info.object
      });
    } else {
      this.setState({toolTipX: 0, toolTipY: 0, hoveredObject: null});
    }
  }

  _renderTooltip(countKey) {
    const {toolTipX, toolTipY, hoveredObject} = this.state;

    if (!hoveredObject) {
      return null;
    }

    const tooltipStyle = {
      position: 'absolute',
      padding: '4px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      maxWidth: '300px',
      zIndex: 9,
      fontSize: '14px',
      pointerEvents: 'none'
    };

    let hoveredPoints = [];
    let aggregatePointsList = {};

    // Have to look at the proper zoom level since points are clustered.
    // const z = Math.floor(this.state.viewport.zoom);
    // console.log('Z:', z);
    // console.log(hoveredObject);
    if (hoveredObject && hoveredObject.points) {
      hoveredPoints = hoveredObject.points;
      // console.log('HOVERED POINTS:',hoveredPoints);
      if (hoveredPoints) {
        for (let i = 0; i < hoveredPoints.length; i++) {
          if (aggregatePointsList[hoveredPoints[i].name] === undefined) {
            aggregatePointsList[hoveredPoints[i].name] = {
              name: hoveredPoints[i].name,
              count: hoveredPoints[i][countKey]              
            }
          } else {
            aggregatePointsList[hoveredPoints[i].name].count += hoveredPoints[i][countKey];
          }
        }
      }
    }
    // console.log(aggregatePointsList);

    var labels = [];
    for (let i in aggregatePointsList) {
      if (aggregatePointsList[i]) {
        labels.push(<div key={i}>
          {aggregatePointsList[i].name}: {abbreviate(aggregatePointsList[i].count)}
        </div>);
      }
    }

    return (
      <div style={{...tooltipStyle, left: toolTipX, top: toolTipY}}>
        <strong>{this.props.label}</strong>
        {labels}
      </div>
    );
  }

  handleMapZoomOutClick() {
    if (this.state.zoomed) {
      this.setState({ viewport: this.calculateViewPort(this.state.viewport), zoomed: false });
    }
  }
 
  /**
   * Figure out the new dimensions for the map viewport.
   */
  handleViewportChange(viewport, parentWidth) {
    // Scroll zoom has been disbled, but there may be instances where the viewport changes zoom level.
    // This will ensure zooming in again doesn't break.
    if (viewport.zoom === 5) {
      this.setState({ zoomed: false });
    }
    this.setState({ viewport: this.calculateViewPort(viewport) });
  }

  calculateViewPort(viewport) {
    const { stateName = 'Alabama', minZoom = 5, maxZoom = 5, defaultZoom = 5, pitch = 0, bearing = 0 } = this.props;
    viewport.pitch = pitch;
    viewport.bearing = bearing;

    const stateBox = USStateBoundingBoxes[stateName].boundingbox;

    const bounds = geoViewport.viewport(
      [
        stateBox[0], // S
        stateBox[2], // W
        stateBox[1], // N
        stateBox[3] // E
      ],
      [viewport.height, viewport.width],
      minZoom,
      maxZoom
    );

    viewport.latitude = bounds.center[0];
    viewport.longitude = bounds.center[1];

    // Some calculations through viewport() don't even return a zoom level (like Arizona) so default to 6.
    viewport.zoom = bounds.zoom || defaultZoom;

    return viewport;
  }

  componentWillMount() {
    const initViewport = {
      //width: window.innerWidth,
      //height: window.innerHeight,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 5
    };
    this.setState({ viewport: this.calculateViewPort(initViewport) });
  }
  
  render() {
    const width = this.props.width;
    const height = this.props.height;
    const data = this.props.data;    
    const countKey = this.props.countKey;

    const colorScale = r => [r * 255, 140, 200 * (1 - r)];
    
    return (
      <div>
      {this._renderTooltip(countKey)}
      <ReactMapGL
        {...this.state.viewport}
        width={width}
        height={height}
        onViewportChange={viewport => this.handleViewportChange(viewport, width)}
        mapStyle="mapbox://styles/mapbox/light-v8"
        mapboxApiAccessToken={token()}
        scrollZoom={false}
      >
        <StateIconCountLayer
          onRef={ref => (this.deck = ref)}
          viewport={this.state.viewport}
          height={height}
          width={width}
          geoJson={{ data: AlabamaGeo, colorScale: colorScale }}
          iconCount={{
            showCluster: true,
            iconAtlas:
              '/static/media/location-icon-atlas-large.png',
            iconMapping: IconMapping,
            data: data
          }}
          onLayerClick={this.onDeckGLLayerClick}
          onLayerHover={this.onDeckGLLayerHover}
          groupKey={this.props.groupKey}
          countKey={this.props.countKey}
        />
      </ReactMapGL>
      <div
        onClick={this.handleMapZoomOutClick}
        className="map-zoom-out-button"
        style={{ display: this.state.zoomed ? 'block' : 'none' }}
      >
        <FontAwesome className="widget-control" name="search-minus" size="2x" style={{ color: '#777' }} />
      </div>
    </div>      
    );
  }
}

Map.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  groupKey: PropTypes.string.isRequired,
  countKey: PropTypes.string.isRequired
};
