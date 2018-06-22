// npm test -- --watch --collectCoverageFrom=src/components/dashboardFilters/Example.jsx --testPathPattern=dashboardFilters/Example
import React from 'react';
import { shallow, mount } from 'enzyme';
import DashboardFilter from '../DashboardFilter';
import DashboardExampleFilter from './Example';
import { ObservableMap } from 'mobx';
import PubSub from 'pubsub-js';

global.sessionStorage = {
  config: '{}'
}

describe('DashboardExampleFilter', () => {

  const wrapper = shallow(<DashboardExampleFilter />);

  const mntWrapper = mount(
    <DashboardFilter>
      <DashboardExampleFilter />
    </DashboardFilter>);

  it('should render', () => {
    expect(wrapper.shallow().find("label").length).toEqual(1);
    expect(wrapper.shallow().find("label").text().length).toBeGreaterThan(1);
  });

  it('should have @observable DashboardFilterStore passed via props as `filters`', () => {
    expect(mntWrapper.children().find(DashboardExampleFilter).prop("filters")).toBeInstanceOf(ObservableMap);
  });

  describe('handleChange()', () => {
    it('should update a `example` filter value in @observable map', (done) => {
      PubSub.subscribe(mntWrapper.instance().props.topic, (msg, filters) => {
        expect(filters.has('example')).toEqual(true);
        expect(filters.get('example')).toEqual("foo");
        done();
      });

      mntWrapper.children().find(DashboardExampleFilter).find('input').simulate('change',
        { target: { value: 'foo' } }
      );
    });
  });

});