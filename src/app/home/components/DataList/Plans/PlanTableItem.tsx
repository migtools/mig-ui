import React, { useState } from 'react';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../../../theme';
import {
  Button,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
} from '@patternfly/react-core';

import {
  Table,
  TableHeader,
  TableBody,
  //@ts-ignore
  compoundExpand,
} from '@patternfly/react-table';

const PlanTableItem = ({ rows, onExpand, columns, ...props }) => {
  return (
    <Table
      key="id"
      caption="Compound expandable table"
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
