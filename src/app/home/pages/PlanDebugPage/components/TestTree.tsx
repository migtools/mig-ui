import React, { useState } from 'react';
import { Table, TableHeader, TableBody, headerCol, treeRow } from '@patternfly/react-table';
import { table } from 'console';
interface ITreeTableProps {
  filteredTreeData: any;
}

export const TreeTable: React.FunctionComponent<ITreeTableProps> = ({ filteredTreeData }) => {
  //   buildRows: ([x, ...xs]: [any, ...any[]], level: any, posinset: any, isHidden?: boolean) => any[];
  //   onCollapse: (event: any, rowIndex: any, title: any) => void;
  //   onCheckChange: (event: any, checked: any, rowIndex: any, title: any) => void;
  //   state: any;
  //   prevState: any;
  const [expandedRows, setExpandedRows] = useState([]);
  const buildRows = ([x, ...xs], level, posinset, isHidden = false) => {
    if (x) {
      const isExpanded = expandedRows.includes(x.id);
      return [
        {
          cells: [x.id, x.name, x.dropdown],
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
      cells={[{ title: 'ID', cellTransforms: [treeRow(onCollapse)] }, 'Name', 'Action']}
      rows={buildRows(filteredTreeData, 1, 1)}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
