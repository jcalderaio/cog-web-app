import React, { Component } from "react";
import { Accordion, Panel } from "react-bootstrap";
import _ from "lodash";

export default class ProviderTableFilter extends Component {

  render() {
    return (
      <Accordion id={this.props.accordionId || new Date().getTime()}>
        <Panel title="Filters &#9660;" eventKey="1">
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
          </div>
        </Panel>
      </Accordion>
    );
  }
}
