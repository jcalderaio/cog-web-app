// npm test -- --watch --collectCoverageFrom=src/components/dashboardFilters/Gender.jsx --testPathPattern=dashboardFilters/Gender
import React from 'react';
import { shallow, mount } from 'enzyme';
import DashboardFilter from '../DashboardFilter';
import GenderFilter from './Gender';
import { ObservableMap } from 'mobx';
import PubSub from 'pubsub-js';

global.sessionStorage = {
  config: '{}'
}

describe('GenderFilter', () => {

  const wrapper = shallow(<GenderFilter />);

  const mntWrapper = mount(
    <DashboardFilter>
      <GenderFilter />
    </DashboardFilter>);

  it('should render', () => {
    expect(wrapper.shallow().find("label").length).toEqual(1);
    // wrapper.dive().find("label").text() should be "Gender"
    // But don't test on that, display title could always change
    expect(wrapper.shallow().find("label").text().length).toBeGreaterThan(1);
  });

  it('should have @observable DashboardFilterStore passed via props as `filters`', () => {
    expect(mntWrapper.children().find(GenderFilter).prop("filters")).toBeInstanceOf(ObservableMap);
  });

  describe('getGenderOptions()', () => {
    it('should return an array of options for use with <Select>', () => {
      expect(wrapper.instance().getGenderOptions).toBeInstanceOf(Function);
      const genderOptions = wrapper.instance().getGenderOptions("male");
      expect(genderOptions[0].value).toEqual("male");
      expect(genderOptions[0].label).toEqual("Male");
      expect(genderOptions.length).toBeGreaterThan(1);
      // testing other parts of the switch
      expect(wrapper.instance().getGenderOptions("m")[0].value).toEqual("m");
      expect(wrapper.instance().getGenderOptions("M")[1].value).toEqual("F");
      expect(wrapper.instance().getGenderOptions().length).toEqual(2);
    });
  });

  describe('handleChange()', () => {
    it('should update a `gender` filter value in @observable map', (done) => {
      PubSub.subscribe(mntWrapper.instance().props.topic, (msg, filters) => {
        expect(filters.has('gender')).toEqual(true);
        expect(filters.get('gender')).toEqual('m');
        done();
      });
      mntWrapper.children().find(GenderFilter).instance().handleChange({value: "m"});
    });

    it('should allow a `gender` filter value to be removed from @observable map', (done) => {
      PubSub.subscribe(mntWrapper.instance().props.topic, (msg, filters) => {
        expect(filters.has('gender')).toEqual(false);
        expect(filters.get('gender')).toEqual(undefined);
        done();
      });
      mntWrapper.children().find(GenderFilter).instance().handleChange(null);
    });
  });

});