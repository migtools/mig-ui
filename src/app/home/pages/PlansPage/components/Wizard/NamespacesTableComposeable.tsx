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
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  sortable,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFilterState, useSortState } from '../../../../../common/duck/hooks';
import {
  FilterToolbar,
  FilterCategory,
  FilterType,
} from '../../../../../common/components/FilterToolbar';
import TableEmptyState from '../../../../../common/components/TableEmptyState';
import { usePaginationState } from '../../../../../common/duck/hooks/usePaginationState';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import CheckIcon from '@patternfly/react-icons/dist/js/icons/check-icon';
import TimesIcon from '@patternfly/react-icons/dist/js/icons/times-icon';
import PencilAltIcon from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';

interface INamespacesTableProps
  extends Pick<IOtherProps, 'sourceClusterNamespaces'>,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const NamespacesTableComposeable: React.FunctionComponent<INamespacesTableProps> = ({
  setFieldValue,
  sourceClusterNamespaces,
  values,
}: INamespacesTableProps) => {
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

  // const columns = ['Repositories', 'Branches', 'Pull requests', 'Workspaces', 'Last commit'];
  // const rows = [
  //   ['one', 'two', 'a', 'four', 'five'],
  //   ['a', 'two', 'k', 'four', 'five'],
  //   ['p', 'two', 'b', 'four', 'five'],
  // ];
  const [allRowsSelected, setAllRowsSelected] = React.useState(false);
  const [selected, setSelected] = React.useState(rows.map((row) => false));
  const onSelect = (event, isSelected, rowId) => {
    setSelected(selected.map((sel, index) => (index === rowId ? isSelected : sel)));
    if (!isSelected && allRowsSelected) {
      setAllRowsSelected(false);
    } else if (isSelected && !allRowsSelected) {
      let allSelected = true;
      for (let i = 0; i < selected.length; i++) {
        if (i !== rowId) {
          if (!selected[i]) {
            allSelected = false;
          }
        }
      }
      if (allSelected) {
        setAllRowsSelected(true);
      }
    }
  };
  const onSelectAll = (event, isSelected) => {
    setAllRowsSelected(isSelected);
    setSelected(selected.map((sel) => isSelected));
  };
  return (
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
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, rowIndex) => (
          <Tr key={rowIndex}>
            <Td
              key={`${rowIndex}_0`}
              select={{
                rowIndex,
                onSelect,
                isSelected: selected[rowIndex],
                disable: rowIndex === 1,
              }}
            />
            {row.cells.map((cell, cellIndex) => {
              const shiftedIndex = cellIndex + 1;
              if (columns[cellIndex].title === 'Name') {
                return (
                  <div>
                    {/* <div className="pf-c-inline-edit__value">Text input description content</div> */}
                    {/* <div className="pf-c-inline-edit__input"> */}
                    {/* <input
                        className="pf-c-form-control"
                        type="text"
                        value="Text input description content"
                        id="bulk-edit-table-example-row-1-text-input"
                        aria-label="Text input"
                      /> */}
                    <TextInput
                      value={cell}
                      type="text"
                      // onChange={handleTextInputChange}
                      aria-label="text input example"
                      isReadOnly={true}
                    />
                    {/* </div> */}
                  </div>
                );
              } else {
                return (
                  <Td key={`${rowIndex}_${shiftedIndex}`} dataLabel={columns[cellIndex].title}>
                    {cell}
                  </Td>
                );
              }
            })}
            <Td key={`${rowIndex}_5`} className="pf-c-table__inline-edit-action" role="cell">
              {/* <span id="save-edit-icon" className="pf-c-icon pf-m-success">
                <CheckIcon
                  type="button"
                  onClick={() => {
                    console.log('success');
                  }}
                />
              </span>
              <span id="inline-edit-icon" className="pf-c-icon pf-m-danger">
                <TimesIcon
                  type="button"
                  onClick={() => {
                    console.log('ping me');
                  }}
                />
              </span> */}
              <span id="inline-edit-icon" className="pf-c-icon pf-m-default">
                <PencilAltIcon
                  type="button"
                  onClick={() => {
                    console.log('ping me');
                  }}
                />
              </span>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};
export default NamespacesTableComposeable;
