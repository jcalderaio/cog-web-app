import React, { PureComponent } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// GenderFilter
export default class GenderFilter extends PureComponent {

  state = {
    selectedValue: ""
  };

  handleChange(selected) {
    let newValue = (selected !== null) ? selected.value:undefined;
    this.setState({selectedValue: newValue});
    this.props.addFilter({gender: newValue});
  }

  /**
   * Gets options for use with <Select> based on a specific
   * format for gender code.
   * 
   * @param  {String} abbr The gender abbreviation style to use (indicate for male)
   * @return {Array}
  */
  getGenderOptions(abbr) {
    const genderOptions = [];
    switch(abbr) {
      default:
      case 'm':
        genderOptions.push({value: 'm', label: 'Male'}, {value: 'f', label: 'Female'});
        break;
      case 'M':
        genderOptions.push({value: 'M', label: 'Male'}, {value: 'F', label: 'Female'});
        break;
      case 'male':
        genderOptions.push({value: 'male', label: 'Male'}, {value: 'female', label: 'Female'});
        break;
    }
    return genderOptions;
  }

  render() {
    const {
      width = '250px',
      genderAbbreviation = 'M'
    } = this.props;

    return (
      <div className="filter-input">
        <label>Gender</label>
        <Select
          style={{"width": width}}
          name="gender"
          options={this.getGenderOptions(genderAbbreviation)}
          onChange={this.handleChange.bind(this)}
          value={(this.props.filters && this.props.filters.get('gender') === undefined) ? null:this.state.selectedValue}
        />
      </div>
    );
  }
}