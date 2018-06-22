import React from 'react';
import { shallow } from 'enzyme';

import Spinner from '../../../../../../components/Spinner.jsx';
import { Tabs, Tab } from 'react-bootstrap';

// Component under test
import { MpiidsDetailView } from './view';

describe('MpiidsDetailView', () => {
  test('mount', () => {
    const props = {
      data: {
        loading: true,
        monthly_counts: []
      }
    };

    const wrapper = shallow(<MpiidsDetailView {...props} />);
    
    expect(wrapper.shallow().find(Spinner).length).toEqual(1);
    expect(wrapper.shallow().find(Tabs).length).toEqual(1);
    expect(wrapper.shallow().find(Tab).length).toEqual(3);
  });
});
