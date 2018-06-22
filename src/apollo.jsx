import ApolloClient from 'apollo-client';
// import { setContext } from "apollo-link-context";
// import { HttpLink, createHttpLink } from "apollo-link-http";
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';

let _client = null;

function client() {
  if (!_client) {
    throw new Error('Apollo Client has not been initialized. Make sure (initialize) method has been called.');
  }
  return _client;
}

const initialize = function(uri) {
  _client = new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache()
  });
  return client();
};

export default client;
export { ApolloProvider, initialize };
