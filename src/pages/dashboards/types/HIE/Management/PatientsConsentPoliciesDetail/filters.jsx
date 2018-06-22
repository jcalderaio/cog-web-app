// react
import React, { PureComponent } from "react";
import DatePicker from "react-datepicker";
import Collapsible from "components/Collapsible";
import { ControlLabel } from "react-bootstrap";
import Select from "react-select";
import "react-select/dist/react-select.css";

// date functions
import { startOfMonth, endOfMonth, subMonths, isAfter } from "date-fns";
import moment from "moment";

import {isEmpty} from "lodash";

export default class PatientsConsentPoliciesDetailFilters extends PureComponent {
  constructor(props) {
    super(props);

    this.resetFilters = this.resetFilters.bind(this);
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeStatus = this.handleChangeStatus.bind(this);
  }

  componentWillMount() {
    if (isEmpty(this.props.filters)) {
      this.resetFilters(); // FIXED
    }
  }

  resetFilters() {
    const initialFilters = {
      startDate: startOfMonth(subMonths(new Date(), 23)),
      endDate: endOfMonth(new Date()),
      status: null
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

  handleChangeStatus(change) {
    const status = change;
    this.props.updateFilters({ status: status });
  }

  render() {
    return (
      <div className="panel-default filters-grid-element">
        <div className="panel-heading filter-panel-heading">
          <h3 className="panel-title">
            Filters
            <button type="button" className="btn-clear-all btn btn-link" onClick={this.resetFilters}>
              Clear All
            </button>
          </h3>
        </div>

        {/* datepicker requires moment-wrapped dates */}

        <Collapsible header="Date Range" isOpen>
          <ControlLabel>Start Date</ControlLabel>
          <DatePicker
            selected={moment(this.props.filters.startDate)}
            selectsStart
            startDate={moment(this.props.filters.startDate)}
            endDate={moment(this.props.filters.endDate)}
            onChange={this.handleChangeStartDate}
          />
          <ControlLabel>End Date</ControlLabel>
          <DatePicker
            selected={moment(this.props.filters.endDate)}
            selectsEnd
            startDate={moment(this.props.filters.startDate)}
            endDate={moment(this.props.filters.endDate)}
            onChange={this.handleChangeEndDate}
          />
        </Collapsible>

        <Collapsible header="Status" isOpen>
          <ControlLabel srOnly={true}>Status</ControlLabel>
          <div id="filter_status">
            <Select
              simpleValue
              value={this.props.filters.status ? this.props.filters.status : ''}
              onChange={this.handleChangeStatus}
              options={["Active", "Inactive"].map(e => {return {value: e, label: e}})}
              placeholder={"Type to Search..."}
            />
          </div>
        </Collapsible>
      </div>
    );
  }
}
