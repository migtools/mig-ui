import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
const styles = require('./LogItem.module');
import { Grid } from '@patternfly/react-core';

const LogItem = ({ log }) => {
  const logConverted = log.map((item) => ({ value: item }));
  const columns = [{
    Header: '', accessor: 'value'
  }];


  return (
    <Grid gutter='md' className={styles.container}>
      <ReactTable
        filterable
        defaultFilterMethod={(filter, row) => {
          return row[filter.id].includes(filter.value);
        }
        }
        defaultPageSize={200}
        style={{ height: `${0.6 * window.innerHeight}px`, textAlign: 'left' }}
        columns={columns}
        data={logConverted}
        className="-highlight"
      />
    </Grid>
  );
};

export default LogItem;
