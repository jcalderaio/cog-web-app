import React from 'react';
import ReactTable from 'react-table';
import { CSVLink } from 'react-csv';

export default function DataTable(props) {
  const { data = [], columns = [], pageSize = 10, csv = true, csvFile = 'data-export.csv' } = props;
  const csvHeaders = columns.map(e => e.Header);
  const csvAccessors = columns.map(e => e.accessor);
  const csvData = [csvHeaders, ...data.map(e => csvAccessors.map(a => e[a]))];
  return (
    <div>
      <ReactTable data={data} columns={columns} defaultPageSize={pageSize} className="-striped -highlight" />
      {csv && (
        <div>
          <br />
          <CSVLink data={csvData} filename={csvFile} className="btn btn-primary" target="_blank">
            Download CSV
          </CSVLink>
        </div>
      )}
    </div>
  );
}
