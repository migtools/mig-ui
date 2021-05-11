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
  TextInput,
  Button,
  FlexItem,
  Flex,
} from '@patternfly/react-core';
import { sortable, TableComposable, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFilterState, useSortState } from '../../../../../common/duck/hooks';
import {
  FilterToolbar,
  FilterCategory,
  FilterType,
} from '../../../../../common/components/FilterToolbar';
import TableEmptyState from '../../../../../common/components/TableEmptyState';
import { usePaginationState } from '../../../../../common/duck/hooks/usePaginationState';
import CheckIcon from '@patternfly/react-icons/dist/js/icons/check-icon';
import TimesIcon from '@patternfly/react-icons/dist/js/icons/times-icon';
import PencilAltIcon from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import { Td } from '../Td';
const styles = require('./NamespacesTable.module').default;

interface INamespacesTableProps
  extends Pick<IOtherProps, 'sourceClusterNamespaces'>,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const NamespacesTable: React.FunctionComponent<INamespacesTableProps> = ({
  setFieldValue,
  sourceClusterNamespaces,
  values,
}: INamespacesTableProps) => {
  const [allRowsSelected, setAllRowsSelected] = React.useState(false);
  const [editableRow, setEditableRow] = React.useState(null);

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
    meta: {
      selectedNamespaces: values.selectedNamespaces,
      editedNamespaces: values.editedNamespaces,
      editableRow: editableRow,
    }, // See comments on onSelect
  }));

  const handleTextInputChange = (value, event) => {
    console.log('value, event', value, event);
  };

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
      const { meta } = rowData;
      if (isSelected) {
        newSelected = [...new Set([...meta.meta.selectedNamespaces, meta.cells[0]])];
      } else {
        newSelected = meta.selectedNamespaces.filter((selected) => selected !== meta.cells[0]);
      }
    }
    setFieldValue('selectedNamespaces', newSelected);
  };
  const onSelectAll = (event, isSelected, rowIndex, rowData) => {
    setAllRowsSelected(isSelected);

    let newSelected;
    if (isSelected) {
      newSelected = filteredItems.map((namespace) => namespace.name); // Select all (filtered)
    } else {
      newSelected = []; // Deselect all
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
            <Pagination
              widgetId="namespace-table-pagination-top"
              itemCount={paginationProps.itemCount}
              perPage={paginationProps.perPage}
              page={paginationProps.page}
              onSetPage={paginationProps.onSetPage}
              onPerPageSelect={paginationProps.onPerPageSelect}
            />
          </LevelItem>
        </Level>
        {rows.length > 0 ? (
          <TableComposable aria-label="Selectable Table">
            <Thead>
              <Tr>
                <Th
                  select={{
                    onSelect: onSelectAll,
                    isSelected: allRowsSelected,
                  }}
                />
                <Th>{columns[0].title}</Th>
                <Th>{columns[1].title}</Th>
                <Th>{columns[2].title}</Th>
                <Th>{columns[3].title}</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row, rowIndex) => {
                const isEditable = row.meta.editableRow === rowIndex;
                return (
                  <Tr key={rowIndex}>
                    <Td
                      key={`${rowIndex}_0`}
                      select={{
                        rowIndex,
                        onSelect,
                        isSelected: row.selected,
                        meta: row,
                        // disable: rowIndex === 1,
                      }}
                    />
                    {row.cells.map((cell, cellIndex) => {
                      console.log('row, rows', row, rowIndex, cell, cellIndex);
                      const shiftedIndex = cellIndex + 1;
                      if (columns[cellIndex].title === 'Name') {
                        return (
                          <div>
                            <TextInput
                              value={cell}
                              type="text"
                              onChange={handleTextInputChange}
                              aria-label="text input example"
                              isReadOnly={!isEditable}
                            />
                          </div>
                        );
                      } else {
                        return (
                          <Td
                            key={`${rowIndex}_${shiftedIndex}`}
                            dataLabel={columns[cellIndex].title}
                          >
                            {cell}
                          </Td>
                        );
                      }
                    })}
                    <Td
                      key={`${rowIndex}_5`}
                      className="pf-c-table__inline-edit-action"
                      role="cell"
                    >
                      {isEditable ? (
                        <Flex className={styles.actionsContainer} direction={{ default: 'row' }}>
                          <FlexItem flex={{ default: 'flex_1' }} className={spacing.mAuto}>
                            <span id="save-edit-icon" className="pf-c-icon pf-m-success">
                              <CheckIcon
                                type="button"
                                onClick={() => {
                                  setEditableRow(null);
                                }}
                              />
                            </span>
                          </FlexItem>
                          <FlexItem flex={{ default: 'flex_1' }} className={spacing.mAuto}>
                            <span id="inline-edit-icon" className="pf-c-icon pf-m-danger">
                              <TimesIcon
                                type="button"
                                onClick={() => {
                                  setEditableRow(null);
                                }}
                              />
                            </span>
                          </FlexItem>
                        </Flex>
                      ) : (
                        <span id="inline-edit-icon" className="pf-c-icon pf-m-default">
                          <PencilAltIcon
                            type="button"
                            onClick={() => {
                              setEditableRow(rowIndex);
                            }}
                          />
                        </span>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </TableComposable>
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
              itemCount={paginationProps.itemCount}
              perPage={paginationProps.perPage}
              page={paginationProps.page}
              onSetPage={paginationProps.onSetPage}
              onPerPageSelect={paginationProps.onPerPageSelect}
            />
          </LevelItem>
        </Level>
      </GridItem>
    </React.Fragment>
  );
};
export default NamespacesTable;
