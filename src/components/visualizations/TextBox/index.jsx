import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class TextBox extends Component {
  render() {
    const { text, style } = this.props;
    return (
      <div className="textbox" style={style}>
        <p>{text}</p>
      </div>
    )
  }
}

TextBox.defaultProps = {
  style: {}
};

TextBox.propTypes = {
  style: PropTypes.object,
  text: PropTypes.string.isRequired
};
