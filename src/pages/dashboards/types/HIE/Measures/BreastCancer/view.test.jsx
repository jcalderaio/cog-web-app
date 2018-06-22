import React from "react";
import { shallow } from "enzyme";
import { BreastCancerDetailsView } from "./view";

global.sessionStorage = {
  config: "{}"
};

describe("Well Child Details Dashboard", () => {
  const emptyStore = {
    getState: () => {},
    subscribe: () => {},
    dispatch: () => {}
  };

  test("should render", () => {
    const wrapper = shallow(<BreastCancerDetailsView store={emptyStore} />);
    expect(wrapper.find("h2").length).toEqual(1);
    // NOTE: Do NOT test children components, such as the bar chart, here.
    // There's only a million reasons why unit tests should never do that.
  });
});
