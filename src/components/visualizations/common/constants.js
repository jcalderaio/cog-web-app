const BRUSH_HEIGHT = 30;
const LEGEND_HEIGHT = 40;
const XAXIS_HEIGHT = 40;
const DEF_PADDING_MARGIN = 30;

const Add = (a, b) => a+b;
const CalcWidgetHeight = (...correctionHeights) => (
  (widgetHeight) => widgetHeight - correctionHeights.reduce(Add, 0));

export default {
  BRUSH_HEIGHT,
  LEGEND_HEIGHT,
  XAXIS_HEIGHT,
  DEF_PADDING_MARGIN,
  CalcWidgetHeight
}