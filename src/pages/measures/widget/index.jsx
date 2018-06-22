import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router';


export default class Widget extends React.Component {
  constructor(props){
    super(props);
    this.handleAction = this.handleAction.bind(this);
  }

  handleAction(e){
    const action = this.props.actions[e.target.id];
    if(action) {
      action.execute();
    }
  }

  render() {
    return (
      <div className="widget">
       <div className="widget-header-title clearfix">
            <div className="widget-title">
              { this.props.title && <h2>{this.props.title}</h2> }
            </div>
            <div className="widget-header-controls pull-right">
              <ul>
              {
                Object.keys(this.props.actions || {})
                 .map(k => {
                    const a = this.props.actions[k];
                    return (
                      <li key={k}> {
                      _.isString(a.target)
                      ? <Link to={a.target}>
                          <FontAwesome className="widget-control" name={a.icon || 'bolt'} size="2x"/>
                        </Link>
                      : <Link onClick={this.handleAction}>
                          <FontAwesome className="widget-control" name={a.icon || 'bolt'} size="2x"/>
                        </Link> }
                      </li>
                    );
                 })
              }
              </ul>
            </div>
        </div>
        <div className="widget-content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

// Defines the default props (which are changed by react-grid-layout)
Widget.defaultProps = {
  title: '',
  onStateChange: () => {}
};

// Defines propTypes
Widget.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.object, // { id1: {execute, icon}, id2: {execute, icon} }
  onAction: PropTypes.func
};