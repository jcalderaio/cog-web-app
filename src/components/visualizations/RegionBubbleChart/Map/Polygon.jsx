// This is a copy from react-d3-map-core it adds onMouseMove props as well.
import { Component } from 'react';
import PropTypes from 'prop-types';

// This library is used to keep React's virtual DOM in sync
// with the D3 manipulations we want to do. ie. we construct React components
// using the D3 api
import ReactFauxDOM from 'react-faux-dom';

// Ensure d3 v3 is used and not v4 (current). It's aliased to react-d3-map-core's d3 dependency.
import * as d3 from 'd3v3';

export default class Polygon extends Component {
  bindEventHandlers(polygon, props) {
    const {
      id,
      onMouseOut,
      onMouseOver,
      onMouseMove,
      onClick
    } = props;

    if (onMouseOver) {
      polygon.on("mouseover", (d, i) => onMouseOver(this, d, id));
    }

    if (onMouseOut) {
      polygon.on("mouseout", (d, i) => onMouseOut(this, d, id));
    }

    if (onClick) {
      polygon.on("click", (d, i) => onClick(this, d, id));
    }

    if (onMouseMove) {
      polygon.on("mousemove", (d, i) => onMouseMove(this, d, id));
    }

    return polygon;
  }

  _mkPolygon(dom) {
    const { id, data, polygonClass, geoPath } = this.props;
    var polygon = d3.select(dom);

    polygon
      .datum(data)
      .attr('class', `${polygonClass} polygon`)
      .attr('d', geoPath);

    if (id) {
      polygon.attr('id', id);
    }

    this.bindEventHandlers(polygon, this.props)
    
    return polygon;
  }

  render () {
    var poly = ReactFauxDOM.createElement('path');
    var chart = this._mkPolygon(poly);

    return chart.node().toReact();
  }

}

Polygon.defaultProps = {
  polygonClass: 'react-d3-map-core__polygon'
};

Polygon.propTypes = {
  data: PropTypes.object.isRequired,
  geoPath: PropTypes.func.isRequired,
  polygonClass: PropTypes.string
};
