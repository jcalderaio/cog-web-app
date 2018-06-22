// react
import React, { Component } from "react";

// container
import DetailContainer from "../DetailContainer";

// filters / views
import Filters from "./filters.jsx";
import View from "./view.jsx";

export default class DirectSecureMessagesDetailContainer extends Component {
  render() {
    return (
      <DetailContainer 
        title={"Direct Secure email by Account Details"}
        Filters={Filters} 
        View={View} />
    );
  }
}