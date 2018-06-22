import _ from 'lodash';
import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import Hedis from './Hedis';
import MeasureWidget from './MeasureWidget';
import Spinner from 'components/Spinner';

import { buildLayoutFuncAllSizes, Constants as LayoutConstants } from '../../utils/buildLayouts';

export default class MeasureDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      measures: undefined,
      data: undefined
    };

    this.staticLayoutOptions = {
      isDraggable: true,
      isResizable: false,
      static: true
    };

    // Currently making this default to 4x3
    const itemsPerRowLg = 4;
    const itemHeight = 3;
    this.buildLayout = buildLayoutFuncAllSizes(itemsPerRowLg, itemHeight);
  }

  componentDidMount() {
    Hedis.measures()
      //.then(m => this.setState({ measures: m }))
      .then(m => {
        return Promise.all([Promise.resolve(m), Promise.resolve(Hedis.yearlyData(null, new Date().getFullYear() - 3))]);
      })
      .then(r => {
        let orderedMeasures = Object.keys(r[0]).sort((a, b) => {
          const x = r[1][a].find(d => Number(d.year) === Number(Hedis.lastReportingPeriod())) || { score: 0 };
          const y = r[1][b].find(d => Number(d.year) === Number(Hedis.lastReportingPeriod())) || { score: 0 };
          return x.score > y.score;
        });

        // a specific order: https://cognosante.tpondemand.com/entity/44740
        orderedMeasures = [
           'PPC',
          'W15',
           'AWCV',
          'CIS',
          'WACNPACA',
           'ADMM',
          'CDC',
          'BMI',
          'BCS',
           'CERCS',
           'CRCS',
           'COA'
        ];
        this.setState({
          measures: r[0],
          data: r[1],
          orderedMeasures: orderedMeasures
        });
      });
  }

  onBreakpointChange(breakpoint, cols) {
    // console.log('onBreakpointChange', breakpoint, cols);
    // this.setState({breakpoint: breakpoint, cols: cols});
  }

  onLayoutChange(layout) {
    // console.log('onLayoutChange', layout);
    // this.setState({layout: layout});
  }

  renderWidget(code, idx) {
    // console.log('******' + code, this.state.data, this.state.data[code]);
    return (
      <div key={code}>
        <MeasureWidget dashboard="demoMeasures" data={this.state.data[code] || []} {...this.state.measures[code]} />
      </div>
    );
  }

  shouldRenderData(state) {
    return state.measures && state.data && state.orderedMeasures;
  }

  render() {
    let layout = {};
    if (this.shouldRenderData(this.state)) {
      layout = this.buildLayout({
        items: this.state.orderedMeasures,
        options: this.staticLayoutOptions
      });
    }

    return (
      <Spinner until={this.state.measures}>
        <div id="page-header">
          <h2 className="page-heading">Last reported period: 2016</h2>
        </div>
        <ResponsiveReactGridLayout
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          className="layout"
          layouts={layout}
          breakpoints={LayoutConstants.BREAK_POINTS}
          cols={LayoutConstants.COLS}
        >
          {this.shouldRenderData(this.state) && this.state.orderedMeasures.map((r, i) => this.renderWidget(r, i))}
        </ResponsiveReactGridLayout>
      </Spinner>
    );
  }
}
