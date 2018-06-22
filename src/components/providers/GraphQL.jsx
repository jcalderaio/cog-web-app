/**
 * A compositional GraphQL Provider Component and HOC function
 * that makes it easy to get data from an API and pass it down
 * to its children.
 *
 * Note: All query adjustments (for example, adding args for
 * filtering data) is done outside of this component. This
 * component does not concern itself with such things.
 * @see components/DashboardFilter.jsx
 */
import React, { PureComponent, Children } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';
import Sha256 from '../../utils/sha256';
import PubSub from 'pubsub-js';
import { ulid } from 'ulid';
import { withConfig, withUser } from '@cognosante/react-app';
import { token } from '../../utils/userUtils';

class GraphQLProvider extends PureComponent {
  constructor(props) {
    super(props);
    this.publishUpdate = this.publishUpdate.bind(this);
    this.getServiceURL = this.getServiceURL.bind(this);

    // There can be multiple <GraphQL /> provider components in use at the same time.
    // So in order to determine which children get which data, we need to start keeping
    // track of the providers. This will do that (and the ID should be sequential).
    this.providerId = ulid();

    // When checking the props in componentWillReceiveProps()
    // the first time around the query in current props and next props
    // will actually be the same. This fixes that issue.
    this.isFirstQuery = true;

    // A reference to the current XMLHttpRequest from axios.
    // It will allow the in-flight request to be canceled if need be.
    this.requestSource = null;
  }

  static propTypes = {
    providerService: PropTypes.string,
    queryPaths: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    query: PropTypes.string,
    result: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    beforeFetch: PropTypes.func,
    afterFetch: PropTypes.func,
    clearResultOnChange: PropTypes.bool
  };

  static defaultProps = {
    clearResultOnChange: true
  };

  // you must specify what you're adding to the context
  static childContextTypes = {
    graphqlUpdateTopic: PropTypes.string
  };

  /**
   * Cancels any AJAX request still in flight should this component unmount.
   */
  componentWillUnmount() {
    if (this.requestSource) {
      // console.log('Cancelling in-flight request:', this.requestSource);
      this.requestSource.cancel();
    }
  }

  /**
   * Make the GraphQL query here in a Promise.
   * We can not setState from that promise though because it will mess
   * with React's lifecycle. So we use an event bus which all children
   * listen to.
   *
   * @param {Object} nextProps
   */
  componentWillReceiveProps(nextProps) {
    // Only need to update if the query has changed (or if it's the first one).
    if (this.props.query !== nextProps.query || this.isFirstQuery) {
      this.isFirstQuery = false;
      let query = nextProps.query || '';
      // Why is there service and providerService ?? Fix that.
      let serviceURL = this.getServiceURL(nextProps.providerService || nextProps.service);
      let requestMethod = 'post';
      let requestHeaders = {};

      // beforeFetch hook
      if (typeof nextProps.beforeFetch === 'function') {
        query = nextProps.beforeFetch(query, nextProps);
      }

      // Make sure we can even make a query.
      if (serviceURL && query !== '') {
        if (serviceURL === 'demo' || serviceURL === 'mock') {
          // Mock/demo service works similar to GraphQL in that it will make an HTTP request.
          // Instead of an API server, it just loads static JSON. See files in public/mock
          // Example:
          // {
          //   description: "This file contains data to power some widget.",
          //   errors: "Can have the same errors if for some reason errors want to be mocked",
          //   data: {
          //     someGraphObject: [{"some": "data"}]
          //   }
          // }
          //
          // The filename to pull from the public directory is based on the query.
          // This way each specific GraphQL query can have its own response.
          // Since it's very difficult to tell how the query will be formatted in code
          // (spaces, tabs, etc.) remove all whitespace before generating the hash.
          const noWSQuery = query.replace(/[\t\n\r\s]+/g, '');
          const mockFileName = Sha256.hash(noWSQuery);
          serviceURL = `/mock/${mockFileName}.json`;
          // Not only does the service URL change, but the request method does as well.
          requestMethod = 'get';
        } else {
          requestHeaders = { Authorization: `Bearer ${token(nextProps.user)}` };
        }

        // Make the API request.
        //
        // If the router changes state before the HTTP request completes
        // it could create problems. So keep a reference to this request and on
        // componentWillUnmount() simply cancel the request if it hasn't returned yet.
        const CancelToken = axios.CancelToken;
        this.requestSource = CancelToken.source();

        const httpClient = axios.create({
          // Some queries are going to take a LONG time for now...But this is nice to set.
          // timeout: 1000,
          // This won't be necessary for the mock data, but also won't hurt.
          // There is no need for separate headers. Only request method and URL.
          headers: requestHeaders
        });
        httpClient
          .request({ method: requestMethod, url: serviceURL, data: { query: query } })
          .then(result => {
            // The request is no longer in-flight, so it doesn't need to be canceled.
            this.requestSource = null;
            this.publishUpdate(this.providerId, result, query, nextProps);
          })
          .catch(function(error) {
            console.warn(error);
          });
      } else {
        console.error('GraphQL service (' + serviceURL + ') URL not configured!');
      }
    }
  }

