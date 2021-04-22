import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, headerCol, treeRow } from '@patternfly/react-table';
interface ITreeTableProps {
  filteredTreeData: any;
}

export const DebugTree: React.FunctionComponent<ITreeTableProps> = ({ filteredTreeData }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [builtRows, setBuiltRows] = useState([]);

  useEffect(() => {
    const buildRows = ([x, ...xs], level, posinset, isHidden = false) => {
      console.log('buildRows');
      if (x) {
        const isExpanded = expandedRows.includes(x.id);
        return [
          {
            cells: [x.id, x.kind, x.namespace, x.status, x.dropdown],
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
    setBuiltRows(buildRows(filteredTreeData, 1, 1));
  }, [filteredTreeData]);

  const onCollapse = (event, rowIndex, title) => {
    console.log('onCollapse');
    setExpandedRows((expandedRows) => {
      const openedIndex = expandedRows.indexOf(title);
      const newExpandedRows =
        openedIndex === -1 ? [...expandedRows, title] : expandedRows.filter((o) => o !== title);
      return newExpandedRows;
    });
  };
  console.log('debug tree rendering');
  return (
    <Table
      isTreeTable
      aria-label="Tree table"
      cells={[
        { title: 'ID', cellTransforms: [treeRow(onCollapse)] },
        'Kind',
        'Namespace',
        'Status',
        'Action',
      ]}
      rows={builtRows}
      // rows={buildRows(filteredTreeData, 1, 1)}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};
