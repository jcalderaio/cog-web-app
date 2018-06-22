import React, { Component } from 'react';
import { Accordion, Button, Checkbox, Panel } from 'react-bootstrap';
import _ from 'lodash';

export default class AccordionFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: {}
    }

    this.updateFilters = this.updateFilters.bind(this);
    // this.selectAllColumns = this.selectAllColumns.bind(this);
    // this.unselectAllColumns = this.unselectAllColumns.bind(this);
  }

  componentWillMount() {
    if (this.props.columnCheckboxes) {
      _.each(this.props.columnCheckboxes, column => {
        this.setState({ columns: { [column.key]: true } })
      });
    }
  }
  
  // renderColumnCheckboxes() {
  //   var newColumns = {};
  //   return _.map(this.props.columnCheckboxes, column => {
  //       return <Checkbox defaultChecked={this.state.columns[column.key] ? true : false} inline key={column.key} onChange={() => (this.updateCheckbox(column.key, 'columns'))}>{column.name}&nbsp;&nbsp;</Checkbox>;
  //   })
  // }

  // selectAllColumns() {
  //   _.each(this.state.columns, (column, key) => {
  //     this.state.columns[key] = true
  //   })
  // }

  // unselectAllColumns() {
  //   _.each(this.state.columns, (column, key) => {
  //     this.state.columns[key] = false
  //   });
  // }

  updateFilters() {
    this.props.updateWithFilters(this.state);
  }

  render() {
    return (
      <Accordion id={this.props.accordionId || new Date().getTime()}>
        <Panel id={this.props.panelId || new Date().getTime()} header="Filters &#9660;" eventKey="1">
          <div className="filters-group">
            <div>Search By Name:&nbsp;
              <input type='text' placeholder="Name" value={this.props.name} onChange={this.props.updateFilterInput} />
            </div>
            <div className="filter">Search By City:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input type='text' placeholder="City" value={this.props.city}
                disabled={this.props.preventCityFilter} onChange={this.props.updateFilterInput} />
            </div>
            <div className="filter">Entity Type:&nbsp;
              <Checkbox checked={this.props.entityType.pcp} inline
                onChange={() => this.props.updateFilterCheckbox('pcp', 'entityType')}>PCP</Checkbox>{' '}
              <Checkbox checked={this.props.entityType.hospital} inline
                onChange={() => this.props.updateFilterCheckbox('hospital', 'entityType')}>Hospital</Checkbox>{' '}
              <Checkbox checked={this.props.entityType.others} inline
                onChange={() => this.props.updateFilterCheckbox('others', 'entityType')}>Others</Checkbox>{' '}
            </div>
            <div className="filter">HIE Participant:&nbsp;
              <Checkbox checked={this.props.hieParticipant.yes} inline
                onChange={() => this.props.updateFilterCheckbox('yes', 'hieParticipant')}>Yes</Checkbox>{' '}
              <Checkbox checked={this.props.hieParticipant.no} inline
                onChange={() => this.props.updateFilterCheckbox('no', 'hieParticipant')}>No</Checkbox>{' '}
            </div>
          </div>
          <br />
          {/*<div className="columns-group">
            {this.renderColumnCheckboxes()}
          </div>
          <br />*/}
          <Button bsStyle="primary" bsSize="xsmall" onClick={this.updateFilters}>
            Update Table
          </Button>
        </Panel>
      </Accordion>
    )
  }


}
