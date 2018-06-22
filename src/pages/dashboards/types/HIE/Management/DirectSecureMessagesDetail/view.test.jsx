// Test just this
// npm test -- --watch --collectCoverageFrom=src/pages/dashboards/types/HIE/Management/DirectSecureMessagesDetail/view.jsx --testPathPattern=DirectSecureMessagesDetail/view.test.jsx
import React from 'react';
import { mount } from 'enzyme';
// import MockedProvider from 'react-apollo';
import {DirectSecureMessagesDetailView} from './view';
import { Responsive, WidthProvider } from "react-grid-layout";
import { DashboardLayout } from "pages/dashboards/DashboardLayout";
import ResponsiveWidget from "widgets/ResponsiveWidget";
import { mockData, mockFilters } from "./mocks";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

describe('DirectSecureMessagesDetailView', () => {
  
  // The grid and <ResponsiveReactGridLayout> <ResponsiveWidget> wrapper is needed because
  // it passes the height and width down to the children. These absolute dimensions are needed
  // by things like the recharts <LineChart> which uses SVG. The grid layout, size and number 
  // of grid elements doesn't matter here.
  // TODO: Think about a common wrapper for unit testing components which rely upon dimensions (many do)
  const gridProps = DashboardLayout.getDetailsPageGridProps(6,6);

  const wrapper = mount(
    <ResponsiveReactGridLayout
      className="layout"
      rowHeight={100}
      {...gridProps}
    >
    <ResponsiveWidget key={"content"} className={"empty-grid-element"}>
      <DirectSecureMessagesDetailView 
        filters={mockFilters}
        xAxisKey="created"
        data={mockData}
      />
    </ResponsiveWidget>
    </ResponsiveReactGridLayout>
  );
  
  // console.log(wrapper.debug());

  it('should render', () => {
    expect(wrapper
      .find(DirectSecureMessagesDetailView).children()
      .find('li.active').children()
      .find('a').text())
      .toEqual("Trend");

  });


});