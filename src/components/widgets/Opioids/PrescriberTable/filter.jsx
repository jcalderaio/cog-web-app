import React, { Component } from "react";
import { Accordion, Checkbox, Panel } from "react-bootstrap";
import _ from "lodash";

export default class PrescriberTableFilter extends Component {

  render() {
    return (
      <Accordion>
        <Panel header="Filters &#9660;" eventKey="1">
          <div className="filters-group">
            <div>
              Search By Last Name:&nbsp;
              <input
                type="text"
                placeholder="Last Name"
                value={this.props.filters.last_name}
                onChange={this.props.updateFilterInput}
              />
            </div>
            <div className="filter">
              Search By City:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                type="text"
                placeholder="City"
                value={this.props.filters.city}
                onChange={this.props.updateFilterInput}
              />
            </div>
            <div className="filter">
              Search By Specialty:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                type="text"
                placeholder="Specialty"
                value={this.props.filters.specialty}
                onChange={this.props.updateFilterInput}
              />
            </div>
            <div className="filter">
              # Patients prescribed:&nbsp;
              <Checkbox
                checked={this.props.filters.patients10}
                inline
                onChange={() => this.props.updateFilterCheckbox("patients10")}
              >
                10+
              </Checkbox>{" "}
              <Checkbox
                checked={this.props.filters.patients100}
                inline
                onChange={() => this.props.updateFilterCheckbox("patients100")}
              >
                100+
              </Checkbox>{" "}
              <Checkbox
                checked={this.props.filters.patients1000}
                inline
                onChange={() => this.props.updateFilterCheckbox("patients1000")}
              >
                1000+
              </Checkbox>{" "}
            </div>
          </div>
        </Panel>
      </Accordion>
    );
  }
}
