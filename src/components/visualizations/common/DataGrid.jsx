import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'providers/GraphQL';
import ReactDataGrid from 'react-data-grid';
import S from 'string';

/**
 * The DataGrid class is responsible for rendering a table component
 * with data passed directly via props or indirectly via the GraphQL Provider
 * available in the `graphql.result` prop.
 * 
 * The `ResponsiveWidget` class will use this component conditionally and
 * allow the props to be passed down. That widget component will take
 * into consideration sizing and layout, though the widget's grid size will
 * need to have enough height to support a graph and a table.
 * 
 * Due to the nature of the SVG charts, it is best to use the data grid
 * in this way with charts, though it is a stand alone component of course. 
 * 
 * Example columns and rows format:
 * ```
 * const columns = [
 *  {key: 'month', name: 'Month'},
 *  {key: 'totalValue', name: 'Total'}
 * ];
 * 
 * const rows = [
 *  {month: 'Janurary', totalValue: 100},
 *  {month: 'February', totalValue: 150}
 * ];
 * ```
 * 
 * Example usage with `ResponsiveWidget`:
 * ```
 * <ResponsiveWidget dataGrid={true} dataGridData={rows} dataGridColumns={columns}>
 *  ...
 * <ResponsiveWidget />
 * ```
 * 
 * @class   DataGrid
 * @extends React.Component
 * @see     ResponsiveWidget
 */
class DataGrid extends Component {

  constructor(props) {
    super(props);
    this.rowGetter = this.rowGetter.bind(this);
  }

  /**
   * Gets the rows for the data grid from props.
   * This is used by `ReactDataGrid` component.
   * 
   * @method   rowGetter
   * @memberof DataGrid
   * @see      ReactDataGrid
   * @param    {Number} i The row index
   * @return   {Object}   The requested row
   */
  rowGetter(i) {
    if(this.props.dataGridData && this.props.dataGridData.length > 0) {
      return this.props.dataGridData[i];
    } else {
      return this.props.graphql.result[this.props.dataGridDataKey][i];
    }
  }

  /**
   * Gets the columns for the data grid from props.
   * Note that the array of column objects must have a `key` value.
   * In the case of GraphQL, this key value is also used for the name
   * with a "humanized" transform.
   * 
   * @method   getColumns
   * @memberof DataGrid
   * @return   {Array}    The columns for the table
   */
  getColumns() {
    if(this.props.dataGridColumns.length > 0) {
      return this.props.dataGridColumns;
    } else {
      return Object.keys(this.props.graphql.result[this.props.dataGridDataKey]).map((key) => {
        return {
          key: key, name: S.humanize(key)
        };
      });
    }
  }

  /**
   * Gets the row length for the data grid from props.
   * 
   * @method   getRowLength
   * @memberof DataGrid
   * @return   {Number} The number of rows
   */
  getRowLength() {
    if(this.props.dataGridData.length > 0) {
      return this.props.dataGridData.length;
    } else {
      return this.props.graphql.result[this.props.dataGridDataKey].length;
    }
  }

  render() {
    return (
      <div className="data-grid-wrapper">
      <ReactDataGrid
        columns={this.getColumns()}
        rowGetter={this.rowGetter}
        rowsCount={this.getRowLength()}
        minHeight={this.props.minHeight}
      />
      </div>
    );
  }
}

/**
 * The component's propTypes.
 * 
 * @memberof DataGrid
 * @type     {Object}
 * @property {Object} propTypes.minHeight       - The table height
 * @property {Array}  propTypes.dataGridColumns - The table columns
 * @property {Array}  propTypes.dataGridData    - The table data if not from GraphQL
 * @property {String} propTypes.dataGridDataKey - The key in the GraphQL result to use for the table data
 */
DataGrid.propTypes = {
  minHeight: PropTypes.number,
  dataGridColumns: PropTypes.array,
  dataGridData: PropTypes.array,
  dataGridDataKey: PropTypes.string
};

/**
 * The component's default props.
 * 
 * @memberof DataGrid
 * @type     {Object}
 * @property {Array}  defaultProps.dataGridData - The data for the grid if not from GraphQL
 */
DataGrid.defaultProps = {
  dataGridData: [],
  minHeight: 105
};

export default graphql(DataGrid);