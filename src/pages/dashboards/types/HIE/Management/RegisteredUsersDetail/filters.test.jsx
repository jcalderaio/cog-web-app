import React from 'react';
import { shallow } from 'enzyme';

import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import moment from 'moment';

// Component under test
import { RegisteredUsersDetailFilters } from './filters';

describe('RegisteredUsersDetailFilters', () => {
  const mockUpdateFilters = jest.fn();

  const data = {
    loading: true,
    organizations: [],
    cities: [],
    userType: []
  };

  const wrapper = shallow(<RegisteredUsersDetailFilters filters={{}} updateFilters={mockUpdateFilters} data={data} />);
  const instance = wrapper.instance();

  describe('updateFilters()', () => {
    afterEach(() => {
      mockUpdateFilters.mockClear();
    });

    it('is called on mount', () => {
      expect(mockUpdateFilters.mock.calls).toEqual([
        [
          {
            startDate: startOfMonth(subMonths(new Date(), 23)),
            endDate: endOfMonth(new Date()),
            organization: null,
            city: null,
            userType: null
          }
        ]
      ]);
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

    it('is called when changing city', () => {
      const change = 'b2';

      instance.handleChangeCity(change);
      expect(mockUpdateFilters.mock.calls).toEqual([[{ city: change }]]);
    });
  });
});
