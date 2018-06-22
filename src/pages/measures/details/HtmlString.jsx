import React from 'react';
import PropTypes from 'prop-types';

export default function HtmlString(props) {
  return ( <div dangerouslySetInnerHTML={{__html: props.html || ''}} />);
}

HtmlString.propTypes = {
  html: PropTypes.string,
}
