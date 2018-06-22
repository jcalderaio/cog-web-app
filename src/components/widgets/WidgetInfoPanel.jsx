import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

/**
 * WidgetInfoPanel
 * Allows for a panel, that covers most of the widget, to provide
 * additional or contextual information. This can be an alternative
 * to using a more limited popover.
 * 
 * With this component, there can be a lot more content displayed.
 * Not only does the <div> element overflow to scroll, but composition
 * can be used for its contents. Almost anything can be rendered inside
 * this element. A popover or tooltip are far more limiting.
 * 
 * Another advantage of this component is its ability to work on
 * smaller screens without concern about placement.
 * 
 * Tooltips and popovers are perhaps better choices when there's very
 * short text to be displayed.
 */
class WidgetInfoPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      infoIsOpen: false
    };
  }

  closeInfo() {
    this.setState({ infoIsOpen: false });
  }

  componentWillReceiveProps(props) {
    this.setState({infoIsOpen: props.infoIsOpen});
  }

  render() {
    const ICON_SIZE = '2x';
    const { content, infoPanelClass, infoPanelHeight } = this.props;
    
    // Panel can be any size/position within the widget...For example, half size centered.
    // width: '50%', height: '50%', left: '25%'
    const infoPanelStyle = this.props.style || {
      height: infoPanelHeight
    };

    // Much like ResponsiveWidget.jsx, we can use composition. <WidgetInfoPanel> ...<child /><child />... </WidgetInfoPanel>
    // This is one major thing setting an info panel apart from a tooltip or popover.
    const newChildren = React.Children.map(this.props.children, (child) => {
      // Do not pass widgetWidth or widgetHeight to any non-React children elements (<div>, <h2>, <h4> for example).
      // They don't understand those props.
      if (typeof child.type === 'function') {
        // Our components, the visualizations, etc. they will care about widgetWidth and widgetHeight.
        return React.cloneElement(child, {
          // TODO: This would be nice to add. It would allow the info/context panels to also include charts.
          // No use case yet, but there easily could be. For example, an alternative to "zoom"
          //
          // Many charts use SVG images which need absolute dimensions. So pass the dimensions of the widget
          // down to the children so they can calculate how much available space there is for the charts.
          // widgetWidth: parseInt(this.props.style.width, 10),
          // widgetHeight: parseInt(this.props.style.height, 10) - (dataGrid ? dataGridHeight:0)
        });
      }

      return child;
    });

    return (
      <div>
        {(this.state.infoIsOpen ?
          <div
            className={infoPanelClass}
            style={infoPanelStyle}>
            <FontAwesome
              className={'close-info-panel'}
              name={'times'}
              size={ICON_SIZE}
              onClick={this.props.closeInfo || (() => { this.closeInfo() })}
            />
            <div className={'widget-info-panel-body'}>
              {content}
              {newChildren}
            </div>
          </div>
          : null)}
      </div>
    );
  }
}

// Defines propTypes
WidgetInfoPanel.propTypes = {
  // children: PropTypes.node,
  style: PropTypes.object,
  infoPanelClass: PropTypes.string,
  infoPanelHeight: PropTypes.string,
  infoIsOpen: PropTypes.bool,
  content: PropTypes.any
};

// Defines the default props
WidgetInfoPanel.defaultProps = {
  //children: {},
  style: {},
  infoPanelClass: 'widget-info-panel',
  infoPanelHeight: '100%',
  infoIsOpen: false,
  content: ''
};

export default WidgetInfoPanel;
