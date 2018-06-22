import { first, values, intersection } from "lodash";

import dashboardState from "../../public/assets/data/dashboardState.json";

export const token = user => user.id_token;

export const username = user => {
  let username = user && user.profile && user.profile.sub ? user.profile.sub : "";
  if (username.substring("WSO2.ORG/")) {
    username = username.replace("WSO2.ORG/", "");
  }
  return username;
};

export const providerId = user => user.providerId;
// export const providerId = user => 1;

export const groups = user => {
  return (user && user.groups) || [];
  // return ["administrator"];
  // return ["provider"];
};

export const group = user => {
  return first(groups(user));
};

export const isAdmin = user => {
  return groups(user).includes("administrator");
};

export const visibleDashboards = config => {
  return values(dashboardState.dashboards).filter(
    dashboard =>
      dashboard.disabled !== true && dashboard.showNav !== false && config.visibleDashboards.includes(dashboard.id)
  );
};

export const allowedDashboards = (dashboards, user) => {
  return dashboards.filter(dashboard => {
    if (dashboard.disabled === true) {
      return false;
    }

    return isAdmin(user) || intersection(groups(user), dashboard.groups || []).length > 0;
  });
};

/**
 * In the dashboard config, each dashboard can define
 * a `groupDefault` key. It's value can vary for convenience:
 *
 * groupDefault: ["administrator", "provider"]
 * groupDefault: ["provider"]
 * groupDefault: "provider"
 *
 * If no `groupDefault` exists for the given user group
 * then an empty string will be returned.
 *
 * If the user belongs to multiple groups, then the first
 * group found in the auth response will be used.
 *
 * If multiple dashbaords are marked as being default
 * for a given group, then the first found will be used.
 */
export const defaultDashboard = (config, user) => {
  const _group = group(user);

  const defaultDashboards = dashboardState.dashboards.filter(item => {
    if (item.groupDefault !== undefined) {
      const groupDefault =
        Object.prototype.toString.call(item.groupDefault) === "[object Array]"
          ? item.groupDefault
          : [item.groupDefault];

      if (groupDefault.includes(_group)) {
        return true;
      }
    }
    return false;
  });

  return defaultDashboards.length > 0 ? defaultDashboards[0].id : "";
};
