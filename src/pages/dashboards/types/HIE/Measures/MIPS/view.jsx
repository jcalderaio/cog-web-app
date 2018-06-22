import React, { Component } from 'react';
import { Label } from 'recharts';
import ScatterChartWidget from 'visualizations/ScatterChart';
import { Responsive, WidthProvider } from 'react-grid-layout';
import ResponsiveWidget from 'widgets/ResponsiveWidget';
import WidgetHeader from 'widgets/WidgetHeader';
import WidgetInfoPanel from 'widgets/WidgetInfoPanel';
import BackLink from 'components/BackLink';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class Mips236DetailsView extends Component {

  render() {
    const layouts = DashboardLayout.generateLayouts(this.props, [{ i: 'a', gridLayout: { w: 12, h: 5 } }]);

    // X Axis
    const scatterXAxis = {
      dataKey: 'systolic',
      type: 'number'
      // label: "some other value",
    };
    const scatterXAxisLabel = (
      <Label value="systolic (mmHg)" style={{ fill: 'rgb(102, 102, 102)' }} offset={0} position="insideBottom" />
    );

    // Y Axis
    const scatterYAxis = {
      dataKey: 'diastolic',
      type: 'number'
      // label: "diastolic (mmHg)",
    };
    // For whatever reason, when rotated (angle -90) the label gets clipped.
    // So use offset -10 to move it back inside the SVG bounding box.
    // Everything else will shift over just fine.
    const scatterYAxisLabel = (
      <Label value="diastolic (mmHg)" style={{ fill: 'rgb(102, 102, 102)' }} offset={-10} position="left" angle={-90} />
    );

    const scatterSeries = [
      {
        name: 'Not Under Control',
        dataKey: 'denominator_only'
      },
      {
        name: 'Under Control',
        dataKey: 'numerator'
        // fill: 'rgba(255, 0, 0, 0.5)',
        // shape: 'cross',
        // legendPayload: {
        //   dataKey: 'wellChildHeadCircumference_zika_m',

        //   value: 'item name', type: 'line'
        // }
      }
    ];

    return (
      <div>
        <div id="page-header">
          <h2 className="page-heading">MIPS 236: Controlling High Blood Pressure</h2>
          <BackLink />
        </div>

        {this.props.dashboardFilters}

        <ResponsiveReactGridLayout className="layout" layouts={layouts} rowHeight={DashboardLayout.DEFAULT_ROW_HEIGHT}>
          <ResponsiveWidget key={'a'}>
            <WidgetHeader title="Patients" />
            <ScatterChartWidget
              scatterChartProps={{ margin: { top: 24, right: 60 } }}
              resultDataKey={'mips236scatter'}
              grid={true}
              xAxisLabel={scatterXAxisLabel}
              yAxisLabel={scatterYAxisLabel}
              series={scatterSeries}
              xAxis={scatterXAxis}
              yAxis={scatterYAxis}
              scatterClick={this.props.onScatterClick}
              data={this.props.data}
            />
            <WidgetInfoPanel
              closeInfo={this.props.closeScatterPlotInfo}
              style={{ width: '50%', height: '60%', left: '25%' }}
              infoIsOpen={this.props.infoIsOpen}
              content={this.props.infoPanelContent}
            />
          </ResponsiveWidget>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

const query = gql`
  query hieQuery($careProvider: String, $insurer: String, $careSite: String) {
    mips {
      mips236(careProvider: $careProvider, insurer: $insurer, careSite: $careSite) {
        systolic
        diastolic
        patientID
        patientFirstName
        patientLastName
        providerPrefix
        providerFirstName
        providerLastName
        providerSuffix
        insuranceCompanyName
      }
    }
  }
`;

const graphqlVariables = (/* props: */ {
  args
}) => ({
  variables: {
    careProvider: args.careProvider,
    insurer: args.insurer,
    careSite: args.careSite
  },
});

const graphqlTransform = ({ ownProps, data }) => {
  if (data && data.mips) {
    // console.log('DATA:', data);

    let scatterData = { denominator_only: [], numerator: [] };

    // Numerator criteria: systolic blood pressure < 140 mmHg and diastolic blood pressure < 90 mmHg

    scatterData.numerator = data.mips.mips236.map((result, i) => {
      if (result.systolic < 140 && result.diastolic < 90) {
        return result;
      }
      return false;
    });

    scatterData.denominator_only = data.mips.mips236.map((result, i) => {
      if (result.systolic >= 140 && result.diastolic >= 90) {
        return result;
      }
      return false;
    });

    return { data: scatterData };
  }
};

export default graphql(query, {
  options: graphqlVariables,
  props: graphqlTransform,
})(Mips236DetailsView);
