import React from "react";
import { shallow } from "enzyme";
import { PrenatalCareDetailsView } from "./view.jsx";

global.sessionStorage = {
  config: "{}"
};

describe("Prenatal Care Details Dashboard", () => {
  const emptyStore = {
    getState: () => {},
    subscribe: () => {},
    dispatch: () => {}
  };

  const wrapper = shallow(<PrenatalCareDetailsView store={emptyStore} />);
  it("should render", () => {
    expect(wrapper.find("h2.page-heading").length).toEqual(1);
    // wrapper.dive().find("h2.page-heading").text() should be "Details: Prenatal Care"
    // But don't test on that, dashboard display title could always change
    expect(wrapper.find("h2.page-heading").text().length).toBeGreaterThan(1);
    // NOTE: Do NOT test children components, such as the bar chart, here.
    // There's only a million reasons why unit tests should never do that.
  });

  /*
  describe("generatetransformTimelinessLayouts()", () => {
    it("should transform data to include percentages", () => {
      // eslint-disable-next-line max-len
      const mockResponse = {
        data: {
          hiePreNatalCareDetail: [
            { FirstVisitWeeks: 0, NumPatients: 113 },
            { FirstVisitWeeks: 4, NumPatients: 4 },
            { FirstVisitWeeks: 5, NumPatients: 14 },
            { FirstVisitWeeks: 6, NumPatients: 11 },
            { FirstVisitWeeks: 7, NumPatients: 12 },
            { FirstVisitWeeks: 8, NumPatients: 9 },
            { FirstVisitWeeks: 9, NumPatients: 12 },
            { FirstVisitWeeks: 10, NumPatients: 29 },
            { FirstVisitWeeks: 11, NumPatients: 67 },
            { FirstVisitWeeks: 12, NumPatients: 72 },
            { FirstVisitWeeks: 13, NumPatients: 56 },
            { FirstVisitWeeks: 14, NumPatients: 56 },
            { FirstVisitWeeks: 15, NumPatients: 70 },
            { FirstVisitWeeks: 16, NumPatients: 90 },
            { FirstVisitWeeks: 17, NumPatients: 133 },
            { FirstVisitWeeks: 18, NumPatients: 121 },
            { FirstVisitWeeks: 19, NumPatients: 114 },
            { FirstVisitWeeks: 20, NumPatients: 119 },
            { FirstVisitWeeks: 21, NumPatients: 138 },
            { FirstVisitWeeks: 22, NumPatients: 103 },
            { FirstVisitWeeks: 23, NumPatients: 88 },
            { FirstVisitWeeks: 24, NumPatients: 97 },
            { FirstVisitWeeks: 25, NumPatients: 78 },
            { FirstVisitWeeks: 26, NumPatients: 54 },
            { FirstVisitWeeks: 27, NumPatients: 55 },
            { FirstVisitWeeks: 28, NumPatients: 41 },
            { FirstVisitWeeks: 29, NumPatients: 54 },
            { FirstVisitWeeks: 30, NumPatients: 40 },
            { FirstVisitWeeks: 31, NumPatients: 43 },
            { FirstVisitWeeks: 32, NumPatients: 37 },
            { FirstVisitWeeks: 33, NumPatients: 45 },
            { FirstVisitWeeks: 34, NumPatients: 42 },
            { FirstVisitWeeks: 35, NumPatients: 39 },
            { FirstVisitWeeks: 36, NumPatients: 41 },
            { FirstVisitWeeks: 37, NumPatients: 13 },
            { FirstVisitWeeks: 38, NumPatients: 26 },
            { FirstVisitWeeks: 39, NumPatients: 30 },
            { FirstVisitWeeks: 40, NumPatients: 3 }
          ]
        }
      };
      const transformedData = wrapper.instance().transformTimeliness(mockResponse.data);

      expect(transformedData).toBeInstanceOf(Object);
      expect(transformedData.hiePreNatalCareDetail).toBeInstanceOf(Array);
      expect(transformedData.hiePreNatalCareDetail[0]).toHaveProperty("Percentage");
      expect(transformedData.hiePreNatalCareDetail[0].Percentage).toEqual(0.18);
    });
  });
  */
});
