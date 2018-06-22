// Test just this
// npm test -- --watch --collectCoverageFrom=src/pages/dashboards/types/HIE/Management/DirectSecureMessagesDetail/index.jsx --testPathPattern=DirectSecureMessagesDetail/index.test.jsx
import React from 'react';
import { shallow } from 'enzyme';
import Container from './index';

describe('DirectSecureMessagesDetailContainer', () => {
  
  const wrapper = shallow(<Container />);
  // console.log(wrapper.debug());

  it('should render', () => {
    expect(wrapper.props().title.length).toBeGreaterThan(0);
  });

});