import React, { Component } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import _ from 'lodash';
import QueryString from 'query-string';
import ResponsiveWidget from 'widgets/ResponsiveWidget';
import { WidgetRegistry } from 'widgets';
import { DashboardLayout } from 'pages/dashboards/DashboardLayout';
// Import does not exist View
import NotFound from '../NotFound';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class WidgetDetail extends Component {

  render() {
    const widgetType = this.props.params.type;
    const Widget = WidgetRegistry.find(widgetType)
    // console.log('widget:', widgetType);
    if (!Widget) {
      return <NotFound />;
    }

    // I don't think anything was ever setting a title.
    // But this would be the page title (oustide the widget box).
    const { title } = this.props;

    const layouts = DashboardLayout.generateLayouts(this.props, [
      { 'i': 'a', gridLayout: { w: 12, h: 7 } }
    ]);
    // console.log('generated layouts', layouts);

    // WIDGET OPTIONS
    // Each widget can set options on its object prototype.
    // This is useful for switching the layout here.
    const defaultOptions = {
      layoutClassName: "layout",
      code: this.props.params.code || '',
      title: WidgetRegistry.findTitle(this.props.params.code) || ''
    };

    const widgetOptions = Object.assign(defaultOptions, 
      // Widget.prototype.options may switch the grid to false for example
      (Widget.prototype.options || {}), 
      // This will be helpful when there's querystring parameters like ?code= &demo=
      QueryString.parse(window.location.hash.split('?')[1], 
      // This, I have no idea.
      {arrayFormat: 'bracket'})
    );

    // By default we use a the react grid layout.
    let WidgetLayout = (
      <ResponsiveReactGridLayout
          className="layout"
          layouts={layouts}
          rowHeight={DashboardLayout.DEFAULT_ROW_HEIGHT}>
        <ResponsiveWidget key={"a"}>
          <Widget options={widgetOptions} maximized={true} />
        </ResponsiveWidget>
      </ResponsiveReactGridLayout>
    );

    return (
      <div>
        <div id="page-header">
          <h2 className="page-heading">{title}</h2>
        </div>
        {WidgetLayout}
      </div>
    );
  }
}


export default WidgetDetail;