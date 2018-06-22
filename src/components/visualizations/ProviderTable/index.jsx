import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import PubSub from 'pubsub-js';
import ReactDataGrid from 'react-data-grid';
import careProviderAPI from './healthcareProviders';
import Pager from 'components/Pager';
import AccordionFilters from 'components/AccordionFilters';
import './providerTable.scss';
import Spinner from 'components/Spinner';

function EmptyRowsView(){
    return (<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;No Results found</div>);
};

/**
 * A Table for health care providers. Currently sorting and filtering is all done client side
 * 
 * @export
 * @class ProviderTable
 * @extends {Component}
 */
export default class ProviderTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      visibleSlice: [0, props.pageSize],
      totalProviderCount: 0,
      filters: {},
      queryFilters: {},
      sort: {},
      afterCursor: '',
      initialCursor: '',
      cursorOffset: -1,
      hasNextPage: false,
      previousButtonDisabled: true,
      nextButtonDisabled: true,
      paginationReset: true,
      preventCityFilter: true,
      isLoading: false,
      initalLoad: false,
      entityType: {
        pcp: true,
        hospital: true,
        others: true
      },
      hieParticipant: {
        yes: true,
        no: true
      },
      name: '',
      city: '',
      columns: [
        { key: 'hieParticipant', name: 'HIE', width: 50 },
        { key: 'npi', name: 'NPI', width: 100, resizable: true },
        { key: 'name', name: 'Name', width: 200, resizable: true },
        { key: 'entityType', name: 'Entity Type', width: 100 },
        { key: 'fullAddress', name: 'Address', resizable: true, width: 200 },
        { key: 'city', name: 'City', width: 100, resizable: true, sortable: true },
        { key: 'zip', name: 'Zip', filterable: true, width: 80, resizable: true, sortable: true }
      ]
    }

    this.pagination = null;
    this.grid = null;
    this.ensureAllColumnCellsRenderHack = this.ensureAllColumnCellsRenderHack.bind(this);
    this.fetchForSelfAndSetState = this.fetchForSelfAndSetState.bind(this);
    this.getProviderRow = this.getProviderRow.bind(this);
    this.setVisibleProviders = this.setVisibleProviders.bind(this);
    this.onGridSort = this.onGridSort.bind(this);
    this.serverSideSort = this.serverSideSort.bind(this);
    this.updateTableWithFilters = this.updateTableWithFilters.bind(this);
    this.fetchNext = this.fetchNext.bind(this);
    this.fetchPrevious = this.fetchPrevious.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.updateFilterCheckbox = this.updateFilterCheckbox.bind(this);
    this.updateFilterInput = this.updateFilterInput.bind(this);
  }

  static widgetType() {
    return 'ProviderTable'.toLowerCase();
  }

  get gridHeight() {
    return Math.floor(this.props.widgetHeight * 0.6);
  }

  get gridWidth() {
    return this.props.widgetWidth - 20;
  }

  get Columns() {
    return this.state.columns;
  }

  /**
     * Fetch data on component mount
     * 
     * @memberOf ProviderTable
     */
  componentDidMount() {
    PubSub.subscribe('GET FILTERED DATA', this.subscriber.bind(this));
    this.fetchForSelfAndSetState(this.props);
    this.ensureAllColumnCellsRenderHack();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  /**
 * Check out this little diddy.
 *
 * Heres where: https://github.com/adazzle/react-data-grid/blob/master/packages/react-data-grid/src/ViewportScrollMixin.js#L65
 * Heres why:
 *  first problem: the grid doesnt properly resize itself on all resize
 *    events. This was solved by passing a minWidth prop to the data grid component
 *    based on the widgetWidth prop, which DOES change on resize. This forces
 *    the table to rerender the proper width.
 *
 *  second problem: this "unexpected" width adjustment to the data grid (not sure why
 *    its unexpected, they accept the prop) doesnt force the component to recalculate
 *    which columns are visilble based on the width. And so when the grid's with expands,
 *    there are columns with empty cells. One (crucial) function called
 *    during that calculation is getRenderedColumnCount, which exists on
 *    the nested viewport component. By forcing this to always return
 *    how many columns there are, every time the grid wants to know
 *    which columns it needs to render the cells for, the answer is: all of them!
 *
 * @memberOf ProviderTable
 */
  ensureAllColumnCellsRenderHack() {
    if (this.grid) {
      this.grid.base.viewport.getRenderedColumnCount = () => this.Columns.length;
    }
  }

  /**
   * Component is capable of fetching its own data if a fetch method
   * is passed along
   * 
   * @param {any} props 
   * @param {any} stateFilters 
   * 
   * @memberOf ProviderTable
   */
  fetchForSelfAndSetState(props, paginationFilters, stateFilters) {
    const entityTypeDict = { 1: 'PCP', 2: 'Hospital', 3: 'Others' };
    const hieParticipantDict = { 1: 'Yes', 0: 'No' };
    if (this.state.initialLoad) this.setState({ isLoading: true });
    if (props.fetch) {
      const filters = Object.assign(
        {},
        (props.providerFilter || {}),
        stateFilters,
        paginationFilters ? paginationFilters : { first: 25, after: '' }
      )
      const query = careProviderAPI.filterQuery(
        careProviderAPI.query,
        {
          queryFilters: filters
        });
      props.fetch(query).then((result) => {
        var queriedData;
        if (result.providers.total === 0) {
          queriedData = [];
        } else {
          queriedData = result.providers.edges.map((edge) => {
            if (edge.node.organizationName && edge.node.lastName)
              edge.node.name = `${edge.node.firstName} ${edge.node.lastName}`;
            else if (edge.node.organizationName) edge.node.name = edge.node.organizationName;
            else if (!edge.node.organizationName) edge.node.name = `${edge.node.firstName} ${edge.node.lastName}`;
            return edge.node
          });
        }
        result.providers.edges.forEach(edge => {
          edge.node.entityType = entityTypeDict[edge.node.entityType];
          edge.node.hieParticipant = hieParticipantDict[edge.node.hieParticipant];
        })
        this.setState(() => ({
          initialLoad: !this.state.initialLoad ? true : true,
          afterCursor: result.providers.pageInfo.hasNextPage ? result.providers.pageInfo.endCursor : '',
          initialCursor: this.state.initialCursor ? this.state.initialCursor : result.providers.pageInfo.startCursor,
          hasNextPage: result.providers.pageInfo.hasNextPage ? true : false,
          previousButtonDisabled: this.state.paginationReset ? true : false,
          nextButtonDisabled: result.providers.pageInfo.hasNextPage ? false : true,
          data: queriedData,
          totalProviderCount: result.providers.total || 1,
          isLoading: false
        }));
      });
    }
  }

  fetchNext(filters) {
    if (this.state.hasNextPage) {
      this.setState({
        cursorOffset: this.state.cursorOffset + 25,
        paginationReset: false
      })
      this.fetchForSelfAndSetState(this.props,
        Object.assign({ first: 25, after: this.state.afterCursor },
          this.state.queryFilters, this.state.sort));
    }
  }

  fetchPrevious() {
    if (!this.state.paginationReset) this.setState({ cursorOffset: this.state.cursorOffset - 25 });
    if (this.state.cursorOffset < 1) this.resetPagination();
    this.fetchForSelfAndSetState(this.props,
      Object.assign({ first: 25, after: this.state.paginationReset ? 
        '':this.offsetToCursor(this.state.cursorOffset) },
        this.state.queryFilters, this.state.sort));
    if (!this.state.paginationReset) this.setState({ cursorOffset: this.state.cursorOffset - 25 });
  }

  offsetToCursor(offset) {
    const PREFIX = 'arrayconnection:';
    // return base64(PREFIX + offset);
    return window.btoa(PREFIX + offset);
  }

  /**
   * Higher order function for binding the current visible data to the table
   * 
   * @param {any} data 
   * @returns 
   * 
   * @memberOf ProviderTable
   */
  getProviderRow(data) {
    return (i) => {
      if (data.length === 0) {
        return {};
      }
      return data.slice(...this.state.visibleSlice)[i];
    }
  }

  resetPagination() {
    this.setState({
      paginationReset: true,
      cursorOffset: -1,
      previousButtonDisabled: true
    })
  }

  serverSideSort(col, dir) {
    this.setState({
      sort: {
        orderColumn: col,
        orderDirection: dir
      }
    });
    this.fetchForSelfAndSetState(this.props,
      Object.assign({ first: 25, orderColumn: col, orderDirection: dir }, this.state.queryFilters));
  }


  subscriber(msg, data) {
    if (data.entityType) {
      if (!data.entityType.pcp && data.entityType.hospital) {
        this.setState({
          queryFilters: Object.assign(this.state.queryFilters, { type: '2' }),
          entityType: data.entityType
        })
      } else if (!data.entityType.hospital && data.entityType.pcp) {
        this.setState({
          queryFilters: Object.assign(this.state.queryFilters, { type: '1' }),
          entityType: data.entityType
        })
      } else if (data.entityType.pcp && data.entityType.hospital) {
        this.setState({
          queryFilters: Object.assign(this.state.queryFilters, { type: '' }),
          entityType: data.entityType
        })
      } else if (!data.entityType.pcp && !data.entityType.hospital) {
        this.setState({
          queryFilters: Object.assign(this.state.queryFilters, { type: '3' }),
          entityType: data.entityType
        })
      }
      this.fetchForSelfAndSetState(this.props, Object.assign({ first: 25 },
        this.state.queryFilters, this.state.sort));
    }
    if (data.region) {
      if (!data.region.atParentLevel) {
        this.setState({
          preventCityFilter: false,
          queryFilters: Object.assign(this.state.queryFilters, { county: data.region.regionName })
        });
        this.fetchForSelfAndSetState(this.props,
          Object.assign({ first: 25 }, this.state.queryFilters, this.state.sort));
      } else { //when zooming out to state level
        this.setState({
          queryFilters: { county: ''},
          sort: {
            orderColumn: '',
            orderDirection: ''
          },
          preventCityFilter: true,
          city: '',
          name: '',
          hieParticipant: { yes: true, no: true },
          entityType: { pcp: true, hospital: true, others: true }
        });
        this.fetchForSelfAndSetState(this.props, Object.assign({ first: 25 }, this.state.sort));
      }
    }
  }

  updateFilterInput(e) {
    if (e.target.placeholder === 'Name') { this.setState({ name: e.target.value }); }
    if (e.target.placeholder === 'City') { this.setState({ city: e.target.value }); }
  }

  updateFilterCheckbox(value, type) {
    this.setState(Object.assign(this.state[type], {
      [value]: !this.state[type][value]
    })
    );
  }

  updateTableWithFilters() {
    //temporary conditional measure until we update the db to displayable id. 
    if (!this.state.entityType.pcp && this.state.entityType.hospital)
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { type: '2' }) })
    else if (!this.state.entityType.hospital && this.state.entityType.pcp)
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { type: '1' }) })
    else if (this.state.entityType.pcp && this.state.entityType.hospital)
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { type: '' }) })
    else { this.setState({ queryFilters: Object.assign(this.state.queryFilters, { type: 'null' }) }) }
    // if (!this.state.entityType.pcp && !this.state.entityType.hospital) this.state.queryFilters.type = '';

    if (this.state.hieParticipant.yes && this.state.hieParticipant.no)
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { hie_participant: '' }) });
    else if (this.state.hieParticipant.yes && !this.state.hieParticipant.no)
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { hie_participant: '1' }) });
    else if (!this.state.hieParticipant.yes && this.state.hieParticipant.no)
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { hie_participant: '0' }) });
    else { this.setState({ queryFilters: Object.assign(this.state.queryFilters, { hie_participant: 'null' }) }) }
    this.state.city ?
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { city: this.state.city }) }) :
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { city: '' }) });
    PubSub.publish('FILTER MAP', { entityType: this.state.entityType });
    this.state.name ?
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { name: this.state.name }) }) :
      this.setState({ queryFilters: Object.assign(this.state.queryFilters, { name: '' }) });
    this.fetchForSelfAndSetState(this.props, Object.assign({ first: 25 }, this.state.queryFilters, this.state.sort));
  }

  onGridSort(col, dir) {
    var sortableCol = {
      lastName: 'last_name',
      city: 'physical_address_city',
      zip: 'physical_address_postal_code'
    };
    this.resetPagination();
    this.serverSideSort(sortableCol[col], dir);
  }

  setVisibleProviders(visibleSlice) {
    this.setState({ visibleSlice });
  }

  render() {
    const rowGetter = this.getProviderRow(this.state.data);
    const visibleEdgeCount = this.state.data.length;
    const curVisibleSlice = this.state.visibleSlice;
    const numberRows = (
      visibleEdgeCount > curVisibleSlice[1] ?
        this.props.pageSize :
        visibleEdgeCount - curVisibleSlice[0]);
    return (
      <div className='provider-table'>
        <AccordionFilters
          columnCheckboxes={this.Columns.map(item => { return { key: item.key, name: item.name }; })}
          updateWithFilters={this.updateTableWithFilters}
          entityType={this.state.entityType}
          hieParticipant={this.state.hieParticipant}
          updateFilterCheckbox={this.updateFilterCheckbox}
          updateFilterInput={this.updateFilterInput}
          preventCityFilter={this.state.preventCityFilter}
          name={this.state.name}
          city={this.state.city}
        />
        <Spinner until={(this.state.initialLoad && !this.state.isLoading)}>
          <ReactDataGrid
            ref={(grid) => { this.grid = grid }}
            columns={this.Columns}
            rowsCount={numberRows}
            rowGetter={rowGetter}
            onGridSort={this.onGridSort}
            onAddFilter={this.onAddFilter}
            minWidth={this.gridWidth}
            minHeight={this.gridHeight}
            emptyRowsView={EmptyRowsView}
          />
          <Pager
            pageSize={this.props.pageSize}
            ref={(el) => { this.pagination = el }} // allow ref for reseting pagination
            totalEdgeCount={visibleEdgeCount}    // currently fetching all data at once 
            edgeCount={visibleEdgeCount}         // and so total and edgeCount are the same
            setVisibleEdges={this.setVisibleProviders}
            fetchNext={this.fetchNext}
            fetchPrevious={this.fetchPrevious}
            previousButtonDisabled={this.state.previousButtonDisabled}
            nextButtonDisabled={this.state.nextButtonDisabled}
          />
        </Spinner>
      </div>
    )
  }
}

ProviderTable.defaultProps = {
  data: [],
  pageSize: 25,
  widgetHeight: 600,
  widgetWidth: 100
}

ProviderTable.PropTypes = {
  summary: PropTypes.bool,
  pageSize: PropTypes.number,
  filterFields: PropTypes.arrayOf(PropTypes.object),
  providerFilter: PropTypes.object,
  fetch: PropTypes.func,
  data: PropTypes.oneOfType([
    PropTypes.object, PropTypes.array
  ])
}
