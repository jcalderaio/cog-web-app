// react
import React, { Component } from "react";

// container
import DetailContainer from "../DetailContainer";

// filters / views
import Filters from "./filters.jsx";
import View from "./view.jsx";

export default class RegisteredDocumentsDetailContainer extends Component {
  render() {
    return (
      <DetailContainer 
        title={"Registered Documents Details"}
        Filters={Filters} 
        View={View} />
    );
  }
}
