import React from 'react';

import {
  Table,
  TableHeader,
  TableBody,
  //@ts-ignore
} from '@patternfly/react-table';

const PlanTableItem = ({ rows, onExpand, columns }) => {
  return (
    <Table
      key="id"
      onExpand={onExpand}
      rows={rows}
      //@ts-ignore
      cells={columns}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export default PlanTableItem;
