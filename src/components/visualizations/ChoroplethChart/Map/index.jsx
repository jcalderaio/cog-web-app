import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Graticule,
  Mesh,
  Circle,
  PointText,
  Tile,
  isTooltipUpdate,
  tileFunc,
  scale as domainScaleFunc,
  projection as projectionFunc,
  geoPath as geoPathFunc
} from 'react-d3-map-core';
import Terraformer from 'terraformer';
/*eslint-disable */
// Ensure d3 v3 is used and not v4 (current). It's aliased to react-d3-map-core's d3 dependency.
import * as d3 from 'd3v3';
// import * as d3v4 from 'd3';
/*eslint-enable */
import Polygon from './Polygon';
import './map.scss';

// Re-export map Components
export { default as MapControls } from './MapControls';
export { default as MapLegend } from './MapLegend';

export default class Map extends Component {

  constructor(props) {
    super(props);

    // The projection function
    this.proj = null;

    // Region zoom click handler (needs to change to work with different "modes" so other click needs can be met)
    // So likely a "navigation mode" that allows zooming into regions and a "query mode" or "inspect" that will
    // pop up information about the data or layers visible on the map.
    this.handleClick = this.handleClick.bind(this);

    // Hit detection layer event handlers
    this._handleClick = this._handleClick.bind(this);
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleMouseOut = this._handleMouseOut.bind(this);
    this._handleMouseOver = this._handleMouseOver.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isTooltipUpdate(nextProps, nextState, this);
  }

  /*eslint-disable */
  componentDidUpdate() {
    // let move = 1;
    // while (move > 0) {
    //   move = 0;
    //   d3.selectAll('text.city-label-text')
    //     .each(function () {
    //       // console.log(this);
    //       const that = this;
    //       let a = this.getBoundingClientRect();
    //       d3.selectAll('text.city-label-text')
    //           .each(function () {
    //             if (this !== that) {
    //               const b = this.getBoundingClientRect();
    //               if ((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) &&
    //                 (Math.abs(a.top - b.top) * 2 < (a.height + b.height))) {
    //                 // overlap, move labels
    //                 const dx = (Math.max(0, a.right - b.left) + Math.min(0, a.left - b.right)) * 0.01;
    //                 const dy = (Math.max(0, a.bottom - b.top) + Math.min(0, a.top - b.bottom)) * 0.02;
    //                 const tt = d3.transform(d3.select(this).attr('transform'));
    //                 const to = d3.transform(d3.select(that).attr('transform'));
    //                 move += Math.abs(dx) + Math.abs(dy);

    //                 to.translate = [to.translate[0] + dx, to.translate[1] + dy];
    //                 tt.translate = [tt.translate[0] - dx, tt.translate[1] - dy];
    //                 d3.select(this).attr('transform', `translate(${tt.translate})`);
    //                 d3.select(that).attr('transform', `translate(${to.translate})`);
    //                 a = this.getBoundingClientRect();
    //               }
    //             }
    //           });
    //     });
    // }
  }
  /*eslint-enable */

  // getProjectionFunc will return the current projection function (with scale, translate, etc.)
  getProjectionFunc() {
    const { projection, precision, rotate, center, clipAngle, parallels, width } = this.props;
    let { translate, scale } = this.props;
    // NOTE: - 120 is temporary. 66 is total height of components above the map. plus some margin. automatically calculate this in the future.
    // counties need more space though.
    const height = this.props.dataGrid ? this.props.height : this.props.height - 120;

    // const width = this.props.availableDimensions().width;
    // const height = this.props.availableDimensions().height;

    // Ensure the map is centered.
    // See (Mike Bostock's answer): http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
    // Also: https://bl.ocks.org/mbostock/4699541
    // const center = d3.geo.centroid(this.props.polygonData);

    // Create a unit projection.
    // d3.geo.albers()
    if (d3.geo[projection] !== undefined) {
      const adjustedProjection = d3.geo[projection]()
        .scale(1)
        .translate([0, 0]);

      // Create a path generator.
      const path = d3.geo.path()
        .projection(adjustedProjection);

      // Compute the bounds of a feature of interest, then derive scale & translate.
      const b = path.bounds(this.props.polygonData);
      scale = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
      translate = [(width - (scale * (b[1][0] + b[0][0]))) / 2, (height - (scale * (b[1][1] + b[0][1]))) / 2];
    }

    return projectionFunc({
      projection: projection,
      scale: scale,
      translate: translate,
      precision: precision,
      rotate: rotate,
      center: center,
      clipAngle: clipAngle,
      parallels: parallels
    });
  }

