<a name="DataGrid"></a>

## DataGrid ⇐ <code>React.Component</code>
**Kind**: global class  
**Extends**: <code>React.Component</code>  
**See**: ResponsiveWidget  

* [DataGrid](#DataGrid) ⇐ <code>React.Component</code>
    * [new DataGrid()](#new_DataGrid_new)
    * [.propTypes](#DataGrid.propTypes) : <code>Object</code>
    * [.defaultProps](#DataGrid.defaultProps) : <code>Object</code>
    * [.rowGetter(i)](#DataGrid.rowGetter) ⇒ <code>Object</code>
    * [.getColumns()](#DataGrid.getColumns) ⇒ <code>Array</code>
    * [.getRowLength()](#DataGrid.getRowLength) ⇒ <code>Number</code>

<a name="new_DataGrid_new"></a>

### new DataGrid()
The DataGrid class is responsible for rendering a table component
with data passed directly via props or indirectly via the GraphQL Provider
available in the `graphql.result` prop.

The `ResponsiveWidget` class will use this component conditionally and
allow the props to be passed down. That widget component will take
into consideration sizing and layout, though the widget's grid size will
need to have enough height to support a graph and a table.

Due to the nature of the SVG charts, it is best to use the data grid
in this way with charts, though it is a stand alone component of course. 

Example columns and rows format:
```
const columns = [
 {key: 'month', name: 'Month'},
 {key: 'totalValue', name: 'Total'}
];

const rows = [
 {month: 'Janurary', totalValue: 100},
 {month: 'February', totalValue: 150}
];
```

Example usage with `ResponsiveWidget`:
```
<ResponsiveWidget dataGrid={true} dataGridData={rows} dataGridColumns={columns}>
 ...
<ResponsiveWidget />
```

<a name="DataGrid.propTypes"></a>

### DataGrid.propTypes : <code>Object</code>
The component's propTypes.

**Kind**: static property of <code>[DataGrid](#DataGrid)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| propTypes.minHeight | <code>Object</code> | The table height |
| propTypes.dataGridColumns | <code>Array</code> | The table columns |
| propTypes.dataGridData | <code>Array</code> | The table data if not from GraphQL |
| propTypes.dataGridDataKey | <code>String</code> | The key in the GraphQL result to use for the table data |

<a name="DataGrid.defaultProps"></a>

### DataGrid.defaultProps : <code>Object</code>
The component's default props.

**Kind**: static property of <code>[DataGrid](#DataGrid)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaultProps.dataGridData | <code>Array</code> | The data for the grid if not from GraphQL |

<a name="DataGrid.rowGetter"></a>

### DataGrid.rowGetter(i) ⇒ <code>Object</code>
Gets the rows for the data grid from props.
This is used by `ReactDataGrid` component.

**Kind**: static method of <code>[DataGrid](#DataGrid)</code>  
**Returns**: <code>Object</code> - The requested row  
**See**: ReactDataGrid  

| Param | Type | Description |
| --- | --- | --- |
| i | <code>Number</code> | The row index |

<a name="DataGrid.getColumns"></a>

### DataGrid.getColumns() ⇒ <code>Array</code>
Gets the columns for the data grid from props.
Note that the array of column objects must have a `key` value.
In the case of GraphQL, this key value is also used for the name
with a "humanized" transform.

**Kind**: static method of <code>[DataGrid](#DataGrid)</code>  
**Returns**: <code>Array</code> - The columns for the table  
<a name="DataGrid.getRowLength"></a>

### DataGrid.getRowLength() ⇒ <code>Number</code>
Gets the row length for the data grid from props.

**Kind**: static method of <code>[DataGrid](#DataGrid)</code>  
**Returns**: <code>Number</code> - The number of rows  
