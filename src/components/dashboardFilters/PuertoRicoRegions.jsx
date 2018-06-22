import React, { PureComponent } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// PuertoRicoRegionsFilter
export default class PuertoRicoRegionsFilter extends PureComponent {

  state = {
    selectedValue: ""
  };

  handleChange(selected) {
    let newValue = undefined;
    if (selected !== null) {
      newValue = selected.value;
    }
    this.setState({selectedValue: newValue});
    this.props.addFilter({serviceRegion: newValue});
  }

  render() {
    const {
      lang,
      width = '250px'
    } = this.props;

    const regions = {
      spanish: ['Noreste', 'Este', 'Sureste', 'Norte', 'Oeste', 'San Juan', 'Metro Norte', 'All'],
      english: [
        'North',
        'Metro-North',
        'East',
        'North-East',
        'South-East',
        'San Juan',
        'Virtual',
        'South-West',
        'All'
      ]
    };

    const regionLang = lang || 'english';
    const regionFilterOptions = regions[regionLang].map((region) => {
      return {
        label: region.replace(/-/g, ' '),
        value: region === 'All' ? null : region
      }
    });

    return (
      <div className="filter-input">
        <label>Service Region</label>
        <Select
          style={{"width": width}}
          name="serviceRegion"
          options={regionFilterOptions}
          onChange={this.handleChange.bind(this)}
          value={this.props.filters.get('serviceRegion') === undefined ? null:this.state.selectedValue}
        />
      </div>
    );
  }
}