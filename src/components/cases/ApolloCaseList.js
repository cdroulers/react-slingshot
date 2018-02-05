import React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { CaseList } from "./CaseList";

class ApolloCaseList extends CaseList {
  static propTypes = {};

  state = {
    loading: true,
    cases: []
  };

  componentDidMount() {}

  render() {
    const { data } = this.props;
    if (data.loading) {
      return <div>loading........</div>;
    }

    return (
      <div>
        <p>network status: {JSON.stringify(data.networkStatus)}</p>
        <CaseList
          cases={data.localCases}
          createItemFunc={this.props.createCase}
          updateItemFunc={this.props.updateCase}
        />
      </div>
    );
  }
}

const query = gql`
  query wat($first: Int!) {
    networkStatus @client {
      isConnected
    }
    localCases @client {
      __typename
      _id
      name
    }
  }
`;

const createMutation = gql`
  mutation createCase($id: String!, $name: String!) {
    createCase(id: $id, name: $name) @client
  }
`;
const updateMutation = gql`
  mutation updateCase($id: String!, $name: String!) {
    updateCase(id: $id, name: $name) @client
  }
`;
export default compose(
  graphql(query, {
    options: {
      pollInterval: 5000,
      variables: { first: 25 }
    }
  }),
  graphql(createMutation, {
    props: ({ mutate, ...other }) => ({
      ...other,
      createCase: variables => mutate({ variables })
    })
  }),
  graphql(updateMutation, {
    props: ({ mutate, ...other }) => ({
      ...other,
      updateCase: variables => mutate({ variables })
    })
  })
)(ApolloCaseList);
