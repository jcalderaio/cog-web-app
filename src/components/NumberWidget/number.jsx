import React from 'react';
import PropTypes from 'prop-types';
import abbreviate from 'number-abbreviate';
import { uniqueId, isNumber } from 'lodash';

export default class Number extends React.PureComponent {
  static propTypes = {
    values: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.any,
        format: PropTypes.string,
        label: PropTypes.string,
        textSize: PropTypes.number
      })
    )
  };

  get text() {
    const { format, value } = this.props;
    if (!value || !isNumber(value)) return value;
    const val = Math.trunc(value);
    switch (format) {
      case 'percent':
        return val.toLocaleString(
          'en',
          { style: 'percent' }
        );
      case 'abbrev':
        return abbreviate(val);
      default:
        return val.toLocaleString();
    }
  }

  get textSize() {
    const { value, textSize } = this.props;
    let size = textSize;
    if (!size) {
      if (value < 999999) size = 72;
      else if (value < 999999999) size = 64;
      else size = 32;
    }
    return size;
  }

  render() {
    const { label } = this.props;
    return (
      <div key={uniqueId('number-')}>
        <div className="number-style-large" style={{ 'fontSize': this.textSize }}>
          {this.text}
        </div>
        <p className="text-trend">{label}</p>
      </div>
    );
    // return <div className="number-style-container">{items}</div>;
  }
}
