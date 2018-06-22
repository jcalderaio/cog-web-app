import React, { Component } from 'react';
import QueryString from 'query-string';
import WidgetHeader from 'widgets/WidgetHeader';
import GraphQLProvider from 'providers/GraphQL';
import RegionBubbleChartContainer from 'visualizations/RegionBubbleChart/container';

class ParticipationByRegion extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getQuery() {
    return `{
      hie {
        providerDistribution {
          providerCount
          providerCity
          ehrCount
          ehrCity
        }
      }
    }`;
  }

  // INTEGRATE WITH NEW API. The query was changed, so we had to change this to pull the data off.
  afterFetch(result) {
    return result.hie;
  }

  render() {
    return (
      <div>
        <WidgetHeader
          title="Participation by Region"
          maximized={this.props.maximized}
          showMaxMinLink={true}
          fullPageLink={`/widget/HIE.ParticipationByRegion?${this.props.queryOptions}`}
        />
        <GraphQLProvider query={this.getQuery()} providerService={'insights'} afterFetch={this.afterFetch}>
          <RegionBubbleChartContainer
            projection={'mercator'}
            region={'Alabama'}
            data={require('../../../assets/data/Alabama.participation.geo.json')}
            providerLocation={true}
            queryOptions={
              this.props.maximized && QueryString.parse(window.location.hash.split('?')[1], { arrayFormat: 'bracket' })
            }
            {...this.props}
          />
        </GraphQLProvider>
      </div>
    );
  }
}

export default ParticipationByRegion;
