import React from 'react';
import PropTypes from 'prop-types';
import { Async } from 'react-select';
import gql from 'graphql-tag';
import { isFunction, isString } from 'lodash';
import graphqlClient from '../../../../apollo';

export default class UserSelector extends React.PureComponent {
  static propTypes = {
    orgId: PropTypes.string,
    onChange: PropTypes.func,
    selector: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
  };

  static defaultProps = { selector: 'username' };

  state = { data: null };

  fetchUsers() {
    return graphqlClient()
      .query({
        query: gql`
          query UserQuery {
            user {
              list {
                sk
                id
                firstName
                lastName
              }
            }
          }
        `
      })
      .then(response => {
        const { data } = response;
        return (data.user && data.user.list) || [];
      });
  }

  loadOptions(input, callback) {
    this.fetchUsers(input)
      .then(users => {
        let data = users.map(i => ({ username: i.id, fullname: `${i.firstName} ${i.lastName}`.trim() }));
        data = input ? data.filter(d => `${d.fullname}`.toLowerCase().includes(input.toLowerCase())) : data;
        callback(null, { options: data });
      })
      .catch(err => {
        callback(err, { options: [] });
      });
  }

  onChange(newVal) {
    const { selector, onChange } = this.props;
    if (!onChange || !isFunction(onChange)) return;
    let ret = newVal;
    if (newVal && selector) {
      let selFunc = i => i;
      if (isString(selector)) selFunc = i => i[selector];
      else if (isFunction(selector)) selFunc = selector;
      ret = selFunc(newVal);
    }
    onChange(ret);
  }

  render() {
    const { username } = this.props;
    console.log('USERSELECTOR:', username);
    return (
      <Async
        multi={false}
        loadOptions={(input, cb) => this.loadOptions(input, cb)}
        valueKey="username"
        labelKey="fullname"
        value={username}
        onChange={i => this.onChange(i)}
        backspaceRemoves={true}
      />
    );
  }
}
