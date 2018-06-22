// Test just this
// npm test -- --watch --collectCoverageFrom=src/pages/dashboards/types/HIE/Management/RegisteredDocumentsDetail/view.jsx --testPathPattern=RegisteredDocumentsDetail/view.test.jsx
import React from 'react';
import { shallow } from 'enzyme';

import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import ResponsiveWidget from 'widgets/ResponsiveWidget';

// Component under test
import { RegisteredDocumentsDetailsView } from './view';

describe('RegisteredDocumentsDetailsView', () => {
  const gridProps = DashboardLayout.getDetailsPageGridProps(6, 6);
  const ResponsiveReactGridLayout = WidthProvider(Responsive);
  const wrapper = shallow(
    <ResponsiveReactGridLayout className="layout" rowHeight={100} {...gridProps}>
      <ResponsiveWidget key={'content'} className={'empty-grid-element'}>
        <RegisteredDocumentsDetailsView 
        filters={{}} data={{ loading: true }} />
      </ResponsiveWidget>
    </ResponsiveReactGridLayout>
  );

  it('should render', () => {
    expect(wrapper.shallow().find(RegisteredDocumentsDetailsView).length).toEqual(1);
  });
});
