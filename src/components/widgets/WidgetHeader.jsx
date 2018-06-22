import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import { Link, hashHistory } from 'react-router';
import { goto } from '@cognosante/react-app';
import Popover from '../Popover';
import WidgetInfoPanel from './WidgetInfoPanel';
import _ from 'lodash';

const ICON_SIZE = '2x';
// WidgetHeader is responsible for the title and settings section at the top of each widget.
class WidgetHeader extends Component {

  constructor(props) {
    super(props);
    this.state = {
      infoIsOpen: false
    };
  }

  toggleInfo() {
    if (this.state.infoIsOpen) {
      this.setState({infoIsOpen: false});
    } else {
      this.setState({infoIsOpen: true});
    }
  }

  render() {
    const { fullPageLink, detailsLink, maximized, title, 
      subtitle, actions, popoverText, infoPanelContent } = this.props;
    
    const controlStyle = this.props.controlStyle ? this.props.controlStyle : {};
    const showMaxMinLink = (maximized || fullPageLink);
    const maxMinClass = (maximized || !fullPageLink) ? 'arrow-circle-left' : 'arrow-circle-right';
    const maxMinLink = maximized ? hashHistory.goBack : () => {goto(fullPageLink)};
    // eslint-disable-next-line max-len
    const widgetHeaderClassName = (maximized || !fullPageLink) ? 'widget-header maximized-widget':'widget-header minimized-widget';
    const infoPanelIcon = this.props.infoPanelIcon ? this.props.infoPanelIcon : 'question-circle-o';

    // An actions prop can pass in an object with props for <Link>
    // ie. { edit: { icon: "edit", linkProps: { ...various props to be spread... } } }
    // These links would need to be handled by the router.jsx
    // Most common "actions" are actually not handled through this prop.
    // Instead, they are handled by their own props: fullPageLink and detailsLink
    const headerActions = !actions ? null : actions.map((action, i) => (
      <Link key={i} {...(action.linkProps || {})}>
        <FontAwesome className="widget-control" name={action.icon} size={ICON_SIZE} />
      </Link>
    ));
 
    // fullPageLink
    // This will determine the route for the maximize button
    //
    // detailsLink
    // This will determine the route for the details view for a widget
    //
    // Special then is this last thing in the header; popoverText
    // which isn't really a link. It's just an icon with a popover
    // that provides some helpful information about the widget.

    return (
      <div
        className={widgetHeaderClassName}
        ref={(node) => this.props.returnRef(node, 'WidgetHeader')}
      >
        <div className="widget-title">
          <h3>{title}</h3>
          {(subtitle ?
            <h4>{subtitle}</h4>
          :null)}
        </div>
        <div className="widget-controls" style={controlStyle}>
          <div className="widget-header-options-group">
            {(popoverText ? 
              <Popover id={'popover'}popover={popoverText} placement="left" positionLeft={200} positionTop={100}>
                <FontAwesome className="widget-control" name={'question-circle-o'} size={ICON_SIZE} />
              </Popover> 
            : null)}

            {(infoPanelContent ? 
              <FontAwesome
                className="widget-control"
                onClick={() => {this.toggleInfo()}}
                name={infoPanelIcon}
                size={ICON_SIZE} />
            : null)}

            {headerActions}

            {(showMaxMinLink ?
              <Link onClick={maxMinLink} style={{float: "right"}}>
                <FontAwesome className="widget-control" name={maxMinClass} size={ICON_SIZE} />
              </Link>
            : null)}

            {(detailsLink ?
              <Link onClick={() => goto(detailsLink)} style={{float: "right"}}>
                <FontAwesome className="widget-control" name={'bar-chart'} size={ICON_SIZE} />
              </Link>
            : null)}
          </div>

        </div>

        {(infoPanelContent ?   
          <WidgetInfoPanel infoIsOpen={this.state.infoIsOpen} content={infoPanelContent} />
          : null)}
        
      </div>
    );
  }

}

// Defines the default props (which are changed by react-grid-layout)
WidgetHeader.defaultProps = {
  title: '',
  style: {},
  returnRef: () => {},
  insightID: '',
  maximized: false
};

// Defines propTypes
WidgetHeader.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.array,
  style: PropTypes.object,
  returnRef: PropTypes.func,
  fullPageLink: PropTypes.string,
  goBack: PropTypes.func,
  maximized: PropTypes.bool
};

export default WidgetHeader;
