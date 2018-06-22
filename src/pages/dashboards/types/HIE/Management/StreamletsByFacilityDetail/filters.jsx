import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// react
import React, { PureComponent } from 'react';
import DatePicker from 'react-datepicker';
import Collapsible from 'components/Collapsible';
import Spinner from 'components/Spinner.jsx';
import { ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import OrganizationSelector from '../../organizations';

// date functions
import { startOfMonth, endOfMonth, subMonths, isAfter } from 'date-fns';
import moment from 'moment';

import { isEmpty } from 'lodash';

export class StreamletsByFacilityDetailFilters extends PureComponent {
  constructor(props) {
    super(props);

    this.resetFilters = this.resetFilters.bind(this);
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeOrganization = this.handleChangeOrganization.bind(this);
    this.handleChangeType = this.handleChangeType.bind(this);
    this.handleChangeGateway = this.handleChangeGateway.bind(this);
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
      organization: null,
      type: null,
      gateway: null
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

  handleChangeOrganization(change) {
    this.props.updateFilters({ organization: change });
  }

  handleChangeType(change) {
    this.props.updateFilters({ type: change });
  }

  handleChangeGateway(change) {
    this.props.updateFilters({ gateway: change });
  }

  render() {
    const types = this.props.data.types || [];
    const gateways = this.props.data.gateways || [];

    return (
      <div className="panel-default filters-grid-element">
        <Spinner until={!this.props.data.loading && this.props.filters}>
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

          <Collapsible header="Gateway" isOpen>
            <ControlLabel srOnly={true}>Gateway</ControlLabel>
            <Select
              simpleValue
              value={this.props.filters.gateway ? this.props.filters.gateway : ''}
              onChange={this.handleChangeGateway}
              options={gateways.map(e => {
                return { value: e.gateway, label: e.gateway };
              })}
              placeholder={'Type to Search...'}
            />
          </Collapsible>

          <Collapsible header="Organization" isOpen>
            <ControlLabel srOnly={true}>Organization</ControlLabel>
            <OrganizationSelector
              orgId={this.props.filters.organization}
              onChange={o => this.handleChangeOrganization(o)}
            />
          </Collapsible>

          <Collapsible header="Streamlet Type" isOpen>
            <ControlLabel srOnly={true}>Streamlet Type</ControlLabel>
            <Select
              simpleValue
              value={this.props.filters.type ? this.props.filters.type : ''}
              onChange={this.handleChangeType}
              options={types.map(e => {
                return { value: e.type, label: e.type };
              })}
              placeholder={'Type to Search...'}
            />
          </Collapsible>
        </Spinner>
      </div>
    );
  }
}

const query = gql`
  {
    organization {
      search {
        list {
          id
          name
        }
      }
    }
    hie {
      streamlets {
        types {
          type
        }
        gateways {
          gateway
        }
      }
    }
  }
`;

const graphqlTransform = ({ ownProps, data }) => {
  if (data.loading) {
    return {
      data: {
        loading: true,
        organizations: [],
        types: [],
        gateways: []
      }
    };
  }

  const organizations = (data.organization && data.organization.search && data.organization.search.list) || [];
  const types = (data.hie && data.hie.streamlets && data.hie.streamlets.types) || [];
  const gateways = (data.hie && data.hie.streamlets && data.hie.streamlets.gateways) || [];

  return {
    data: {
      organizations,
      types,
      gateways
    }
  };
};

export default graphql(query, {
  props: graphqlTransform
})(StreamletsByFacilityDetailFilters);
