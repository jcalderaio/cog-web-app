import React, { PureComponent } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// MonthFilter
export default class MonthFilter extends PureComponent {

  state = {
    selectedValue: ""
  };

  componentWillMount() {
    // Handle an initial value
    if (this.props.initialValue) {
      let iV = this.props.initialValue;
      // Special shortcut 
      if (this.props.initialValue === "now") {
        iV = new Date().getMonth()+1;
      }
      this.props.addFilter({month: iV}, false);
      this.setState({selectedValue: iV});
    }
  }

  handleChange(selected) {
    const newValue = (selected !== null) ? selected.value:undefined;
    this.setState({selectedValue: newValue});
    this.props.addFilter({month: newValue});
  }

  render() {
    const {
      width = '250px',
      min = 1,
      max = 12,
      clearable = true
    } = this.props;

    const monthNames = {
      1: 'January',
      2: 'February',
      3: 'March',
      4: 'April',
      5: 'May',
      6: 'June',
      7: 'July',
      8: 'August',
      9: 'September',
      10: 'October',
      11: 'November',
      12: 'December'
    };

    const monthOptions = [];
    for(let i = min; i <= max; i++) {
      monthOptions.push({
        value: i,
        label: monthNames[i]
      });
    }

    return (
      <div className="filter-input">
        <label>Month</label>
        <Select
          style={{"width": width}}
          name="month"
          options={monthOptions}
          onChange={this.handleChange.bind(this)}
          value={(this.props.filters && this.props.filters.get('month') === undefined) ? null:this.state.selectedValue}
          clearable={clearable}
        />
      </div>
    );
  }
}