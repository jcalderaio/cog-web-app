import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Svg } from 'react-d3-map-core';
import './styles.css';
/*eslint-disable */
// Ensure d3 v3 is used and not v4 (current). It's aliased to react-d3-map-core's d3 dependency.
import * as d3 from 'd3v3';
// import MapBubble from 'react-d3-map-bubble/lib/mapBubble';
// ^ going to try and reproduce mapBubble here. so we can modify it. as well as map.jsx
import Map, { MapLegend, MapControls } from './Map';
const topodata = require('./data/Alabama.topo.json');
const topojson = require('topojson');

// To adjust available height/width for <Svg /> and <Map />
const otherComponentSizes = {};

export class Choropleth extends Component {
  /*eslint-enable */

  // Some sources:
  // https://github.com/johan/world.geo.json/tree/master/countries/USA  (states and then counties for each state)
  // https://github.com/storiesofsolidarity/us-data/tree/gh-pages/geography (states, counties, zcta (zipcode poly? ... zipcode tabluation areas) zipcode points)
  // https://gist.github.com/jefffriesen/6892860 zip codes

  constructor(props) {
    super(props);
    this.state = {
      xTooltip: null,
      yTooltip: null
    };
    this.getAvailableDimensions.bind(this);
  }

  // getReportSize will return the offsetWidth and offsetHeight of various Components using a returnRef prop.
  // This allows this Component to adjust the height and width prop for <Svg /> and <Map /> since they must
  // be specified as absolute values and can not use percentages. Only this Component will know where the
  // child Components were positioned so the calculations are made here. The only thing the child Components
  // do is return their node to this callback.
  getReportedSize(node, componentName) {
    if (node) {
      // console.log('node', node);
      // console.log(node.offsetHeight);
      // console.log(node.offsetWidth);

      // NOTE: Currently all of these other Components are at the top, so the only change will be to the height.
      // If one of the Components was off to the side, then it would need to be targeted based on componentName
      // in a switch of some sort and then set a width key value instead of height.
      // The problem with always adding it is that Components above the SVG element won't have any affect on
      // the available width. Also note that this.state is not available here.
      otherComponentSizes[componentName] = { height: node.offsetHeight };
    }
  }

  // getAvailableDimensions will add up all of the reported sizes from other Components then substract from the
  // grid item dimensions given to this Component's props.
  getAvailableDimensions() {
    if (this.props) {
      // This updates when the GridItem is resized/dragged.
      const width = this.props.widgetWidth;
      const height = this.props.widgetHeight;

      const reduction = { height: 0, width: 0 };
      for (const i in otherComponentSizes) {
        if (otherComponentSizes[i].height !== undefined) {
          reduction.height += otherComponentSizes[i].height;
        }
        if (otherComponentSizes[i].width !== undefined) {
          reduction.width += otherComponentSizes[i].width;
        }
      }

      return { height: height - reduction.height, width: width - reduction.width };
    }
    return { height: 0, width: 0 };
  }

  // _onMouseMove(dom, d, i)
  _onMouseMove(dom, d) {
    console.log('mouse move');
    console.log('x', d3.event.clientX);
    console.log('y', d3.event.clientY);

    this.setState({
      xTooltip: d3.event.clientX,
      yTooltip: d3.event.clientY,
      contentTooltip: d
    });
  }

  // _onMouseOut(dom, d, i)
  _onMouseOut() {
    this.setState({
      xTooltip: null,
      yTooltip: null
    });
  }

  render() {
    const onMouseOut = this._onMouseOut.bind(this);
    const onMouseMove = this._onMouseMove.bind(this);

    // console.log(this.props);
    // This updates when the GridItem is resized/dragged.
    // The props are strings, ie. "10px" so they need to be parsed to integers.
    // const width = parseInt(this.props.width, 10);
    // const height = parseInt(this.props.height, 10);
    // const { width, height } = this.getAvailableDimensions();

    // domain (for circle scale/sizes)
    // NOTE: this will need to change
    const domain = {
      scale: 'quantize',
      domain: [1386379576, 4117584013],
      range: d3.range(5).map(function (i) { return "q" + i + "-6"; })
    };

    // This updates when the GridItem is resized/dragged.
    // The props are strings, ie. "10px" so they need to be parsed to integers.
    const width = parseInt(this.props.width, 10);
    const height = parseInt(this.props.height, 10);
    const domainData = topodata.objects['cb_2015_alabama_county_20m'].geometries.map(function (item) {
      return {
        GEOID: item.properties.GEOID,
        ALAND: item.properties.ALAND
      }
    });
    var domainValue = function (d) { return +d.ALAND; };
    var domainKey = function (d) { return d.GEOID };
    var mapKey = function (d) { return d.properties.fips };
    this.getAvailableDimensions();
    // console.log('available height passed', this.getAvailableDimensions().height);

    return (
      <div className={'choropleth-chart-widget unselectable'}>
        <MapControls {...this.props} returnRef={this.getReportedSize} />
        <MapLegend {...this.props} returnRef={this.getReportedSize} />
        <Svg
          width={width}
          height={height}
          onMouseMove={onMouseMove}
          onMouseOut={onMouseOut}
        >
          <Map
            dimensionOffsets={otherComponentSizes}
            width={width}
            height={height}
            domain={domain}
            domainData={domainData}
            domainValue={domainValue}
            domainKey={domainKey}
            mapKey={mapKey}
            {...this.props}
            {...this.state}
          />
        </Svg>
      </div>
    );
  }

}

// Default Choropleth props
Choropleth.defaultProps = {
  showLegend: false,
  showGraticule: false,
  meshClass: 'border',
  polygonClass: 'land',
  projection: 'mercator',
  width: 0,
  height: 0
};

// Props validation
Choropleth.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number
};
