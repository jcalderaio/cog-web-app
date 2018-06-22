import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import GraphQLProvider from 'providers/GraphQL';
import WidgetHeader from 'widgets/WidgetHeader';
import NetworkGrowthMinimized from './Minimized';
import NetworkGrowthMaximized from './Maximized';
import { RotatedMonthAndYearTick } from 'visualizations/common/CustomAxisTick';


class NetworkGrowthContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      year: 2016
    }
    this.transformResult = this.transformResult.bind(this);
  }

  networkValue(nodeCount) {
    // return nodeCount;                            // Identity
    return (nodeCount * (nodeCount - 1)) / 2  // n(n-1) / 2 - metcalfe
    // return nodeCount * (Math.log(nodeCount)); // nlog(n)
  }

  // only provide summary of the expected year (which isn't something a user can change right now)
  transformResult(result) {
    // console.log('network growth result', result);
    // Transform for maximized view
    if (this.props.maximized) {
      if (!result || !result.hieParticipation) return [];

      const grouped = _(result.hieParticipation)
        .groupBy('year')
        .map((objs, key) => ({
            'year': parseInt(key, 10),
            'month': 0,
            'totalParticipants': _.maxBy(objs, 'total_hie_participants')['total_hie_participants'],
            'totalProviders': _.maxBy(objs, 'total_providers')['total_providers'],
            // We're after the highest number of providers/participants seen.
            // Though that's not technically correct. Perhaps for total providers out there...
            // But for participants, we likely want to know how many were participating for the whole year.
            // Not what was the most participating at any given time (month).
            // When looking at it month by month then, it'd be a different query.
            // Some rules need to be defined around this.
            'hieNetworkScore': this.networkValue(_.maxBy(objs, 'total_hie_participants')['total_hie_participants']),
            'potentialHieNetworkScore': this.networkValue(_.maxBy(objs, 'total_providers')['total_providers'])
        }))
        .value();

      // console.log('grouped', grouped);
      result.hieParticipationScore = grouped;

      // and by month
      result.hieParticipation.map((object) => {
        object.hieNetworkScore = this.networkValue(object['total_hie_participants']);
        object.potentialHieNetworkScore = this.networkValue(object['total_providers']);
        return object;
      });
      return result;
    }

    // Transform for minimized view
    if (result.hieParticipation) {
      result.hieParticipation = result.hieParticipation.filter((participationMonth) => {
        return (participationMonth.year === this.state.year && participationMonth.month > 6);
      });
    }
    // console.log('data', result);
    return result;
  }
  

  render() {
    // Note: This widget displays something different when maximized.
    // However, the query for data is still the same.
    const query = `{
      hieParticipation {
        year
        month
        new_hie_participants
        total_hie_participants
        total_providers
      }
    }`;

    const CustomAxisTick = React.createFactory(RotatedMonthAndYearTick());

    // The widget guts in minimized view
    let networkGrowthComponent = (
      <NetworkGrowthMinimized
        xAxisProps={{tick: <CustomAxisTick />}}
        year={this.state.year}
        {...this.props}
      />
    );
    let widgetTitle = "Network Growth";

    // The innards when maximized
    if (this.props.maximized) {
      networkGrowthComponent = (
        <NetworkGrowthMaximized
            year={this.state.year}
            {...this.props}
        />
      );
      widgetTitle = "About";
    }

    // NOTE: This is a demo widget. It has never been hooekd up to real data.
    // So it has been mocked for now.
    // .../public/mock/868d27adcf84ec7fa39e3d36558cde1abc85022e7aed68f64ae2ca76e94a45c2.json
    return (
      <div>
        <WidgetHeader
          title={widgetTitle}
          maximized={this.props.maximized}
          showMaxMinLink={true}
          fullPageLink={`/widget/HIE.NetworkGrowth?${this.props.queryOptions}`}
          controlStyle={this.props.maximized ? {position: 'relative', top: 0, float: 'right'} : {}}
        />
        <GraphQLProvider query={query} providerService={'demo'} afterFetch={this.transformResult}>
          {networkGrowthComponent}
        </GraphQLProvider>
      </div>
    );
  }

}

NetworkGrowthContainer.defaultProps = {
  style: {}
};

// Props validation
NetworkGrowthContainer.propTypes = {
  style: PropTypes.object
};

export default NetworkGrowthContainer;