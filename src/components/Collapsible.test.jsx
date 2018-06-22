

// Test just this Collapsible
// (provides more details in summary)
// npm test -- --watch --collectCoverageFrom=src/components/Collapsible.jsx --testPathPattern=components/Collapsible.test.jsx
import React from 'react';
import createReactClass from 'create-react-class';
import { shallow, mount } from 'enzyme';
import Collapsible from './Collapsible';
import { Row, SafeAnchor } from 'react-bootstrap';

global.sessionStorage = {
  config: '{}'
}

describe('Collapsible', () => {
  const Child = createReactClass({
    render: function() {
      return <h1>text</h1>;
    }
  });

  const wrapper = shallow(<Collapsible />);
  
  const mntWrapper = mount(
    <Collapsible isOpen={true}>
      <Child foo="bar"/>
    </Collapsible>);

  const mntWrapperCollapsed = mount(
    <Collapsible isOpen={false}>
      <Child foo="bar"/>
    </Collapsible>);

  it('should render', () => {
    // console.log(mntWrapper.debug());
    expect(wrapper.shallow().find(Row).length).toEqual(1);
    expect(mntWrapper.children().find(Child).prop("foo")).toEqual("bar");
  });

  it('should collapse if `isOpen` prop is passed false', () => {
    expect(mntWrapperCollapsed.children().find(SafeAnchor).prop('className')).toEqual("collapsed");
  });

});