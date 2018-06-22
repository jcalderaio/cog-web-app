// npm test -- --watch --collectCoverageFrom=src/components/providers/GraphQL.jsx --testPathPattern=providers/GraphQL
import React from "react";
import createReactClass from "create-react-class";
import { mount } from "enzyme";
import GraphQLProvider, { graphql } from "./GraphQL";
// import PubSub from "pubsub-js";

// var nock = require("nock");

global.sessionStorage = {
  config: "{}"
};

describe("GraphQL Provider", () => {
  const emptyStore = {
    getState: () => {
      return {
        app: {
          config: {
            insightsAPIEndpoint: "https://app.dev.cognosante.cc/graphql",
            healthshareAPIEndpoint: "https://healthshare-graphql.dev.cognosante.cc/graphql",
            healthshareClinicalAPIEndpoint: "https://healthshare-graphql.dev.cognosante.cc/graphql"
          }
        }
      };
    },
    subscribe: () => {},
    dispatch: () => {},
    getItem: () => {}
  };

  const Child = graphql(
    createReactClass({
      state: { default: true },
      render: function() {
        return <h1>Child Title</h1>;
      }
    })
  );

  const mockQuery = `{
    obj(arg: 'a') {
      fieldA
      fieldB
    }
  }`;

  const mockQueryAltered = `{
    obj(arg: 'a', arg2: 'b') {
      fieldA
      fieldB
    }
  }`;

  // const mockResult = {
  //   data: {
  //     data: { users: { total: 10 } }
  //   }
  // };

  // var mockAPI = nock("http://localhost")
  //   // .get('/mock/1c16d96ee52227e9013f6fb8d6f5ea3683554ccf13e2572291114249339585dc.json')
  //   .get("/mock/39503240840815bcc59ed42ba91fd1e090ef32be2daf8b3e4374ca7dfe92915f.json")
  //   .reply(200, mockResult);

  const alterQuery = query => {
    return mockQueryAltered;
  };

  // const wrapper = shallow(
  //   <GraphQLProvider service="mock" beforeFetch={alterQuery} query={mockQuery} store={emptyStore}>
  //     <Child />
  //   </GraphQLProvider>
  // );
  const mntWrapper = mount(
    <GraphQLProvider service="demo" beforeFetch={alterQuery} query={mockQuery} store={emptyStore}>
      <Child />
    </GraphQLProvider>
  );
  // const gqlInstance = mntWrapper
  //   .children()
  //   .first()
  //   .instance();

  it("should render", () => {
    expect(
      mntWrapper
        .children()
        .find(Child)
        .find("h1")
        .text().length
    ).toBeGreaterThan(1);
    // expect(mntWrapper.children().find(Child).prop("graphql")).toEqual("bar");
    // NOTE: Do NOT test children components, such as the bar chart, here.
    // There's only a million reasons why unit tests should never do that.
  });

  /*
  describe("getServiceURL()", () => {
    it("should return mock or demo for mock service", () => {
      expect(gqlInstance.getServiceURL("mock")).toEqual("mock");
      expect(gqlInstance.getServiceURL("demo")).toEqual("demo");
    });

    it("should return service URL for configured service", () => {
      expect(gqlInstance.getServiceURL("healthshare")).toEqual("https://healthshare-graphql.dev.cognosante.cc/graphql");
      expect(gqlInstance.getServiceURL("insights")).toEqual("https://app.dev.cognosante.cc/graphql");
      expect(gqlInstance.getServiceURL("default")).toEqual("healthshare");
    });
  });

  describe("getChildContext()", () => {
    it("should return an object with a `graphqlUpdateTopic` key", () => {
      expect(gqlInstance.getChildContext()).toBeInstanceOf(Object);
    });
  });
  

  describe("publishUpdate()", () => {
    it("should publish an update for each child to consume", done => {
      expect(typeof gqlInstance.publishUpdate).toEqual("function");

      PubSub.subscribe("DASHBOARD_GRAPHQL_UPDATE_" + gqlInstance.providerId, (msg, data) => {
        expect(msg.length).toBeGreaterThan(1);
        expect(data.result).toEqual(mockResult.data.data);
        expect(typeof data.afterFetch).toEqual("function");
        // console.log(mntWrapper.children().find(Child).instance().state)
        done();
      });

      gqlInstance.publishUpdate(gqlInstance.providerId, mockResult, mockQuery, {
        query: mockQuery,
        afterFetch: data => {
          return data;
        }
      });
    });
  });

  it("HOC should receive state updates for `graphql`", () => {
    expect(
      mntWrapper
        .children()
        .find(Child)
        .instance().state.graphql.result
    ).toEqual(mockResult.data.data);
  });
  */

  it("HOC unmount should remove PubSub sucribe", () => {
    // Note: There's no return on this lifecycle event. It's not exactly something to test.
    // Testing PubSub unsubscribe() isn't really something you do either. Just checking the token was set is enough.
    mntWrapper
      .children()
      .find(Child)
      .instance()
      .componentWillUnmount();
    expect(
      mntWrapper
        .children()
        .find(Child)
        .instance().token.length
    ).toBeGreaterThan(0);
  });

  /*
  it("should support a `beforeFetch` hook", () => {
    expect(
      mntWrapper
        .children()
        .find(Child)
        .instance().state.graphql.query
    ).toEqual(mockQuery);
    // console.log(mntWrapper.props('graphql'));
    // expect(gqlInstance.instance().props('graphql').query).toEqual(mockQueryAltered);
  });
  */

  describe("children", () => {
    it("should have a `graphql` prop", () => {
      expect(
        typeof mntWrapper
          .children()
          .find(Child)
          .props("graphql")
      ).toEqual("object");
    });
  });
});
