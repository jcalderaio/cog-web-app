import React from 'react';
import DetailContainer from '../DetailContainer';
import Filter from './filter.jsx';
import View from './view.jsx';

export default function() {
  return <DetailContainer title="Patient Search Details" Filters={Filter} View={View} />;
}
