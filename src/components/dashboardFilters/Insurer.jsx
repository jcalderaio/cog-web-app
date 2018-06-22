import React, { PureComponent } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// InsurerFilter
export default class InsurerFilter extends PureComponent {

  state = {
    selectedValue: ""
  };

  setInitialValue() {
    if (this.props.initialValue) {
      this.props.addFilter({insurer: this.props.initialValue}, false);
      this.setState({selectedValue: this.props.initialValue});
    }
  }

  componentWillUpdate() {
    // Handle <DashboardFilter> "clear all"
    if (!this.props.filters.has('insurer')) {
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
    this.props.addFilter({insurer: newValue});
  }

  render() {
    const {
      width = '250px',
      clearable = true
    } = this.props;

    // NOTE: This is mock data.
    // TODO: Pull from a registry/API endpoint...may even want a component other than <Select> for this
    const insurerOptions = [
      {
        label: "Fallon Community Health Plan",
        value: "Fallon Community Health Plan",
      },
      {
        label: "Harvard Pilgrim Health Care, Inc.",
        value: "Harvard Pilgrim Health Care, Inc."
      },
      {
        label: "Neighborhood Health Plan, Inc.",
        value: "Neighborhood Health Plan, Inc."
      },
      {
        label: "Blue Cross and Blue Shield of Massachusetts",
        value: "Blue Cross and Blue Shield of Massachusetts"
      },
      {
        label: "Blue Cross and Blue Shield of Massachusetts HMO Blue",
        value: "Blue Cross and Blue Shield of Massachusetts HMO Blue"
      },
      {
        label: "Health New England",
        value: "Health New England"
      },
      {
        label: "Boston Medical Center Health Plan, Inc (d/b/a Boston Medical Center HealthNet Plan)",
        value: "Boston Medical Center Health Plan, Inc (d/b/a Boston Medical Center HealthNet Plan)"
      },
      {
        label: "Tufts Health Plans, Inc.",
        value: "Tufts Health Plans, Inc."
      }
    ];

    return (
      <div className="filter-input">
        <label>Insurer</label>
        <Select
          style={{"width": width}}
          name="insurer"
          options={insurerOptions}
          onChange={this.handleChange.bind(this)}
          value={(this.props.filters && this.props.filters.get('insurer') === undefined) ? 
            null:this.state.selectedValue}
          clearable={clearable}
        />
      </div>
    );
  }
}