import React, { Component } from 'react';
import BarChartVisualization from 'visualizations/BarChart';
import { Label } from 'recharts';
import { Responsive, WidthProvider } from 'react-grid-layout';
import ResponsiveWidget from 'widgets/ResponsiveWidget';
import WidgetHeader from 'widgets/WidgetHeader';
import BackLink from 'components/BackLink';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class WellChildDetailsView extends Component {

  render() {
    const layouts = DashboardLayout.generateLayouts(this.props, [{ i: 'a', gridLayout: { w: 12, h: 5 } }]);
    const xAxisLabel = (
      <Label value="Number of Visits" style={{ fill: 'rgb(102, 102, 102)' }} offset={0} position="insideBottom" />
    );

    return (
      <div>
        <div id="page-header">
          <h2 className="page-heading">Details: Well Child Visits</h2>
          <BackLink />
        </div>

        <ResponsiveReactGridLayout className="layout" layouts={layouts} rowHeight={DashboardLayout.DEFAULT_ROW_HEIGHT}>
          <ResponsiveWidget key={'a'}>
            <WidgetHeader title="Well Child Visits" />
            <BarChartVisualization
              xAxisKey={'visits'}
              xAxisLabel={xAxisLabel}
              yAxisProps={{ label: '%' }}
              seriesKeys={[{ percentage: 'Percentage of Well Child Visits Since Birth' }]}
              data={this.props.data}
              {...this.props}
            />
          </ResponsiveWidget>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

// TODO: change me
const query = gql`
query {
  hedis {
    wellChild {
      deepDive {
        visits
        percentage
      }                
    }            
  }
}
`;

const graphqlTransform = ({ ownProps, data }) => {
  if (data && data.hedis) {
    return { data: data.hedis.wellChild.deepDive };
  }
};

export default graphql(query, {
  options: {},
  props: graphqlTransform,
})(WellChildDetailsView);
