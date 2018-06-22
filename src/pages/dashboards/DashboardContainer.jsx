import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
// import Dashboard Component
import Dashboard from './Dashboard';
// Import does not exist View
import NotFound from '../NotFound';
import { DashboardTypeRegistry } from 'pages/dashboards/types';
import { withConfig, withUser } from '@cognosante/react-app';

import dashboardState from '../../../public/assets/data/dashboardState.json';

/**
 * Main dashboard container class. This component is responsible for rendering
 * the currently active dashboard based on the URI. It also manages
 * state for the Dashboard: dashboard insights and query filters
 *
 * @export
 * @class DashboardContainer
 * @extends {Component}
 */
export class DashboardContainer extends Component {
  constructor(props) {
    super(props);

    this.onFilterCallback = this.onFilterCallback.bind(this);
    this.sessionTimeout = this.props.config ? this.props.config.sessionTimeout : 3600000;
  }

  onFilterCallback(dashboard) {
    return filters => {
      this.props.updateDashboard({
        id: dashboard.id,
        filters: filters
      });
    };
  }

  render() {
    const activeDashboard = _.find(dashboardState.dashboards, {
      id: this.props.params.id || dashboardState.activeDashboard
    });

    //Jamming in the previously available measures widgets that used the dashboard.
    //Currently, the list of measures widget is hardcoded and not utilizing the dashboardContainer.
    //However, we still need to use the dashboard mechanism for the maximize views for measures.

    // By default, not found.
    let DashboardComponent = <NotFound />;

    if (activeDashboard !== undefined && !activeDashboard.disabled) {
      // The standard "dynamic" dashboard full of widgets (if there are widgets).
      if (activeDashboard.widgets !== undefined && activeDashboard.widgets.length > 0) {
        DashboardComponent = <Dashboard {...activeDashboard} dashboardContainerProps={this.props} />;
      }

      // Custom dashboard "types" that don't necessarily need to be full of widgets.
      // They also don't need to use the grid system.
      // These are kept under: pages/dashboards/types
      if (activeDashboard.type !== undefined && activeDashboard.type) {
        const DashboardTypeComponent = DashboardTypeRegistry.find(activeDashboard.type);
        if (DashboardTypeComponent) {
          DashboardComponent = <DashboardTypeComponent dashboardContainerProps={this.props} />;
        }
      }
    }

    // Also note that we can dynamically load dashboards based on path without explicit configuration.
    // Though in order to allow any user group other than "administrator" to them, they'll need to be
    // defined in the dashboard configuration with a "groups" key.
    if (this.props.params.id) {
      const DashboardTypeComponent = DashboardTypeRegistry.find(this.props.params.id);
      if (DashboardTypeComponent) {
        DashboardComponent = <DashboardTypeComponent dashboardContainerProps={this.props} />;
      }
    }

    return <div>{DashboardComponent}</div>;
  }
}

DashboardContainer.defaultProps = {
  params: {},
  insights: {}
};

DashboardContainer.propTypes = {
  params: PropTypes.object,
  activeDashboardID: PropTypes.string,
  insights: PropTypes.object,
  dashboard: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
};

export default withUser(withConfig(DashboardContainer));
