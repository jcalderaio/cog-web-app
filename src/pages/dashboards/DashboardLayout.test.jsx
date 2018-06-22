// import React from 'react';
// import { shallow } from 'enzyme';

// Component under test
import { DashboardLayout } from './DashboardLayout';

describe('DashboardLayout', () => {

  it('should be defined', () => {
    expect(DashboardLayout).toBeDefined();
    expect(DashboardLayout.automaticGridLayout).toBeDefined();
    expect(DashboardLayout.generateLayouts).toBeDefined();
  });
  describe('generateLayouts()', () => {
    const props = {
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
      widgets: [
        // NOTE: Both are passed with x: 0
        // Automatic layout should reposition these so that widgetB has x: 4
        {type: "widgetA", gridLayout: { w: 4, h: 5, x: 0, y: 0} },
        {type: "widgetB", gridLayout: { w: 4, h: 5, x: 0, y: 0} },
        {type: "widgetC", gridLayout: { w: 4, h: 5, x: 0, y: 6} },
        {type: "widgetD", gridLayout: { w: 2, h: 5, x: 2, y: 6} },
        {type: "widgetE", gridLayout: { w: 2, h: 5, x: 2, y: 6} },
        {type: "widgetF", gridLayout: { w: 2, h: 5, x: 4, y: 6} }
      ],
      defaultGridItemLayout: {h:5, isDraggable: false, isResizable: false, w: 4}
    };
    const layout = DashboardLayout.generateLayouts(props);

    it('should return a grid layout object with breakpoints', () => {
      expect(layout).toHaveProperty("lg");
      expect(layout).toHaveProperty("md");
      expect(layout).toHaveProperty("sm");
      expect(layout).toHaveProperty("xs");
      expect(layout).toHaveProperty("lg.0.i");
    });

    it('should automatically move widgets to available spaces', () => {
      // Again, in large breakpoint, widgetB should be at x: 4
      // widgetD (or the index 4) should be at x: 0 because it's on a new row
      expect(layout.lg[0].x).toEqual(0);
      expect(layout.lg[1].x).toEqual(4);
      expect(layout.lg[2].x).toEqual(8);
      expect(layout.lg[3].x).toEqual(0);
    });

    it('should return a default grid layout', () => {
      const defaultLayout = DashboardLayout.generateLayouts();
      expect(defaultLayout).toHaveProperty("lg");
    });

    it('should not return a columns for a missing breakpoint', () => {
      const props = {
        gridLayout: {
          breakpoints: {
            lg: 1200
          },
          cols: {
            foo: 12
          }
        }
      };
      const invalidLayout = DashboardLayout.generateLayouts(props);
      expect(invalidLayout).toHaveProperty("lg");
      expect(invalidLayout).not.toHaveProperty("foo");
    });

  });
});