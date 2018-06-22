import _ from 'lodash';

const DashboardLayout = {
  /**
   * DEFAULT_ROW_HEIGHT simply provides a property to use to for default
   * widget height in the grid. It gets passed to <ResponsiveReactGridLayout />
   * which is 3rd party and has its own default that's too tall.
   */
  DEFAULT_ROW_HEIGHT: 86,

  /**
   * Every widget needs to be placed into the grid and for that to happen, there needs
   * to be an x and y position as well as a width and height (in terms of grid spaces).
   *
   * Note that there are actually multiple grids when talking about a responsive design.
   * At a large breakpoint there might be 12 columns while at a smaller breakpoint only 6.
   * 
   * So rather than requiring the Dashboard configuration to pass the position for each
   * breakpoint, it can be generated automatically. There's even a default widget widget
   * and height to be used as well. This way the Dashboard configuration can be as simple
   * as possible.
   * 
   * @param  {Object} props      Props from the Dashboard component
   * @param  {Number} breakpoint The grid breakpoint (used to look up number of configured columns)
   * @return {Object} A grid layout object
   */
  automaticGridLayout: function(props, breakpoint = 'lg') {
    const cols = props.gridLayout.cols[breakpoint] || 12;
    const { w: defaultW, h: defaultH, isDraggable, isResizable } = props.defaultGridItemLayout;

    let currentX = 0;
    let currentY = 0;
    
    const layouts = [];
    let prevWidgetW = 0;
    props.widgets.forEach((widget, idx) => {
      // If widget.gridLayout wasn't defined at all, use some defaults.
      let incrementW = defaultW;
      let incrementH = defaultH;
      // If widget did have a gridLayout object, use that to help position.
      // We'll know that if a widget is 6 wide, we need to increment by 6 for the next to account for its size.
      if(widget.gridLayout !== undefined) {
        // eslint-disable-next-line max-len
        incrementW = (widget.gridLayout.w !== undefined && !isNaN(widget.gridLayout.w)) ? widget.gridLayout.w:incrementW;
        // eslint-disable-next-line max-len
        incrementH = (widget.gridLayout.h !== undefined && !isNaN(widget.gridLayout.h)) ? widget.gridLayout.h:incrementH;
        
      }

      // Set new position based on previous widgets before this current one.
      // If this was the first widget, then prevWidget will be 0.
      currentX += prevWidgetW;
      // if we're at the end of the available columns or if the next widget width will push us beyond the end,
      // go to next row.
      if (currentX > cols || (currentX + incrementW > cols)) {
        currentX = 0;
        incrementW = defaultW;
        currentY += incrementH;
      }

      // NOTE: widget width and height is NOT the incrementW and incrementH.
      // Because the incrementW could be "reset" if at the end of the row. If we didn't have rows,
      // then sure the incrementW would work here for width. Technically, it is the same as incrementH
      // because we don't "reset" that, but don't conflate the purposes of the two variables.
      // One is a pointer to where we need to place a widget, the other is the defined size of a widget.
      let widgetWidth = (widget.gridLayout && widget.gridLayout.w) ? widget.gridLayout.w:defaultW;
      let widgetHeight = (widget.gridLayout && widget.gridLayout.h) ? widget.gridLayout.h:defaultH;

      // NOTE: The index `idx` is important. It is typically not defined, so it becomes 0, 1, 2, etc.
      // Then `i` becomes '0', '1', '2', etc.
      // However, in custom dashboard layouts, one may decide to define/label their widgets.
      // If not referenced, then the widget gets no props. It defaults to whatever <ResponsiveReactGridLayout />
      // wants, which results in a small, widget that's draggable and resizeable. Which we don't want.
      //
      // The easiest thing to do is key each composed widget with props like key={'0'} for example. In order.
      // If something like key={'a'} or key={'describedWidget'} is desired instead, then each widget in each layout
      // breakpoint should be keyed as such with a corresponding `i` property.
      // So for example: { lg: [{ i: 'describedWidget', x: 0, y: 0, w: 4, h: 5 }] }
      // 
      // This is only going to be the case in custom, hard coded, dashboards and not those automatically generated
      // from dashboardState.json and such ("dynamic" dashboards).
      // Push the widget into the layouts for breakpoint.
      layouts.push({
        i: widget.i || idx.toString(),
        x: currentX,
        y: currentY,
        w: widgetWidth,
        h: widgetHeight,
        isResizable: widget.isResizable || isResizable,
        isDraggable: widget.isDraggable || isDraggable,
        // Some lesser used values, with RGL defaults.
        // https://github.com/STRML/react-grid-layout
        // I worry about using {...widget} here because of other invalid props.
        minW: widget.minW || 0,
        maxW: widget.maxnW || Infinity,
        minH: widget.minH || 0,
        maxH: widget.maxH || Infinity
        // static: widget.static || true
      });

      // Last, keep track of the current widget's width for the next widget after.
      // It needs to know what came before it.
      prevWidgetW = widgetWidth;
    });

    return layouts;
  },

  /**
   * Generates the ResponsiveReactGridLayout `layouts` prop. This will create a new layout for each breakpoint
   * that's been defined in this Dashboard component's `gridLayout.cols` prop.
   * 
   * @param  {Object} props   The Dashboard component props
   * @param  {Array}  widgets Typically, the widgets are defined in props for a dashboard (dashboardState.json).
   *                          However, a custom dashboard may choose to use composition to define the widgets
   *                          and nest them within <ResponsiveReactGridLayout /> ... in which case, we need
   *                          to know about those somehow. There's no way to introspect this since it doesn't
   *                          exist until render(). So those custom layouts will need to pass the list of widgets
   *                          in this argument here.
   * @return {Object} Layouts keyed by breakpoint name (lg, md, sm, etc.)
   */
  generateLayouts: function(props, widgets) {
    // Default values for the gridLayout
    const layoutProps = _.merge(
      {
        gridLayout: {
          breakpoints: {
            lg: 1200,
            md: 952,
            sm: 768,
            xs: 480
          },
          cols: {
            lg: 12,
            md: 8,
            sm: 4,
            xs: 4
          }
        },
        defaultGridItemLayout: {
          h: 5,
          w: 4,
          isDraggable: false,
          isResizable: false
        },
        widgets: []
      },
      props
    );
    // If widgets were passed, use those. "Composed layouts" will do this because there's no way to
    // know what the widgets are.
    // TODO: I don't know, can we look up children? Would we need to use shallow rendering first?
    // Probably not worth it. Though would really be convenient to not have to define the layout
    // above all the children widgets (referencing them) and instead define on each child widget itself.
    layoutProps.widgets = (widgets !== undefined && widgets.length > 0 ) ? widgets:layoutProps.widgets;
    const layouts = {};
    for (let breakpoint in layoutProps.gridLayout.cols) {
      if (layoutProps.gridLayout.breakpoints[breakpoint]) {
        layouts[breakpoint] = this.automaticGridLayout(layoutProps, breakpoint);
      }
    }
    // console.log('FINAL LAYOUTS:', layouts);
    return layouts;
  },

  /** 
   * This will return a standard "details" page grid props where filtering is on the left side
   * of the page with content (likely in tabs) on the right. This just saves boilerplate.
   * This includes all of the necessary grid props; cols, layouts, etc.
   * 
   * 
   * @return {Object} Layouts appropriate for all breakpoints
  */
  getDetailsPageGridProps(filterHeight = Infinity, contentHeight = Infinity) {
    return {
      breakpoints: {
        lg: 1200,
        md: 952,
        sm: 768,
        xs: 480
      },
      cols: {
        lg: 12,
        md: 8,
        sm: 6,
        xs: 6
      },
      layouts: {
        // Large
        lg: [
          {
            "i": "content",
            "x": 0,
            "y": 0,
            "w": 9,
            "h": contentHeight,
            "isResizable": false,
            "isDraggable": false,
            "minW": 0,
            "maxW": Infinity,
            "minH": 0,
            "maxH": Infinity
          },
          {
            "i": "filters",
            "x": 10,
            "y": 0,
            "w": 3,
            "h": filterHeight,
            "isResizable": false,
            "isDraggable": false,
            "minW": 0,
            "maxW": Infinity,
            "minH": 0,
            "maxH": Infinity
          }
        ],
        // Medium
        md: [
          {
            "i": "content",
            "x": 0,
            "y": 0,
            "w": 6,
            "h": contentHeight,
            "isResizable": false,
            "isDraggable": false,
            "minW": 0,
            "maxW": Infinity,
            "minH": 0,
            "maxH": Infinity
          },
          {
            "i": "filters",
            "x": 7,
            "y": 0,
            "w": 2,
            "h": filterHeight,
            "isResizable": false,
            "isDraggable": false,
            "minW": 0,
            "maxW": Infinity,
            "minH": 0,
            "maxH": Infinity
          }
        ],
        // Small
        sm: [
          {
            "i": "content",
            "x": 0,
            "y": 0,
            "w": 4,
            "h": contentHeight,
            "isResizable": false,
            "isDraggable": false,
            "minW": 0,
            "maxW": Infinity,
            "minH": 0,
            "maxH": Infinity
          },
          {
            "i": "filters",
            "x": 5,
            "y": 0,
            "w": 2,
            "h": filterHeight,
            "isResizable": false,
            "isDraggable": false,
            "minW": 0,
            "maxW": null,
            "minH": 0,
            "maxH": null
          }
        ],
        // Extra Small
        xs: [
          {
            "i": "content",
            "x": 0,
            "y": 0,
            "w": 6,
            "h": contentHeight,
            "isResizable": false,
            "isDraggable": false,
            "minW": 0,
            "maxW": Infinity,
            "minH": 0,
            "maxH": Infinity
          },
          {
            "i": "filters",
            "x": 0,
            "y": 0,
            "w": 0,
            "h": 0,
            "isResizable": false,
            "isDraggable": false,
            "minW": 0,
            "maxW": Infinity,
            "minH": 0,
            "maxH": Infinity
          }
        ]

      }
    };
  }

};

export { DashboardLayout };