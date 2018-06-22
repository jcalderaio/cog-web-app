// eslint-disable-next-line import/no-extraneous-dependencies
import 'babel-polyfill';
import React from 'react';

import { ApolloProvider, initialize as ApolloInit } from './apollo';
import AppRouter from './router';
import { withConfig } from '@cognosante/react-app';

class AppContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false,
      client: null
    };
  }

  componentWillMount() {
    const client = ApolloInit(this.props.config.insightsAPIEndpoint);
    this.setState({ init: true, client: client });
  }

  render() {
    const { config } = this.props;
    const { init, client } = this.state;

    // only render application if config and user manager are present
    if (Object.keys(config).length === 0 || !init) return null;

    return (
      <div>
        <ApolloProvider client={client}>
          <AppRouter />
        </ApolloProvider>
      </div>
    );
  }
}

export default withConfig(AppContainer);
