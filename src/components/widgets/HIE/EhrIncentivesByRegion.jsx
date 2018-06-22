import React, { Component } from 'react';
import WidgetHeader from 'widgets/WidgetHeader';
import GraphQLProvider from 'providers/GraphQL';
import RegionBubbleChartContainer from 'visualizations/RegionBubbleChart/container';


const popoverText = `Displays the relative concentration EHR Incentive recipients.`;

class EhrIncentivesByRegion extends Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  getQuery() {
    return `{
      ehrIncentivesAggregate(state: "AL") {
       city,
       count
      }
     }`
  }

  render() {
    return (
      <div>
        <WidgetHeader
          title="EHR Incentives by Region"
          maximized={this.props.maximized}
          showMaxMinLink={true}
          popoverText={popoverText ? popoverText : false}
          fullPageLink={`/widget/HIE.EhrIncentivesByRegion?${this.props.queryOptions}`}
        />
        <GraphQLProvider query={this.getQuery()} providerService={'healthshare'}>
          <RegionBubbleChartContainer
            projection={'mercator'}
            region={'Alabama'}
            {...this.props}
          />
        </GraphQLProvider>
      </div>
    )
  }

}

export default EhrIncentivesByRegion;