import React, { Component } from 'react';

import DirectMessagesView from './view';

export default class DirectMessages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      args: {},
      xAxisKey: 'year',
      xAxisMonthFormatting: false,
      zoomLabel: 'All year(s)',
      zoomState: 0
    };

    this.handleChartClick = this.handleChartClick.bind(this);
    this.handleZoomOutClick = this.handleZoomOutClick.bind(this);
  }

  /**
   * Handles a click on the chart in order to adjust the query.
   * This handles the drill down functionality.
   *
   * Note: `data` can be null depending on where the user clicked.
   * You should always check if data exists before blindly using it.
   * However `proxy` should always be set.
   *
   * `proxy` will give you the SyntheticMouseEvent which helps with
   * targeting clicks on "DOM" elements not otherwise handled.
   *
   * @param {Object} data  The chart click handler includes X, Y position clicked, label, and more
   * @param {Object} proxy This includes [[Target]] which should be a SyntheticMouseEvent
   */
  handleChartClick(data, proxy) {
    // console.log('chart element clicked', data, proxy);
    if (data) {
      let args = {};
      let xAxis = 'year';
      // We're after the label. This is the element in the chart that was clicked.
      // In this case, it'll be greater than 12 if it's a year. Otherwise it'll be
      // 1-12 for each month. This is specific to the data set used by this widget,
      // which is why this handler exists here and not inside the LineChartVisualization
      // component itself.
      if (data.activeLabel && data.activeLabel > 12) {
        args.year = data.activeLabel;
        xAxis = 'month';
      } else {
        xAxis = 'year';
      }
      this.setState({
        args: args,
        xAxisKey: xAxis,
        xAxisMonthFormatting: true,
        zoomState: 1,
        zoomLabel: (data.activeLabel < 12) ? 'All year(s)':'Month(s) for year ' + data.activeLabel,
      })
    }
  }

  /**
   * Similar to `handleChartClick()` we are given the opportunity
   * to instruct the LineChartVisualization when the user clicks its,
   * optional, "zoom out" (or it could be a 'go back', etc.) button.
   *
   */
  handleZoomOutClick() {
    // In this case, it's quite simple. Just change the query to its default
    // and set the xAxisKey back to year.
    this.setState({
      args: {},
      xAxisKey: 'year',
      xAxisMonthFormatting: false,
      zoomLabel: 'All year(s)',
      zoomState: 0
    })
  }

  render() {
    // Note: Ensure all of the props are passed down to <LineChartVisualization>
    // In them include the `widgetHeight` and `widgetWidth` which is important for the SVG sizing.
    return (
      <DirectMessagesView
        handleChartClick={this.handleChartClick}
        handleZoomOutClick={this.handleZoomOutClick}
        args={this.state.args}
        xAxisKey={this.state.xAxisKey}
        xAxisMonthFormatting={this.state.xAxisMonthFormatting}
        zoomLabel={this.state.zoomLabel}
        zoomState={this.state.zoomState}
        {...this.props}
      />
    )
  }
}
