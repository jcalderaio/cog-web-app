import React, { PureComponent } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// YearFilter
export default class YearFilter extends PureComponent {

  state = {
    selectedValue: ""
  };

  setInitialValue() {
    if (this.props.initialValue) {
      // Special shortcut 
      // Note: just make sure the value isn't outside of any min/max prop
      // which is responsible for the <Select> options. If it is, it won't be
      // displayed by this component (though initial value will still be set).
      const iV = (this.props.initialValue === "now") ? new Date().getFullYear():this.props.initialValue;
      // Note: Do not dispatch the initial value. The <DashboardFilter>
      // component will dispatch after adding all children filters.
      this.props.addFilter({year: iV}, false);
      this.setState({selectedValue: iV});
    }
  }

  componentWillUpdate() {
    // Handle <DashboardFilter> "clear all"
    if (!this.props.filters.has('year')) {
      this.setInitialValue();
    }
  }

  componentWillMount() {
    // Handle an initial value when component mounts
    this.setInitialValue();
  }

  handleChange(selected) {
    const newValue = (selected !== null) ? selected.value:undefined;
    this.setState({selectedValue: newValue});
    this.props.addFilter({year: newValue});
  }

  render() {
    // Default min/max year is past 3 years to current year
    const {
      width = '250px',
      min = (new Date().getFullYear()-3),
      max = new Date().getFullYear(),
      clearable = true
    } = this.props;

    const yearOptions = [];
    for(let i = min; i <= max; i++) {
      yearOptions.push({
        value: i,
        label: i.toString()
      });
    }

    return (
      <div className="filter-input">
        <label>Year</label>
        <Select
          style={{"width": width}}
          name="year"
          options={yearOptions}
          onChange={this.handleChange.bind(this)}
          value={(this.props.filters && this.props.filters.get('year') === undefined) ? null:this.state.selectedValue}
          clearable={clearable}
        />
      </div>
    );
  }
}