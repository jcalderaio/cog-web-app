import React from 'react';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

export default function(options) {
  const opt = options || {};
  const date = opt.date ? opt.date : new Date();

  const offset = opt.offset || -23;
  let startDate, endDate;
  if (offset > 0) {
    startDate = endOfMonth(date);
    endDate = startOfMonth(addMonths(endDate, offset));
  } else {
    endDate = endOfMonth(date);
    startDate = startOfMonth(addMonths(endDate, offset));
  }
  return function withDateRange(WrappedComponent) {
    return class DateRangeHOC extends React.Component {
      render() {
        const newProps = { endDate, startDate };
        return <WrappedComponent {...this.props} {...newProps} />;
      }
    };
  };
}
