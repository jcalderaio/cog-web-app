import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import gql from 'graphql-tag';
import { sortBy, isFunction, isString } from 'lodash';
import graphqlClient from '../../../../apollo';

export default class OrganizationSelector extends React.PureComponent {
  static propTypes = {
    orgId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onChange: PropTypes.func,
    selector: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
  };

  static defaultProps = { selector: 'id' };

  state = { data: null };

  componentDidMount() {
    return graphqlClient()
      .query({
        query: gql`
          query OrganizationQuery {
            organization {
              search {
                list {
                  sk
                  id
                  name
                }
              }
            }
          }
        `
      })
      .catch(e => {
        console.log(e);
      })
      .then(response => {
        const { data } = response;

        const organizations = (data.organization && data.organization.search && data.organization.search.list) || [];
        const sorted = sortBy(organizations, 'name');

        this.setState({ data: sorted });
      });
  }

  loadOptions(input) {
    const result = input
      ? this.state.data.filter(d => `${d.name}`.toLowerCase().includes(input.toLowerCase()))
      : this.state.data;
    return result || [];
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
    const { orgId } = this.props;
    return (
      <Select
        multi={false}
        options={this.loadOptions()}
        valueKey="id"
        labelKey="name"
        value={orgId}
        onChange={i => this.onChange(i)}
        backspaceRemoves={true}
      />
    );
  }
}