  // getMapPolygon will return the current react-d3-map-core <Polygon /> Component
  getMapPolygon(projFunc) {
    const {
      domain,
      domainData,
      domainValue,
      domainKey,
      mapKey,
    } = this.props;
    let mapPolygon;
    const { polygonData } = this.props;
    const geoPath = geoPathFunc(projFunc);
    var byId = d3.map();
    var domainScale = domainScaleFunc(domain);
    domainData.forEach((d) => {
      byId.set(domainKey(d), domainValue(d));
    })
    if (polygonData) {
      if (!Array.isArray(polygonData)) {
        mapPolygon = polygonData.features.map((d, i) => {
          var val = byId.get(mapKey(d));
          var polygonClass = domainScale(val);
          d.properties[mapKey(d)] = val;

          return (
            <Polygon
              key={i}
              data={d}
              geoPath={geoPath}
              polygonClass={polygonClass}
            />
          )
        });
      } else {

        mapPolygon = polygonData.map((d, i) => {
          var val = byId.get(mapKey(d));
          var polygonClass = domainScale(val);

          d.properties[mapKey(d)] = val;

          return (
            <Polygon
              key={i}
              data={d}
              geoPath={geoPath}
              polygonClass={polygonClass}
            />
          )
        });
      }
    }
    return mapPolygon;
  }

  // getMapDetectionLayer will return the map <Polygon /> just as getMapPolygon() does, only it'll be transparent.
  getMapDetectionLayer(projFunc) {
    let mousePositionPolygon;
    const { polygonData } = this.props;
    const geoPath = geoPathFunc(projFunc);
    if (polygonData) {
      if (!Array.isArray(polygonData)) {
        mousePositionPolygon = (
          <Polygon
            data={polygonData}
            geoPath={geoPath}
            polygonClass="hit-detection"
            {...this.state}
            onMouseOut={this._handleMouseOut}
            onMouseMove={this._handleMouseOver}
            onClick={this._handleClick}
            onDoubleClick={this._handleDoubleClick}
          />
        );
      } else {
        mousePositionPolygon = polygonData.map((d, i) => {
          /*eslint-disable */
          // TODO: index as key
          return (
            <Polygon
              key={i}
              data={polygonData}
              geoPath={geoPath}
              polygonClass="hit-detection"
              {...this.state}
              onMouseOut={this._handleMouseOut}
              onMouseMove={this._handleMouseOver}
              onClick={this._handleClick}
              onDoubleClick={this._handleDoubleClick}
            />
          );
          /*eslint-enable */
        });
      }
    }
    return mousePositionPolygon;
  }

  // getMapMesh will return the current react-d3-map-core <Mesh /> Component which is responsible for drawing geo feature boundary lines
  getMapMesh(projFunc) {
    let mesh;
    const { meshData, meshClass } = this.props;
    const geoPath = geoPathFunc(projFunc);
    if (meshData) {
      if (!Array.isArray(meshData)) {
        mesh = (
          <Mesh
            data={meshData}
            geoPath={geoPath}
            meshClass={meshClass}
            {...this.state}
          />
        );
      } else {
        /*eslint-disable */
        // TODO: index as key
        mesh = meshData.map((d, i) => {
          return (
            <Mesh
              key={i}
              data={d}
              geoPath={geoPath}
              meshClass={meshClass}
              {...this.state}
            />
          );
        });
        /*eslint-enable */
      }
    }
    return mesh;
  }

