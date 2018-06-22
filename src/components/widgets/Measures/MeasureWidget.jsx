import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import obj2arg from 'graphql-obj2arg';
// import QueryString from 'query-string';

import GraphQLProvider from 'providers/GraphQL';
import MaximizedMeasure from 'widgets/Measures/MaximizedMeasure/MaximizedMeasure';
import MinimizedMeasure from 'widgets/Measures/MinimizedMeasure/MinimizedMeasure';
import WidgetHeader from 'widgets/WidgetHeader';
import HedisDefinitions from 'widgets/Measures/HedisDefinitions'
// import hedis from './Hedis';

class MeasureWidget extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: this.getQuery(),
      data: [],
      code: this.props.options.code
    }

    this.aggregateData = this.aggregateData.bind(this);
    this.transformAggregate = this.transformAggregate.bind(this);
  }

  aggregateData(source) {
    const transformedResult = { years: [], months: [] }

    var yearData = {};
    var current = new Date();

    source.forEach(monthData => {
      // we don't need to aggregate monthly rolling data for the extra year designed to help us 
      // calculate the 5th year in the past eg. 2012 if today is 2017

      if (parseInt(monthData.year, 10) !== current.getFullYear() - 5) {

        if (!yearData[monthData.year]) {
          yearData[monthData.year] = {};
          yearData[monthData.year].denominator = parseInt(monthData.denominator, 10);
          yearData[monthData.year].numerator = parseInt(monthData.numerator, 10);
        } else {
          yearData[monthData.year].denominator += parseInt(monthData.denominator, 10);
          yearData[monthData.year].numerator += parseInt(monthData.numerator, 10);
        }

        transformedResult.months.push(
          {
              numerator: monthData.numerator,
              denominator: monthData.denominator,
              month: monthData.month, 
              year: monthData.year
          }
        );
      }
    });

    _.each(yearData, (year, key) => {
      transformedResult.years.push({
        score: parseInt(year.denominator, 10) !== 0 ?
          Math.round(parseInt(year.numerator, 10) / parseInt(year.denominator, 10) * 100) :
          0, numeratorCount: parseInt(year.numerator, 10), denominatorCount: parseInt(year.denominator, 10), year: key
      })
    });
    
    _.each(transformedResult.months, month => {
      month.score = month.denominator !== 0 ? Math.round(month.numerator / month.denominator * 100) : 0;
    })

    return transformedResult;
  }

  transformAggregate(result, nextProps) {    
    result = result.hedis ? result.hedis : result;

    // var queryOptions = null;
    // if(this.props.maximized) {
    //   queryOptions = QueryString.parse(window.location.hash.split('?')[1], {arrayFormat: 'bracket'})
    // }

    switch (result ? Object.keys(result)[0] : null) {
      case 'prenatalCare':
        return this.aggregateData(result.prenatalCare.history);
      case 'breastCancerScreening':
        return this.aggregateData(result.breastCancerScreening.history);
      case 'wellChildVisit15':
        return this.aggregateData(result.wellChildVisit15.history);
      default:
        break;
    }
  }

  /**
   * Get the query (including filter conditions if any) for the GraphQL provider so it can return data to 
   * the visualizations in this widget. 
  */
  getQuery(filters = {}) {
    let args = obj2arg(filters, { keepNulls: true, noOuterBraces: true });
    if (args) {
      args = `(${args})`;
    }

    // TODO: Remove this by updating GraphQL.
    let code = this.props.options.code;

    if (this.props.options.code.toLocaleLowerCase() === "prenatalcare") {
      code = "prenatalCare";
    }
    if (this.props.options.code.toLocaleLowerCase() === "wellchildvisit15") {
      code = "wellChildVisit15";
    }
    if (this.props.options.code.toLocaleLowerCase() === "breastcancerscreening") {
      code = "breastCancerScreening";
    }

    return `{
      hedis {
        ${code}${args} {
          history {
            denominator
            numerator
            month
            year
          }
        }  
      }
    }`
  }

  /**
   * Find title will take a measure code and look up the display title in HedisDefinitions.js
   * This ensures the lookup is case insensitive. Opposed to just: HedisDefinitions[this.state.code].title
   * 
   * @param {string} code 
   */
  findTitle(code) {
    if (!code) {
      return "";
    }
    for (let key in HedisDefinitions) {
      if (key.toLocaleLowerCase() === this.state.code.toLocaleLowerCase()) {
        return HedisDefinitions[key].title;
      }
    }
  }

  render() {
    return (
      <div>
        <WidgetHeader
          title={(this.state.code && this.findTitle(this.state.code)) || 'UNKNOWN MEASURE'}
          maximized={this.props.maximized}
          showMaxMinLink={true}
          fullPageLink={`/widget/HIE.Measures/${this.props.options.code}?${this.props.queryOptions}`}
          detailsLink={`/dashboard/HIE.Measures.${this.props.options.code}?${this.props.queryOptions}`}
        />
        { /** Minimized Component **/
        !this.props.maximized && !this.props.details &&
          <GraphQLProvider query={this.state.query}
            afterFetch={this.transformAggregate}
            providerService={'insights'} >
            <MinimizedMeasure {...this.props} />
          </GraphQLProvider>
        }

        { /** Maximized Component **/
        this.props.maximized && !this.props.details &&
          <GraphQLProvider query={this.state.query}
            afterFetch={this.transformAggregate}
            providerService={'insights'} >
            <MaximizedMeasure {...this.props} average={HedisDefinitions[this.state.code].average}
              code={this.state.code} />
          </GraphQLProvider>
        }
      </div>
    );
  }
}

MeasureWidget.defaultProps = {
  maximized: false
}

MeasureWidget.contextTypes = {
  router: PropTypes.object.isRequired
}


// Instructions for the parent component using this component.
// Since this is a child that needs to talk to the parent (before the child is rendered),
// it's a bit difficult. Is it JavaScript or is it JavaScript? We can use the prototype.
// Alternatively this kind of information would need to be held in configuration *yuck*
// and we just simplified the config. Nor is this really something that will change
// or be configured by a user.
// 
// These are completely optional and will lead to some choices in layout/design.
// For example, `detail.grid` false will ensure that the page layout does not include the grid
// when in the details/maximized view. This will allow for a page with variable height.
// The grid would otherwise set a fixed height.
// This is SUPER important for this component in particular because it has side by side
// visualizations using Twitter Bootstrap CSS which conflicts with the react grid layout.
MeasureWidget.prototype.options = {
  // For the Detail.jsx component, details/maximized view.
  detail: {
    grid: false
  }
};

export default MeasureWidget;