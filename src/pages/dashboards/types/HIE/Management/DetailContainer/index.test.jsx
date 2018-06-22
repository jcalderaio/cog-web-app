// Test just this
// npm test -- --watch --collectCoverageFrom=src/pages/dashboards/types/HIE/Management/DetailContainer/index.jsx --testPathPattern=DetailContainer/index.test.jsx
import React from 'react';
import createReactClass from 'create-react-class';
import { mount } from 'enzyme';
import DetailsView from './index';

describe('DetailContainer', () => {

  // For the <Media /> component inside <DetailContainer />
  const createMockMediaMatcher = matches => () => ({
    matches,
    addListener: () => {},
    removeListener: () => {}
  });
  window.matchMedia = createMockMediaMatcher(true);

  const MockFilters = createReactClass({
    render: function() {
      return <h1>Not Really Filters</h1>;
    }
  });

  const MockView = createReactClass({
    render: function() {
      return <h1>Not Really View</h1>;
    }
  });

  const wrapper = mount(<DetailsView
    title={"Details Test"}
    Filters={MockFilters} 
    View={MockView}
  />);
  
  it('should render itself, Filters and View children', () => {
    // console.log(wrapper.debug());
    expect(wrapper.find('h2.page-heading').length).toEqual(1);
    expect(wrapper.find('h2.page-heading').text()).toEqual("Details Test");

    expect(wrapper.find(MockFilters).children().find('h1').text()).toEqual("Not Really Filters");
    expect(wrapper.find(MockView).children().find('h1').text()).toEqual("Not Really View");
  });

  describe('updateFilters()', () => {
    it('should update filter state', () => {
      expect(wrapper.state('filters')).toEqual({});
      wrapper.instance().updateFilters({"foo": "bar"});
      expect(wrapper.state('filters')).toEqual({"foo": "bar"});
    });
  });

  describe("Filter <button> should toggle <Tray />", () => {
    it('should show <Tray /> on click', () => {
      expect(wrapper.state('filterTrayIsOpen')).toEqual(false);
      wrapper.find('button.btn-sidebar-filter').simulate('click');
      expect(wrapper.state('filterTrayIsOpen')).toEqual(true);
    });
  });

});