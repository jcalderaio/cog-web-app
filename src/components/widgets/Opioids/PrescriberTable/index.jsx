import React, { Component } from "react";

import ReactTable from "react-table";

import _ from "lodash";

import PrescriberTableFilter from "./filter";
import "./prescriberTable.scss";

import Spinner from "components/Spinner";
import { graphql } from "providers/GraphQL";
import DF from "visualizations/common/dataFormatter";

/**
 * A Table for opioid prescribers. Currently sorting and filtering is all done client side
 *
 * @export
 * @class PrescriberTable
 * @extends {Component}
 */
class PrescriberTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        last_name: "",
        city: "",
        specialty: "",
        patients10: false,
        patients100: false,
        patients1000: false
      }
    };

    this.updateFilterCheckbox = this.updateFilterCheckbox.bind(this);
    this.updateFilterInput = this.updateFilterInput.bind(this);
  }

  static widgetType() {
    return "PrescriberTable".toLowerCase();
  }

  get page_size() {
    return this.props.maximized ? 10 : 5;
  }

  get columns() {
    return [
      {
        Header: "NPI",
        accessor: "npi"
      },
      {
        Header: "First Name",
        accessor: "first_name"
      },
      {
        Header: "Last Name",
        accessor: "last_name"
      },
      {
        Header: "City",
        accessor: "city"
      },
      {
        Header: "Specialty",
        accessor: "specialty"
      },
      {
        Header: "# Patients",
        accessor: "num_patients",
        sortMethod: (a, b) => {
          return +a > +b ? 1 : -1;
        }        
      }
    ];
  }

  updateFilterInput(e) {
    let filters = this.state.filters;

    if (e.target.placeholder === "Last Name") {
      filters.last_name = e.target.value;
    }
    if (e.target.placeholder === "City") {
      filters.city = e.target.value;
    }
    if (e.target.placeholder === "Specialty") {
      filters.specialty = e.target.value;
    }

    this.setState({ filters: filters });
  }

  updateFilterCheckbox(name) {
    let filters = this.state.filters;
    filters[name] = !filters[name];
    this.setState({ filters: filters });
  }

  filterData(data, filters) {
    return data.filter(e => {
      return (
        e.last_name.toUpperCase().includes(filters.last_name.toUpperCase()) &&
        e.city.toUpperCase().includes(filters.city.toUpperCase()) &&
        e.specialty.toUpperCase().includes(filters.specialty.toUpperCase()) &&
        (filters.patients10 ? e.num_patients >= 10 : true) &&
        (filters.patients100 ? e.num_patients >= 100 : true) &&
        (filters.patients1000 ? e.num_patients >= 1000 : true)
      );
    });
  }

  get demo_data() {
    let rows = [];
    for (let i = 1; i < 2000; i++) {
      rows.push({
        npi: `123456789`,
        first_name: `first${i}`,
        last_name: `last${i}`,
        city: `city${i}`,
        specialty: `specialty${i}`,
        num_patients: `${i}`
      });
    }

    return rows;
  }

  render() {
    let graphql_data = DF.getDataFromProps(this.props);

    return (
      <div className="prescriber-table">
        <Spinner until={!_.isEmpty(graphql_data)}>
          <PrescriberTableFilter
            filters={this.state.filters}
            updateFilterInput={this.updateFilterInput}
            updateFilterCheckbox={this.updateFilterCheckbox}
          />
          {/* FIXME replace this.demo_data with graphql_data */}
          <ReactTable
            data={this.filterData(this.demo_data, this.state.filters)}
            columns={this.columns}
            defaultPageSize={this.page_size}
          />
        </Spinner>
      </div>
    );
  }
}

export default graphql(PrescriberTable);
