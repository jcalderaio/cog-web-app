// react
import React, { PureComponent } from "react";
import DatePicker from "react-datepicker";
import Collapsible from "components/Collapsible";
import Spinner from "../../../../../../components/Spinner.jsx";
import { ControlLabel } from "react-bootstrap";

// date functions
import { startOfMonth, endOfMonth, subMonths, isAfter } from "date-fns";
import moment from "moment";

import {isEmpty} from "lodash";

export class MpiidsDetailFilters extends PureComponent {
  constructor(props) {
    super(props);

    this.resetFilters = this.resetFilters.bind(this);
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
  }

  componentWillMount() {
    if (isEmpty(this.props.filters)) {
      this.resetFilters(); // FIXED
    }
  }

  resetFilters() {
    const initialFilters = {
      startDate: startOfMonth(subMonths(new Date(), 23)),
      endDate: endOfMonth(new Date())
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

  render() {
    return (
      <div className="panel-default filters-grid-element">
        <Spinner until={this.props.filters}>
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
        </Spinner>
      </div>
    );
  }
}

export default MpiidsDetailFilters;
