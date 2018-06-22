import React, { Component } from "react";
import PropTypes from "prop-types";
import FontAwesome from "react-fontawesome";
import { Link } from "react-router";
import { goto } from '@cognosante/react-app';

const ICON_SIZE = "2x";

class Header extends Component {

  render() {
    const { title, fullPageLink } = this.props;

    return (
      <div className="widget-header minimized-widget">
        <div className="widget-title">
          <h3>{title}</h3>
        </div>
        <div className="widget-controls">
          <div className="widget-header-options-group">
            <Link onClick={() => goto(fullPageLink)} style={{ float: "right" }}>
              <FontAwesome className="widget-control" name={"arrow-circle-right"} size={ICON_SIZE} />
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

// Defines propTypes
Header.propTypes = {
  title: PropTypes.string,
  fullPageLink: PropTypes.string
};

export default Header;
