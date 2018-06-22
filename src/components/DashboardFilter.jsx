import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import PubSub from 'pubsub-js';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

const _defaultFilters = {};

// DashboardFilter provides global filters for all widgets on a dashboard
@observer class DashboardFilter extends Component {

  // Replaces state. Exposed through PubSub. Some more good info here: https://mobx.js.org/refguide/object.html
  // https://mobx.js.org/refguide/map.html
  @observable DashboardFilterStore = observable.map(_defaultFilters);

  constructor(props) {
    super(props);
    this.dispatchFilterUpdate = this.dispatchFilterUpdate.bind(this);
    this.toggleFilterCollapse = this.toggleFilterCollapse.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.addFilter = this.addFilter.bind(this);
    this.state = {
      lastCleared: new Date().getTime(),
      isFilterCollapsed: false
    };
  }

  dispatchFilterUpdate() {
    // In order to support multiple filters at once, different topics
    // (or "action type" in redux land) can be used.
    PubSub.publish(this.props.topic, this.DashboardFilterStore);
  }

  addFilter(newFilter, dispatch = true) {
    if (typeof(newFilter) === 'object') {
      const key = Object.keys(newFilter)[0];
      if (newFilter[key] === undefined) {
        this.DashboardFilterStore.delete(key);
      } else {
        this.DashboardFilterStore.set(key, newFilter[key]);
      }
      // Publish the changes so anything listening can adjust accordingly.
      // This is actually optional, but is the default action.
      // It's optional so that initial filter values can "queue up" so to
      // speak and not lead to a bunch of unnecessary dispatches.
      if (dispatch) {
        this.dispatchFilterUpdate();
      }
    } else {
      throw new Error("addFilter() requires an object to be passed {fitlerName: value}.");
    }
  }

  toggleFilterCollapse() {
    if (this.state.isFilterCollapsed) {
      this.setState({isFilterCollapsed: false});
    } else {
      this.setState({isFilterCollapsed: true});
    }
  }

  clearAllFilters() {    
    this.DashboardFilterStore.clear();
    // Force a re-render by updating state (preferred over this.forceUpdate())
    this.setState({lastCleared: new Date().getTime(), isFilterCollapsed: this.state.isFilterCollapsed});
  }

  render() {
    // Use composition. <DashboardFilter> ...<filter /><filter />... </DashboardFilter>
    const filters = React.Children.map(this.props.children, (child, i) => {
      if (child && typeof child.type === 'function') {
        // Append the children components, setting some important props that allow communication with this component.
        return React.cloneElement(child, {
          // Set key if not already set.
          key: child.key || 'filter'+i.toString(),
          addFilter: this.addFilter,
          filters: this.DashboardFilterStore,
          lastCleared: this.state.lastCleared
        });
      } else {
        return false;
      }
    });
    // After children are appended, dispatch an update.
    // If any of the filters had set defualt values, they should not be dispatching
    // with addFilter() because it would lead to multiple dispatches.
    // Do it once - if even necessary.
    // Because we're using a observable map, we can easily check the size
    // which will let us know if anything has been added.
    // Also, don't dispatch when the filters are collapsed. This is unnecessary.
    // Nothing can change when they are collapsed.
    if (this.DashboardFilterStore.size > 0) {
      this.dispatchFilterUpdate();
    }

    return (
      <div id="dashboard-global-filter" style={this.props.style}>
      {(this.props.header ?
        <div className="filters-header">
          <FontAwesome
            onClick={this.toggleFilterCollapse}
            className="dashboard-global-filter-collapse"
            name={this.state.isFilterCollapsed ? 'chevron-down':'chevron-up'}
            style={{float: 'left', marginRight: '5px', paddingTop: '2px'}}
          />
          <h4 onClick={this.toggleFilterCollapse}>{this.props.title}</h4>
          <a className="clear-filters" onClick={this.clearAllFilters}>{this.props.clearAllText}</a>
        </div>
        :null)}
        <div className={this.state.isFilterCollapsed ? 'hidden':'filters'}>
          {filters}
        </div>
      </div>
    )
  }

}

// Defines the default props
DashboardFilter.defaultProps = {
  title: 'Filters',
  clearAllText: '(Clear All)',
  header: true,
  style: {},
  topic: 'DASHBOARD_FILTER_UPDATE'
};

// Defines propTypes
DashboardFilter.propTypes = {
  title: PropTypes.string,
  clearAllText: PropTypes.string,
  header: PropTypes.bool,
  style: PropTypes.object,
  topic: PropTypes.string
};

export default DashboardFilter;