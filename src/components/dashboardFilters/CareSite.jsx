import React, { PureComponent } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// CareSiteFilter
export default class CareSiteFilter extends PureComponent {

  state = {
    selectedValue: ""
  };

  setInitialValue() {
    if (this.props.initialValue) {
      this.props.addFilter({careSite: this.props.initialValue}, false);
      this.setState({selectedValue: this.props.initialValue});
    }
  }

  componentWillUpdate() {
    // Handle <DashboardFilter> "clear all"
    if (!this.props.filters.has('careSite')) {
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
    this.props.addFilter({careSite: newValue});
  }

  render() {
    const {
      width = '250px',
      clearable = true
    } = this.props;

    const mockCareSiteNames = [
      "CAPE COD HOSP CARDIAC DIAG & REHAB",
      "BETH ISRAEL DEACONESS HOSPITAL-MILTON INC",
      "CANCER CARE CENTER @ HARRINGTON",
      "GOOD SAMARITAN M C THE GODDARD CTR",
      "BEVERLY HOSP/ADDISION GILBERT CAMPU",
      "BOSTON CHILDREN'S AT LEXINGTON",
      "AMESBURY HEALTH CENTER",
      "SIGNATURE HEALTHCARE BROCKTON HOSP",
      "SPAULDING OUTPATIENT CTR - DOWNTOWN",
      "MT AUBURN HOSP IMAGING & SPECIMEN C",
      "SOUTH SHORE HOSP'S CTR WOUND CARE &",
      "HOLY FAMILY HOSP AMBULATORY SRVS",
      "MASS EYE & EAR INF QUINCY ANNEX",
      "BEVERLY HOSP/BEVERLY CAMPUS",
      "LAHEY HOSP & MC, DPT OF ALLRGY&IMM&",
      "CAPE COD HOSP MED SRVCS @905 ATTUCK",
      "FALMOUTH HOSPITAL REHABILTATN SVCS",
      "CHA CAMBRIDGE FAMILY HEALTH NORTH",
      "SPAULDING OUTPATIENT CTR - FRAMINGH",
      "CHA WOMEN'S IMAGING CTR EVERETT H C",
      "MGH CHELSEA HEALTHCARE CTR",
      "NEWTON-WELLESLEY HOSPITAL",
      "BETH ISRAEL DEACONESS HOSPITAL-MILTON INC",
      "LGH CTR WOUND HEALING @ DRUM HILL",
      "BOSTON MED CTR CORP MENINO PAVILION",
      "WELDON OUTPT REHABTN & WELLNESS CTR"
    ];
    const careSiteOptions = [];
    mockCareSiteNames.forEach((item) => {
      careSiteOptions.push({label: item, value: item});
    })
    
    return (
      <div className="filter-input">
        <label>Care Site</label>
        <Select
          style={{"width": width}}
          name="careSite"
          options={careSiteOptions}
          onChange={this.handleChange.bind(this)}
          value={(this.props.filters && this.props.filters.get('careSite') === undefined) ? 
            null:this.state.selectedValue}
          clearable={clearable}
        />
      </div>
    );
  }
}