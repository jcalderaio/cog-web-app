// Test just this DashboardFilter
// (provides more details in summary)
// npm test -- --watch --collectCoverageFrom=src/components/DashboardFilter.jsx --testPathPattern=components/DashboardFilter.test.jsx
//
// Test all dashboard filter stuff
// (providers coverage for more files, but shorter PASS/FAIL details in summary)
// npm test -- --watch --collectCoverageFrom='["src/components/DashboardFilter.jsx","src/components/dashboardFilters/**/*.{js,jsx}"]' --testPathPattern=dashboardfilter
import React from 'react';
import createReactClass from 'create-react-class';
import { shallow, mount, ReactWrapper } from 'enzyme';
import DashboardFilter from './DashboardFilter';
import { ObservableMap } from 'mobx';
import PubSub from 'pubsub-js';

global.sessionStorage = {
  config: '{}'
}

describe('DashboardFilter', () => {
  const Child = createReactClass({
    render: function() {
      return <h1>Child Filter Title</h1>;
    }
  });

  const wrapper = shallow(<DashboardFilter />);
  const wrapperNoHeader = shallow(<DashboardFilter header={false} />);
  
  const mntWrapper = mount(
    <DashboardFilter>
      <Child foo="bar"/>
      <span>invalid</span>
      invalid
      <div>invalid</div>
    </DashboardFilter>);

  it('should render', () => {
    expect(wrapper.shallow().find("h4").length).toEqual(1);
    // wrapper.dive().find("h2.page-heading").text() should be "Filters"
    // But don't test on that, display title could always change
    expect(wrapper.shallow().find("h4").text().length).toBeGreaterThan(1);
    // the header element (with collapsible function) is optional
    // one could put the entire <DashboardFilter> component inside of something else
    expect(wrapperNoHeader.shallow().find("h4").length).toEqual(0);
  });

  describe('children filters', () => {
    it('should render', () => {
      expect(mntWrapper.children().find(Child).prop("foo")).toEqual("bar");
    });

    it('should render only functions', () => {
      expect(mntWrapper.children().find(Child)).toBeInstanceOf(ReactWrapper);
      // Unless it changes, it's likely to equal: "Filters(Clear All)Child Filter Title"
      // But it certainly shouldn't have the word "invalid" in there.
      expect(mntWrapper.children().text()).not.toEqual(expect.stringMatching(/invalid/));
    });
    
    it('should have `addFilter()` passed via props', () => {
      expect(mntWrapper.children().find(Child).prop("addFilter")).toBeInstanceOf(Function);
    });

    it('should have @observable DashboardFilterStore passed via props as `filters`', () => {
      expect(mntWrapper.children().find(Child).prop("filters")).toBeInstanceOf(ObservableMap);
    });

    it('should have a `lastCleared` prop passed to it', () => {
      expect(mntWrapper.children().find(Child).prop("lastCleared")).toBeDefined();
    });
    
  });

  describe('addFilter()', () => {
    it('should update @observable DashboardFilterStore', () => {
        expect(wrapper.instance().DashboardFilterStore).toBeInstanceOf(ObservableMap);
        wrapper.instance().addFilter({foo: "bar"}, false);
        expect(wrapper.instance().DashboardFilterStore.get("foo")).toEqual("bar");
    });
    
    it('should publish dashboard filter updates', (done) => {
        PubSub.subscribe(wrapper.instance().props.topic, (msg, filters) => {
            expect(filters.has('foo')).toEqual(true);
            expect(filters.get('foo')).toEqual('bar');
            done();
        });
        wrapper.instance().addFilter({foo: "bar"});
    });

    it('should be able to remove keys from @observable DashboardFilterStore', (done) => {
      PubSub.subscribe(wrapper.instance().props.topic, (msg, filters) => {
          expect(filters.has('foo')).toEqual(false);
          done();
      });
      wrapper.instance().addFilter({foo: undefined});
    });

    it('should require an object to update filters', () => {
      expect(() => {
        wrapper.instance().addFilter("foo")
      }).toThrow();      
    });
  });

  describe('dispatchFilterUpdate()', () => {
    it('should dispatch updates', (done) => {
        PubSub.subscribe(wrapper.instance().props.topic, (msg, filters) => {
            expect(msg).toEqual(wrapper.instance().props.topic);
            done();
        });
        wrapper.instance().dispatchFilterUpdate();
    });
  });

  describe('clearAllFilters()', () => {
    it('should reset @observable DashboardFilterStore', () => {
        wrapper.instance().addFilter({foo: "bar"}, false);
        wrapper.instance().clearAllFilters();
        expect(wrapper.instance().DashboardFilterStore.has('foo')).toEqual(false);
    });
  });

  describe('toggleFilterCollapse()', () => {
    it('should toggle state property between true and false', () => {
      wrapper.instance().toggleFilterCollapse();
      expect(wrapper.instance().state.isFilterCollapsed).toEqual(true);
      wrapper.instance().toggleFilterCollapse();
      expect(wrapper.instance().state.isFilterCollapsed).toEqual(false);
    })
  });

});