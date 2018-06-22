// DEPRECATION NOTICE: This component is a fork of our widget component.
// It is marked for deletion. Do not use or copy it.
// See:
// /src/components/widgets/ResponsiveWidget.jsx
// /src/components/widgets/WidgetHeader.jsx
// /src/components/widgets/Widget.jx
import React from 'react';
import PropTypes from 'prop-types';
import Meter from './Meter';
import SparkGraph from './SparkGraph';
import Widget from './widget';
import hedis from './Hedis';

export default class MeasureWidget extends React.Component {
  constructor(props) {
    super(props);
    this.handleStateChanged = this.handleStateChanged.bind(this);
  }

  handleStateChanged() {
    this.context.router.push(`/dashboard/measures/${this.props.code}`);
  }
  
  abbreviateNumber(n) {
    var ranges = [
      { divider: 1e9 , suffix: 'B' },
      { divider: 1e6 , suffix: 'M' },
      { divider: 1e3 , suffix: 'K' }
    ];
    for (var i = 0; i < ranges.length; i++) {
      if (n >= ranges[i].divider) {
        var dividedNum = ((n / ranges[i].divider).toString()).split('.')[0];
        return dividedNum.length < 2 ? 
          (n / ranges[i].divider).toString().slice(0,3) + ranges[i].suffix 
          : ((n / ranges[i].divider).toString()).split('.')[0] + ranges[i].suffix;
      }
    }
    return n.toString();
  }

  get history() {
    return this.props.data.sort((a, b) => Number(b.year) - Number(a.year)).map(d => d.score);
  }

  get lastPeriod() {
    return (
      this.props.data.find(d => Number(d.year) === Number(hedis.lastReportingPeriod())) || {
        year: undefined,
        total: 0,
        completed: 0
      }
    );
  }

  get actions() {
    var actions = {};

    if (hedis.supportsAnalysis(this.props.code)) {
      // DO NOT USE THIS COMPONENT
      // It is deprecated. It is not compatible with new conventions.
      // Here's an example. /dashboard/<code> is just not a thing.
      // 
      if (this.props.code === 'MIPS-236') {
        actions.analysis = {
          icon: 'bar-chart',
          target: `/dashboard/HIE.Measures.MIPS-236`
        };
      } else {
        actions.analysis = {
          icon: 'bar-chart',
          target: `/dashboard/${this.props.code}`
        }
      }
    }

    actions.details = {
      icon: 'arrow-circle-right',
      target: `/dashboard/${this.props.dashboard}/${this.props.code}`
    };

    return actions;
  }

  render() {
    const last = this.lastPeriod;
    return (
      this.props.data &&
      <Widget title="" className="widget-controls" actions={this.actions}>
        <div className="measure-widget">
          <div className="measure-widget-content">
            <div className="header">
              <span>
                <h3>
                  {this.props.name || this.props.code}
                </h3>
              </span>
            </div>
            <div className="meter">
              <Meter percent={last.score || last.completed / last.total * 100} />
            </div>
            <div className="details">
              <h4>
                Completed&nbsp;
                <span className="completed">{this.abbreviateNumber(last.completed)}</span>
                &nbsp;of&nbsp;
                <span className="total">{this.abbreviateNumber(last.total)}</span>
              </h4>
            </div>
            <div className="graph">
              {history && history.length > 0 && <SparkGraph history={this.history} />}
            </div>
          </div>
        </div>
      </Widget>
    );
  }
}

MeasureWidget.propTypes = {
  code: PropTypes.string,
  name: PropTypes.string,
  data: PropTypes.array
};

MeasureWidget.contextTypes = {
  router: PropTypes.object.isRequired
};
