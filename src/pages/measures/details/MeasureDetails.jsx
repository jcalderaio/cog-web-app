import _ from "lodash";
import React from "react";
import PropTypes from "prop-types";
import Widget from "../widget";
import Toggle from "./Toggle";
import YearChart from "./YearChart";
import MonthChart from "./MonthChart";
import HtmlString from "./HtmlString";
import { Row, Col } from "react-bootstrap";
import Score from "./Score";
import hedis from "../Hedis";

export default class MeasureDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChartChange = this.handleChartChange.bind(this);
    this.handleStateChanged = this.handleStateChanged.bind(this);
  }

  handleChartChange(view) {
    this.setState({ ...this.state, graph: view });
  }

  handleStateChanged() {
    this.context.router.push(`/dashboard/measures`);
  }

  get ytd() {
    const year = new Date().getFullYear();
    return this.props.yearData.find(d => Number(d.year) === year) || { year: year, total: 0, completed: 0 };
  }

  get last() {
    const year = hedis.lastReportingPeriod();
    return this.props.yearData.find(d => Number(d.year) === year) || { year: year, total: 0, completed: 0 };
  }

  get min() {
    return _.minBy(this.props.yearData, "score") || { year: undefined, total: 0, completed: 0 };
  }

  get max() {
    return _.maxBy(this.props.yearData, "score") || { year: undefined, total: 0, completed: 0 };
  }

  get actions() {
    var actions = {};

    if (hedis.supportsAnalysis(this.props.code)) {
      if (this.props.code === "MIPS-236") {
        actions.analysis = {
          icon: "bar-chart",
          target: `/dashboard/HIE.Measures.MIPS-236`
        };
      } else {
        actions.analysis = {
          icon: "bar-chart",
          target: `/dashboard/${this.props.code}`
        };
      }
    }

    actions.details = {
      icon: "arrow-circle-left",
      target: `/dashboard/${this.props.dashboard}/`
    };

    return actions;
  }

  render() {
    return (
      <Widget title={this.props.name} actions={this.actions}>
        <div>
          <Row>
            <Col xs={12} md={6}>
              <Score ytd={this.ytd} last={this.last} min={this.min} max={this.max} />
              {this.state.graph === "month" ? (
                <MonthChart {...this.props} />
              ) : (
                <YearChart data={this.props.yearData} {...this.props} />
              )}
              <Toggle options={[{ id: "Year", default: true }, { id: "Month" }]} onChange={this.handleChartChange} />
            </Col>
            <Col xs={12} md={6}>
              <HtmlString html={this.props.description} />
            </Col>
          </Row>
        </div>
      </Widget>
    );
  }
}

MeasureDetails.contextTypes = {
  router: PropTypes.object.isRequired
};
