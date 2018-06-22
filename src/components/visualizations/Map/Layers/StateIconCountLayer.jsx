import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer, IconLayer, WebMercatorViewport} from 'deck.gl';
import rbush from 'rbush';
import _ from 'lodash';
import PropTypes from 'prop-types';

const ICON_SIZE = 60;

function getIconName(size) {
  // console.log("SIZE:", size);
  // default
  let marker = 'marker-100';

  if (size === 0) {
    marker = '';
  }
  if (size < 10) {
    marker = `marker-${size}`;
  }
  if (size >= 10 && size < 100) {
    marker = `marker-${Math.floor(size/10)*10}`;
  }
  if (size >= 100 && size < 1000) {
    marker = `marker-${Math.floor(size/100)*100}`;
  }
  // 1k - 10k markers (1k increments)
  if (size >= 1000 && size < 10000) {
    marker = `marker-${Math.floor(size/1000)*1000}`;
  }
  
  // 20k - 100k markers (10k increments)
  if (size >= 20000 && size < 100000) {
    marker = `marker-${Math.floor(size/10000)*10000}`;
  }

  // 100k - 1m markers (100k increments)
  if (size >= 100000 && size < 1000000) {
    marker = `marker-${Math.floor(size/100000)*100000}`;
  }

  // 1m - 10m markers (1m increments)
  if (size >= 1000000 && size < 10000000) {
    marker = `marker-${Math.floor(size/1000000)*1000000}`;
  }

  // 10m - 100m markers (10m increments)
  if (size >= 10000000 && size < 100000000) {
    marker = `marker-${Math.floor(size/10000000)*10000000}`;
  }

  // 100m
  if (size >= 100000000) {
    marker = `marker-100000000`;
  }

  // console.log("MARKER:", marker);
  return marker;
}

function getIconSize(size) {
  return Math.min(100, size) / 100 * 0.5 + 0.5;
}

class StateIconCountLayer extends Component {

