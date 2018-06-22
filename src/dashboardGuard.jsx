import React from "react";
import _ from "lodash";
import { withUser, withConfig, goto } from "@cognosante/react-app";
import { isAdmin, groups, defaultDashboard } from "./utils/userUtils";
import dashboardState from '../public/assets/data/dashboardState.json';

class Guard extends React.Component {
  
  /**
   * Returns true if the user has proper access to the currently active
   * dashboard (group based) OR the next dashboard to be active (nextProps).
   *
   * Convention is to return false unless groups are explicitly configured
   * for both the currently active dashboard and the currently logged in user.
   *
   * @return Boolean
   */
  hasDashboardAccess(nextProps) {
    let props = this.props;
    if (nextProps !== undefined) {
      props = nextProps;
    }

    // For anything that is not a dashboard, return true.
    if (!props.location.pathname.includes("dashboard")) {
      return true;
    }

    const userGroups = groups(props.user);

    if (userGroups.length === 0) {
      console.error("This user does not seem to belong to any groups. Application access will be severely limited.");
    }

    // If the user is in the "administrator" group then just return true.
    // They have access to everything.
    if (isAdmin(props.user)) {
      return true;
    }

    // Note: It is possible that a dashboard loads without being configured.
    // This would mean that `props.activeDashboard` would be undefined.
    // These are path based dynamic dashboards (dashboard "types") and can have an entry
    // in configuration (currently dashboardState.json) but do not necessarily need one.
    // So the default behavior here will be to block access to these dashboards unless
    // the user is in the "administrator" group.
    
    const activeDashboard = _.find(dashboardState.dashboards, {
      id: this.props.params.id || dashboardState.activeDashboard
    })
      
    const dashboardGroups = activeDashboard && activeDashboard.groups ? activeDashboard.groups : [];

    if (activeDashboard === undefined) {
      dashboardGroups.push("administrator");
    }

    if (userGroups.length > 0 && dashboardGroups.length > 0) {
      if (_.intersection(userGroups, dashboardGroups).length > 0) {
        return true;
      }
    }

    return false;
  }

  currentUserDefaultDashboardId() {
    return defaultDashboard(this.props.config, this.props.user);
  }

  componentDidMount() {
    window.localStorage.setItem("redirectTo", window.location.hash);

    // If we are at /dashboard from a redirect it's going to be empty. Potentially.
    // The default dahsboard was "hie" from config, but now we can have a different default per user group.
    // So redirect to whatever that is...But we don't want to always redirect there on componentDidMount()
    // that would mean you could never view any other dashboard =)
    // So just go there if we're sitting at /dashboard
    if (
      this.currentUserDefaultDashboardId() !== "" &&
      this.props.location.pathname === "/dashboard" &&
      this.props.location.hash === "" &&
      this.props.location.search === ""
    ) {
      goto(`/dashboard/${this.currentUserDefaultDashboardId()}`)
      // this.props.dispatch(push());
    }
  }

  shouldComponentUpdate(nextProps) {
    // Fix for double render() when using hashHistory
    // See: https://github.com/ReactTraining/history/issues/427
    // and: https://github.com/reactjs/react-router-redux/issues/197
    // Should not be needed once react-router is updated to v4.
    // Note: this.props.location.state may also differ, but it has not been seen yet.
    // It also may require a deep comparison.
    const currentLocation = this.props.location.pathname + this.props.location.search + this.props.location.hash;
    const nextLocation = nextProps.location.pathname + nextProps.location.search + nextProps.location.hash;
    if (currentLocation !== nextLocation) {
      return true;
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
    const currentUserDefaultDashboardId = this.currentUserDefaultDashboardId();

    // console.log('has access to next dashboard via props:',this.hasDashboardAccess(nextProps));
    // console.log('has access to current dashboard via props:',this.hasDashboardAccess());

    // This should only be the case when a user manually adjusts the URL in their browser.
    // The intent is to load up the user's default dashboard when at this location.
    // A hard page reload in the browser (or coming from somewhere else) will redirect.

    if (nextProps.location.pathname === "/dashboard" && nextProps.location.hash === "") {
      // ...but only redirect if the current user has a default dashboard to go to.
      // Otherwise this is going to be a weird one. Due to configuration and access rules,
      // we now have a need for some sort of "Not Authorized" page in these kinds of situations
      // where nothing was properly configured.
      if (currentUserDefaultDashboardId !== "") {
        goto(`/dashboard/${currentUserDefaultDashboardId}`);
        // this.props.dispatch(push(`/dashboard/${currentUserDefaultDashboardId}`));
      }
    }

    // Redirect if the user does not have access to the dashboard coming in next props.
    // Redirect if the user does not have access to the current dashboard.
    // Also, don't redirect if the next dashboard id coming in the props is the user's default dashboard.
    // That would create a loop =)
    // But why would the user not have access to their default dashboard? Why indeed...Config problem.
    const nextActiveId =
      nextProps.activeDashboard && nextProps.activeDashboard.id ? nextProps.activeDashboard.id : null;

    if (
      (!this.hasDashboardAccess(nextProps) || !this.hasDashboardAccess()) &&
      currentUserDefaultDashboardId !== nextActiveId &&
      currentUserDefaultDashboardId !== ""
    ) {
      goto(`/dashboard/${currentUserDefaultDashboardId}`);
      // this.props.dispatch(push(`/dashboard/${currentUserDefaultDashboardId}`));
    }
  }

  // Note: this.hashDashboardAccess() is also checked here before rendering for an important reason.
  // While componentWillReceiveProps catches the access and redirects, it's AFTER a render() call.
  // So what happens is the child components start to load and set state...But then there's a redirect
  // due to lack of access and we get the warning in the console about setting state on an unmounted
  // component. So this check prevents that.
  render() {
    return this.hasDashboardAccess() ? this.props.children : null;
  }
}

export default withUser(withConfig(Guard));
