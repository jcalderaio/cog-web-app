// Test just this
// npm test -- --watch --collectCoverageFrom=src/pages/dashboards/types/HIE/Management/StreamletsByFacilityDetail/filters.jsx --testPathPattern=StreamletsByFacilityDetail/filters.test.jsx
import React from 'react';
import { shallow } from 'enzyme';
// import MockedProvider from 'react-apollo';
import {StreamletsByFacilityDetailFilters} from './filters';
import { mockFilters, mockFiltersData } from "./mocks";
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import moment from 'moment';

describe('StreamletsByFacilityDetailFilters', () => {

  const mockUpdateFilters = jest.fn();

  const wrapper = shallow(
    <StreamletsByFacilityDetailFilters 
      filters={mockFilters}
      data={mockFiltersData}
      updateFilters={mockUpdateFilters}
    />
  );
  // console.log(wrapper.debug());

  const instance = wrapper.instance();

  describe('updateFilters()', () => {
    afterEach(() => {
      mockUpdateFilters.mockClear();
    });

    it('is called when changing startDate', () => {
      const change = startOfMonth(subMonths(new Date(), 24));

      instance.handleChangeStartDate(moment(change));

      expect(mockUpdateFilters.mock.calls).toEqual([[{ startDate: change }]]);
    });

    it('is called when changing endDate', () => {
      const change = endOfMonth(subMonths(new Date(), 1));

      instance.handleChangeEndDate(moment(change));

      expect(mockUpdateFilters.mock.calls).toEqual([[{ endDate: change }]]);
    });

    it('is called when changing organization', () => {
      const change = 'a1';

      instance.handleChangeOrganization(change);
      expect(mockUpdateFilters.mock.calls).toEqual([[{ organization: change }]]);
    });

  });

});