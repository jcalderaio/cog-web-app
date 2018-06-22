/**
 * This code was grabbed uber's react-vis-force libary:
 * https://github.com/uber/react-vis-force/blob/master/src/utils/d3-force.js
 * and modified to create ad-hoc simulations
 */

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force';

const ALPHA_FACTORS = [
  'alpha',
  'alphaDecay',
  'alphaMin',
  'alphaTarget',
  'velocityDecay',
];

/**
 * check ES2015 Sets for equality.
 * http://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
 * @param {Set} setA
 * @param {Set} setB
 * @returns {boolean} are the sets equal
 */
function setsEqual(setA, setB) {
  if (setA.size !== setB.size) {
    return false;
  }

  let acc = true;
  setA.forEach((a) => {
    acc = acc && setB.has(a);
  });

  return acc;
}

// ---- PRIVATE METHODS ----
/**
 * return a mapped list of objects where only the attrNames provided
 * remain on the objects in the collection.
 * @param {array} list - array of objects
 * @param {...array} attrNames - keys, spread over the rest of the arguments
 * @return {array} mapped list of new objects with only the attrNames on them
 */
function pick(list, ...attrNames) {
  return list.map(item => attrNames.reduce(
    (obj, attrName) => Object.assign(obj, {
      [attrName]: item[attrName],
    }),
    {}
  ));
}

/**
 * take a function or a value to return as a strength and set it
 * @param {mixed} target
 * @return {function} a strength function
 */
export function asStrengthFn(target) {
  switch (typeof target) {
    case 'function':
      return target;
    default:
      return () => target;
  }
}

function applyAlphaFactors(simulation, options) {
  ALPHA_FACTORS.forEach((alphaFactorName) => {
    if ({}.hasOwnProperty.call(options, alphaFactorName)) {
      simulation[alphaFactorName](options[alphaFactorName]);
    }
  });

  return simulation;
}

function applyCenterForce(simulation, { height, width }) {
  // setup a new center force if it doesn't exist.
  if (!simulation.force('center')) {
    simulation.force('center', forceCenter());
  }

  // set the center force to the center of the graph. only update
  // the value if it is not the same as the previous value.
  const centerX = width ? width / 2 : 0;
  if (width > 0 && simulation.force('center').x() !== centerX) {
    simulation.shouldRun = true;
    simulation.force('center').x(centerX);
  }

  const centerY = height ? height / 2 : 0;
  if (height > 0 && simulation.force('center').y() !== centerY) {
    simulation.shouldRun = true;
    simulation.force('center').y(centerY);
  }

  return simulation;
}

function applyManyBodyChargeForce(simulation, { strength = {} }) {
  if (!simulation.force('charge')) {
    simulation.force('charge', forceManyBody());
  }

  if (strength.charge !== simulation.strength.charge) {
    simulation.strength.charge = strength.charge;
    simulation.shouldRun = true;
    simulation.force('charge').strength(asStrengthFn(strength.charge));
  }
}

function applyCollisionForce(simulation, { radiusMargin = 3, strength = {} }) {
  if (!simulation.force('collide')) {
    simulation.force('collide', forceCollide());
  }

  if (simulation.radiusMargin !== radiusMargin) {
    simulation.radiusMargin = radiusMargin;
    simulation.shouldRun = true;
    simulation.force('collide').radius(({ radius }) => radius + radiusMargin);
  }

  if (strength.collide !== simulation.strength.collide) {
    simulation.strength.collide = strength.collide;
    simulation.shouldRun = true;
    simulation.force('collide').strength(asStrengthFn(strength.collide)());
  }
}