  // getCityLabelPoints will return Circle elements to draw on the map for the top populated cities in the region
  getCityLabelPoints(projFunc) {
    let cityPoints;
    const { cityLabelData } = this.props;
    const geoPath = geoPathFunc(projFunc);
    const radius = 2;
    var randomKey = 0;
    if (cityLabelData && cityLabelData.features && cityLabelData.features.length > 0) {
      cityPoints = cityLabelData.features.map((d) => {
        const position = this._dataPosition(d, geoPath, this.proj);
        // console.log(d);
        // console.log(position);
        return (
          <Circle
            key={d.id ? d.id : randomKey++}
            data={d}
            geoPath={geoPath}
            circleClass={'city-label-point'}
            r={radius}
            x={position[0]}
            y={position[1]}
            {...this.state}
          />
        );
      });
    }
    return cityPoints;
  }

  // getCityLabels will return PointText elements to draw on the map for the top populated cities in the region
  getCityLabels() {
    let cityLabels;
    const { cityLabelData } = this.props;
    // const geoPath = geoPathFunc(projFunc);

    if (cityLabelData && cityLabelData.features && cityLabelData.features.length > 0) {
      // /////////////
      // Place and label location
      const foci = [];

      // Store the projected coordinates of the places for the foci and the labels
      cityLabelData.features.forEach((d) => {
        const c = this.proj(d.geometry.coordinates);
        foci.push({ x: c[0], y: c[1] });
      });
      // Create the force layout with a slightly weak charge
      const width = parseInt(this.props.width, 10);
      const height = parseInt(this.props.height, 10);
      const force = d3.layout.force()
        .nodes([])
        .charge(-20)
        .gravity(0)
        .chargeDistance(width / 8)
        .size([width, height]);

      // force.on('tick', (e) => {
      //   const k = 0.1 * e.alpha;
      //   cityLabels.forEach((o, j) => {
      //     console.log('city label', o);
      //     // The change in the position is proportional to the distance
      //     // between the label and the corresponding place (foci)

      //     // can't assign these like this...
      //     // cityLabels[j].props.dy += (foci[j].y - o.y) * k;
      //     // cityLabels[j].props.x += (foci[j].x - o.x) * k;

      //     // o.y += (foci[j].y - o.y) * k;
      //     // o.x += (foci[j].x - o.x) * k;
      //   });

      //   // Update the position of the text element
      //   d3.selectAll('text.city-label-text')
      //     .attr('x', (d) => { return d.x; })
      //     .attr('y', (d) => { return d.y; });
      // });

      const updatePos = (pt) => {
        // initial position offset (a little above and to the right of the dot)
        // pt.setState({ x: 3, dy: -3 });
        // console.log('PointText', pt);

        return force.on('tick', (e) => {
          // console.log('tick event', e);
          const c = this.proj(pt.props.data.geometry.coordinates);

          const k = 0.1 * e.alpha;
          // pt.setState({ x: 10, dy: -10 });
          // pt.setState({
          //   x: pt.props.x + (c.x - pt.props.x) * k,
          //   dy: pt.props.dy + (c.dy -  pt.props.dy) * k
          // });
          // console.log(pt.props.dy);

          d3.selectAll('text.city-label-text')
            .attr('x', () => { return pt.props.x + ((c[0] - pt.props.x) * k); })
            .attr('y', () => { return pt.props.dy + ((c[1] - pt.props.dy) * k); });
        });
      };

      // force.start();
      // ////////////
      var randomKey = 0;
      cityLabels = cityLabelData.features.map((d) => {
        // const position = this._dataPosition(d, geoPath, this.proj);
        return (
          <PointText
            key={d.id ? d.id : randomKey++}
            data={d}
            text={d.properties.city || d.properties.name}
            projection={this.proj}
            x={3}
            dy={-3}
            ref={updatePos}
            pointTextClass={'city-label-text'}
          />
        );
      });

      // force.nodes(cityLabels);
      // force.start();
    }
    return cityLabels;
  }

