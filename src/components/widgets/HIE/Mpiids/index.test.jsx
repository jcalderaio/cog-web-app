import React from 'react';
import { shallow } from 'enzyme';
import { MpiIdWidget } from './index.jsx';

describe('Mpiids Widget', () => {
  const wrapper = shallow(<MpiIdWidget />);
  // console.log(wrapper.debug());

  // TODO: This doesn't do anything
  it('should exist', () => {
    expect(wrapper).toBeDefined();
  });
});
