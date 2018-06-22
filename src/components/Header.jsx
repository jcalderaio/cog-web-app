import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router";
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem } from "react-bootstrap";
import { withConfig, withUser, goto } from "@cognosante/react-app";
import { username, visibleDashboards, allowedDashboards } from "../utils/userUtils";

/**
 * Header component constructs navigation for the saved dashboards
 * @export
 * @class Header
 * @extends {React.Component}
 */
export class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: window.innerWidth };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.getActiveDashboardId = this.getActiveDashboardId.bind(this);
    this.buildDashboardNav = this.buildDashboardNav.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth });
  }

  /**
   * Returns the active dashboard id.
   * This may not be the id given to props from configuration.
   * It may be an id used from a default dashboard setting and
   * now seen in the URL hash due to a redirect.
   *
   * @return String
   */
  getActiveDashboardId() {
    let activeId = "";

    const currentPathName = this.props.location.pathname;
    if (currentPathName.includes("/dashboard")) {
      const currentPathPieces = currentPathName.split("/");
      // Path will be #/dashboard/cardiology
      //              0 1         2
      if (currentPathPieces.length > 1) {
        activeId = currentPathPieces[2];
      }
    }
    return activeId;
  }

  buildDashboardNav() {
    const visible = visibleDashboards(this.props.config);
    const allowed = allowedDashboards(visible, this.props.user);

    return allowed.map(dashboard => {
      const activeDashboardId = this.getActiveDashboardId();
      const activeClass = activeDashboardId === dashboard.id ? "active" : "";
      return (
        <LinkContainer key={dashboard.id} to={`/dashboard/${dashboard.id}`}>
          <NavItem eventKey={dashboard.id} className={activeClass}>
            {dashboard.title}
          </NavItem>
        </LinkContainer>
      );
    });
  }

  getBackgroundStyle(backgroundImageURL) {
    if (backgroundImageURL && this.state.width > 479) {
      return {
        // see _navigation.scss
        background: `url(${backgroundImageURL}) no-repeat`,
        backgroundSize: "230px 50px"
      };
    } else if (backgroundImageURL && this.state.width <= 479) {
      return {
        // see _navigation.scss
        background: `url(${backgroundImageURL}) no-repeat`,
        backgroundSize: "184px 40px"
      };
    } else {
      return {
        visibility: "hidden"
      };
    }
  }

  render() {
    const backgroundImageURL = this.props.config.headerImage;
    const backgroundStyle = this.getBackgroundStyle(backgroundImageURL);

    const { user } = this.props;

    // Note: using ref here is a bit of a yuck...But it's a great way to calculate available height.
    // Since we aren't manipulating it or anything, should be fine.
    // window.innerHeight - window.HeaderComponent.clientHeight - window.FooterComponent.clientHeight
    return (
      <div
        id="banner"
        ref={element => {
          window.HeaderComponent = element;
        }}
      >
        <Navbar inverse fluid>
          <div id="site-header">
            <Grid>
              <Navbar.Header>
                <Navbar.Brand>
                  <Link to="dashboard" id="logo-esante-insights" style={backgroundStyle}>
                    eSante Insights
                  </Link>
                </Navbar.Brand>
                {user && (
                  <span>
                    <Navbar.Toggle />
                    <Nav pullRight className="hidden-xs">
                      <NavDropdown
                        title={username(user)}
                        id="user-settings-dropdown"
                        className="user-dropdown icon-security"
                      >
                        <MenuItem href={`${this.props.config.auth.oidc.authority}/dashboard/`} target="_blank">
                          My Profile
                        </MenuItem>
                        <MenuItem onClick={() => goto('/logout')}>Logout</MenuItem>
                      </NavDropdown>
                    </Nav>
                  </span>
                )}
              </Navbar.Header>
            </Grid>
          </div>
          <div id="main-nav">
            <div className="container">
              {user && (
                <Navbar.Collapse>
                  <Nav id="navbar">
                    {this.buildDashboardNav()}
                    <NavItem
                      className="visible-xs"
                      href={`${this.props.config.auth.oidc.authority}/dashboard/`}
                      target="_blank"
                    >
                      My Profile
                    </NavItem>
                    <NavItem className="visible-xs" onClick={() => goto('/logout')}>
                      Logout
                    </NavItem>
                  </Nav>
                </Navbar.Collapse>
              )}
            </div>
          </div>
        </Navbar>
      </div>
    );
  }
}


export default withUser(withConfig(Header));
