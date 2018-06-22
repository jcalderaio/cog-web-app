import PropTypes from 'prop-types';
import { ControlLabel } from 'react-bootstrap';
import React, { PureComponent } from 'react';
import DatePicker from 'react-datepicker';
import Collapsible from 'components/Collapsible';
import Spinner from 'components/Spinner.jsx';
import OrganizationSelector from './org-selector';
import UserSelector from './user-selector';
// date functions
import { startOfMonth, endOfMonth, subMonths, isAfter } from 'date-fns';
import moment from 'moment';

import { isEmpty } from 'lodash';

export default class Filter extends PureComponent {
  static propTypes = {
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    organization: PropTypes.string,
    user: PropTypes.string
  };

  componentWillMount() {
    if (isEmpty(this.props.filters)) this.resetFilters(); // FIXED
  }

  resetFilters() {
    const initialFilters = {
      startDate: startOfMonth(subMonths(new Date(), 23)),
      endDate: endOfMonth(new Date()),
      organization: null,
      user: null
    };
    this.props.updateFilters(initialFilters);
  }

  handleChangeStartDate(change) {
    // convert moment to Date
    let startDate = change.toDate();
    let endOfThisMonth = endOfMonth(new Date());
    let startOfThisMonth = startOfMonth(new Date());
    this.props.updateFilters({ startDate: isAfter(startDate, endOfThisMonth) ? startOfThisMonth : startDate });
  }

  handleChangeEndDate(change) {
    // convert moment to Date
    let endDate = change.toDate();
    let endOfThisMonth = endOfMonth(new Date());
    this.props.updateFilters({ endDate: isAfter(endDate, endOfThisMonth) ? endOfThisMonth : endDate });
  }

  handleChangeOrganization(value) {
    this.props.updateFilters({ organization: value, user: null });
  }

  handleChangeUser(value) {
    this.props.updateFilters({ user: value });
  }

  render() {
    const { loading, filters } = this.props;

    return (
      <div className="panel-default filters-grid-element">
        <Spinner until={!loading && filters}>
          <div className="panel-heading filter-panel-heading">
            <h3 className="panel-title">
              Filters
              <button type="button" className="btn-clear-all btn btn-link" onClick={() => this.resetFilters()}>
                Clear All
              </button>
            </h3>
          </div>

          {/* datepicker requires moment-wrapped dates */}

          <Collapsible header="Date Range" isOpen>
            <ControlLabel>Start Date</ControlLabel>
            <DatePicker
              selected={moment(filters.startDate)}
              selectsStart
              startDate={moment(filters.startDate)}
              endDate={moment(filters.endDate)}
              onChange={d => this.handleChangeStartDate(d)}
            />
            <ControlLabel>End Date</ControlLabel>
            <DatePicker
              selected={moment(filters.endDate)}
              selectsEnd
              startDate={moment(filters.startDate)}
              endDate={moment(filters.endDate)}
              onChange={d => this.handleChangeEndDate(d)}
            />
          </Collapsible>

          <Collapsible header="Organization" isOpen>
            <ControlLabel srOnly={true}>Organization</ControlLabel>
            <OrganizationSelector filters={filters} onChange={o => this.handleChangeOrganization(o)} />
          </Collapsible>

          {filters.organization && (
            <Collapsible header="User" isOpen>
              <ControlLabel srOnly={true}>User</ControlLabel>
              <UserSelector filters={filters} onChange={o => this.handleChangeUser(o)} />
            </Collapsible>
          )}
        </Spinner>
      </div>
    );
  }
}
