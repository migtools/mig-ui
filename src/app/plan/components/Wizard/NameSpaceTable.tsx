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

  if (values.sourceCluster === null) return null;

  /*
  update formik when local state changes -- no need
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
  */

  /* initialize local state from formik -- no need
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
  */

  /* update local state on select all -- no need?
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
  */

  /* update local state on select -- update formik directly instead
  const selectRow = rowId => {
    const newSelected = Object.assign({}, checkedNamespaceRows);
    newSelected[rowId] = !checkedNamespaceRows[rowId];
    setCheckedNamespaceRows(newSelected);
    setSelectAll(2);
  };
  */

  const columns = [
    { title: 'Name' },
    { title: 'Pods' },
    { title: 'PV claims' },
    { title: 'Services' },
  ];
  const rows = sourceClusterNamespaces.map(namespace => ({
    cells: [namespace.name, namespace.podCount, namespace.pvcCount, namespace.serviceCount],
    selected: values.selectedNamespaces.includes(namespace.name),
  }));

  const onSelect = (event, isSelected, rowIndex) => {
    console.log('was already selected?', values.selectedNamespaces);
    let newSelected;
    if (rowIndex === -1) {
      if (isSelected) {
        newSelected = sourceClusterNamespaces.map(namespace => namespace.name); // Select all
      } else {
        newSelected = []; // Deselect all
      }
    } else {
      const thisNamespace = sourceClusterNamespaces[rowIndex];
      if (isSelected) {
        console.log('New shit:', [...values.selectedNamespaces, thisNamespace.name]);
        newSelected = [...new Set([...values.selectedNamespaces, thisNamespace.name])];
      } else {
        newSelected = values.selectedNamespaces.filter(name => name !== thisNamespace.name);
      }
    }
    setFieldValue('selectedNamespaces', newSelected);
  };

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
          onSelect={onSelect}
          canSelectAll
        >
          <TableHeader />
          <TableBody />
        </Table>
      </GridItem>
    </React.Fragment>
  );
};

export default NamespaceTable;
