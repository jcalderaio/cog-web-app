// npm test -- --watch --collectCoverageFrom=src/components/dashboardFilters/Year.jsx --testPathPattern=dashboardFilters/Year
import React from 'react';
import { shallow, mount } from 'enzyme';
import DashboardFilter from '../DashboardFilter';
import YearFilter from './Year';
import { ObservableMap } from 'mobx';
import PubSub from 'pubsub-js';

global.sessionStorage = {
  config: '{}'
}

describe('YearFilter', () => {

  const wrapper = shallow(<YearFilter />);

  const mntWrapper = mount(
    <DashboardFilter>
      <YearFilter initialValue="now" />
    </DashboardFilter>);

  it('should render', () => {
    expect(wrapper.shallow().find("label").length).toEqual(1);
    expect(wrapper.shallow().find("label").text().length).toBeGreaterThan(1);
  });

  it('should have @observable DashboardFilterStore passed via props as `filters`', () => {
    expect(mntWrapper.children().find(YearFilter).prop("filters")).toBeInstanceOf(ObservableMap);
  });

  describe('handleChange()', () => {
    it('should update a `year` filter value in @observable map', (done) => {
      PubSub.subscribe(mntWrapper.instance().props.topic, (msg, filters) => {
        expect(filters.has('year')).toEqual(true);
        expect(filters.get('year')).toEqual("foo");
        done();
      });

      mntWrapper.children().find(YearFilter).instance().handleChange({value: 'foo'});
    });
  });

  describe('setInitialValue()', () => {
    it('should update a `year` filter value in @observable map', () => {
      expect(mntWrapper.children().find(YearFilter).instance().props.initialValue).toEqual("now");
      mntWrapper.children().find(YearFilter).instance().setInitialValue();
      // Remember, initial values do not publish messages, they "queue" up in a sense
      expect(mntWrapper.instance().DashboardFilterStore.get("year")).toEqual(new Date().getFullYear());
    });
  });

  describe('componentWillUpdate()', () => {
    it('should set the initial filter value, if set, if DashboardFilter cleared all filter values', () => {
        mntWrapper.children().find(YearFilter).instance().handleChange({value: undefined});
        mntWrapper.children().find(YearFilter).instance().componentWillUpdate();
        // In this case, there is an initialValue so check for that
        expect(mntWrapper.instance().DashboardFilterStore.get("year")).toEqual(new Date().getFullYear());
    });
  });

});