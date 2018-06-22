import React, { Component } from 'react';
import BarChartVisualization from 'visualizations/BarChart';
import { Label } from 'recharts';
import {Responsive, WidthProvider} from 'react-grid-layout';
import ResponsiveWidget from 'widgets/ResponsiveWidget';
import WidgetHeader from 'widgets/WidgetHeader';
import BackLink from 'components/BackLink';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export class PrenatalCareDetailsView extends Component {

  render() {
    const layouts = DashboardLayout.generateLayouts(this.props, [
      {'i': 'a', gridLayout: {w: 12, h: 5}}
    ]);

    // NOTE: `resultDataKey` prop below is unnecessary as only one object is being returned.
    // It's for example...Unless more widgets are added to this dashboard and only one GraphQL
    // query is made that returns multiple sets of data to be used.

    // NOTE: Probably better to put <GraphQLProvider> as the parent of <ResponsiveReactGridLayout>
    // See <BarChartVisualization> component for more details.
    // The height is automatically passed down to children and <GraphQLProvider> messes with that
    // if not handled some other way. Though for an example of multiple GraphQL reqeusts and component
    // composition, here it is.

    // A <Label /> component instead of a label prop allows for more flexibility.
    // Better positioning control for starters. http://recharts.org/#/en-US/api/Label
    const xAxisLabel = (
      <Label
        value="Gestational Age in Weeks (N = no visit found)"
        style={{fill: "rgb(102, 102, 102)"}}
        offset={0}
        position="insideBottom"
      />
    );

    return (
      <div>
        <div id="page-header">
          <h2 className="page-heading">Details: Prenatal Care</h2>
          <BackLink />
        </div>
        
        <ResponsiveReactGridLayout
          className="layout"
          layouts={layouts}
          rowHeight={DashboardLayout.DEFAULT_ROW_HEIGHT}>

          <ResponsiveWidget key={'a'}>
              <WidgetHeader
              title="First Prenatal Care Visit Timeliness" subtitle="(Most Recent 12 Months)" />
              <BarChartVisualization
                xAxisKey="firstVisitWeeks"
                xAxisLabel={xAxisLabel}
                yAxisProps={{label: "%"}}
                seriesKeys={[{'percentage': '% of First Prenatal Care Visits (data from most recent 12 months)'}]}
                {...this.props}
              />
          </ResponsiveWidget>
          
        </ResponsiveReactGridLayout>
      </div>
    );
  }

}

// Defines the default props
PrenatalCareDetailsView.defaultProps = {
};

// Defines propTypes
PrenatalCareDetailsView.propTypes = {
};

const query = gql`
query {
  hedis {
    prenatalCare {
      deepDive {
        firstVisitWeeks
        numPatients
      }                
    }            
  }
}
`;

const graphqlTransform = ({ ownProps, data }) => {
  if (data && data.hedis) {
    // numPatients -> percentage
    const totalVisits = _.sumBy(data.hedis.prenatalCare.deepDive, 'numPatients');
    
    let transformedDeepDive = data.hedis.prenatalCare.deepDive.map((result, i) => {
      // The "N" value at 50 weeks
      const firstVisitWeeks = (result.firstVisitWeeks === null || result.firstVisitWeeks === 0) ? 
        50:result.firstVisitWeeks;
      
      return {
        percentage: parseFloat(parseFloat((result.numPatients / totalVisits) * 100).toFixed(2)),
        numPatients: result.numPatients,
        firstVisitWeeks
      };
    });

    // sort
    transformedDeepDive = _.sortBy(transformedDeepDive, "firstVisitWeeks");
    
    // relabel
    transformedDeepDive = transformedDeepDive.map((result, i) => {
      if(result.firstVisitWeeks === 50) {
        result.firstVisitWeeks = "N";
      }
      return result;
    });

    return { data: transformedDeepDive };
  }
};

export default graphql(query, {
  options: {},
  props: graphqlTransform,
})(PrenatalCareDetailsView);
  