import React from 'react';
import { shallow } from 'enzyme';

import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import ResponsiveWidget from 'widgets/ResponsiveWidget';

// Component under test
import { RegisteredUsersDetailView } from './view';

describe('RegisteredUsersDetailView', () => {
  const gridProps = DashboardLayout.getDetailsPageGridProps(6, 6);
  const ResponsiveReactGridLayout = WidthProvider(Responsive);
  const wrapper = shallow(
    <ResponsiveReactGridLayout className="layout" rowHeight={100} {...gridProps}>
      <ResponsiveWidget key={'content'} className={'empty-grid-element'}>
        <RegisteredUsersDetailView
          filters={{}}
          data={{
            loading: true
          }}
        />
      </ResponsiveWidget>
    </ResponsiveReactGridLayout>
  );

  it('should render', () => {
    expect(wrapper.shallow().find(RegisteredUsersDetailView).length).toEqual(1);
  });
});
