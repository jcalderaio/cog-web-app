// npm test -- --watch --collectCoverageFrom=src/components/BackLink.jsx --testPathPattern=components/BackLink.test.jsx
import React from 'react';
import { mount } from 'enzyme';
import BackLink from './BackLink';

global.sessionStorage = {
  config: '{}'
}

describe('BackLink', () => {
  const wrapper = mount(<BackLink />);
  
  it('should render', () => {
    // There should be a <span> element for rendetered (not shallow) <FrontAwesome /> component and a <span> element with text. 
    expect(wrapper.mount().find("span").length).toEqual(2);
  });

});