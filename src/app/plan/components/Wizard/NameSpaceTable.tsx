import React from 'react';
import { GridItem, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

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
  const { setFieldValue, sourceClusterNamespaces, values } = props;

  if (values.sourceCluster === null) return null;

  const columns = [
    { title: 'Name' },
    { title: 'Pods' },
    { title: 'PV claims' },
    { title: 'Services' },
  ];
  const rows = sourceClusterNamespaces.map(namespace => ({
    cells: [namespace.name, namespace.podCount, namespace.pvcCount, namespace.serviceCount],
    selected: values.selectedNamespaces.includes(namespace.name),
    meta: { selectedNamespaces: values.selectedNamespaces }, // See comments on onSelect
  }));

  const onSelect = (event, isSelected, rowIndex, rowData) => {
    // Because of a bug in Table where a shouldComponentUpdate method is too strict,
    // when onSelect is called it may not be the one from the scope of the latest render.
    // So, it is not safe to reference the current selection state directly from the outer scope.
    // This is why we use rowData.meta.selectedNamespaces instead of values.selectedNamespaces.
    let newSelected;
    if (rowIndex === -1) {
      if (isSelected) {
        newSelected = sourceClusterNamespaces.map(namespace => namespace.name); // Select all
      } else {
        newSelected = []; // Deselect all
      }
    } else {
      const { selectedNamespaces } = rowData.meta;
      const thisNamespace = sourceClusterNamespaces[rowIndex];
      if (isSelected) {
        newSelected = [...new Set([...selectedNamespaces, thisNamespace.name])];
      } else {
        newSelected = selectedNamespaces.filter(name => name !== thisNamespace.name);
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
