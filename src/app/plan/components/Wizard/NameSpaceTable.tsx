import React, { useState, useEffect } from 'react';
import { GridItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

const styles = require('./NamespaceTable.module');
interface INamespaceTableProps {
  isEdit: boolean;
  values: any;
  sourceClusterNamespaces: [
    {
      name: string;
      podCount: number;
      pvcCount: number;
      serviceCount: number;
    }
  ];
  setFieldValue: (fieldName, fieldValue) => void;
}

const NamespaceTable: React.FunctionComponent<INamespaceTableProps> = props => {
  const { isEdit, setFieldValue, sourceClusterNamespaces, values } = props;
  const [checkedNamespaceRows, setCheckedNamespaceRows] = useState({});
  const [selectAll, setSelectAll] = useState(0);

  useEffect(() => {
    if (sourceClusterNamespaces.length > 0) {
      const formValuesForNamespaces = sourceClusterNamespaces
        .filter(item => {
          const keys = Object.keys(checkedNamespaceRows);

          for (const key of keys) {
            if (item.name === key && checkedNamespaceRows[key]) {
              return item;
            }
          }
        })
        .map(namespace => namespace.name);

      setFieldValue('selectedNamespaces', formValuesForNamespaces);
    }
  }, [checkedNamespaceRows]);

  useEffect(() => {
    if (values.selectedNamespaces.length > 0 && sourceClusterNamespaces.length > 0) {
      const newSelected = Object.assign({}, checkedNamespaceRows);
      values.selectedNamespaces.filter((item, _) => {
        for (let i = 0; sourceClusterNamespaces.length > i; i++) {
          if (item === sourceClusterNamespaces[i].name) {
            newSelected[item] = true;
          }
        }
      });
      setCheckedNamespaceRows(newSelected);
    }
  }, [sourceClusterNamespaces]);

  const toggleSelectAll = () => {
    const newSelected = {};

    if (selectAll === 0) {
      sourceClusterNamespaces.forEach(item => {
        newSelected[item.name] = true;
      });
    }
    setSelectAll(selectAll === 0 ? 1 : 0);
    setCheckedNamespaceRows(newSelected);
  };

  const selectRow = rowId => {
    const newSelected = Object.assign({}, checkedNamespaceRows);
    newSelected[rowId] = !checkedNamespaceRows[rowId];
    setCheckedNamespaceRows(newSelected);
    setSelectAll(2);
  };

  if (values.sourceCluster !== null) {
    console.log({ sourceClusterNamespaces });

    const columns = [
      { title: 'Name' },
      { title: 'Pods' },
      { title: 'PV claims' },
      { title: 'Services' },
    ];
    const rows = sourceClusterNamespaces.map(namespace => ({
      cells: [namespace.name, namespace.podCount, namespace.pvcCount, namespace.serviceCount],
    }));

    return (
      <React.Fragment>
        <GridItem>
          <TextContent className={spacing.mtMd}>
            <Text component={TextVariants.p}>Select projects to be migrated:</Text>
          </TextContent>
        </GridItem>
        <GridItem>
          <Table
            aria-label="Projects table"
            variant={TableVariant.compact}
            cells={columns}
            rows={rows}
            // onSelect={() => {}}
            // canSelectAll
          >
            <TableHeader />
            <TableBody />
          </Table>
        </GridItem>
      </React.Fragment>
    );
  } else {
    return null;
  }
};

export default NamespaceTable;
