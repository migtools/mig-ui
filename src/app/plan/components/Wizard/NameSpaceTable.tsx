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

  useEffect(() => {
    console.log('>>>>>>>>>>> SELECTED NAMESPACES CHANGED', values.selectedNamespaces);
  }, [values.selectedNamespaces]);

  const currentSelected = JSON.parse(JSON.stringify(values.selectedNamespaces));
  console.log('>>> -- selected namespaces at render time?', currentSelected);

  const columns = [
    { title: 'Name' },
    { title: 'Pods' },
    { title: 'PV claims' },
    { title: 'Services' },
  ];
  const rows = sourceClusterNamespaces.map(namespace => ({
    cells: [namespace.name, namespace.podCount, namespace.pvcCount, namespace.serviceCount],
    selected: currentSelected.includes(namespace.name),
  }));

  const onSelect = (event, isSelected, rowIndex) => {
    console.log('=========  SELECT  ============');
    console.log('??? -- selected namespaces at select time?', [...currentSelected]);
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
        newSelected = [...new Set([...currentSelected, thisNamespace.name])];
      } else {
        newSelected = currentSelected.filter(name => name !== thisNamespace.name);
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
