import React from "react";
import { shallow } from "enzyme";

// Component under test
import ProviderTable from "./index";

describe("ProviderTable Component", () => {
  const fakeProps = {
  };

  const wrapper = shallow(<ProviderTable {...fakeProps} />);

  it("should render", () => {
    expect(wrapper.dive().find("ReactTable").length).toEqual(1);
  });
});