  // getLayers will run through passed in layers prop array and handle plotting data and drawing custom layers.
  // TODO: refactor. refactor. refactor.
  getLayers(projFunc) {
    const circles = { pop_2010: [], hospital: [], pcp: [], others: [] };
    if (this.props.layers.length > 0) {
      // console.log(this.props.layers);
      // This map has the projection, so it's hard for a higher order component to set up the items to layer on top.
      // It could pass the <Circle /> components (for example) and then this could be more of a "get and project layers"
      // function where it loops those components and adjusts their props to include the projection/translate for positioning.
      const demoParticipationData = this.props.layers[0];
      const geoPath = geoPathFunc(projFunc);

      // const domainScale = domainScaleFunc(this.props.domain);
      // const r = domainScale(circleValue(dataCircle));
      // const radius = 3; // scale based on data value
      if (demoParticipationData && demoParticipationData.features.length > 0) {
        const allCircleValues = [];
        demoParticipationData.features.forEach((d) => {
          allCircleValues.push(d.properties.pop_2010);
          // allCircleValues.push(d.properties.pcp);
          // allCircleValues.push(d.properties.others);
        });

        // console.log('all circle values', allCircleValues);
        const rscale = d3.scale.linear()
          .domain([5000, d3.max(allCircleValues)])
          .range([3, 15]);
        var randomKey = 0;
        circles.pop_2010 = demoParticipationData.features
          .filter((d) => { return d.properties.pop_2010 > 5000; }) //limiting to cities over 5,000 population
          .map((d) => {
            // in this demo, circleValue() is just the reported number.
            // here is a good reason why this data should be passed in. all of this can be best
            // determined by the component calling this one. it's just the positioning that has
            // to be set here...
            const r = rscale(d.properties.pop_2010);
            const position = this._dataPosition(d, geoPath, this.proj);
            return (
              <Circle
                key={d.properties.cartodb_id ? d.properties.cartodb_id : randomKey++}
                data={d}
                geoPath={geoPath}
                circleClass={'participation-bubble-pop_2010'}
                r={r}
                x={position[0] ? position[0] : 0}
                y={position[1] ? position[1] : 1}
                {...this.state}
              />
            );
          });

        circles.hospital = demoParticipationData.features
          .filter((d) => { return d.properties.hospital > 0; })
          .map((d) => {
            // in this demo, circleValue() is just the reported number.
            // here is a good reason why this data should be passed in. all of this can be best
            // determined by the component calling this one. it's just the positioning that has
            // to be set here...
            const r = rscale(d.properties.hospital);
            const position = this._dataPosition(d, geoPath, this.proj);
            // console.log(d);
            // console.log(position);
            return (
              <Circle
                key={d.id}
                data={d}
                geoPath={geoPath}
                circleClass={'participation-bubble-hospital'}
                r={r}
                x={position[0]}
                y={position[1]}
                {...this.state}
              />
            );
          });

        circles.pcp = demoParticipationData.features
          .filter((d) => { return d.properties.pcp > 0; })
          .map((d) => {
            const r = rscale(d.properties.pcp);
            const position = this._dataPosition(d, geoPath, this.proj);
            return (
              <Circle
                key={d.id}
                data={d}
                geoPath={geoPath}
                circleClass={'participation-bubble-pcp'}
                r={r}
                x={position[0]}
                y={position[1]}
                {...this.state}
              />
            );
          });

        circles.others = demoParticipationData.features
          .filter((d) => { return d.properties.others > 0; })
          .map((d) => {
            const r = rscale(d.properties.others);
            const position = this._dataPosition(d, geoPath, this.proj);
            return (
              <Circle
                key={d.id}
                data={d}
                geoPath={geoPath}
                circleClass={'participation-bubble-others'}
                r={r}
                x={position[0]}
                y={position[1]}
                {...this.state}
              />
            );
          });
      }
    }

    return (
      <g>
        <g id={'participation-layer-pop_2010'}>
          {circles.pop_2010}
        </g>
        {/*<g id={'participation-layer-pcp'}>
          {circles.pcp}
        </g>
        <g id={'participation-layer-others'}>
          {circles.others}
        </g>*/}
      </g>
    );
  }

