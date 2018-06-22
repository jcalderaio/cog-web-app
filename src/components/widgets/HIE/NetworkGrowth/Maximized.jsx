import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import _ from 'lodash';
import LineChartVisualization from 'visualizations/LineChart';
import ForceDirectedGraph from 'visualizations/ForceDirectedGraph';
import Zoom from 'visualizations/Zoom';
import { graphql } from 'providers/GraphQL';
import ResponsiveWidget from 'components/widgets/ResponsiveWidget';
import { Constants as ColorConstants } from 'visualizations/common/colorControls';
import { Mappers as DateMappers } from 'visualizations/common/dateControls';

import 'components/widgets/HIE/NetworkGrowth/styles/hieNetworkVisual.scss'

// TODO: refactor. these really shouldn't be outside the class.
const colors = ColorConstants.scheme20;
const Decrease = (percentage) => (number) => {
  return number - (number * percentage);
}

class NetworkGrowthMaximized extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      xAxisKey: 'year',
      xAxisMonthFormatting: false,
      zoomLabel: 'All year(s)',
      zoomState: 0,
      // maybe even on props
      nodeCount: 30,
      potentialNodeColorIndex: 1,
      actualNodeColorIndex: 0,
      // not jazzed about these...
      // what data becomes is a set of data from this.props.graphql.result
      // and i'd rather have the parent component do the data transforms
      // right now it's the handleChartClick() that's doing it.
      // instead, handleChartClick() should just update a graphql query
      // and the server should provide appropriate data for the given year.
      // right now we are loading 5 years of data at once. and that won't always
      // be good practice. while query caching on the server could help mitigate
      // any undue stress on the database...it still has to make a larger query
      // at some point in order to get that result and should that data set be
      // too large (maybe not this visualization, but perhaps another like a map
      // full of points for example...over 5 years?!) then it's going to be a poor
      // user experience or even crash a browser due to the amount of data.
      // 
      // the problem here is that the container.js has a transform for GraphQLProvider
      // and then we have a another transform (a filter()) here. that's data manipulation
      // in two different locations. and that becomes hard to keep track of.
      dataSetKey: 'hieParticipationScore',
      data: null,
      // these are for the force graph... should be the latest month of each year
      // mostly that's 12 of course. except the current year. this makes more sense
      // being held in state and changing on zoom. because that's just a reference
      // key to some data. not manipulation of data.
      snapshotMonth: 4,
      snapshotYear: 2017
    }
    
    this.handleZoomOutClick = this.handleZoomOutClick.bind(this);
    this.handleChartClick = this.handleChartClick.bind(this);
    this.onLegendClick = this.onLegendClick.bind(this);

    // TODO: again another js file to clean this out of here.
    this.generateNodes = this.generateNodes.bind(this);
    this.generateCompleteGraphLinks = this.generateCompleteGraphLinks.bind(this);
    this.generateActualNetworkGraphProps = this.generateActualNetworkGraphProps.bind(this);
    this.generateCompleteNetworkGraphProps = this.generateCompleteNetworkGraphProps.bind(this);
    this.calcNumberProvidersPerNode = this.calcNumberProvidersPerNode.bind(this);
  }

  // this was completely useless
  // get fields() {
  //   // new_hie_participants
  //   // total_hie_participants
  //   const actualHIEParticipants = 'total_hie_participants';
  //   const potentialParticipants = 'total_providers';
  //   const actualHIENetworkScore = 'HIE Network Score';
  //   const potentialHIENetworkScore = 'Potential HIE Network Score';
  //   return {
  //     actual: actualHIEParticipants,
  //     potential: potentialParticipants,
  //     actualScore: actualHIENetworkScore,
  //     potentialScore: potentialHIENetworkScore,
  //     all: [actualHIENetworkScore, potentialHIENetworkScore]
  //   }
  // }

  networkValue(nodeCount) {
    // return nodeCount;                            // Identity
    return (nodeCount * (nodeCount - 1)) / 2  // n(n-1) / 2 - metcalfe
    // return nodeCount * (Math.log(nodeCount)); // nlog(n)
  }

  handleChartClick(data) {
    // console.log('chart element clicked', data, proxy);
    if (data) {
      let args = {};
      let xAxis = 'year';
      let dataSetKey = 'hieParticipationScore';
      let stateData = null;
      let snapshotYear = 2017;
      // last month in demo data set. _.maxBy() would be nice to use here too, and in constructor.
      let snapshotMonth = 4;
      // We're after the label. This is the element in the chart that was clicked.
      // In this case, it'll be greater than 12 if it's a year. Otherwise it'll be
      // 1-12 for each month. This is specific to the data set used by this widget,
      // which is why this handler exists here and not inside the BarChartVisualization
      // component itself.
      if (data.activeLabel && data.activeLabel > 12 && this.props.graphql && this.props.graphql.result) {
        args.year = data.activeLabel;
        xAxis = 'month';
        dataSetKey = 'hieParticipation';
        stateData = _.filter(this.props.graphql.result[dataSetKey], { 'year': parseInt(data.activeLabel, 10) });
        snapshotMonth = _.maxBy(stateData, 'month').month;
        snapshotYear = parseInt(data.activeLabel, 10);
      } else {
        xAxis = 'year';
      }
      this.setState({
        data: stateData,
        dataSetKey: dataSetKey,
        //query: this.getQuery(args),
        xAxisKey: xAxis,
        xAxisMonthFormatting: true,
        zoomState: 1,
        zoomLabel: 'Month(s) for year ' + data.activeLabel,
        snapshotMonth,
        snapshotYear
      })
    }
  }

  handleZoomOutClick(updates) {
    //console.log('zoom out click', updates);
    this.setState({
      data: null,
      // this is the group by year data set
      dataSetKey: 'hieParticipationScore',
      xAxisKey: 'year',
      zoomLabel: 'All year(s)',
      zoomState: 0,
      xAxisMonthFormatting: false,
      // TODO again this is the end of the data set. figuring out the actual latest month is needed.
      snapshotMonth: 4,
      snapshotYear: 2017
    });
  }

  onLegendClick(data) {
  }

  /**
   * Returns the <Zoom /> component for use with the LineChartVisualization.
   * This parent component needs to control the zoom, the line chart component
   * will place the control if it's present in the props, but it has no knowledge
   * of how the control is to work.
   * 
   */
  getZoom() {
    return(
      <div>
        <h4 className={'legend-label'} style={{ textAlign: 'center'}}>
          {this.state.zoomLabel}
        </h4>
        <Zoom
          zoomOut={this.handleZoomOutClick}
          scaleIndex={this.state.zoomState}
        />
      </div>
    );
  }

  //// TODO: put this in a separate js file to include.
  // dear lord the number of functions...this can probably be shortened
  // or in the least commented a bit, it's very hard to follow.
  findNetworkData(data, year, month) {
    if (!data) return {};

    const lastIndex = data.length-1;
    for (let i=lastIndex; i >= 0; i--) {
      if (data[i].year === year && data[i].month === month) {
        return data[i];
      }
    }
    return data[lastIndex];
  }

  nodeId(index) {
    return `hie-network-node-${index}`;
  }

  generateNodes(count) {
    return _.range(count).map((index) => {
      return {
        id: index,
        node: {
          id: this.nodeId(index)
        }
      }
    })
  }

  generateLinks(nodes, linkCount) {
    const lastIndex = nodes.length-1;
    const middle = Math.floor(lastIndex/2);
    return _.range(linkCount).map((i) => {
      return {
        link: {
          strokeWidth: 1,
          source: nodes[i].node.id,
          target: nodes[_.random(middle, lastIndex)].node.id
        }
      }
    });
  }

  generateCompleteGraphLinks(nodes, connectedNodeCount) {
    const numConnectedNodes = connectedNodeCount || nodes.length;
    const startNode = this.state.nodeCount - numConnectedNodes;

    return _.range(startNode, nodes.length).reduce(
      (links, srcNodeIndex) => links.concat(
        _.range(srcNodeIndex+1, nodes.length).map(
          (targetIndex) => ({
            link: {
              strokeWidth: 1,
              source: this.nodeId(srcNodeIndex),
              target: this.nodeId(targetIndex)
            }
          }))),
        []);
  }

  calcNumberProvidersPerNode(totalProviders) {
    return Math.floor(totalProviders / this.state.nodeCount);
  }

  generateActualNetworkGraphProps(data) {
      const nodes = this.generateNodes(this.state.nodeCount);
      const connectedNodes = Math.floor(
        (data.total_hie_participants / data.total_providers) * this.state.nodeCount);
      const links = this.generateCompleteGraphLinks(nodes, connectedNodes);

      return {
        nodes,
        links,
        colors: () => colors(this.state.actualNodeColorIndex)
      }
  }

  generateCompleteNetworkGraphProps() {
      const nodes = this.generateNodes(this.state.nodeCount);
      const links = this.generateCompleteGraphLinks(nodes);
      return {
        nodes,
        links,
        colors: () => colors(this.state.potentialNodeColorIndex),
      }
  }

  render() {
    // const tooltipProps = FormatProps.monthOrYearInt;
    // console.log('props', this.props)
    const data = this.props.graphql.result;
    // console.log('props', this.props);
    // const mergeOptions = {
    //   initVal: 0,
    //   mergeFunc: function Latest(a, b) { return b }
    // }
    // console.log('data', data);

    
    const snapshotMonth = this.state.snapshotMonth; //|| _.maxBy(data['hieParticipation'], 'year').month; // 4;
    const snapshotYear = this.state.snapshotYear; // || _.maxBy(data['hieParticipation'], 'year').year; // 2017;

    let snapshotData = {};
    if (data && data.hieParticipation) {
      snapshotData = this.findNetworkData(data.hieParticipation, snapshotYear, snapshotMonth);
    }
    let actualNetwork = {};
    let potentialNetwork = {};
    if (!_.isEmpty(snapshotData)) {
      actualNetwork = this.generateActualNetworkGraphProps(snapshotData);
      potentialNetwork = this.generateCompleteNetworkGraphProps();
    }
    // TODO: most definintely get rid of this. sizing should be handled within the ForceDiretedGraph
    // const MagicHeightCorrection = Decrease(0.55)(this.props.widgetHeight);
    // const MagicWidthCorrection = Decrease(0.50)(this.props.widgetWidth);
    const MagicHeightCorrection = Decrease(0.55)(550);
    const MagicWidthCorrection = Decrease(0.50)(450);

    const graphProps = {
      height: MagicHeightCorrection,
      width: MagicWidthCorrection,
      linkDistance: 110,
      nodes: [],
      links: []
    }
    

    const actualNetworkGraphProps = Object.assign({}, graphProps, actualNetwork);
    const potentialNetworkGraphProps = Object.assign({}, graphProps, potentialNetwork);
    // console.log('network graph props', actualNetworkGraphProps);
    const graphHeading = `As of ${DateMappers.intToMonth(snapshotMonth)}, ${snapshotYear}`;

    // NOTE: The use of ResponsiveWidget, it's height and className
    // - Visualization (SVG) height is based on available height passed down from <ResponsiveWidget />
    //   However, in this case we are cutting into the available height with the little information up top.
    //   It can't account for what we add ahead of time (TODO: unsure if there's a way to later calculate
    //   and update the height value, but maybe look into it).
    //   So we need to use a new <ResponsiveWidget /> in here to get a new height for the visualization.
    //   In fact, we'll also go ahead and specifically size that container because we know how much
    //   height we have available to us.
    // - The className prop is set to empty because by default it will use "widget" and that will then
    //   include the gray band at the top of the <div> element. We want to hide that in this case.
    // 
    // In the end, we are left with a brand new <div> element that fits in our available space and
    // instructs the <LineChartVisualization /> properly so it also fits.
    // If this is ever confusing, we could also create another component that doesn't carry any
    // default class name, etc. and simply passes its available height (retrieved from CSS) down
    // to the children props. That's all that's happening here. Note that we can not pass the
    // height directly to <LineChartVisualization /> without looking for a new prop and that
    // would mean updating that component and then all other components. It's best to simply
    // standardize on the one `widgetHeight` value that each visualization can look for and rely on.
    // Renaming "ResponsiveWidget" to simple "ResponsiveDiv" may also be an option.

    let lineChartData = (this.props.graphql && 
      this.props.graphql.result && 
      this.props.graphql.result[this.state.dataSetKey]) ? 
        this.props.graphql.result[this.state.dataSetKey]:[]

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-5 col-xs-12">
            <p>The Network Potentiality Score measures how connected the HIE network is. 
              More providers in the network produces a more valuable HIE.</p>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6 col-md-11 col-sm-11 col-xs-12">
            <div className="widget-title">
              <h2>HIE Potentiality Score</h2>
            </div>
            <ResponsiveWidget style={{height: '550px'}} className="">
              <LineChartVisualization  
                data={this.state.data || lineChartData}
                handleChartClick={this.handleChartClick}
                zoom={this.getZoom()}
                xAxisKey={this.state.xAxisKey}
                xAxisMonthFormatting={this.state.xAxisMonthFormatting}
                seriesKeys={[
                  {'hieNetworkScore': 'HIE Network Score'},
                  {'potentialHieNetworkScore': 'Potential HIE Network Score'}
                ]}
                {...this.props}
              />
            </ResponsiveWidget>
          </div>
          <div className="col-lg-6 col-md-11 col-sm-11 col-xs-12">
            <div className="widget-title">
              <h2>HIE Connectivity</h2>
            </div>
            <ResponsiveWidget style={{height: '550px'}} className="hie-network-score-graph">
              <h4>{graphHeading}</h4>
              <div className="fd-graphs">
                <div className="network-graph actual-network">
                  <h5>Actual Network</h5>
                  <ForceDirectedGraph {...actualNetworkGraphProps} />
                </div>
                <div className="network-graph potential-network">
                  <h5>Potential Network</h5>
                  <ForceDirectedGraph {...potentialNetworkGraphProps} />
                </div>
              </div>
              <div className="graph-description">
                Each point corresponds to {this.calcNumberProvidersPerNode(snapshotData.total_providers)} Providers
              </div>
            </ResponsiveWidget>
          </div>
        </div>
      </div>
    );
  }
}

NetworkGrowthMaximized.propTypes = {
  updateInsightState: PropTypes.func
}

export default graphql(NetworkGrowthMaximized);