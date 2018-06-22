// Libs
import React from "react";
import { Router, Route, IndexRedirect, IndexRoute } from "react-router";

import PortalTemplate from './templates/portal.jsx';
import PublicTemplate from './templates/public.jsx';
import DashboardGuard from './dashboardGuard';

// Dashboard pages
import DashboardContainer from "./pages/dashboards/DashboardContainer";
import WidgetDetail from "./pages/widgets/Detail";

// Route does not exist view
import NotFound from "./pages/NotFound/";

import { Callback, Login, RouteGuardian, history } from '@cognosante/react-app';
import Logout from './pages/session/logout.jsx';

/* Routing Structure:
      Main - wraps application and renders its children
        dashboard/ - renders Dashboard that corresponds to state's activeDashID field
          /add/    - renders form for creating a new dashboard
          /:id/    - renders Dashboard according to ID
        widget/    - no indexroute
          /:type/  - renders a full screen version of a single widget
*/

const AppRouter = () => (
  <Router history={history}>
    <Route path="/">      
      <IndexRedirect to="dashboard" />

      {/* require user */}
      <Route component={RouteGuardian()}>

        {/* control dashboard access */}
        <Route component={DashboardGuard}>
          <Route component={PortalTemplate}>
            <IndexRedirect to="dashboard" />
              <Route path="dashboard">
                <IndexRoute component={DashboardContainer} />
                <Route path=":id(/:code)" component={DashboardContainer} />
              </Route>
              <Route path="widget">
                <Route path=":type(/:code)" component={WidgetDetail} />
              </Route>
          </Route>
        </Route>
      </Route>

      <Route component={PublicTemplate}>
        <Route path="callback" component={Callback} />
        <Route path="login" component={Login} />
        <Route path="logout" component={Logout} />
        <Route path="*" component={NotFound} />
      </Route>
    </Route>
  </Router>
);

export default AppRouter;
