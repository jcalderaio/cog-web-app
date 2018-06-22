import React from 'react';
import PropTypes from 'prop-types';
import 'css-toggle-switch/dist/toggle-switch.css';

export default class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this
      .handleClick
      .bind(this);
  }

  handleClick(e) {
    if (this.props.onChange) {
      this
        .props
        .onChange(e.target.id)
    }
  }

  render() {
    return (
      <div
        className="switch-toggle well"
        style={{ maxWidth: 180, margin: '10px auto' }}>
        <input
          id="year"
          name="graph-type"
          type="radio"
          defaultChecked
          onClick={this.handleClick}/>
        <label htmlFor="year">Year</label>

        <input id="month" name="graph-type" type="radio" onClick={this.handleClick}/>
        <label htmlFor="month">Month</label>

        <a className="btn btn-primary"></a>
      </div>
    );
  }

}

Toggle.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func
}

Toggle.defaultProps = {
  options: [
    {
      id: '1',
      label: 'ON',
      default: true
    }, {
      id: '0',
      label: 'OFF'
    }
  ],
  onChange: (newVal, oldVal) => {}
}
