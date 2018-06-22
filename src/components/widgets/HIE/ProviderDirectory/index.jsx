import React, { Component } from "react";

import ReactTable from "react-table";

import _ from "lodash";

import ProviderTableFilter from "./filter";
import "./providerTable.scss";

import Spinner from "components/Spinner";
import { graphql } from "providers/GraphQL";
import DF from "visualizations/common/dataFormatter";

/**
 * A Table for HIE providers. Currently sorting and filtering is all done client side
 *
 * @export
 * @class ProviderTable
 * @extends {Component}
 */
class ProviderTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        last_name: "",
        city: "",
        specialty: ""
      }
    };

    this.updateFilterCheckbox = this.updateFilterCheckbox.bind(this);
    this.updateFilterInput = this.updateFilterInput.bind(this);
  }

  static widgetType() {
    return "ProviderTable".toLowerCase();
  }

  get page_size() {
    return this.props.maximized ? 15 : 9;
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
        e.specialty.toUpperCase().includes(filters.specialty.toUpperCase())
      );
    });
  }

  get demo_data() {
    
    /* eslint-disable */
    let rows = [
      {npi: "1841491859", first_name: "David", last_name: "Aarons", city: "Birmingham", specialty: "Internal Medicine"},
      {npi: "1669420394", first_name: "Donald", last_name: "Abele", city: "Birmingham", specialty: "Emergency Medicine"},
      {npi: "1255387585", first_name: "Matthew", last_name: "Abele", city: "Birmingham", specialty: "Dermatology"},
      {npi: "1265528954", first_name: "Teresa", last_name: "Abernathy", city: "Birmingham", specialty: "Anesthesiology"},
      {npi: "1013010164", first_name: "James", last_name: "Abroms", city: "Birmingham", specialty: "Internal Medicine"},
      {npi: "1508043605", first_name: "Deepak", last_name: "Acharya", city: "Birmingham", specialty: "Internal Medicine"},
      {npi: "1316023708", first_name: "Vivian", last_name: "Aboko-Cole Hicks", city: "Huntsville", specialty: "Internal Medicine"},
      {npi: "1609154681", first_name: "Nessy", last_name: "Abraham", city: "Huntsville", specialty: "Internal Medicine"},
      {npi: "1033183777", first_name: "Pippa", last_name: "Abston", city: "Huntsville", specialty: "Pediatrics"},
      {npi: "1710935440", first_name: "Laura", last_name: "Dyer", city: "Huntsville", specialty: "Family Medicine Geriatric Medicine"},
      {npi: "1962481218", first_name: "Charles", last_name: "Estopinal", city: "Huntsville", specialty: "Anesthesiology"},
      {npi: "1245449024", first_name: "Hayley", last_name: "Garner Degraaff", city: "Huntsville", specialty: "General Practice"},
      {npi: "1710948948", first_name: "John", last_name: "Greco", city: "Huntsville", specialty: "Orthopaedic Surgery"},
      {npi: "1235347469", first_name: "Katie", last_name: "Gunter", city: "Huntsville", specialty: "Pediatrics"},
      {npi: "1700873494", first_name: "Kynard", last_name: "Adams", city: "Montgomery", specialty: "Family Medicine"},
      {npi: "1316106164", first_name: "Himanshu", last_name: "Aggarwal", city: "Montgomery", specialty: "Urology"},
      {npi: "1952320400", first_name: "James", last_name: "Alexander", city: "Montgomery", specialty: "Internal Medicine"},
      {npi: "1679643076", first_name: "Daria", last_name: "Anagnos", city: "Montgomery", specialty: "Pediatrics"},
      {npi: "1255480703", first_name: "Sherman", last_name: "Armstrong", city: "Montgomery", specialty: "Surgery"},
      {npi: "1265410781", first_name: "Glenda", last_name: "Atilano", city: "Montgomery", specialty: "Internal Medicine"},
      {npi: "1730123217", first_name: "Steven", last_name: "Avezzano", city: "Montgomery", specialty: "Emergency Medicine"},
      {npi: "1477662617", first_name: "Wesley", last_name: "Barry", city: "Montgomery", specialty: "Surgery"},
      {npi: "1811953839", first_name: "Malcolm", last_name: "Brown", city: "Montgomery", specialty: "General Practice"},
      {npi: "1831110691", first_name: "Patricia", last_name: "Campbell", city: "Montgomery", specialty: "Family Medicine"},
      {npi: "1306807599", first_name: "Xiongying", last_name: "Chen", city: "Montgomery", specialty: "Internal Medicine"},
      {npi: "1841385663", first_name: "Tai", last_name: "Chung", city: "Montgomery", specialty: "Orthopaedic Surgery"},
      {npi: "1356577233", first_name: "Kristi", last_name: "Busby", city: "Montgomery", specialty: "Veterinarian"},
      {npi: "1043392772", first_name: "Cristalle", last_name: "Cox", city: "Montgomery", specialty: "Anesthesiology"},
      {npi: "1801854369", first_name: "Jean", last_name: "Crepault", city: "Montgomery", specialty: "Family Medicine"},
      {npi: "1972561769", first_name: "Chere", last_name: "Fulmer", city: "Montgomery", specialty: "Internal Medicine"},
      {npi: "1780726349", first_name: "Frank", last_name: "Gogan", city: "Montgomery", specialty: "Family Medicine"},
      {npi: "1245315308", first_name: "Christopher", last_name: "Heck", city: "Montgomery", specialty: "Orthopaedic Surgery"},
      {npi: "1942271812", first_name: "Mark", last_name: "Herron", city: "Montgomery", specialty: "Dermatology"},
      {npi: "1700850765", first_name: "Mont", last_name: "Highley", city: "Montgomery", specialty: "Family Medicine"},
      {npi: "1013054725", first_name: "David", last_name: "Hon", city: "Montgomery", specialty: "Surgery"}
    ];
    /* eslint-enable */
    
    return rows;
  }

  render() {
    let graphql_data = DF.getDataFromProps(this.props);

    return (
      <div className="provider-table">
        <Spinner until={!_.isEmpty(graphql_data)}>
          <ProviderTableFilter
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

export default graphql(ProviderTable);
