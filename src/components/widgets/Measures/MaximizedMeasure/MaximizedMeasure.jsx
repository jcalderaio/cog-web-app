import _ from "lodash";
import React from "react";

import { graphql } from "providers/GraphQL";
import Toggle from "./Toggle";
import YearChart from "./YearChart";
import MonthChart from "./MonthChart";
import HtmlString from "./HtmlString";
import { Row, Col } from "react-bootstrap";
import Score from "./Score";
import Spinner from "components/Spinner";
import HedisDefinitions from "widgets/Measures/HedisDefinitions";

const current = new Date();

class MaximizedMeasure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
    this.handleChartChange = this.handleChartChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEmpty(nextProps.graphql.result)) {
      this.setState({
        data: nextProps.graphql.result
      });
    }
  }

  last() {
    return this.state.data.months[this.state.data.months.length - 1];
  }

  max() {
    let sorted = _.sortBy(this.state.data.months, [
      o => {
        return o.score;
      }
    ]);
    return sorted[sorted.length - 1];
  }

  min() {
    return _.sortBy(this.state.data.months, [
      o => {
        return o.score;
      }
    ])[0];
  }

  ytd() {
    return _.find(this.state.data.years, { year: current.getFullYear().toString() })
      ? _.find(this.state.data.years, { year: current.getFullYear().toString() })
      : 0;
  }

  handleChartChange(view) {
    this.setState({ graph: view });
  }

  render() {
    var current = new Date();
    // eslint-disable-next-line max-len
    var lastReportedPeriodData = _.find(this.state.data ? this.state.data.years : {}, {
      year: (current.getFullYear() - 1).toString()
    });
    // eslint-disable-next-line max-len
    // var lastReportedPeriodDataMinusOne = _.find(this.state.data ? this.state.data.years : {}, {year: (current.getFullYear()-2).toString()});
    // // eslint-disable-next-line max-len
    // var lastReportedPeriodDataMinusTwo = _.find(this.state.data ? this.state.data.years : {}, {year: (current.getFullYear()-3).toString()});
    // // eslint-disable-next-line max-len
    // var lastReportedPeriodDataMinusThree = _.find(this.state.data ? this.state.data.years : {}, {year: (current.getFullYear()-4).toString()});
    return (
      <Spinner until={!_.isEmpty(this.state.data)}>
        <Row>
          <Col xs={12} md={6}>
            <br />
            {lastReportedPeriodData && (
              <Score
                ytd={{ score: this.ytd().score, year: this.ytd().year }}
                last={{ score: this.last().score, year: this.last().year, month: this.last().month }}
                min={{ score: this.min().score, year: this.min().year, month: this.min().month }}
                max={{ score: this.max().score, year: this.max().year, month: this.max().month }}
              />
            )}
            <br />
            {this.state.graph === "month" ? (
              <MonthChart data={this.state.data.months} {...this.props} />
            ) : (
              <YearChart data={this.state.data.years} {...this.props} />
            )}
            <Toggle options={[{ id: "year", default: true }, { id: "month" }]} onChange={this.handleChartChange} />
          </Col>
          <Col xs={12} md={6}>
            <HtmlString html={HedisDefinitions[this.props.code].description} />
          </Col>
        </Row>
      </Spinner>
    );
  }
}

export default graphql(MaximizedMeasure);
