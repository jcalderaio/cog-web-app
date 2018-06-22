import React from "react";
// import { shallow } from "enzyme";
import { WellChildDetails } from "./view";

global.sessionStorage = {
  config: "{}"
};

describe("Well Child Details Dashboard", () => {
  // const emptyStore = {
  //   getState: () => {},
  //   subscribe: () => {},
  //   dispatch: () => {}
  // };

  it("should exist", () => {
    expect(<WellChildDetails />).toBeDefined();
  });

  /*
  test("should render", () => {
    const wrapper = shallow(<WellChildDetails store={emptyStore} />);
    expect(wrapper.dive().find("h2.page-heading").length).toEqual(1);
  });
  */
});
