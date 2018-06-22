// npm test -- --watch --collectCoverageFrom=src/components/dashboardFilters/Month.jsx --testPathPattern=dashboardFilters/Month
import React from 'react';
import { shallow, mount } from 'enzyme';
import DashboardFilter from '../DashboardFilter';
import MonthFilter from './Month';
import { ObservableMap } from 'mobx';
import PubSub from 'pubsub-js';

global.sessionStorage = {
  config: '{}'
}

describe('MonthFilter', () => {

  const wrapper = shallow(<MonthFilter />);

  const mntWrapper = mount(
    <DashboardFilter>
      <MonthFilter initialValue="now" />
    </DashboardFilter>);

  it('should render', () => {
    expect(wrapper.shallow().find("label").length).toEqual(1);
    expect(wrapper.shallow().find("label").text().length).toBeGreaterThan(1);
  });

  it('should have @observable DashboardFilterStore passed via props as `filters`', () => {
    expect(mntWrapper.children().find(MonthFilter).prop("filters")).toBeInstanceOf(ObservableMap);
  });

  describe('handleChange()', () => {
    it('should update a `month` filter value in @observable map', (done) => {
      PubSub.subscribe(mntWrapper.instance().props.topic, (msg, filters) => {
        expect(filters.has('month')).toEqual(true);
        expect(filters.get('month')).toEqual("foo");
        done();
      });

      mntWrapper.children().find(MonthFilter).instance().handleChange({value: 'foo'});
    });
  });

});