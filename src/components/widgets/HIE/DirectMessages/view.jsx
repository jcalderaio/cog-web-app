import React, { Component } from 'react';

import _ from 'lodash';

// apollo
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// widget
import WidgetHeader from 'widgets/WidgetHeader';
import LineChartVisualization from 'visualizations/LineChart';
import Zoom from 'visualizations/Zoom';

class DirectMessagesView extends Component {
  getZoom() {
    return(
      <div>
        <h4 className={'legend-label'} style={{ textAlign: 'center'}}>
          {this.props.zoomLabel}
        </h4>
        <Zoom
          zoomOut={this.props.handleZoomOutClick}
          scaleIndex={this.props.zoomState}
        />
      </div>
    );
  }

  render() {
    // Note: Ensure all of the props are passed down to <LineChartVisualization>
    // ... including the `widgetHeight` and `widgetWidth` which is important for the SVG sizing.
    return (
      <div>
        <WidgetHeader
          title="DIRECT Secured Messages"
          maximized={this.props.maximized}
          showMaxMinLink={true}
          fullPageLink={`/widget/HIE.DirectMessages?${this.props.queryOptions}`}
        />
        <LineChartVisualization
          xAxisKey={this.props.xAxisKey}
          seriesKeys={[{'totalMessagesThisMonth': 'total messages sent'}]}
          data={this.props.data}
          widgetWidth={934}
          widgetHeight={662}
        />
      </div>
    )
  }
}

const query = gql`
query hieQuery($year: Int) {
  hie {
    directMessages(year: $year) {
      year
      month
      totalMessagesThisMonth
      totalMessagesSentOON
      activeAccounts
    }
  }
}
`;

const graphqlVariables = (/* props: */ {
  args
}) => ({
  variables: {
    year: args.year
  },
});

const graphqlTransform = ({ ownProps, data }) => {  
  let directMessageTotals = [];

  if (data.hie) {
    if (ownProps.xAxisKey !== 'month') {
      directMessageTotals = _(data.hie.directMessages)
        .groupBy('year')
        .map((objs, key) => ({
            'year': parseInt(key, 10),
            'month': 0,
            'totalMessagesThisMonth': _.sumBy(objs, 'totalMessagesThisMonth') }))
        .value();
    } else {
      // Ensure the month by month, zoomed in, view is sorted.
      directMessageTotals = _.sortBy(data.hie.directMessages, 'month');
    }
  }

  return {
    data: directMessageTotals
  };
};

export default graphql(query, {
  options: graphqlVariables,
  props: graphqlTransform,
})(DirectMessagesView);
  