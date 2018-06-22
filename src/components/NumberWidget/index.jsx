import React from 'react';
import PropTypes from 'prop-types';
import { parse, format } from 'date-fns';
import { flatten, map } from 'lodash';
import Spinner from '../Spinner.jsx';
import Header from './header';
import Number from './number';
import Sparkline from './sparkline';
import ErrorDisplay from '../ErrorDisplay';

export default class NumberWidget extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    fullPageLink: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.any,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        aggregate: PropTypes.shape({
          value: PropTypes.any,
          format: PropTypes.string,
          label: PropTypes.string
        }),
        items: PropTypes.arrayOf(
          PropTypes.shape({
            date: PropTypes.instanceOf(Date),
            value: PropTypes.number
          })
        )
      })
    )
  };

  get dateRange() {
    const series = this.props.series || [];
    const flat = flatten(series.map(d => d.items.map(x => parse(x.date))));
    const sortedFlat = flat.sort((a, b) => a - b);

    return sortedFlat;
  }

  get period() {
    const range = this.dateRange;
    if (range.length) {
      const dateFormat = 'MMM YYYY';
      if (range.length === 1) return format(range[0], dateFormat);
      else return `${format(range[0], dateFormat)} - ${format(range[range.length - 1], dateFormat)}`;
    }
  }

  render() {
    // return <pre>{JSON.stringify(this.props.data.map)}</pre>;
    const { title, fullPageLink, loading, series = [], error } = this.props;
    const { period } = this;
    return (
      <div>
        <Header title={title} fullPageLink={fullPageLink} />
        {error ? (
          <ErrorDisplay
            header="Server Error"
            message="An error was encountered while fetching data from server."
            details={error}
          />
        ) : (
          <Spinner until={!loading && !error}>
            <div>
              <div className="number-style-container">
                {series &&
                  map(series, (s, i) => (
                    <div key={`SN${i}`} className="push-down">
                      <Number value={s.aggregate.value} format={s.aggregate.format} label={s.aggregate.label} />
                    </div>
                  ))}
              </div>

              <hr className="hr--light" />

              <div>
                <Sparkline
                  className="sparkline-widget"
                  data={series.map(d => d.items.sort((x, y) => parse(x.date) > parse(y.date)))}
                  marginLeft={15}
                  marginRight={15}
                  height={150}
                  stroke={['#0071bc', '#cccccc']}
                />
                {period && (
                  <div>
                    <p className="text-trend">{period}</p>
                  </div>
                )}
              </div>
            </div>
          </Spinner>
        )}
      </div>
    );
  }
}
