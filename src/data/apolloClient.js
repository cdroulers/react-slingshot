import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { withClientState } from "apollo-link-state";
import { ApolloLink } from "apollo-link";
import gql from "graphql-tag";
import db from "./db";

// This is the same cache you pass into new ApolloClient
const cache = new InMemoryCache();

const stateLink = withClientState({
  cache,
  resolvers: {
    Mutation: {
      createCase: (_, { id, name }, { cache }) => {
        const c = {
          _id: "case-" + id,
          name: name,
          type: "case"
        };
        const action = {
          _id: "action-" + Date.now().toString(),
          type: "action",
          name: "createCase",
          parameters: {
            _id: c._id,
            name: c.name
          }
        };
        return db.bulkDocs([c, action]).then(() => {
          const newCase = {
            __typename: "Case",
            _id: c._id,
            name
          };
          const query = gql`
            query getLocalCases {
              localCases @client {
                __typename
                _id
                name
              }
            }
          `;
          const previous = cache.readQuery({ query });
          const data = {
            localCases: previous.localCases.concat([newCase])
          };
          cache.writeQuery({ query, data });
        });
      },
      updateCase: (_, { id, name }, { cache }) => {
        return db.get(id).then(c => {
          c.name = name;
          const action = {
            _id: "action-" + Date.now().toString(),
            type: "action",
            name: "updateCase",
            parameters: {
              _id: c._id,
              name: c.name
            }
          };
          return db.bulkDocs([c, action]).then(() => {
            const query = gql`
              query getLocalCases {
                localCases @client {
                  __typename
                  _id
                  name
                }
              }
            `;
            const previous = cache.readQuery({ query });
            previous.localCases.filter(x => x._id == id)[0].name = name;
            const data = {
              localCases: previous.localCases
            };
            cache.writeQuery({ query, data });
          });
        });
      }
    },
    Query: {
      networkStatus: () => {
        return {
          __typename: "NetworkStatus",
          isConnected: true
        };
      },
      localCases: () => {
        return db
          .query("cases/by_name", { include_docs: true })
          .then(docs => {
            const cases = docs.rows
              .filter(x => x.doc.type === "case")
              .map(x => ({
                __typename: "Case",
                ...x.doc
              }));
            return cases;
          });
      }
    }
  }
});

const httpLink = new HttpLink({ uri: "http://localhost:5000/graphql" });

const client = new ApolloClient({
  link: ApolloLink.from([stateLink, httpLink]),
  cache
});

window.apolloClient = client;

export default client;
