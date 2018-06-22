import React, { Component } from 'react';
import _ from 'lodash';
import { Responsive, WidthProvider } from 'react-grid-layout';
import ResponsiveWidget from 'widgets/ResponsiveWidget';
import BackLink from 'components/BackLink';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
import Media from 'react-media';
import Tray from '@cognosante/cgs-react-tray';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class DetailsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {},
      filterTrayIsOpen: false,
      activeTab: 1
    };

    this.updateFilters = this.updateFilters.bind(this);
    this.updateActiveTab = this.updateActiveTab.bind(this);
    this.updateFilterTrayIsOpen = this.updateFilterTrayIsOpen.bind(this);
  }

  updateFilters(changes) {
    this.setState(_.merge({}, this.state, { filters: changes }));
  }

  updateActiveTab(changes) {
    this.setState(_.merge({}, this.state, { activeTab: changes }));
  }

  updateFilterTrayIsOpen(changes) {
    this.setState(_.merge({}, this.state, { filterTrayIsOpen: changes }));
  }

  render() {
    const Filters = this.props.Filters;
    const View = this.props.View;

    const gridProps = DashboardLayout.getDetailsPageGridProps(
      this.props.filterHeight || 8,
      this.props.contentHeight || 6
    );

    return (
      <div>
        <div id="page-header">
          <h2 className="page-heading">{this.props.title}</h2>
          <div className="buttons-container">
            <BackLink />
            <Media query="(max-width: 991px)">
              {matches =>
                matches ? (
                  <div>
                    <button
                      className="btn-sidebar-filter"
                      data-toggle="offcanvas"
                      onClick={() => this.updateFilterTrayIsOpen(true)}
                    >
                      <i className="icon__filter" /> <span>Filters</span>
                    </button>
                    <Tray
                      isOpen={this.state.filterTrayIsOpen}
                      onClose={() => this.updateFilterTrayIsOpen(false)}
                      className={'filters-tray'}
                      size="small"
                    >
                      <Filters filters={this.state.filters} updateFilters={this.updateFilters} />
                    </Tray>
                  </div>
                ) : null
              }
            </Media>
          </div>
        </div>

        <ResponsiveReactGridLayout
          className="layout"
          {...gridProps}
          onLayoutChange={this.onLayoutChange}
          rowHeight={DashboardLayout.DEFAULT_ROW_HEIGHT + 5}
        >
          <ResponsiveWidget key={'filters'} className={'empty-grid-element'}>
            <Filters filters={this.state.filters} updateFilters={this.updateFilters} />
          </ResponsiveWidget>

          <ResponsiveWidget key={'content'} className={'empty-grid-element'}>
            <View
              filters={this.state.filters}
              activeTab={this.state.activeTab}
              updateActiveTab={this.updateActiveTab}
            />
          </ResponsiveWidget>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}
