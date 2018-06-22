import React from "react";
import PropTypes from "prop-types";

// Components
import { Grid } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";

import PubSub from "pubsub-js";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { withConfig, withUser, AuthenticatedContainer } from "@cognosante/react-app";

const _defaultLayoutOptions = { showFooter: true, gridLayout: true };

@observer
class PortalTemplate extends React.Component {
  // Observable (mobx) layout options that other components can adjust via message bus (PubSub).
  @observable LayoutOptions = _defaultLayoutOptions;

  componentWillUnmount() {
    // Remove the listener/subscriber (though when this unmounts, the app is kinda gone).
    PubSub.unsubscribe(this.token);
  }

  componentWillReceiveProps() {
    // Reset to defaults when new props will be received, essentially when those children change.
    // Or in other words, on a new page or screen. It will be up to the child component to then
    // adjust the layout as they need.
    this.LayoutOptions = _defaultLayoutOptions;
  }

  componentWillMount() {
    // When this message comes in, adjust the layout options.
    PubSub.subscribe("DASHBOARD_LAYOUT_UPDATE", (msg, data) => {
      this.LayoutOptions = Object.assign(this.LayoutOptions, data);
    });
  }

  render() {
    return (
      this.props.user && (<AuthenticatedContainer>
        <div className="app">
          <Header location={this.props.location} />
          {this.LayoutOptions.gridLayout ? (
            <main id="main">
              <Grid className="content">{this.props.children}</Grid>
            </main>
          ) : (
            <main>{this.props.children}</main>
          )}
          <div className="push" />

          {this.LayoutOptions.showFooter ? <Footer /> : null}
        </div>
      </AuthenticatedContainer>)
    );
  }
}

PortalTemplate.propTypes = {
  children: PropTypes.node
};

export default withUser(withConfig(PortalTemplate));
