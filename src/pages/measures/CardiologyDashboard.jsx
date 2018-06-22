import _ from 'lodash';
import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import Hedis from './Hedis';
import MeasureWidget from './MeasureWidget';
import Spinner from 'components/Spinner';

import { buildLayoutFuncAllSizes, Constants as LayoutConstants } from '../../utils/buildLayouts';

export default class CardiologyDashboard extends React.Component {
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
    const itemsPerRowLg = 3;
    const itemHeight = 3;
    this.buildLayout = buildLayoutFuncAllSizes(itemsPerRowLg, itemHeight);
  }

  componentDidMount() {
    Hedis.measures()
      .then(m => {
        // eslint-disable-next-line max-len
        return Promise.all([Promise.resolve(m), Promise.resolve(Hedis.monthlyData(null, new Date().getFullYear() - 1))]);
      })
      .then(r => {
        let orderedMeasures = [
          'MIPS-236',
          'MIPS-374',
          'MIPS-006',
          'MIPS-128',
          'MIPS-226',
          'MIPS-431',
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
        <MeasureWidget dashboard="cardiology" data={this.state.data[code] || []} {...this.state.measures[code]} />
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
          <h2 className="page-heading">Last reported period: Dec 2017</h2>
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
