// npm test -- --watch --collectCoverageFrom=src/components/dashboardFilters/CareProvider.jsx --testPathPattern=dashboardFilters/CareProvider
import React from 'react';
import { shallow, mount } from 'enzyme';
import DashboardFilter from '../DashboardFilter';
import CareProviderFilter from './CareProvider';
import { ObservableMap } from 'mobx';
import PubSub from 'pubsub-js';

global.sessionStorage = {
  config: '{}'
}

describe('YearFilter', () => {

  const wrapper = shallow(<CareProviderFilter />);

  const mntWrapper = mount(
    <DashboardFilter>
      <CareProviderFilter initialValue="Dr. Feel Good" />
    </DashboardFilter>);

  it('should render', () => {
    expect(wrapper.shallow().find("label").length).toEqual(1);
    expect(wrapper.shallow().find("label").text().length).toBeGreaterThan(1);
  });

  it('should have @observable DashboardFilterStore passed via props as `filters`', () => {
    expect(mntWrapper.children().find(CareProviderFilter).prop("filters")).toBeInstanceOf(ObservableMap);
  });

  describe('handleChange()', () => {
    it('should update a `careProvider` filter value in @observable map', (done) => {
      PubSub.subscribe(mntWrapper.instance().props.topic, (msg, filters) => {
        expect(filters.has('careProvider')).toEqual(true);
        expect(filters.get('careProvider')).toEqual("foo");
        done();
      });

      mntWrapper.children().find(CareProviderFilter).instance().handleChange({value: 'foo'});
    });
  });

  describe('setInitialValue()', () => {
    it('should update a `careProvider` filter value in @observable map', () => {
      expect(mntWrapper.children().find(CareProviderFilter).instance().props.initialValue).toEqual("Dr. Feel Good");
      mntWrapper.children().find(CareProviderFilter).instance().setInitialValue();
      // Remember, initial values do not publish messages, they "queue" up in a sense
      expect(mntWrapper.instance().DashboardFilterStore.get("careProvider")).toEqual("Dr. Feel Good");
    });
  });

  describe('componentWillUpdate()', () => {
    it('should set the initial filter value, if set, if DashboardFilter cleared all filter values', () => {
        mntWrapper.children().find(CareProviderFilter).instance().handleChange({value: undefined});
        mntWrapper.children().find(CareProviderFilter).instance().componentWillUpdate();
        // In this case, there is an initialValue so check for that
        expect(mntWrapper.instance().DashboardFilterStore.get("careProvider")).toEqual("Dr. Feel Good");
    });
  });

});