// react
import React, { Component } from "react";

// container
import DetailContainer from "../DetailContainer";

// filters / views
import Filters from "./filters.jsx";
import View from "./view.jsx";

export default class MpiidsDetailContainer extends Component {
  render() {
    return (
      <DetailContainer 
        title={"MPIIDs Details"} 
        Filters={Filters} 
        View={View} />
    );
  }
}
