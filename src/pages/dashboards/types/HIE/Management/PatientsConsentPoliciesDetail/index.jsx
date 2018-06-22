// react
import React, { Component } from "react";

// container
import DetailContainer from "../DetailContainer";

// filters / views
import Filters from "./filters.jsx";
import View from "./view.jsx";

export default class PatientsConsentPoliciesDetailContainer extends Component {
  render() {    
    return (
      <DetailContainer 
        title={"Patients w/MPI Consent Policies Details"} 
        Filters={Filters} 
        View={View} />
    );
  }
}
