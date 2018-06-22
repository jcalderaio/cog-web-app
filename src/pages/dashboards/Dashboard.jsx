import React from 'react';
import PropTypes from 'prop-types';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardLayout } from './DashboardLayout';
import QueryString from 'query-string';
import ResponsiveWidget from 'widgets/ResponsiveWidget';
import { WidgetRegistry } from 'widgets';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function Dashboard(props) {
  const { widgets, title, gridLayout, id } = props;
  const layouts = DashboardLayout.generateLayouts(props);
  // console.log('generated layouts', layouts);
  return (
    <div>
      <div id="page-header">
        <h2 className="page-heading">{title}</h2>
      </div>
      <ResponsiveReactGridLayout key={id} className="layout" layouts={layouts} {...gridLayout}>
        {// The configured widgets must be wrapped in a ResponsiveWidget component
        // with a key (string) that gets referenced by the generated layouts.
        // These components include titles, controls, etc. and are generic.
        // Note the filter() first, it will remove anything passed that's invalid
        // or not found. Alternatively, we could have a "not found" widget.
        widgets.filter(widget => WidgetRegistry.find(widget.type)).map((widget, index) => {
          const Widget = WidgetRegistry.find(widget.type);
          return (
            <ResponsiveWidget key={index.toString()}>
              <Widget
                options={widget.options}
                queryOptions={QueryString.stringify(widget.options, { arrayFormat: 'bracket' })}
              />
            </ResponsiveWidget>
          );
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
}

Dashboard.defaultProps = {
  cache: {},
  gridLayout: {
    // Note: These breakpoints will be influenced by the parent container and breakpoints set elsewhere
    // that change its size. The defaults set are designed for placing 3, 2, or 1 widget per row.
    // 12/4 = 3, 8/4 = 2, 4/4 = 1
    cols: { lg: 12, md: 8, sm: 4, xs: 4 },
    breakpoints: { lg: 1200, md: 952, sm: 768, xs: 480 },
    // This changes how tall widgets are...unsure just yet if this should change based on breakpoint...
    rowHeight: DashboardLayout.DEFAULT_ROW_HEIGHT
  },
  // Default grid item settings. Dashboard configs need not define a `gridLayout` key value.
  // Reasons to do so would include ensuring a widget maintains a certain minimum width/height, etc.
  // It's best to stick to the conventional default being divisible by 4 and standardize around widgets
  // always being a certain size. It's making the grid a bit less flexible, but unless someone is dragging
  // and dropping, it's going to be hard to ensure things fit neatly.
  // The react-grid-layout library does not perform this compacting like masonry, etc.
  // Note: Leveraging `minW` may be a better idea.
  // Note: `static` is always overridden. Dashboard configuration should use `isResizable` and `isDraggable`
  defaultGridItemLayout: { w: 4, h: 5, isResizable: false, isDraggable: false }
};

Dashboard.propTypes = {
  query: PropTypes.string,
  cache: PropTypes.object,
  gridLayout: PropTypes.object,
  widgets: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  layouts: PropTypes.arrayOf(PropTypes.object),
  defaultGridItemLayout: PropTypes.object
};

export default Dashboard;
