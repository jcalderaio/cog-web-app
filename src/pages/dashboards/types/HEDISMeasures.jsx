import React, { Component } from 'react';
import MeasureDetails from 'pages/measures/details'
import MeasureDashboard from 'pages/measures/MeasureDashboard';

class HEDISMeasures extends Component {
  
  render() {
    // console.log(this.props);

    let measureComponent = (
      <MeasureDashboard {...this.props.dashboardContainerProps} />
    );

    const params = this.props.dashboardContainerProps.params;
    if (params.code !== undefined && params.code !== "") {
      measureComponent = (
        <div>
          <div id="page-header">
            <h2 className="page-heading"></h2>
          </div>
          <MeasureDetails dashboard="demoMeasures" {...this.props.dashboardContainerProps} />
        </div>
      );
    }

    return (
      <div>
        {measureComponent}
      </div>
    )
  }

}

export default HEDISMeasures;