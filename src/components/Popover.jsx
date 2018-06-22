// Libs
import React from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';

export default class ElementWithPopover extends React.Component {
  get popover() {
    return (<Popover id={this.props.id}>{this.props.popover}</Popover>);
  }

  render() {
    return (
      <OverlayTrigger
        overlay={this.popover}
        container={this}
        placement={this.props.placement}
        positionLeft={this.props.positionLeft}
        positionTop={this.props.positionTop}
        rootClose
        trigger="click">
        {this.props.children}
      </OverlayTrigger>
    );
  }
}

ElementWithPopover.defaultProps = {
  placement: 'top',
};

ElementWithPopover.propTypes = {
  id: PropTypes.string.isRequired,
  placement: PropTypes.string,
  popover: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.object.isRequired
  ]).isRequired,
  children: PropTypes.node.isRequired,
};
