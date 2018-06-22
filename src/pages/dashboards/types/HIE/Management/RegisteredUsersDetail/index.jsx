// react
import React, { Component } from 'react';

// container
import DetailContainer from '../DetailContainer';

// filters / views
import Filters from './filters.jsx';
import View from './view.jsx';

export default class RegisteredUsersDetailContainer extends Component {
  render() {
    return <DetailContainer title={'Registered Users Details'} Filters={Filters} View={View} />;
  }
}