  // handleClick will handle clicks on the <Polygon /> Component, from getMapPolygon()
  handleClick(e) {
    e.preventDefault();
    let offsetX = e.nativeEvent.offsetX;
    let offsetY = e.nativeEvent.offsetY;

    // Firefox computes offsets differently - it provides offsets relative
    // to the click handler element, i.e. the <g> element. whereas most other
    // browsers provide offsets relative to the <svg> element. We have to adjust
    // for this by calculating the offsets relative to the svg element and this
    // must be done with absolute properties as <g> elements are positioned
    // absolutely
    if (window && window.navigator.userAgent.indexOf('Firefox') !== -1) {
      // click handler target is the <g> element
      const gRect = e.currentTarget.getBoundingClientRect();
      // <g> element parent is the ownering <svg> element
      const svgRect = e.currentTarget.ownerSVGElement.getBoundingClientRect();

      const fixOffsetX = gRect.left - svgRect.left;
      const fixOffsetY = gRect.top - svgRect.top;

      offsetX += fixOffsetX;
      offsetY += fixOffsetY;
    }

    const point = new Terraformer.Primitive({
      type: 'Point',
      coordinates: this.proj.invert([offsetX, offsetY])
    });

    const thisElement = this.props.polygonData.features.filter((element) => {
      return point.within(element);
    });

    if (thisElement.length > 0) {
      this.props.handleChange('element.county', thisElement[0], 'ParentRegion');
    }

    return e;
  }

  // _dataPosition returns the translated x, y position for geo lat, lng.
  _dataPosition(d, geoPath, proj) {
    const {
      circleX,
      circleY
    } = this.props;

    const type = d.geometry ? d.geometry.type : 'other';

    let x;
    let y;
    if (type === 'Polygon' || type === 'MultiPolygon') {
      x = geoPath.centroid(d)[0];
      y = geoPath.centroid(d)[1];
    } else if (type === 'Point') {
      x = proj ? +proj(d.geometry.coordinates)[0] : d.geometry.coordinates[0];
      y = proj ? +proj(d.geometry.coordinates)[1] : d.geometry.coordinates[1];
    } else if (type === 'other') {
      x = proj ? +proj([circleX(d), circleY(d)])[0] : circleX(d);
      y = proj ? +proj([circleX(d), circleY(d)])[1] : circleY(d);
    }

    return [x, y];
  }

  // Hit detection layer events:
  // The following will return the current mouse position on the rendered map polygon.
  // TODO: Report it back, broadcast, or otherwise allow things to listen to this.
  // It'll be used for many things including tooltips. The problem with using Voronoi or mouse over
  // state on each layer or SVG element is that the map can have many layers. So when one layer
  // covers another, the mouseover no longer fires and having multiple Voronoi would overlap
  // and only the last one added would emit the events. So what instead needs to happen is the
  // aboslute mouse position needs to be known at all times and then a function can check
  // all of the layers using Terraformer.within() to see what's within a certain radius on
  // each layer. Then each layer can decide how to react. Of course multiple tooltips might
  // not make much sense, but there sould be a consolidated/aggregate tooltip that displays.
  // This way each layer can report into the same tooltip. If it's a tooltip that is shown
  // on mouse over at least. This is why reporting back is important - this Component won't
  // know what to display or do and it will vary.
  //
  // This can't be applied to the map polygon layer though (that's at the bottom).
  // This must be put into a new transparent map polygon as a top layer.
  _handleMouseOver(dom, d) {
    // This has to set state and broadcast.
    if (dom === 2) {
      console.log('mouse over');
      console.log(dom);
      console.log(d);
      console.log(this);
      console.log('x', d3.event.clientX);
      console.log('y', d3.event.clientY);
    }
  }

