import React, {Component} from 'react';
import {setParameters} from 'luma.gl';
import DeckGL, { ArcLayer } from 'deck.gl';

const orange = [255,140,0,255];
const blue = [50,140,255,255];

// function getColor(d) {
//   const z = d.start[2];
//   const r = z / 10000;

//   // return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
//   return orange;
// }

export default class LineLayer extends Component {
  static get defaultViewport() {
    return {
      latitude: 47.65,
      longitude: 7,
      zoom: 4.5,
      maxZoom: 16,
      pitch: 50,
      bearing: 0
    };
  }

  _initialize(gl) {
    setParameters(gl, {
      blendFunc: [gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE],
      blendEquation: gl.FUNC_ADD
    });
  }

  render() {
    const {viewport, arcs, strokeWidth} = this.props;

    // if (!flightPaths || !airports) {
    //   return null;
    // }

    const layers = [
      new ArcLayer({
        id: 'flight-paths',
        data: arcs,
        strokeWidth,
        fp64: false,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.destination,
        getTargetColor: d => blue,
        getSourceColor: d => orange,
        pickable: false,//Boolean(this.props.onHover),
        onHover: this.props.onHover
      })
    ];

    return <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />;
  }
}