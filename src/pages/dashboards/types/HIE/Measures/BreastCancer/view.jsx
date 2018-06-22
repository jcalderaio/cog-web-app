import React, { Component } from "react";
import BarChartVisualization from "visualizations/BarChart";
import { Label } from "recharts";
import { Responsive, WidthProvider } from "react-grid-layout";
import ResponsiveWidget from "widgets/ResponsiveWidget";
import WidgetHeader from "widgets/WidgetHeader";
import BackLink from "components/BackLink";
import { DashboardLayout } from "pages/dashboards/DashboardLayout";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import _ from "lodash";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export class BreastCancerDetailsView extends Component {
  render() {
    const layouts = DashboardLayout.generateLayouts(this.props, [{ i: "a", gridLayout: { w: 12, h: 5 } }]);
    const xAxisLabel = (
      <Label value="Age Range" style={{ fill: "rgb(102, 102, 102)" }} offset={0} position="insideBottom" />
    );

    return (
      <div>
        <div id="page-header">
          <h2 className="page-heading">Details: Breast Cancer Mammograms</h2>
          <BackLink />
        </div>

        <ResponsiveReactGridLayout className="layout" layouts={layouts} rowHeight={DashboardLayout.DEFAULT_ROW_HEIGHT}>
          <ResponsiveWidget key={"a"}>
            <WidgetHeader title="Breast Cancer Mammograms" />
            <BarChartVisualization
              xAxisKey={"ageRange"}
              xAxisLabel={xAxisLabel}
              yAxisProps={{ label: "%" }}
              seriesKeys={[{ percentage: "Percentage of Mammograms" }]}
              data={this.props.data}
              {...this.props}
            />
          </ResponsiveWidget>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

const query = gql`
  query {
    hedis {
      breastCancer {
        deepDive {
          ageRange
          percentage
        }
      }
    }
  }
`;

const graphqlTransform = ({ ownProps, data }) => {
  if (data && data.hedis) {
    return { data: data.hedis.breastCancer.deepDive };
  }
};

export default graphql(query, {
  options: {},
  props: graphqlTransform
})(BreastCancerDetailsView);
