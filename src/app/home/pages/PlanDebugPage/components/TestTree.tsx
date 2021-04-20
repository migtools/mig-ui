import React, { useState } from 'react';
import { Table, TableHeader, TableBody, headerCol, treeRow } from '@patternfly/react-table';
import { table } from 'console';

export const TreeTable: React.FunctionComponent = (props: any) => {
  const { filteredTreeData } = props;
  //   buildRows: ([x, ...xs]: [any, ...any[]], level: any, posinset: any, isHidden?: boolean) => any[];
  //   onCollapse: (event: any, rowIndex: any, title: any) => void;
  //   onCheckChange: (event: any, checked: any, rowIndex: any, title: any) => void;
  //   state: any;
  //   prevState: any;
  const [expandedRows, setExpandedRows] = useState([]);
  const [tableTreeData, setTableTreeData] = useState([
    {
      repositories: 'Repositories one',
      branches: <span> testing this </span>,
      pullRequests: 'Pull request one',
      workspaces: 'Workplace one',
      children: [
        {
          repositories: 'Repositories two',
          branches: 'Branch two',
          pullRequests: 'Pull request two',
          workspaces: 'Workplace two',
          children: [
            {
              repositories: 'Repositories three',
              branches: 'Branch three',
              pullRequests: 'Pull request three',
              workspaces: 'Workplace three',
            },
          ],
        },
        {
          repositories: 'Repositories four',
          branches: 'Branch four',
          pullRequests: 'Pull request four',
          workspaces: 'Workplace four',
        },
        {
          repositories: 'Repositories five',
          branches: 'Branch five',
          pullRequests: 'Pull request five',
          workspaces: 'Workplace five',
        },
      ],
    },
    {
      repositories: 'Repositories six',
      branches: 'Branch six',
      pullRequests: 'Pull request six',
      workspaces: 'Workplace six',
      children: [
        {
          repositories: 'Repositories seven',
          branches: 'Branch seven',
          pullRequests: 'Pull request seven',
          workspaces: 'Workplace seven',
        },
      ],
    },
    {
      repositories: 'Repositories eight',
      branches: 'Branch eight',
      pullRequests: 'Pull request eight',
      workspaces: 'Workplace eight',
    },
  ]);
  //   expandedRows: ['Repositories one', 'Repositories six'],
  //   checkedRows: [],

  /** 
      Recursive function which flattens the data into an array flattened IRow objects 
      to be passed to the `rows` prop of the Table
      params: 
        - rowData - array of data
        - level - number representing how deeply nested the current row is
        - posinset - position of the row relative to this row's siblings
        - isHidden - defaults to false, true if this row's parent is expanded
    */
  const buildRows = ([x, ...xs], level, posinset, isHidden = false) => {
    if (x) {
      const isExpanded = expandedRows.includes(x.id);
      return [
        {
          cells: [x.id, x.name],
          props: {
            isExpanded,
            isHidden,
            'aria-level': level,
            'aria-posinset': posinset,
            'aria-setsize': x.children ? x.children.length : 0,
          },
        },
        ...(x.children && x.children.length
          ? buildRows(x.children, level + 1, 1, !isExpanded || isHidden)
          : []),
        // @ts-ignore
        ...buildRows(xs, level, posinset + 1, isHidden),
      ];
    }
    return [];
  };

  const onCollapse = (event, rowIndex, title) => {
    setExpandedRows((expandedRows) => {
      // Object.assign would also work
      const openedIndex = expandedRows.indexOf(title);
      const newExpandedRows =
        openedIndex === -1 ? [...expandedRows, title] : expandedRows.filter((o) => o !== title);
      return newExpandedRows;
    });
  };

  return (
    <Table
      isTreeTable
      aria-label="Tree table"
      cells={[{ title: 'ID', cellTransforms: [treeRow(onCollapse)] }, 'Name']}
      //@ts-ignore
      rows={buildRows(filteredTreeData, 1, 1)}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
