import React from "react";
import { mount } from "enzyme";

// Component under test
import { PatientsConsentPoliciesDetailView } from "./view";

describe("PatientsConsentPoliciesDetailView Component", () => {
  const props = {
    filters: {
      status: "Inactive"
    },
    data: {
      policies: [
        {
          month: "01/2018",
          active: 0,
          inactive: 2,
          any: 2
        },
        {
          month: "02/2018",
          active: 0,
          inactive: 2,
          any: 2
        },
        {
          month: "03/2018",
          active: 0,
          inactive: 2,
          any: 2
        },
        {
          month: "04/2018",
          active: 1,
          inactive: 2,
          any: 3
        }
      ]
    }
  };

  const wrapper = mount(<PatientsConsentPoliciesDetailView {...props} />);
  const instance = wrapper.instance();

  // it("will mount", () => {
  //   expect(wrapper).toContainReact(<h1>hello world</h1>)
  // });

  it("should transform data for csv export", () => {
    const policies = props.data.policies;

    let csvDataTest = instance.csvData(policies);
    let csvDataCorrect = [["Month", "Inactive"], ["01/2018", 2], ["02/2018", 2], ["03/2018", 2], ["04/2018", 2]];

    expect(csvDataTest).toEqual(csvDataCorrect);
  });
});
