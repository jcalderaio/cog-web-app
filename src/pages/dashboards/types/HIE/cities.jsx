import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import gql from 'graphql-tag';
import { sortBy, isFunction, isString } from 'lodash';
import graphqlClient from '../../../../apollo';

export default class CitySelector extends React.PureComponent {
  static propTypes = {
    city: PropTypes.string,
    onChange: PropTypes.func,
    selector: PropTypes.oneOfType([PropTypes.string]),
    source: PropTypes.oneOf(['user', 'organization'])
  };

  static defaultProps = { selector: 'city', source: 'organization' };

  state = { data: null };

  componentDidMount() {
    const { source } = this.props;

    const query = gql`
      query CityQuery {
        ${source} {
          search {
            cities
          }
        }
      }
    `;
    return graphqlClient()
      .query({
        query: query
      })
      .then(response => {
        const { data } = response;

        const cities = (data[source] && data[source].search && data[source].search.cities) || [];
        const sorted = sortBy(cities.map(e => ({ city: e })), 'city');

        this.setState({ data: sorted });
      });
  }

  loadOptions(input) {
    const rawData = this.state.data || [];

    const filteredData = input ? rawData.filter(e => `${e.city}`.toLowerCase().includes(input.toLowerCase())) : rawData;

    return filteredData;
  }

  onChange(newVal) {
    if (!this.props.onChange || !isFunction(this.props.onChange)) return;

    const { selector } = this.props;
    let ret = newVal;

    if (newVal && selector) {
      let selFunc = i => i;
      if (isString(selector)) selFunc = i => i[selector];
      else if (isFunction(selector)) selFunc = selector;
      ret = selFunc(newVal);
    }

    this.props.onChange(ret);
  }

  render() {
    const { city } = this.props;

    return (
      <Select
        multi={false}
        options={this.loadOptions()}
        value={city}
        valueKey="city"
        labelKey="city"
        onChange={i => this.onChange(i)}
        backspaceRemoves={true}
      />
    );
  }
}
