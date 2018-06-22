// Test just this
// npm test -- --watch --collectCoverageFrom=src/pages/dashboards/types/HIE/Management/RegisteredDocumentsDetail/filters.jsx --testPathPattern=RegisteredDocumentsDetail/filters.test.jsx
import React from 'react';
import { mount } from 'enzyme';
// import MockedProvider from 'react-apollo';
import {RegisteredDocumentsDetailFilters} from './filters';
import { Responsive, WidthProvider } from "react-grid-layout";
import { DashboardLayout } from "pages/dashboards/DashboardLayout";
import ResponsiveWidget from "widgets/ResponsiveWidget";
import { mockFilters, mockFiltersData } from "./mocks";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

describe('RegisteredDocumentsDetailFilters', () => {
  
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
      <RegisteredDocumentsDetailFilters 
        filters={mockFilters}
        data={mockFiltersData}
        updateFilters={() => {}}
      />
    </ResponsiveWidget>
    </ResponsiveReactGridLayout>
  );
  
  //console.log(wrapper.debug());

  it('should render', () => {
    const panelTitles = [];
    const panelTitleAnchors = wrapper
    .find(RegisteredDocumentsDetailFilters).children()
    .find('div.panel-title').children()
    .find('a');
    panelTitleAnchors.forEach((anchor) => {
      panelTitles.push(anchor.text());
    })
    
    expect(panelTitles).toEqual(
      expect.arrayContaining(["Organization"]),
    );

    expect(panelTitles.length).toBeGreaterThan(0);

  });

  // it('should allow organization filter changes', () => {
  //   wrapper.find(RegisteredDocumentsDetailFilters).instance().handleChangeOrganization(["testOrg"]);
  //   console.log(wrapper.find(RegisteredDocumentsDetailFilters).props().updateFilters());
  //   // handleChangeOrganization
  // });


});