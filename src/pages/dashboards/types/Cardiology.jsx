import React, { Component } from 'react';
import MeasureDetails from 'pages/measures/details'
// NOTE: pages/measures is deprecated. It will be removed.
// Another home for this might be "dashboards/types/HIE/Measures/MIPS/..." ??
// This appears to be a re-usable MIPS dashboard? So maybe this file shouldn't be called Cardiology?
// If that's not the case, then not sure the point of setting: measureComponent 
import CardiologyDashboard from 'pages/measures/CardiologyDashboard';

class Cardiology extends Component {
  
  render() {
    let measureComponent = (
      <CardiologyDashboard {...this.props.dashboardContainerProps} />
    );

    const params = this.props.dashboardContainerProps.params;
    if (params.code !== undefined && params.code !== "") {
      measureComponent = (
        <div>
          <div id="page-header">
            <h2 className="page-heading"></h2>
          </div>
          <MeasureDetails dashboard="cardiology" {...this.props.dashboardContainerProps} />
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

export default Cardiology;