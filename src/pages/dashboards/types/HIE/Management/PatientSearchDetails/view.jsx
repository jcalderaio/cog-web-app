import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-bootstrap';

import '../../../../../../assets/sass/global/_react-table.scss';
import Filter from './filter';
import AllStats from './stats-all';
import OrgStats from './stats-org';
import UserStats from './stats-user';
import HistoricalGraph from './graph';

export default class View extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    filters: PropTypes.shape(Filter.propTypes),
    history: PropTypes.arrayOf(
      PropTypes.shape({
        year: PropTypes.number,
        month: PropTypes.number,
        count: PropTypes.number
      })
    ),
    list: PropTypes.arrayOf(
      PropTypes.shape({
        organization: PropTypes.string,
        user: PropTypes.string,
        count: PropTypes.number
      })
    )
  };

  render() {
    const { widgetWidth, widgetHeight, filters } = this.props;
    return (
      <div className="panel-default content-grid-element">
        <Tabs
          activeKey={this.props.activeTab}
          onSelect={key => this.props.updateActiveTab(key)}
          id="tabs-details"
          className="tabs-content"
        >
          <Tab eventKey={1} title="Trend">
            <HistoricalGraph filters={filters} widgetWidth={widgetWidth} widgetHeight={widgetHeight} />
          </Tab>

          <Tab eventKey={2} title="Data">
            {!filters.organization && !filters.user && <AllStats filters={filters} />}
            {filters.organization && !filters.user && <OrgStats filters={filters} />}
            {filters.organization && filters.user && <UserStats filters={filters} />}
          </Tab>
        </Tabs>
        )}
      </div>
    );
  }
}
