import _ from 'lodash';
import { getWidget } from 'widgets/Widget';

/**
 * Default Responsive Grid options:
 * 
 * 
 * <ResponsiveReactGridLayout
 *    className="layout"
 *    layouts={lg: [...], md: [...]} // see buildLayoutFuncAllSizes
 *    breakpoints={Constants.BREAK_POINTS}
 *    cols={Constants.COLS}>
 *    ...
 * 
 */
const Constants = {
  COLS: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  DEF_WIDGET_HEIGHT: 3,
  BREAK_POINTS: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  WIDGET_HEIGHT: 470,
  ICON_SIZE: '2x'
}
export {Constants};

/**
 * Constuct function for mapping widgets to layouts
 * 
 * Example:
 *  const ToRowsOfThree = buildLayoutFunc(3, DEF_WIDGET_HEIGHT);
 *  const ToRowsOfFour = buildLayoutFunc(4, DEF_WIDGET_HEIGHT);
 *  const sizedLayout = layoutArray.map(ToRowsOfThree);
 * 
 * @param {integer} itemsPerRow 
 * @param {integer} height 
 * @param {integer} cols 
 * @returns func: (item: Object, index: integer) => Object
 */
export function buildLayoutFunc(itemsPerRow, height, cols) {
  cols = cols || 12;
  const width = Math.floor(cols / itemsPerRow);

  return (item, index) => Object.assign(item, {
    x: (index % itemsPerRow) * width,
    y: Math.floor(index / itemsPerRow) * height, // y offset: row number * height
    w: width,
    h: height,
    static: true
  });
}

/**
 * This provides fully responsive grid layout for items in grid
 * inferring items per row based on the largest Lg viewport size. 
 * This is required due to the library we use. See:
 * https://github.com/STRML/react-grid-layout#responsive-usage
 * 
 * @export
 * @param {number} itemsPerRowLg 
 * @param {number} height 
 * @param {Object} cols [cols=Constants.COLS] 
 * @returns {Object}
 */
export function buildLayoutFuncAllSizes(itemsPerRowLg, height, cols = Constants.COLS) {
  // assumption: Lg and Md viewports have the same items per row
  const itemsPerRowMd = itemsPerRowLg;
  // assumption: Sm viewport can container half items as large
  const itemsPerRowSm = itemsPerRowLg > 2 ? Math.floor(itemsPerRowLg / 2) : 1;
  // assumption: Xs viewport can only handle 1 item per row
  const itemsPerRowXs = 1;

  const toRowsLg = buildLayoutFunc(itemsPerRowLg, height, cols.lg);
  const toRowsMd = buildLayoutFunc(itemsPerRowMd, height, cols.md);
  const toRowsSm = buildLayoutFunc(itemsPerRowSm, height, cols.sm);
  const toRowsXs = buildLayoutFunc(itemsPerRowXs, height, cols.xs);

  return ({items, idKey, options}) => {
    options = options || {};
    // if items are not a list of objects, use the item element as the grid key `i`
    const toIGridObj = (item) => Object.assign(
      {},
      options, // all Grid element options to be passed for all elements
      typeof item === 'object' ? { i: item[idKey] } : { i: item }
    );
    return {
      lg: items.map(toIGridObj).map(toRowsLg),
      md: items.map(toIGridObj).map(toRowsMd),
      sm: items.map(toIGridObj).map(toRowsSm),
      xs: items.map(toIGridObj).map(toRowsXs)
    }
  }
}

/**
 * Build layout objects based on declared Widget defaults and insights.
 * 
 * Note: I dont like how much mutation is going on here and the order
 * of the Object.assign params can lead to potentionally confusing behavior.
 * This should change.
 * @export
 * @param {any} ids 
 * @param {any} insights 
 * @param {any} optParams
 * @returns Object[]
 */
export function getDefaultWidgetLayouts(insights, optParamOverrides) {
  return Object.values(insights).map((insight) => {
    const WidgetDefaultLayout = getWidget(insight.type).DefaultLayout;
    const layout = { i: insight.id };

    // mutate layout object with any widget specific layout defaults
    if (WidgetDefaultLayout && typeof WidgetDefaultLayout === 'function') {
      Object.assign(layout, WidgetDefaultLayout());
    }

    // if optional overrides, mutate layout
    if (optParamOverrides) {
      Object.assign(layout, optParamOverrides);
    }
    
    return layout;
  });
}

/**
 * Construct default dashboard layout with sane defaults
 * 
 * @export
 * @param   {string[]} ids 
 * @param   {Object} insights 
 * @returns {Object}
 */
export function buildDefaultDashLayout(ids, insights) {
  const dashInsights = _.pick(insights, ids);
  const ToRowsOfTwo = buildLayoutFunc(2, Constants.DEF_WIDGET_HEIGHT);
  return getDefaultWidgetLayouts(dashInsights).map(ToRowsOfTwo);
}