import React, { Component } from 'react';
import { Treemap, Tooltip } from 'recharts';
import { Well } from 'react-bootstrap';

let theFacilityLength = 0; // Passed in facility array length
let currPayload = {}; // Payload for custom tooltip
let filters = {}; // The current filter

export default class TreeMap extends Component {
  constructor(props) {
    super(props);

    theFacilityLength = this.props.facilityLength;

    // Sets an array of random colors the size of the facility array
    this.colors = [];
    for (var i = 0; i < this.props.facilityLength; ++i) {
      this.colors.push('#' + (Math.random().toString(16) + '000000').slice(2, 8));
    }
  }

  render() {
    const { width, height, data, dataKey, ratio, stroke, fill, properties } = this.props;

    // Sets filters var to passed in filters prop
    filters = properties.filters;

    return (
      <Treemap
        width={width}
        height={height}
        data={data}
        dataKey={dataKey}
        ratio={ratio}
        stroke={stroke}
        fill={fill}
        content={<CustomTreeContent colors={this.colors} />}
        animationDuration={1}
        isAnimationActive={false}
      >
        <Tooltip active={true} content={<CustomTooltipContent />} />
      </Treemap>
    );
  }
}

class CustomTreeContent extends Component {
  render() {
    let { root, depth, x, y, width, height, index = 0, colors, name } = this.props;
    let streamletCount = ''; // StreamletCount of current sub-item
    let streamletName = ''; // Name of current sub-item
    if (root && root.children && root.children[index] !== undefined) {
      streamletCount = root.children[index].size || '0';
      streamletName = root.children[index].name || '';
    }
    index++;

    // The 2 rectangles are needed because one if for the tooltip overlay (with opacity 0),
    // and one for displaying the actual rectangle hospital color
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fillOpacity="0"
          style={{
            fillOpacity: 0,
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10)
          }}
        />
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={depth === 1 ? colors[Math.floor((index / theFacilityLength) * theFacilityLength)] : 'none'}
          style={{
            fillOpacity: 1,
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10)
          }}
        />
        {depth === 1 ? (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={14}>
            {name}
          </text>
        ) : null}

        {filters.type && !filters.organization && depth === 2 ? (
          <g>
            <text x={x + width / 2} y={y + height / 2 + 22} textAnchor="middle" fill="#fff" fontSize={10}>
              {streamletName}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 40} textAnchor="middle" fill="#fff" fontSize={10}>
              {streamletCount}
            </text>
          </g>
        ) : null}
        {!filters.type && filters.organization && depth === 2 ? (
          <g>
            <text x={x + width / 2} y={y + height / 2 + 22} textAnchor="middle" fill="#fff" fontSize={10}>
              {streamletName}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 40} textAnchor="middle" fill="#fff" fontSize={10}>
              {streamletCount}
            </text>
          </g>
        ) : null}
        {filters.type && filters.organization && depth === 2 ? (
          <g>
            <text x={x + width / 2} y={y + height / 2 + 22} textAnchor="middle" fill="#fff" fontSize={14}>
              {streamletName}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 50} textAnchor="middle" fill="#fff" fontSize={14}>
              {streamletCount}
            </text>
          </g>
        ) : null}
      </g>
    );
  }
}

class CustomTooltipContent extends Component {
  render() {
    const { active, payload } = this.props;

    // Active means currently hovering over streamlet
    // Payload contains data such as facility name, streamlet name, and size of streamlet
    if (active && payload && payload[0] !== undefined) {
      currPayload = {
        facilityName: payload[0].payload.root.name,
        streamletName: payload[0].payload.name,
        value: payload[0].value
      };

      return (
        <div className="custom-tooltip">
          <Well bsSize="small" style={{ color: 'black', textAlign: 'center' }}>
            <p className="label" style={{ color: 'black', fontSize: 14 }}>{`${currPayload.facilityName}`}</p>
            <br />
            <p className="label" style={{ color: 'black' }}>{`${currPayload.streamletName}`}</p>
            <br />
            <p className="label" style={{ color: 'black' }}>{`${currPayload.value}`}</p>
          </Well>
        </div>
      );
    }

    return null;
  }
}

// This is a filter that will show the streamlet count on the top level. Took it out because it looked ugly, but
// kept it in case anyone wanted to use it in the future.
/*
 {!filters.type && !filters.organization && depth === 2 ? (
          <text x={x + width / 2} y={y + height / 2 + 22} textAnchor="middle" fill="#fff" fontSize={10}>
            {streamletCount}
          </text>
        ) : null}
        */