  constructor(props) {
    super(props);

    // build spatial index
    this._tree = rbush(9, ['.x', '.y', '.x', '.y']);
    this.state = {
      x: 0,
      y: 0,
      hoveredItems: null,
      expanded: false
    };

    this._updateCluster(props);
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  componentWillReceiveProps(nextProps) {
    const {viewport} = nextProps;
    const oldViewport = this.props.viewport;

    if (
      nextProps.iconCount.data !== this.props.iconCount.data ||
      viewport.width !== oldViewport.width ||
      viewport.height !== oldViewport.height
    ) {
      this._updateCluster(nextProps);
    }
  }

  // Compute icon clusters
  // We use the projected positions instead of longitude and latitude to build
  // the spatial index, because this particular dataset is distributed all over
  // the world, we can't use some fixed deltaLon and deltaLat
  _updateCluster({iconCount, viewport, groupKey, countKey}) {
    if (!iconCount.data) {
      return;
    }
    const data = iconCount.data;

    const tree = this._tree;

    const transform = new WebMercatorViewport({
      ...viewport,
      zoom: 0
    });

    // The Uber example did not involve a time dimension.
    // We have one. So first, we need to group by hospital/location aross all time entries.
    // We also want to filter out anything without lat/lng.
    // Otherwise don't do the whole group, just get on with the next forEach()
    // that sets screen coordinates (x, y)  and then the whole tree.load() stuff.
    // We need coordinates, and the countKey and groupKey to exist in the data.
    // Adjust props accordingly for group and count keys.
    let locations = {};
    data.filter(p => { return p.coordinates && p[countKey] && p[groupKey] })
      .forEach(p => {
        const groupName = p[groupKey];
        if (locations[groupName] === undefined) {
          // Copy this with assign(). Using `p` directly will keep counting up all the time on hover.
          locations[groupName] = Object.assign({}, p);
        } else {
          // add to existing
          locations[groupName][countKey] += p[countKey];
        }
      });
    const locationData = Object.values(locations);
  
    // console.log('orig data', data);
    // console.log('grouped data', locationData);

    locationData.forEach(p => {
      const screenCoords = transform.project(p.coordinates);
      p.x = screenCoords[0];
      p.y = screenCoords[1];
    });

    tree.clear();
    tree.load(locationData);

    // clusteredLocationData will be a group (another group) of items from locationData that 
    // are close enough to one another to cluster. We'll never not be clustering with this component.
    let clusteredLocationData = [];

    // Only one. It updates all the time anyway.
    locationData.forEach(p => {
      const {x, y} = p;
      const radius = ICON_SIZE / 2 / Math.pow(2, this.props.viewport.zoom);
      // This groups them
      const neighbors = tree
        .search({
          minX: x - radius,
          minY: y - radius,
          maxX: x + radius,
          maxY: y + radius
        });
      // Calculate their total messageCount (or whatever the countKey is)
      // const messageCount = _.sumBy(neighbors, function(o) { return o.messagesDelivered; });
      const count = _.sumBy(neighbors, function(o) { return o[countKey]; });
      
      // No need for name/organization, etc. This is purely about dropping pins.
      // All of the details will be shoved under a "points" key for other needs (hover/label).
      clusteredLocationData.push({
        // Take one of their locations, the first because there could only be one in the group.
        // It's reliable that way. Maybe could average the distance between later on?
        // ...and it's position by default.
        position: neighbors[0].coordinates,
        x: neighbors[0].x,
        y: neighbors[0].y,
        icon: getIconName(count),
        size: getIconSize(count),
        // The hover label will want to know all of the items in this group
        // For debugging purposes mainly, lets put the icon and size on each neighbor
        // NOTE: this means when zoomed out, both points will have the same aggregate marker icon/size.
        // So don't look at it zoomed out and think "market-7000" means 7k per point if there's two.
        // That would mean a total of 7k and both neighbors/points just reflect that one single value being used.
        // If you can zoom in until you reach just one point in the hovered items, then it would be per point.
        points: neighbors.map((point) => {
          point.icon = getIconName(count);
          point.size = getIconSize(count);
          return point;
        })
      });
    });

    // console.log('locationData', locationData);
    // console.log('clusteredLocationData', clusteredLocationData);
    return clusteredLocationData;
  }

  render() {
    const layers = [];

    // The GeoJsonLayer shows the shaded state outline.
    // It is pickable by default so it will send info up to DeckGL event handlers.
    layers.push(new GeoJsonLayer(
      Object.assign({
        id: 'geojson',
        opacity: 0.2,
        stroked: false,
        filled: true,
        wireframe: false,
        fp64: true,
        extruded: false,
        getElevation: (f => 0),
        getFillColor: (f => [248,144,0]),
        getLineColor: (f => [255, 255, 255]),
        lightSettings: {
          lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
          ambientRatio: 0.2,
          diffuseRatio: 0.5,
          specularRatio: 0.3,
          lightsStrength: [1.0, 0.0, 2.0, 0.0],
          numberOfLights: 2
        },
        pickable: true
        // This is unnecessary as DeckGL will capture it all
        // onClick: (info) => console.log('Layer click (onClick prop)', info)
      }, this.props.geoJson)
    ));

    // The IconLayer shows icons with counts all over the map, they combine together depending on zoom level
    const {iconAtlas, iconMapping} = this.props.iconCount;
    
    layers.push(new IconLayer(
      {
        id: 'icon',
        data: this._updateCluster(this.props),
        pickable: true,
        onLayerClick:this.props.onLayerClick,
        onLayerHover:this.props.onLayerHover,
        iconAtlas,
        iconMapping,
        sizeScale: ICON_SIZE * window.devicePixelRatio
      }
    ));

    return (<DeckGL 
      ref={deck => { this.deckGL = deck; }}
      {...this.props.viewport}
      onLayerClick={this.props.onLayerClick}
      onLayerHover={this.props.onLayerHover}
      height={this.props.height}
      width={this.props.width}
      layers={[layers]}
    />);
  }
}

StateIconCountLayer.defaultProps = {
  id: 'stateIconCount',
  viewport: {
    latitude: 49.254,
    longitude: -123.13,
    zoom: 11,
    maxZoom: 16,
    pitch: 45,
    bearing: 0
  },
  geoJson: {
    data: []
  },
  iconCount: {
    showCluster: true,
    data: []
  },
  groupKey: 'organization',
  countKey: 'messagesDelivered'
};

StateIconCountLayer.propTypes = {
  groupKey: PropTypes.string.isRequired,
  countKey: PropTypes.string.isRequired
};

export default StateIconCountLayer;