  /**
   * Publishes an update for the appropriate provider ID.
   * The afterFetch hook is called if present.
   *
   * @param {String} providerId The unique GraphQL provider component ID
   * @param {Object} result     The result from the API
   * @param {String} query      The final query to the API
   * @param {Object} nextProps  Props (most useful being the optional afterFetch hook)
   */
  publishUpdate(providerId, result, query, nextProps) {
    // If there were no errors, publish the update.
    if (result.data && !result.data.errors) {
      let data = result.data.data;
      if (typeof nextProps.afterFetch === 'function') {
        data = nextProps.afterFetch(result.data.data);
      }

      PubSub.publish('DASHBOARD_GRAPHQL_UPDATE_' + providerId, {
        result: data,
        query: query,
        afterFetch: nextProps.afterFetch,
        beforeFetch: nextProps.beforeFetch
      });
    }
    // If there were errors, log them out. No update occurs.
    if (result.data && result.data.errors) {
      result.data.errors.forEach(error => {
        console.error('Error for query: ', query, '\n', error);
      });
    }
  }

  /**
   * Retrieves the GraphQL API endpoint URL based on configuration.
   *
   * @return {Mixed} This will return the endpoint URL string or 'healthshare' (default) if not set in config
   */
  getServiceURL(service) {
    if (service === 'demo' || service === 'mock') {
      return service;
    }
    const endpointKey = `${service}APIEndpoint`;
    const parsedConfig = this.props.config;
    return parsedConfig[endpointKey] || 'healthshare';
  }

  /**
   * Use the context to pass down, to each child, the provider ID.
   * This can not be used for the GraphQL API responses since those
   * come from an async request. That would lead to issues with the
   * React lifecycle.
   *
   * With this provider ID, the children will be able to subscribe
   * to the proper topics in order to receive the proper data from
   * the API and any updates.
   *
   * @return {Object}
   */
  getChildContext() {
    return { graphqlUpdateTopic: 'DASHBOARD_GRAPHQL_UPDATE_' + this.providerId };
  }

  render() {
    // `Children.only` enables us not to add a <div /> for nothing
    return Children.only(this.props.children);

    // NOTE: Applying to multiple children (React.cloneElement()) could
    // create a rather big performance penalty. Especially in combination
    // with the responsive grid components. Those will change quite frequently
    // which will trigger re-render events, which will constantly use cloneElement()
    // which is already slow to begin with. This is why returning Children and
    // using context is much better.
  }
}

export default withUser(withConfig(GraphQLProvider));

/**
 * A function that will return the higher order component and pass
 * the provier ID from the context to each child component.
 * Anything wishing to use GraphQL provider should use this function.
 * With that ID, the HOC will listen for data updates and pass them
 * along to each child component's local state.
 *
 * @param {*} ComponentToWrap React component to use with GraphQL provider
 */
export const graphql = ComponentToWrap => {
  return class GraphQLProvider extends PureComponent {
    state = { graphql: {} };

    token = null;

    componentDidMount() {
      this.token = PubSub.subscribe(this.context.graphqlUpdateTopic, (msg, data) => {
        // console.log('for topic: '+ this.context.graphqlUpdateTopic +' got message with data:', data);
        if (Object.keys(data).length > 0) {
          this.setState({
            graphql: {
              graphqlUpdateTopic: this.context.graphqlUpdateTopic,
              query: data.query,
              beforeFetch: data.beforeFetch,
              afterFetch: data.afterFetch,
              result: data.result
            }
          });
        }
      });
    }

    componentWillUnmount() {
      PubSub.unsubscribe(this.token);
    }

    static contextTypes = {
      graphqlUpdateTopic: PropTypes.string
    };

    render() {
      return <ComponentToWrap {...this.props} graphql={this.state.graphql} />;
    }
  };
};