  _handleMouseOut(dom, d) {
    // This has to set state and broadcast.
    if (dom === 2) {
      console.log('mouse out');
      console.log(dom);
      console.log(d);
    }
  }

  _handleClick(dom, d) {
    // This has to set state and broadcast.
    // console.log('mouse click');
    // console.log(dom);
    // console.log(d);
  }

  _handleDoubleClick(dom, d) {
    // This has to set state and broadcast.
    console.log('mouse click');
    console.log(dom);
    console.log(d);
  }

  render() {
    const {
      width,
      height,
      showGraticule,
      showTile
    } = this.props;

    let graticule;
    let circle;
    let tile;

    const proj = this.getProjectionFunc();
    this.proj = proj;

    if (showTile) {
      const tiles = tileFunc({
        scale: proj.scale() * 2 * Math.PI,
        translate: proj([0, 0]),
        size: [width, height]
      });

      tile = (<Tile
        tiles={tiles}
        scale={tiles.scale}
        translate={tiles.translate}
      />);
    }

    const geoPath = geoPathFunc(proj);

    if (showGraticule) {
      graticule = (
        <Graticule
          geoPath={geoPath}
          {...this.state}
        />
      );
    }


    // console.log(this.props.dimensionOffsets);
    // TODO: remove the rel below. it was just put there to use dimensionOffsets so lint didn't complain =)
    // Note: this.getMapDetectionLayer() always comes last so it sits on top of everything
    return (
      <g onClick={this.handleClick}>
        {tile}
        {graticule}
        {this.getMapPolygon(this.getProjectionFunc())}
        {this.getMapMesh(this.getProjectionFunc())}
        {this.getCityLabels()}
        {this.getCityLabelPoints(this.getProjectionFunc())}
        {this.getLayers(this.getProjectionFunc())}
        {circle}
        {this.getMapDetectionLayer(this.getProjectionFunc())}
      </g>
    );
  }
}

// Default RegionBubbleChart props
Map.defaultProps = {
  width: 0,
  height: 0,
  showGraticule: false,
  polygonData: {},
  polygonClass: 'land',
  meshClass: 'border',
  meshData: {},
  cityLabelData: {},
  scale: 150,
  translate: [],
  precision: 0.1,
  rotate: 0,
  center: 0,
  clipAngle: 0,
  parallels: 0,
  projection: 'mercator',
  domain: {},
  dataCircle: {},
  circleValue: {},
  circleClass: 'bubble',
  circleX: () => { },
  circleY: () => { },
  showTile: false,
  layers: [],
  dimensionOffsets: {}
};

// Props validation
Map.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  showGraticule: PropTypes.bool,
  polygonData: PropTypes.any,
  polygonClass: PropTypes.string,
  meshClass: PropTypes.string,
  meshData: PropTypes.any,
  cityLabelData: PropTypes.any,
  scale: PropTypes.number,
  translate: PropTypes.array,
  precision: PropTypes.number,
  rotate: PropTypes.any,
  center: PropTypes.any,
  clipAngle: PropTypes.any,
  parallels: PropTypes.any,
  projection: PropTypes.string,
  domain: PropTypes.object,
  dataCircle: PropTypes.any,
  circleValue: PropTypes.any,
  circleClass: PropTypes.string,
  circleX: PropTypes.func,
  circleY: PropTypes.func,
  showTile: PropTypes.any,
  handleChange: PropTypes.func.isRequired,
  layers: PropTypes.array,
  dimensionOffsets: PropTypes.object
};

