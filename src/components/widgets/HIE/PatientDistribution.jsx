import React, { Component } from 'react';
import WidgetHeader from 'widgets/WidgetHeader';
import RadialBarChartVisualization from 'visualizations/RadialBarChart';

// TODO: The RadialBarChartVisualization component works off data being passed to props.
// It needs to work with GraphQL. 
class PatientDistribution extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <WidgetHeader
          title="Medicaid Data Distribution"
          maximized={this.props.maximized}
          showMaxMinLink={true}
          fullPageLink={`/widget/HIE.PatientDistribution?${this.props.queryOptions}`}
        />
        
        <RadialBarChartVisualization
          dataField={'percentage'}
          data={require('../../../assets/data/medicaid_dist_levels.json')}
          rainbow={true}
          {...this.props}
        />
      </div>
    )
  }

}

export default PatientDistribution;