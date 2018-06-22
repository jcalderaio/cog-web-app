import React, { Component } from 'react';

import PrenatalCareDetailsView from './view';

export default class PrenatalCareDetails extends Component {
  render() {
    // Note: Ensure all of the props are passed down to <LineChartVisualization>
    // In them include the `widgetHeight` and `widgetWidth` which is important for the SVG sizing.
    return <PrenatalCareDetailsView />;
  }
}
