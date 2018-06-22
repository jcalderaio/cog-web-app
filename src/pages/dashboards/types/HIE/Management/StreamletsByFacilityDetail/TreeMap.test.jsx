import React from 'react';
import { shallow } from 'enzyme';

// Component under test
import TreeMap from './TreeMap';

describe('TreeMap Component', () => {
  const fakeProps = {
    properties: {
      filters: {}
    }
  };

  const wrapper = shallow(<TreeMap {...fakeProps} />);

  it('should render Treemap Component', () => {
    expect(wrapper.find('Treemap').length).toEqual(1);
  });

  it('should render Tooltip Component', () => {
    expect(wrapper.find('Tooltip').length).toEqual(1);
  });
});
