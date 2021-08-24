import React, { useEffect } from 'react';
import { FormikProps, useFormikContext } from 'formik';
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
  Popover,
  PopoverPosition,
  Title,
  FormGroup,
} from '@patternfly/react-core';
import {
  IRowData,
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
import CheckIcon from '@patternfly/react-icons/dist/js/icons/check-icon';
import TimesIcon from '@patternfly/react-icons/dist/js/icons/times-icon';
import PencilAltIcon from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useDelayValidation, validatedState } from '../../../../../common/helpers';
import { ISourceClusterNamespace } from '../../../../../plan/duck/types';
const styles = require('./NamespacesTable.module').default;

type INamespacesTableProps = Pick<IOtherProps, 'sourceClusterNamespaces'>;

const NamespacesTable: React.FunctionComponent<INamespacesTableProps> = ({
  sourceClusterNamespaces,
}: INamespacesTableProps) => {
  const formikSetFieldTouched = (key: any) => () => setFieldTouched(key, true, true);
  const {
    handleBlur,
    handleChange,
    setFieldTouched,
    setFieldValue,
    values,
    touched,
    errors,
    validateForm,
  } = useFormikContext<IFormValues>();

  const [allRowsSelected, setAllRowsSelected] = React.useState(false);
  const [editableRow, setEditableRow] = React.useState(null);
  const currentTargetNameKey = 'currentTargetName';

  if (values.sourceCluster === null) return null;

  const columns = [
    { title: 'Source name', transforms: [sortable] },
    { title: 'Pods', transforms: [sortable] },
    { title: 'PV claims', transforms: [sortable] },
    { title: 'Services', transforms: [sortable] },
    { title: 'Target name', transforms: [sortable] },
  ];
  const getSortValues = (namespace: any) => [
    null, // Column 0 has the checkboxes, sort values need to be indexed from 1
    namespace.name,
    namespace.podCount,
    namespace.pvcCount,
    namespace.serviceCount,
    namespace.name,
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

  const rows = currentPageItems.map((namespace: ISourceClusterNamespace) => {
    let sourceNamespaceName = namespace.name;
    let editedNamespace = values.editedNamespaces.find(
      (editedNS) => editedNS.oldName === namespace.name
      // && editedNS.someIndex === namespace.someIndex
    );
    let targetNamespaceName = editedNamespace ? editedNamespace.newName : namespace.name;
    const includesMapping = sourceNamespaceName.includes(':');
    if (includesMapping) {
      const mappedNamespaceNameArr = sourceNamespaceName.split(':');
      editedNamespace = values.editedNamespaces.find(
        (editedNS) => editedNS.oldName === mappedNamespaceNameArr[0]
        // && editedNS.someIndex === namespace.someIndex
        // && editedNS.namespace === pvItem.pvc.namespace
      );
      if (mappedNamespaceNameArr[0] === mappedNamespaceNameArr[1]) {
        sourceNamespaceName = mappedNamespaceNameArr[0];
        targetNamespaceName = editedNamespace ? editedNamespace.newName : mappedNamespaceNameArr[0];
      } else {
        sourceNamespaceName = mappedNamespaceNameArr[0];
        targetNamespaceName = editedNamespace ? editedNamespace.newName : mappedNamespaceNameArr[1];
      }
    }

    return {
      cells: [
        namespace.name,
        namespace.podCount,
        namespace.pvcCount,
        namespace.serviceCount,
        targetNamespaceName,
      ],
      selected: values.selectedNamespaces.includes(namespace.name),
      meta: {
        selectedNamespaces: values.selectedNamespaces,
        editedNamespaces: values.editedNamespaces,
        editableRow: editableRow,
      }, // See comments on onSelect
    };
  });

  const onSelect = (event: any, isSelected: boolean, rowIndex: number, rowData: IRowData) => {
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
      const { props } = rowData;
      if (isSelected) {
        newSelected = [...new Set([...props.meta.selectedNamespaces, props.cells[0]])];
      } else {
        newSelected = props.meta.selectedNamespaces.filter(
          (selected: string) => selected !== props.cells[0]
        );
      }
    }
    setFieldValue('selectedNamespaces', newSelected);
  };
  const onSelectAll = (event: any, isSelected: boolean, rowIndex: number, rowData: IRowData) => {
    setAllRowsSelected(isSelected);

    let newSelected;
    if (isSelected) {
      newSelected = filteredItems.map((namespace) => namespace.name); // Select all (filtered)
    } else {
      newSelected = []; // Deselect all
    }
    setFieldValue('selectedNamespaces', newSelected);
  };
  const { setQuery, query } = useDelayValidation(setFieldValue);
  const handleDelayedValidation = (val: string, row: any): any => {
    setQuery({
      name: val,
      row: row,
      fieldName: currentTargetNameKey,
    });
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
                  width={10}
                  select={{
                    onSelect: onSelectAll,
                    isSelected: allRowsSelected,
                  }}
                />
                <Th width={20}>{columns[0].title}</Th>
                <Th width={10}>{columns[1].title}</Th>
                <Th width={10}>{columns[2].title}</Th>
                <Th width={10}>{columns[3].title}</Th>
                <Th width={30}>
                  {columns[4].title}
                  <Popover
                    position={PopoverPosition.right}
                    bodyContent={
                      <>
                        <p className={spacing.mtMd}>
                          By default, a target namespace will have the same name as its
                          corresponding source namespace.
                          <br></br>
                          <br></br>
                          To change the name of the target namespace, click the edit icon.
                        </p>
                      </>
                    }
                    aria-label="edit-target-ns-details"
                    closeBtnAriaLabel="close--details"
                    maxWidth="30rem"
                  >
                    <span className={`${spacing.mlSm} pf-c-icon pf-m-info`}>
                      <OutlinedQuestionCircleIcon
                        className="pf-c-icon pf-m-default"
                        size="sm"
                      ></OutlinedQuestionCircleIcon>
                    </span>
                  </Popover>
                </Th>
                <Th width={20}></Th>
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
                        props: row,
                      }}
                    />
                    {row.cells.map((cell, cellIndex) => {
                      const shiftedIndex = cellIndex + 1;
                      if (columns[cellIndex].title === 'Target name') {
                        return (
                          <>
                            {!isEditable ? (
                              <Td
                                key={`${rowIndex}_${shiftedIndex}`}
                                dataLabel={columns[cellIndex].title}
                              >
                                {cell}
                              </Td>
                            ) : (
                              <Td
                                key={`${rowIndex}_${shiftedIndex}`}
                                dataLabel={columns[cellIndex].title}
                              >
                                <FormGroup
                                  isRequired
                                  fieldId={currentTargetNameKey}
                                  helperTextInvalid={
                                    touched.currentTargetName && errors.currentTargetName
                                  }
                                  validated={validatedState(
                                    touched.currentTargetName,
                                    errors.currentTargetName
                                  )}
                                >
                                  <TextInput
                                    name={currentTargetNameKey}
                                    // value={values.currentTargetName.name}
                                    value={query.name}
                                    type="text"
                                    // onChange={(val, e) => {
                                    //   setFieldValue(currentTargetNameKey, {
                                    //     name: val,
                                    //     srcName: row.cells[0],
                                    //   });
                                    // }}
                                    onChange={(val, e) => handleDelayedValidation(val, row)}
                                    onInput={formikSetFieldTouched(currentTargetNameKey)}
                                    onBlur={handleBlur}
                                    isReadOnly={!isEditable}
                                    validated={validatedState(
                                      touched.currentTargetName,
                                      errors.currentTargetName
                                    )}
                                  />
                                </FormGroup>
                              </Td>
                            )}
                          </>
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
                      width={10}
                    >
                      {isEditable ? (
                        <Flex className={styles.actionsContainer} direction={{ default: 'row' }}>
                          <FlexItem flex={{ default: 'flex_1' }}>
                            {!errors.currentTargetName && (
                              <span id="save-edit-icon" className="pf-c-icon pf-m-info">
                                <CheckIcon
                                  size="md"
                                  type="button"
                                  className={styles.clickable}
                                  onClick={() => {
                                    setEditableRow(null);
                                    const hasEditedValue = values.editedNamespaces.find(
                                      (ns) => row.cells[0] === ns.oldName
                                    );
                                    let newEditedNamespaces;
                                    if (hasEditedValue) {
                                      newEditedNamespaces = [
                                        ...new Set([...values.editedNamespaces]),
                                      ];

                                      const index = values.editedNamespaces.findIndex(
                                        (ns) => ns.oldName === row.cells[0]
                                      );
                                      //check if no changes made
                                      if (
                                        newEditedNamespaces[index].oldName ===
                                        values.currentTargetName.name
                                      ) {
                                        if (index > -1) {
                                          newEditedNamespaces.splice(index, 1);
                                        }
                                        //replace found edit with current edit
                                      } else if (index || index === 0) {
                                        newEditedNamespaces[index] = {
                                          oldName:
                                            typeof row.cells[0] === 'string' ? row.cells[0] : '',
                                          newName: values.currentTargetName.name,
                                        };
                                      }
                                    } else {
                                      newEditedNamespaces = [
                                        ...new Set([
                                          ...values.editedNamespaces,
                                          {
                                            oldName: row.cells[0],
                                            newName: values.currentTargetName.name,
                                          },
                                        ]),
                                      ];
                                    }
                                    setFieldValue('editedNamespaces', newEditedNamespaces);
                                    setFieldValue(currentTargetNameKey, null);
                                    setFieldTouched(currentTargetNameKey, false);
                                  }}
                                />
                              </span>
                            )}
                            <span
                              id="inline-edit-icon"
                              className={`${spacing.mlSm} pf-c-icon pf-m-danger`}
                            >
                              <TimesIcon
                                size="md"
                                className={styles.clickable}
                                type="button"
                                onClick={() => {
                                  setEditableRow(null);
                                  setFieldValue(currentTargetNameKey, null);
                                  setFieldTouched(currentTargetNameKey, false);
                                }}
                              />
                            </span>
                          </FlexItem>
                        </Flex>
                      ) : (
                        <span id="inline-edit-icon" className="pf-c-icon pf-m-default">
                          <PencilAltIcon
                            className={styles.clickable}
                            type="button"
                            size="md"
                            onClick={() => {
                              setEditableRow(rowIndex);
                              handleDelayedValidation(
                                typeof row.cells[4] === 'string' ? row.cells[4] : '',
                                row
                              );
                              setFieldValue(currentTargetNameKey, {
                                name: row.cells[4],
                                srcName: row.cells[0],
                              });
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
