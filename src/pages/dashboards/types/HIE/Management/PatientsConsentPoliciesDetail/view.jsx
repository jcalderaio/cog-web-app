// apollo
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// react
import React, { PureComponent } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, Legend } from 'recharts';
import ContainerDimensions from 'react-container-dimensions';
import { CSVLink } from 'react-csv';
import ReactTable from 'react-table';
import { Constants as ColorConstants } from 'visualizations/common/colorControls';
import Spinner from '../../../../../../components/Spinner.jsx';

// date functions
import { format } from 'date-fns';
import { monthsBetween, yyyymmdd } from '../../../../../../utils/dateUtils';

// CSS
import '../../../../../../assets/sass/global/_react-table.scss';

const colors = ColorConstants.scheme;

// named export for testing w/o hoc
export class PatientsConsentPoliciesDetailView extends PureComponent {
  constructor(props) {
    super(props);

    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  handleSelectTab(key) {
    this.props.updateActiveTab(key);
  }

  get columns() {
    return [
      {
        Header: 'Month',
        accessor: 'month'
      },
      {
        Header: 'Active',
        accessor: 'active'
      },
      {
        Header: 'Inactive',
        accessor: 'inactive'
      }
    ];
  }

  get filteredColumns() {
    switch (this.props.filters ? this.props.filters.status : null) {
      case 'Active':
        return this.columns.filter(c => c.Header !== 'Inactive');
      case 'Inactive':
        return this.columns.filter(c => c.Header !== 'Active');
      default:
        return this.columns;
    }
  }

  csvData(policies) {
    const csvHeaders = this.filteredColumns.map(e => e.Header);
    const csvAccessors = this.filteredColumns.map(e => e.accessor);

    return [csvHeaders, ...policies.map(e => csvAccessors.map(a => e[a]))];
  }

  render() {
    let filters = this.props.filters;
    let policies = (this.props.data && this.props.data.policies) || [];
    let csvData = this.csvData(policies);

    return (
      <div className="panel-default content-grid-element">
        <Spinner until={this.props.data && !this.props.data.loading}>
          <Tabs
            activeKey={this.props.activeTab}
            onSelect={this.handleSelectTab}
            id="tabs-details"
            className="tabs-content"
          >
            <Tab eventKey={1} title="Trend">
              <ContainerDimensions>
                {({ width }) => (
                  <AreaChart
                    width={width}
                    height={320}
                    data={policies}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >                   
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <CartesianGrid strokeDasharray="3 3" />
                    {(filters.status === null) && (
                    <Area
                      dataKey="any"
                      name="All"
                      dot={false}
                      stroke={colors(2)}
                      strokeWidth={3}
                      fill="url(#colorNo)"
                    />
                    )}                    
                    {(filters.status === null || filters.status === 'Inactive') && (
                      <Area
                        dataKey="inactive"
                        name="Inactive"
                        dot={false}
                        stroke={colors(1)}
                        strokeWidth={3}
                        fill="url(#colorOr)"
                        fillOpacity={0}
                      />
                    )}
                    {(filters.status === null || filters.status === 'Active') && (
                      <Area
                        dataKey="active"
                        name="Active"
                        dot={false}
                        stroke={colors(0)}
                        strokeWidth={3}
                        fill="url(#colorBl)"
                        fillOpacity={0}
                      />
                    )}
                  </AreaChart>
                )}
              </ContainerDimensions>
            </Tab>

            <Tab eventKey={2} title="Data">
              <ReactTable
                data={policies}
                columns={this.filteredColumns}
                defaultPageSize={10}
                className="-striped -highlight"
              />
              <br />
              <CSVLink
                data={csvData}
                filename={'patients_with_consent_policies_detail.csv'}
                className="btn btn-primary"
                target="_blank"
              >
                Download CSV
              </CSVLink>
            </Tab>
          </Tabs>
        </Spinner>
      </div>
    );
  }
}

const query = gql`
  query hieQuery($startDate: String!, $endDate: String!) {
    hie {
      patientsMpiConsentPolicies {
        byMonth(startDate: $startDate, endDate: $endDate) {
          month
          active
          inactive
        }
      }
    }
  }
`;

const graphqlSkip = (/* props: */ { filters }) => {
  return filters.startDate ? false : true;
};

const graphqlVariables = (/* props: */ { filters }) => ({
  variables: {
    startDate: format(filters.startDate, 'YYYY/MM/DD'),
    endDate: format(filters.endDate, 'YYYY/MM/DD')
  }
});

const graphqlTransform = ({ ownProps, data }) => {
  if (data.loading) {
    return {
      data
    };
  }

  let month_counts =
    (data.hie && data.hie.patientsMpiConsentPolicies && data.hie.patientsMpiConsentPolicies.byMonth) || [];

  // sparse array [ {month: 'YYYY/MM/DD', active: 0} ] to hash { 'YYYY/MM/DD': { active: 0} }
  const sparseMonthlyCounts = month_counts.reduce((m, e) => {
    m[e.month] = { active: e.active, inactive: e.inactive };
    return m;
  }, {});

  let cumulativeActive = 0;
  let cumulativeInactive = 0;

  const denseMonthlyCounts = monthsBetween(ownProps.filters.startDate, ownProps.filters.endDate).map(m => {
    let e = sparseMonthlyCounts[yyyymmdd(m)];
    cumulativeActive +=  (e && e.active) || 0;
    cumulativeInactive +=  (e && e.inactive) || 0;

    return {
      month: format(m, 'MM/YYYY'),
      active: cumulativeActive,
      inactive: cumulativeInactive,
      any: cumulativeActive + cumulativeInactive
    };
  });

  return {
    data: {
      policies: denseMonthlyCounts
    }
  };
};

export default graphql(query, {
  skip: graphqlSkip,
  options: graphqlVariables,
  props: graphqlTransform
})(PatientsConsentPoliciesDetailView);
