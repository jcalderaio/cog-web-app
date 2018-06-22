import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import WidgetHeader from './WidgetHeader';
import { getWidget } from './index';

const DashboardLinkIcon = 'bar-chart';

export default class Widget extends Component {
  render() {
    const {
      type,
      data,
      config,
      queryFilters,
      title,
      pageLink,
      dashboardLink,
      maximized,
      ...rest
    } = this.props;

    const Widget = getWidget(type);

    const headerActions = dashboardLink ? [{
      icon: DashboardLinkIcon,
      linkProps: {
        to: dashboardLink,
      }
    }] : [];
    return (
      <div>
        <WidgetHeader
          title={title}
          fullPageLink={pageLink}
          maximized={maximized}
          actions={headerActions}
        />
        <Widget queryFilters={queryFilters} data={data} {...config} {...rest} />
      </div>
    );
  }
}

Widget.propTypes = {
  type: PropTypes.string.isRequired,
  pageLink: PropTypes.string,
  dashboardLink: PropTypes.string,
  queryFilters: PropTypes.object,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  title: PropTypes.string.isRequired
}