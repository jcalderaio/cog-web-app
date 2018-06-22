import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

// AgeRangeFilter
class AgeRangeFilter extends PureComponent {

  state = {
    selectedValue: []
  };

  componentWillUpdate() {
    // Handle <DashboardFilter> "clear all"
    if (!this.props.filters.has('ageRange')) {
      console.log('updated and now no ageRange');
      console.log('setting state', this.getInitialValue());
      // The problem is there seems to be no way to update or otherwise reset the value of the slider.
      // The defaultValue prop seems to be a one time use only.
      // The value prop freezes it, so you can't select anything else.
      // May need a whole new slider component.
      
      this.setState({selectedValue: this.getInitialValue()});
      this.props.addFilter({ageRange: this.getInitialValue()}, false);
    }
  }

  componentWillMount() {
    // Handle an initial value
    this.props.addFilter({ageRange: this.props.initialValue}, false);
    this.setState({selectedValue: this.props.initialValue});
  }

  handleChange(ageRange) {
    let newValue = undefined;
    if (ageRange !== null) {
      newValue = ageRange;
    }
    this.setState({selectedValue: newValue});
    this.props.addFilter({ageRange: newValue});
  }

  /**
   * The funny thing about a slider filter is that there is always an initial value.
   * Unless disabled completely. The initial value is the min/max.
   * If a separate initialValue was passed then it means initially it's something
   * smaller than or equal to the maximium values on either end.
   * 
   * @return {Array}
   */
  getInitialValue() {
    if (this.props.initialValue && this.props.initialValue.length === 2) {
      return this.props.initialValue;
    } else {
      return [this.props.min, this.props.max];
    }
  }

  render() {
    const {
      min,
      max,
      width,
      rangeStyle,
      style
    } = this.props;
    style.width = width;

    const marks = {};
    marks[min] = {label: min.toString(), style: {marginTop: '-6px'}};
    marks[max] = {label: max.toString(), style: {marginTop: '-6px'}};

    return (
      <div className="filter-input" style={style}>
        <label>Age Range</label>
        <Range
          min={min}
          max={max}
          defaultValue={this.state.selectedValue}
          allowCross={false}
          marks={marks}
          style={rangeStyle}
          onAfterChange={this.handleChange.bind(this)}
        />
      </div>
    );
  }
}

// Defines the default props
AgeRangeFilter.defaultProps = {
  width: '250px',
  rangeStyle: {margin: '0.5em 0 0 0'},
  style: {},
  min: 18,
  max: 85,
  initialValue: [18, 85]
};

// Defines propTypes
AgeRangeFilter.propTypes = {
  width: PropTypes.string,
  rangeStyle: PropTypes.object,
  style: PropTypes.object,
  min: PropTypes.number,
  max: PropTypes.number,
  initialValue: PropTypes.array
};

export default AgeRangeFilter;