import React, { Component } from "react";
import PropTypes from "prop-types";
import { Responsive, WidthProvider } from "react-grid-layout";
import ResponsiveWidget from "widgets/ResponsiveWidget";
import BackLink from "components/BackLink";
// import DashboardFilter from 'components/DashboardFilter';
// import AgeRangeFilter from 'components/dashboardFilters/AgeRange';
import AdultBMIAssessment from "./AdultBMIAssessment";
import AdultBMIGroups from "./AdultBMIGroups";
// import {observer} from 'mobx-react';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

// @observer class BMIDashboard extends Component {
class BMIDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onBreakpointChange(breakpoint, cols) {
    // console.log('onBreakpointChange', breakpoint, cols);
    // this.setState({breakpoint: breakpoint, cols: cols});
  }

  onLayoutChange(layout) {
    // console.log('onLayoutChange', layout);
    // this.setState({layout: layout});
  }

  render() {
    const layouts = {
      lg: [{ i: "a", x: 0, y: 0, w: 6, h: 3, static: true }, { i: "b", x: 6, y: 0, w: 6, h: 3, minH: 3, static: true }]
    };

    return (
      <div>
        <div id="page-header">
          <h2 className="page-heading">BMI Assessment</h2>
          <BackLink />
        </div>
        {/* <DashboardFilter>
          <AgeRangeFilter />
        </DashboardFilter> */}

        <ResponsiveReactGridLayout
          key={"0"}
          className="layout"
          breakpoints={{ lg: 1200, md: 952, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 6, sm: 6, xs: 6 }}
          layouts={layouts}
        >
          <ResponsiveWidget key={"a"}>
            <AdultBMIAssessment />
          </ResponsiveWidget>

          <ResponsiveWidget key={"b"}>
            <AdultBMIGroups />
          </ResponsiveWidget>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

// Defines the default props
BMIDashboard.defaultProps = {
  filters: {}
};

// Defines propTypes
BMIDashboard.propTypes = {
  filters: PropTypes.object
};

export default BMIDashboard;
