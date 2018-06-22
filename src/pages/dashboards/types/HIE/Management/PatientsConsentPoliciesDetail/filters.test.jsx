import React from "react";
import { mount } from "enzyme";

import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import moment from "moment";

// Component under test
import PatientsConsentPoliciesDetailFilters from "./filters";

describe("PatientsConsentPoliciesDetailFilters Component", () => {
  const mockUpdateFilters = jest.fn();

  const wrapper = mount(<PatientsConsentPoliciesDetailFilters filters={{}} updateFilters={mockUpdateFilters} />);
  const instance = wrapper.instance();

  describe("updateFilters()", () => {
    afterEach(() => {
      mockUpdateFilters.mockClear();
    });

    it("is called on mount", () => {
      expect(mockUpdateFilters.mock.calls).toEqual([
        [
          {
            startDate: startOfMonth(subMonths(new Date(), 23)),
            endDate: endOfMonth(new Date()),
            status: null
          }
        ]
      ]);
    });

    it("is called when changing startDate", () => {
      const change = startOfMonth(subMonths(new Date(), 24));

      instance.handleChangeStartDate(moment(change));

      expect(mockUpdateFilters.mock.calls).toEqual([[{ startDate: change }]]);
    });

    it("is called when changing endDate", () => {
      const change = endOfMonth(subMonths(new Date(), 1));

      instance.handleChangeEndDate(moment(change));

      expect(mockUpdateFilters.mock.calls).toEqual([[{ endDate: change }]]);
    });

    it("is called when changing status", () => {
      const change = "Active";

      instance.handleChangeStatus(change);
      expect(mockUpdateFilters.mock.calls).toEqual([[{ status: change }]]);
    });
  });
});
