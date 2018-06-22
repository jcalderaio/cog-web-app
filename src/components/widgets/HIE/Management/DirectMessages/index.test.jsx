// npm test -- --watch --collectCoverageFrom=src/components/widgets/HIE/Management/DirectMessages/index.jsx --testPathPattern=components/widgets/HIE/Management/DirectMessages/index.test.jsx
// import React from 'react';

import { graphqlTransform } from "./index";
import { mockDirectMessages } from "./mocks";

describe("DirectMessages", () => {
  describe("graphqlTransform", () => {
    const transformed = graphqlTransform({
      ownProps: {},
      data: mockDirectMessages
    });

    it("should return 24 months worth of data by default", () => {
      expect(transformed.data.length).toEqual(24);
    });

    it("should zero fill any months where data is missing from GraphQL response", () => {
      // ensure missing months from graphql response are zero filled
      expect(transformed.data[0].messagesReceived).toEqual(0);
    });

    // it("should use data returned from GraphQL as is", () => {
    //   // ensure the map/filter returns original data
    //   expect(transformed.data[16].month).toEqual(10);
    //   expect(transformed.data[16].year).toEqual(2017);
    //   expect(transformed.data[16].messagesReceived).toEqual(1372);
    // });
  });
});
