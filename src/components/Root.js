import React, { Component } from "react";
import PropTypes from "prop-types";
import { ConnectedRouter } from "react-router-redux";
import { ApolloProvider } from "react-apollo";
import { Provider } from "react-redux";
import App from "./App";

export default class Root extends Component {
  render() {
    const { store, history, client } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <ApolloProvider client={client}>
            <App />
          </ApolloProvider>
        </ConnectedRouter>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired
};
