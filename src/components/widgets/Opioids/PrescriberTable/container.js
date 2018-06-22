import React from "react";
import _ from "lodash";
import WidgetHeader from "widgets/WidgetHeader";
import GraphQLProvider from "providers/GraphQL";
import ProviderTable from "./index";

class ProviderTableContainer extends React.Component {
  render() {
    // FIXME use correct query
    const query = `
    {
      hello
    }
    `;

    return (
      <div>
        <WidgetHeader
          title="Prescribers Listing"
          maximized={this.props.maximized}
          showMaxMinLink={true}
          fullPageLink={`/widget/Opioids.PrescriberTable`}
        />
        <GraphQLProvider query={query} providerService={"healthshare"}>
          <ProviderTable {...this.props} />
        </GraphQLProvider>
      </div>
    );
  }
}

export default ProviderTableContainer;
