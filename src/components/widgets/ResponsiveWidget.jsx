import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProviderTable from 'visualizations/ProviderTable/index';

function asWidgetProps(insightProps, propType) {
      let {
        cache,
        widgetConfig,
        ...otherProps
      } = insightProps;

      const widgetProps = Object.assign({
        data: cache,
        config: widgetConfig
      }, otherProps);

      const {
        data,
        config,
        queryFilters,
        ...rest
      } = widgetProps;
      
      if (propType === 'queryFilters') {
        return queryFilters;
      } if (propType === 'config') {
        return config;
      } if (propType === 'data') {
        return data;
      } if (propType === 'rest') {
        return rest;
      }
}


// ResponsiveWidget defines a grid item component that will receive width and height information.
// This is then used by D3 visualiations inside which need to use pixel dimensions.
// See: https://github.com/STRML/react-grid-layout/issues/14
class ResponsiveWidget extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }
  
  render() {
    let {dataGrid, dataGridHeight, ...otherProps} = this.props;
    const dataGridComponent = dataGrid ? (
      <ProviderTable 
        queryFilters={asWidgetProps(this.props.insightProps, 'queryFilters')} 
        data={asWidgetProps(this.props.insightProps, 'data')}
        widgetWidth={parseInt(this.props.style.width, 10)}
        widgetHeight={dataGrid ? dataGridHeight : 600} 
        {...asWidgetProps(this.props.insightProps, 'config')} 
        {...asWidgetProps(this.props.insightProps, 'rest')} 
      />
    ):'';
    
    const newChildren = React.Children.map(this.props.children, (child) => {
      // const resizing = child.props.className !== undefined && child.props.className.indexOf(' resizing ') !== -1;
      // console.log("resizing", resizing);
      
      // Do not pass widgetWidth or widgetHeight to any non-React children elements (<div>, <h2>, <h4> for example).
      // They don't understand those props.
      if (typeof child.type === 'function') {
        // Our components, the visualizations, etc. they will care about widgetWidth and widgetHeight.
        return React.cloneElement(child, {
          // Many charts use SVG images which need absolute dimensions. So pass the dimensions of the widget
          // down to the children so they can calculate how much available space there is for the charts.
          widgetWidth: parseInt(this.props.style.width, 10),
          widgetHeight: parseInt(this.props.style.height, 10) - (dataGrid ? dataGridHeight:0)
        });
      }

      return child;
    });

    return (
      <div {...otherProps}>
        {newChildren}
        {dataGridComponent}
      </div>
    );
  }

}

// Note: When using this.props.children, there's an eslint error (which people went back and forth on for some time).
// So to resolve the error, the default propTypes and values are defined below.
// See: https://github.com/yannickcr/eslint-plugin-react/issues/7
// Also: http://www.hackingwithreact.com/read/1/41/how-to-add-react-component-prop-validation-in-minutes

// Defines propTypes
ResponsiveWidget.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  className: PropTypes.string,
  dataGrid: PropTypes.bool,
  dataGridHeight: PropTypes.number
  // dataGridData: PropTypes.array,
  // dataGridColumns: PropTypes.array
};

// Defines the default props (which are changed by react-grid-layout)
ResponsiveWidget.defaultProps = {
  children: {},
  style: {},
  className: 'widget',
  dataGridHeight: 500,
  dataGrid: false
  // dataGridData: [],
  // dataGridColumns: []
};

export default ResponsiveWidget;
