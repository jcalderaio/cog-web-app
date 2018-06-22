import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import GraphQLProvider from 'providers/GraphQL';
import WidgetHeader from 'widgets/WidgetHeader';
import ProviderTable from './index';

class ProviderTableContainer extends React.Component {

  render() {
    // TODO: Eventually the query should be passed here to GraphQLProvider
    return (
      <div>
        <WidgetHeader
          title="Providers Listing"
          maximized={this.props.maximized}
          showMaxMinLink={true}
          fullPageLink={`/widget/HIE.ProviderTable?${this.props.queryOptions}`}
        />
        <GraphQLProvider service={'healthshare'}>
          <ProviderTable
            {...this.props}
          />
        </GraphQLProvider>
      </div>
    );
  }

}

ProviderTableContainer.defaultProps = {
  style: {}
};

// Props validation
ProviderTableContainer.propTypes = {
  style: PropTypes.object
};

export default ProviderTableContainer;
