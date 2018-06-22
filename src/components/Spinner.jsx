import React from 'react';

export default function Spinner(props) {
  return !props.until
    ? <div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
    : <div>{props.children}</div>;
}