import React from "react";
import _ from "lodash";
import WidgetHeader from "widgets/WidgetHeader";
import GraphQLProvider from "providers/GraphQL";
import ProviderTable from "./index";

class ProviderDirectoryContainer extends React.Component {
  render() {
    // FIXME use correct query
    const query = `
    {
      ping
    }
    `;

    return (
      <div>
        <WidgetHeader
          title="Provider Directory"
          maximized={this.props.maximized}
          showMaxMinLink={true}
          fullPageLink={`/widget/HIE.ProviderDirectory`}
        />
        <GraphQLProvider query={query} providerService={"insights"}>
          <ProviderTable {...this.props} />
        </GraphQLProvider>
      </div>
    );
  }
}

export default ProviderDirectoryContainer;
