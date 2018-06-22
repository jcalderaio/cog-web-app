<a name="ScatterChartWidget"></a>

## ScatterChartWidget ⇐ <code>React.Component</code>
**Kind**: global class  
**Extends**: <code>React.Component</code>  

* [ScatterChartWidget](#ScatterChartWidget) ⇐ <code>React.Component</code>
    * [new ScatterChartWidget()](#new_ScatterChartWidget_new)
    * [.defaultProps](#ScatterChartWidget.defaultProps) : <code>Object</code>
    * [.propTypes](#ScatterChartWidget.propTypes)
    * [.mapSeriesToScatters(series, data)](#ScatterChartWidget.mapSeriesToScatters) ⇒ <code>Array</code>
    * [.render()](#ScatterChartWidget.render)

<a name="new_ScatterChartWidget_new"></a>

### new ScatterChartWidget()
The ScatterChartWidget class.

<a name="ScatterChartWidget.defaultProps"></a>

### ScatterChartWidget.defaultProps : <code>Object</code>
The component's default props.

**Kind**: static property of <code>[ScatterChartWidget](#ScatterChartWidget)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaultProps.data | <code>Array</code> | The data for the chart if not from GraphQL |
| defaults.xAxis | <code>Object</code> | Props handed down to the XAxis Component |
| defaults.yAxis | <code>Object</code> | Props handed down to the YAxis Component |
| defaults.zAxis | <code>Object</code> | Props handed down to the ZAxis Component |

<a name="ScatterChartWidget.propTypes"></a>

### ScatterChartWidget.propTypes
The component's propTypes.

**Kind**: static property of <code>[ScatterChartWidget](#ScatterChartWidget)</code>  
**Properties**

| Name | Type |
| --- | --- |
| propTypes.data | <code>Object</code> | 

<a name="ScatterChartWidget.mapSeriesToScatters"></a>

### ScatterChartWidget.mapSeriesToScatters(series, data) ⇒ <code>Array</code>
Returns <Scatter /> components to use from a series prop.
Each series object passed in the `series` array argument will be spread
on the <Scatter /> component as props. So `onClick` events and any prop
for Rechart's <Scatter /> can be used to control styles, etc.

**Kind**: static method of <code>[ScatterChartWidget](#ScatterChartWidget)</code>  
**Returns**: <code>Array</code> - The scatter chart <Scatter /> components with data (possibly transformed)  
**See**: http://recharts.org/#/en-US/api/Scatter  

| Param | Type | Description |
| --- | --- | --- |
| series | <code>Array.&lt;Object&gt;</code> | The series options, props, and `dataKey` that references which key to use from `data`.                           Each item in `series` gets passed to <Scatter /> props. |
| series[].dataKey | <code>string</code> | The key for the series found in `data` |
| series[].dataTransform | <code>function</code> | A transform function to be applied to `data` for the series |
| series[].name | <code>string</code> | The series name (shown in the legend) |
| data | <code>Mixed</code> | The data object with arrays for each series (or perhaps an array to be transformed into keyed series) |

<a name="ScatterChartWidget.render"></a>

### ScatterChartWidget.render()
Renders the component

**Kind**: static method of <code>[ScatterChartWidget](#ScatterChartWidget)</code>  
