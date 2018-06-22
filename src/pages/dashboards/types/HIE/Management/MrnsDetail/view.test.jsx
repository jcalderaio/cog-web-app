import React from 'react';
import { shallow } from 'enzyme';

import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import ResponsiveWidget from 'widgets/ResponsiveWidget';

// Component under test
import { MrnsDetailView } from './view';

describe('MrnsDetailView', () => {
  const gridProps = DashboardLayout.getDetailsPageGridProps(6, 6);
  const ResponsiveReactGridLayout = WidthProvider(Responsive);
  const wrapper = shallow(
    <ResponsiveReactGridLayout className="layout" rowHeight={100} {...gridProps}>
      <ResponsiveWidget key={'content'} className={'empty-grid-element'}>
        <MrnsDetailView
          filters={{}}
          data={{
            loading: true
          }}
        />
      </ResponsiveWidget>
    </ResponsiveReactGridLayout>
  );

  it('should render', () => {
    expect(wrapper.shallow().find(MrnsDetailView).length).toEqual(1);
  });
});
