import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {ForceGraph, ForceGraphNode, ForceGraphLink} from 'react-vis-force';
import { Constants as ColorConstants } from 'visualizations/common/colorControls';
import _ from 'lodash';

import { defaultSimulation } from './simulations';
// const colors = ColorConstants.scheme20;
const colors = ColorConstants.scheme;
const toNode = (colors) => (props, i) => <ForceGraphNode key={i} fill={colors(i)} {...props} />;
const toLink = (props, i) => <ForceGraphLink key={i} {...props} />;

// see force.js#updateSimulation
const SimulationOptions = ['width', 'height', 'linkDistance', 'linkStrength'];
const RandomNumNodes = 30;

export default class ForceDirectedGraph extends Component {
  constructor(props) {
    super(props);

    this.generateLinks = this.generateLinks.bind(this);
  }

  getSimulationProps(props) {
    if (!props.simulation) return defaultSimulation;
    return {
      createSimulation: props.simulation.createSimulation || defaultSimulation.createSimulation,
      updateSimulation: props.simulation.updateSimulation || defaultSimulation.updateSimulation
    }
  }

  getNodeId(index) {
    return `node-${index}`
  }

  randomNodeProps(count) {
    return _.range(count).map((index) => {
      return {
        id: index,
        node: {
          id: this.getNodeId(index)
        }
      }
    })
  }

  generateLinks(sourceNodeIndex, firstTargetIndex, totalNodeCount) {
    const sourceId = this.getNodeId(sourceNodeIndex);
    return _.range(firstTargetIndex, totalNodeCount).map(
      (targetIndex) => (Object.assign({
        link: {
          source: sourceId,
          target: this.getNodeId(targetIndex)
        }
      }, this.props.linkProps)))
  }

  generateAllLinkProps(nodes) {
    return _.range(nodes.length-1).reduce(
        (links, srcNodeIndex) => links.concat(
          this.generateLinks(srcNodeIndex, srcNodeIndex+1, nodes.length)), 
      []);
  }

  render() {
    let nodes;
    let links;

    if (this.props.fullyConnected) {
      nodes = this.randomNodeProps(this.props.nodeCount);
      links = this.generateAllLinkProps(nodes);
    } else {
      nodes = this.props.nodes;
      links = this.props.links;
    }

    const simulationOptions = _.pick(this.props, SimulationOptions)
    const simulation = this.getSimulationProps(this.props);
    const toColoredNode = toNode(this.props.colors);

    return (
      <ForceGraph
        className={'force-graph-widget'}
        simulationOptions={simulationOptions} {...simulation}>
        {nodes.map(toColoredNode)}
        {links.map(toLink)}
      </ForceGraph>
    );
  }
}

ForceDirectedGraph.defaultProps = {
  width: 300,
  height: 300,
  colors: colors,
  linkProps: {},
  linkDistance: 30,
  nodes: [],
  links: [],
  nodeCount: RandomNumNodes,
  fullyConnected: false
}

ForceDirectedGraph.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  linkDistance: PropTypes.number,
  linkStrength: PropTypes.number,
  fullyConnected: PropTypes.bool,
  nodeCount: PropTypes.number,
  linkProps: PropTypes.object,
  colors: PropTypes.func
}
