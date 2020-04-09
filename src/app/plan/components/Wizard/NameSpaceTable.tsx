import React, { useState } from 'react';
import { FormikProps } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import {
  GridItem,
  Text,
  TextContent,
  TextVariants,
  Level,
  LevelItem,
  Pagination,
  PaginationVariant,
  DropdownDirection,
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody, TableVariant } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFilterState, usePaginationState } from '../../../common/duck/hooks';
import {
  FilterToolbar,
  FilterCategory,
  FilterType,
} from '../../../common/components/FilterToolbar';

interface INamespaceTableProps
  extends Pick<
    IOtherProps,
    | 'isEdit'
    | 'sourceClusterNamespaces'
    >,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const NamespaceTable: React.FunctionComponent<INamespaceTableProps> = ({
  setFieldValue, sourceClusterNamespaces, values
}: INamespaceTableProps) => {
  if (values.sourceCluster === null) return null;

  const filterCategories: FilterCategory[] = [
    {
      key: 'name',
      title: 'Name',
      type: FilterType.search,
      placeholderText: 'Filter by name...',
    },
  ];
  const { filterValues, setFilterValues, filteredItems } = useFilterState(sourceClusterNamespaces);
  const { currentPageItems, paginationProps } = usePaginationState(filteredItems, 10);

  const columns = [
    { title: 'Name' },
    { title: 'Pods' },
    { title: 'PV claims' },
    { title: 'Services' },
  ];

  const rows = currentPageItems.map(namespace => ({
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
      const { meta, name } = rowData;
      if (isSelected) {
        newSelected = [...new Set([...meta.selectedNamespaces, name.title])];
      } else {
        newSelected = meta.selectedNamespaces.filter(selected => selected !== name.title);
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
        <Level>
          <LevelItem>
            <FilterToolbar
              filterCategories={filterCategories}
              filterValues={filterValues}
              setFilterValues={setFilterValues}
            />
          </LevelItem>
          <LevelItem>
            <Pagination widgetId="namespace-table-pagination-top" {...paginationProps} />
          </LevelItem>
        </Level>
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
        <Level>
          <LevelItem>
            <TextContent>
              <Text
                component={TextVariants.small}
                className={spacing.mlLg}
              >{`${values.selectedNamespaces.length} selected`}</Text>
            </TextContent>
          </LevelItem>
          <LevelItem>
            <Pagination
              widgetId="namespace-table-pagination-bottom"
              variant={PaginationVariant.bottom}
              className={spacing.mtMd}
              dropDirection={DropdownDirection.up}
              {...paginationProps}
            />
          </LevelItem>
        </Level>
      </GridItem>
    </React.Fragment>
  );
};

export default NamespaceTable;
