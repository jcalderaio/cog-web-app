import React, { Component } from 'react';
import obj2arg from 'graphql-obj2arg';
import GraphQLProvider from 'providers/GraphQL';
import WidgetHeader from 'widgets/WidgetHeader';
import BarChartVisualization from 'visualizations/BarChart';
import Zoom from 'visualizations/Zoom';

class Utilization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: this.getQuery(),
      xAxisKey: 'year',
      xAxisMonthFormatting: false,
      zoomLabel: 'All year(s)',
      zoomState: 0
    };
    this.handleChartClick = this.handleChartClick.bind(this);
    this.handleZoomOutClick = this.handleZoomOutClick.bind(this);
  }

  /**
   * Get the query (including filter conditions if any) for the GraphQL provider so it can return data to
   * the visualizations in this widget.
   */
  getQuery(filters) {
    let args = obj2arg(filters || {}, { keepNulls: true, noOuterBraces: true });
    if (args) {
      args = `(${args})`;
    }

    // Changed this to reflect what is in the insights API
    return `
    {
      hie {
        queryAndSubmissions${args} {
          queries
          queriesNoResult
          submissions
          month
          year
        }
      }
    }
    `;
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
      // which is why this handler exists here and not inside the BarChartVisualization
      // component itself.
      if (data.activeLabel && data.activeLabel > 12) {
        args.year = data.activeLabel;
        xAxis = 'month';
      } else {
        xAxis = 'year';
      }
      this.setState({
        query: this.getQuery(args),
        xAxisKey: xAxis,
        xAxisMonthFormatting: true,
        zoomState: 1,
        zoomLabel: 'Month(s) for year ' + data.activeLabel
      });
    }
  }

  /**
   * Similar to `handleChartClick()` we are given the opportunity
   * to instruct the BarChartVisualization when the user clicks its,
   * optional, "zoom out" (or it could be a 'go back', etc.) button.
   *
   */
  handleZoomOutClick() {
    // In this case, it's quite simple. Just change the query to its default
    // and set the xAxisKey back to year.
    this.setState({
      query: this.getQuery(),
      xAxisKey: 'year',
      xAxisMonthFormatting: false,
      zoomLabel: 'All year(s)',
      zoomState: 0
    });
  }

  /**
   * Returns the <Zoom /> component for use with the BarChartVisualization.
   * This parent component needs to control the zoom, the line chart component
   * will place the control if it's present in the props, but it has no knowledge
   * of how the control is to work.
   *
   */
  getZoom() {
    return (
      <div>
        <h4 className={'legend-label'} style={{ textAlign: 'center' }}>
          {this.state.zoomLabel}
        </h4>
        <Zoom zoomOut={this.handleZoomOutClick} scaleIndex={this.state.zoomState} />
      </div>
    );
  }

  // INTEGRATE WITH NEW API. The query was changed, so we had to change this to pull the data off.
  afterFetch(result) {
    return result.hie;
  }

  render() {
    // Note: Ensure all of the props are passed down to <BarChartVisualization>
    // In them include the `widgetHeight` and `widgetWidth` which is important for the SVG sizing.

    const popoverText = `Queries represent the number of times any user used the HIE to search for information.
    Submissions represent the number of times any user has submitted information to the HIE.`;

    // Popovers don't always work well with the grid system and on mobile screens.
    // The info panel can work better because it uses the actual widget's space instead of floating on top over unknown elements.
    // It also can accept a wider variety of content, ie. other React elements within it.
    // It also can scroll.
    // const infoPanelContent = `Queries represent the number of times any user used the HIE to search for information.
    // Submissions represent the number of times any user has submitted information to the HIE.`;
    // Info panel can be light or dark or anything else by changing class names
    // infoPanelClass="widget-info-panel light"ƒ
    // Can also change the height if so desired
    // infoPanelHeight="50%"

    return (
      <div>
        <WidgetHeader
          title="Queries & Submissions"
          maximized={this.props.maximized}
          popoverText={popoverText ? popoverText : false}
          /**
          infoPanelContent={infoPanelContent ? infoPanelContent : false}
          infoPanelIcon={'bar-chart'}
          **/
          showMaxMinLink={true}
          fullPageLink={`/widget/HIE.Utilization?${this.props.queryOptions}`}
        />
        <GraphQLProvider query={this.state.query} providerService={'insights'} afterFetch={this.afterFetch}>
          <BarChartVisualization
            handleChartClick={this.handleChartClick}
            zoom={this.getZoom()}
            xAxisKey={this.state.xAxisKey}
            xAxisMonthFormatting={this.state.xAxisMonthFormatting}
            seriesKeys={['queries', { queriesNoResult: 'queries with no result' }, 'submissions']}
            seriesGroups={[{ a: ['queriesNoResult', 'queries'] }]}
            {...this.props}
          />
        </GraphQLProvider>
      </div>
    );
  }
}

export default Utilization;
