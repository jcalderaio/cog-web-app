import React from "react";
import { shallow } from "enzyme";

// Component under test
import PrescriberTable from "./index";

describe("PrescriberTable Component", () => {
  const fakeProps = {
  };

  const wrapper = shallow(<PrescriberTable {...fakeProps} />);

  it("should render", () => {
    expect(wrapper.dive().find("ReactTable").length).toEqual(1);
  });
});
