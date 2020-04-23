import React, { useEffect } from 'react';
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
import { Table, TableHeader, TableBody, TableVariant, sortable } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFilterState, useSortState, usePaginationState } from '../../../common/duck/hooks';
import {
  FilterToolbar,
  FilterCategory,
  FilterType,
} from '../../../common/components/FilterToolbar';
import TableEmptyState from '../../../common/components/TableEmptyState';

interface INamespaceTableProps
  extends Pick<IOtherProps, 'sourceClusterNamespaces'>,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const NamespaceTable: React.FunctionComponent<INamespaceTableProps> = ({
  setFieldValue,
  sourceClusterNamespaces,
  values,
}: INamespaceTableProps) => {
  if (values.sourceCluster === null) return null;

  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Pods', transforms: [sortable] },
    { title: 'PV claims', transforms: [sortable] },
    { title: 'Services', transforms: [sortable] },
  ];
  const getSortValues = (namespace) => [
    null, // Column 0 has the checkboxes, sort values need to be indexed from 1
    namespace.name,
    namespace.podCount,
    namespace.pvcCount,
    namespace.serviceCount,
  ];
  const filterCategories: FilterCategory[] = [
    {
      key: 'name',
      title: 'Name',
      type: FilterType.search,
      placeholderText: 'Filter by name...',
    },
  ];
  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    sourceClusterNamespaces,
    filterCategories
  );
  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [filterValues, sortBy]);

  const rows = currentPageItems.map((namespace) => ({
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
        newSelected = filteredItems.map((namespace) => namespace.name); // Select all (filtered)
      } else {
        newSelected = []; // Deselect all
      }
    } else {
      const { meta, name } = rowData;
      if (isSelected) {
        newSelected = [...new Set([...meta.selectedNamespaces, name.title])];
      } else {
        newSelected = meta.selectedNamespaces.filter((selected) => selected !== name.title);
      }
    }
    setFieldValue('selectedNamespaces', newSelected);
  };

  return (
    <React.Fragment>
      <GridItem>
        <TextContent className={spacing.mtMd}>
          <Text component={TextVariants.p}>Select projects to be migrated</Text>
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
        {rows.length > 0 ? (
          <Table
            aria-label="Projects table"
            variant={TableVariant.compact}
            cells={columns}
            rows={rows}
            sortBy={sortBy}
            onSort={onSort}
            onSelect={onSelect}
            canSelectAll
          >
            <TableHeader />
            <TableBody />
          </Table>
        ) : (
          <TableEmptyState onClearFiltersClick={() => setFilterValues({})} />
        )}
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
