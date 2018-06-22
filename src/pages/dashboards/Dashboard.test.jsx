import React from 'react';

import { mount } from 'enzyme';

import Dashboard from './Dashboard';

describe('pages/dashboardView/Dashboard', () => {
  const layouts = { lg: [
    { i: 'a', x: 0, y: 0, w: 6, h: 3, static: true },
    { i: 'b', x: 6, y: 0, w: 6, h: 3, minH: 3, static: true },
    { i: 'c', x: 0, y: 3, w: 6, h: 3, static: true },
    { i: 'd', x: 6, y: 3, w: 6, h: 3, static: true },
    { i: 'e', x: 0, y: 6, w: 6, h: 3, static: true },
    { i: 'f', x: 6, y: 6, w: 6, h: 3, static: true }
  ] };
  const widgets = [];
  /* eslint-disable max-len */
  const wrapper = mount(<Dashboard title="test" widgets={widgets} insights={[]} layouts={layouts.lg}><div></div></Dashboard>);
  /* eslint-enable max-len */

  it('should render self', () => {
    expect(wrapper.find('#page-header').length).toEqual(1);
  });
});