import React, { PureComponent } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// CareProviderFilter
export default class CareProviderFilter extends PureComponent {

  state = {
    selectedValue: ""
  };

  setInitialValue() {
    if (this.props.initialValue) {
      this.props.addFilter({careProvider: this.props.initialValue}, false);
      this.setState({selectedValue: this.props.initialValue});
    }
  }

  componentWillUpdate() {
    // Handle <DashboardFilter> "clear all"
    if (!this.props.filters.has('careProvider')) {
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
    this.props.addFilter({careProvider: newValue});
  }

  render() {
    const {
      width = '250px',
      clearable = true
    } = this.props;

    // NOTE: Mock data. The search "Kenneth" would even do. There's only one provider right now.
    // Ultimatley this will need to have some sort of ID (code, NPI, etc.)
    // Also come from a registry of the sorts/API endpoint.
    const careProviderOptions = [{
        label: "Dr. Kenneth Ross MD",
        value: "Kenneth Ross"
    }];
    
    return (
      <div className="filter-input">
        <label>Care Provider</label>
        <Select
          style={{"width": width}}
          name="careProvider"
          options={careProviderOptions}
          onChange={this.handleChange.bind(this)}
          value={(this.props.filters && this.props.filters.get('careProvider') === undefined) ? 
            null:this.state.selectedValue}
          clearable={clearable}
        />
      </div>
    );
  }
}