import React, { Component } from "react";
import DashboardFilter from "components/DashboardFilter";
import CareProviderFilter from "components/dashboardFilters/CareProvider";
import CareSiteFilter from "components/dashboardFilters/CareSite";
import InsurerFilter from "components/dashboardFilters/Insurer";
import PubSub from "pubsub-js";
import Mips236DetailsView from "./view";
import { withConfig, withUser } from "@cognosante/react-app";
import { providerId } from "../../../../../../utils/userUtils";

class Mips236Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
      args: {},
      infoIsOpen: false,
      infoPanelContent: "patient info"
    };

    this.onScatterClick = this.onScatterClick.bind(this);
    this.closeScatterPlotInfo = this.closeScatterPlotInfo.bind(this);
  }

  componentWillMount() {
    PubSub.subscribe("DASHBOARD_FILTER_UPDATE", (msg, filters) => {
      this.setState({ args: filters.toJS() });
    });
  }

  onScatterClick(data) {
    const recordUrl = this.props.config.clinicalClarityBaseURL + "/#/patient/" + data.patientID + "/summary";
    const content = (
      <div>
        <strong>Patient</strong>
        <br />
        {data.patientFirstName} {data.patientLastName}
        <br />
        <br />
        <strong>Physician</strong>
        <br />
        {data.providerPrefix} {data.providerFirstName} {data.providerLastName} {data.providerSuffix}
        <br />
        <br />
        <strong>Insurer</strong>
        <br />
        {data.insuranceCompanyName}
        <br />
        <br />
        <a href={recordUrl} target="_blank">
          View Patient in Clinical Clarity
        </a>
      </div>
    );
    this.setState({ infoIsOpen: true, infoPanelContent: content });
  }

  closeScatterPlotInfo() {
    if (this.state.infoIsOpen) {
      this.setState({ infoIsOpen: false });
    }
  }

  render() {
    const dashboardFilters = (
      <DashboardFilter header={false}>
        <CareSiteFilter />
        {providerId(this.props.user) ? null : <CareProviderFilter />}
        <InsurerFilter />
      </DashboardFilter>
    );

    return (
      <div>
        <Mips236DetailsView
          dashboardFilters={dashboardFilters}
          args={this.state.args}
          infoIsOpen={this.state.infoIsOpen}
          infoPanelContent={this.state.infoPanelContent}
          closeScatterPlotInfo={this.closeScatterPlotInfo}
          onScatterClick={this.onScatterClick}
          {...this.props}
        />
      </div>
    );
  }
}

export default withUser(withConfig(Mips236Details));