function applyLinkForce(simulation, {
  data: { nodes, links },
  linkAttrs = [],
  nodeAttrs = [],
  linkDistance,
  linkStrength
}) {
  // setup the link force if it isn't already set up
  if (!simulation.force('link')) {
    simulation.force('link', forceLink().id(nodeId));

    if (linkDistance) {
      simulation.force('link').distance(linkDistance);
    }
  }

  // set the nodes and links for this simulation. provide
  // new instances to avoid mutating the underlying values.
  // only update if there are changes.
  const prevNodesSet = new Set(simulation.nodes().map(nodeId));
  const newNodesSet = new Set(nodes.map(nodeId));
  if (!setsEqual(prevNodesSet, newNodesSet)) {
    simulation.shouldRun = true;
    simulation.nodes(
      pick(nodes, 'id', 'radius', 'fx', 'fy', ...nodeAttrs)
    );
  }

  const prevLinksSet = new Set(simulation.force('link').links().map(linkId));
  const newLinksSet = new Set(links.map(linkId));
  if (!setsEqual(prevLinksSet, newLinksSet)) {
    simulation.shouldRun = true;
    simulation.force('link').links(
      pick(links, 'source', 'target', 'value', ...linkAttrs)
    );

    if (linkStrength) {
      simulation.force('link').strength(linkStrength)
    }
  }
}

function applyAxisForce(simulation, { strength = {} }) {
  if (!simulation.force('x')) {
    simulation.force('x', forceX());
  }

  if (!simulation.force('y')) {
    simulation.force('y', forceY());
  }

  if (strength.x !== simulation.strength.x) {
    simulation.strength.x = strength.x;
    simulation.shouldRun = true;
    simulation.force('x').strength(asStrengthFn(strength.x));
  }

  if (strength.y !== simulation.strength.y) {
    simulation.strength.y = strength.y;
    simulation.shouldRun = true;
    simulation.force('y').strength(asStrengthFn(strength.y));
  }
}

// ---- PUBLIC METHODS ----
/**
 * given a force-directed graph node, return its id.
 * @param {object} node
 * @returns {string} id
 */
export function nodeId(node) {
  return node.id;
}

/**
 * given a force-directed graph link, return its id.
 * @param {object} link
 * @returns {string} id
 */
export function linkId(link) {
  return `${link.source.id || link.source}=>${link.target.id || link.target}`;
}

/**
 * run the simulation and stop it after the appropriate number of steps.
 * @param {object} simulation - a d3-force simulation ready to be run
 * @param {number} steps - the number of times to call tick
 * @returns {object} the run simulation
 */
export function runSimulation(simulation) {
  simulation.restart();

  // run the simulation to fruition and stop it.
  while (simulation.alpha() > simulation.alphaMin()) {
    simulation.tick();
  }

  simulation.stop();

  return simulation;
}

/**
 * given the options, update a simulation
 * @param {object} options
 * @returns {object} d3-force simulation
 */
export function createSimulation(options) {
  // update center force
  const simulation = forceSimulation();
  simulation.strength = {};
  return updateSimulation(simulation, options);
}

/**
 * given the options, update a simulation.
 * @param {object} simulation - a d3-force simulation
 * @param {object} options
 * @param {number} options.height
 * @param {number} options.width
 * @param {object} options.data
 * @param {array} options.data.nodes
 * @param {array} options.data.links
 * @param {object} [options.strength]
 * @param {function|number} [options.strength.charge]
 * @param {function|number} [options.strength.collide]
 * @param {function|number} [options.strength.x]
 * @param {function|number} [options.strength.y]
 * @param {boolean} [options.animate]
 * @param {number} [options.alpha]
 * @param {number} [options.alphaDecay]
 * @param {number} [options.alphaMin]
 * @param {number} [options.alphaTarget]
 * @param {number} [options.velocityDecay]
 * @param {number} [options.radiusMargin]
 * @param {number} [options.linkDistance]
 * @param {number} [options.linkStrength]
 * @returns {object} d3-force simulation
 */
export function updateSimulation(simulation, options) {
  applyAlphaFactors(simulation, options);
  applyCenterForce(simulation, options);
  applyManyBodyChargeForce(simulation, options);
  applyCollisionForce(simulation, options);
  applyLinkForce(simulation, options);
  applyAxisForce(simulation, options);

  if (!options.animate && simulation.shouldRun) {
    runSimulation(simulation);
  }

  simulation.shouldRun = null;

  return simulation;
}