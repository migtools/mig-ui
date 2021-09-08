import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { useDispatch } from 'react-redux';
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
  FormGroup,
  Grid,
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
import { IPlan, IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { IStateMigrationFormValues } from './StateMigrationFormik';
import { PlanActions } from '../../../../../plan/duck/actions';
import { usePausedPollingEffect } from '../../../../../common/context';
const styles = require('./StateMigrationTable.module').default;

interface IStateMigrationTableProps {
  plan: IPlan;
  onHandleClose: () => void;
}
export interface IEditedPV {
  oldName: string;
  newName: string;
  namespace: string;
  pvName: string;
}

const StateMigrationTable: React.FunctionComponent<IStateMigrationTableProps> = ({
  plan,
  onHandleClose,
}: IStateMigrationTableProps) => {
  usePausedPollingEffect();
  const dispatch = useDispatch();
  const { handleBlur, setFieldTouched, setFieldValue, values, touched, errors } =
    useFormikContext<IStateMigrationFormValues>();

  const formikSetFieldTouched = (key: any) => () => setFieldTouched(key, true, true);

  const [allRowsSelected, setAllRowsSelected] = React.useState(true);
  const [editableRow, setEditableRow] = React.useState(null);
  const currentTargetPVCNameKey = 'currentTargetPVCName';
  const hasSelectedPVs = !!values.selectedPVs.length;

  const columns = [
    { title: 'PV name', transforms: [sortable] },
    { title: 'Source PVC', transforms: [sortable] },
    { title: 'Namespace', transforms: [sortable] },
    { title: 'Storage class', transforms: [sortable] },
    { title: 'Size', transforms: [sortable] },
    { title: 'Target PVC', transforms: [sortable] },
  ];

  const getSortValues = (pv: any) => [
    null, // Column 0 has the checkboxes, sort values need to be indexed from 1
    pv.name,
    pv.pvc.name,
    pv.pvc.namespace,
    pv.selection.storageClass,
    pv.capacity,
    'target pvc name',
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
    values.persistentVolumes,
    filterCategories
  );
  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [filterValues, sortBy]);
  const rows = currentPageItems.map((pvItem: IPlanPersistentVolume) => {
    let targetPVCName = pvItem.pvc.name;
    let sourcePVCName = pvItem.pvc.name;
    let editedPV = values.editedPVs.find(
      (editedPV) =>
        editedPV.oldName === pvItem.pvc.name && editedPV.namespace === pvItem.pvc.namespace
    );

    const includesMapping = sourcePVCName.includes(':');
    if (includesMapping) {
      const mappedPVCNameArr = sourcePVCName.split(':');
      editedPV = values.editedPVs.find(
        (editedPV) =>
          editedPV.oldName === mappedPVCNameArr[0] && editedPV.namespace === pvItem.pvc.namespace
      );
      if (mappedPVCNameArr[0] === mappedPVCNameArr[1]) {
        sourcePVCName = mappedPVCNameArr[0];
        targetPVCName = editedPV ? editedPV.newName : mappedPVCNameArr[0];
      } else {
        sourcePVCName = mappedPVCNameArr[0];
        targetPVCName = editedPV ? editedPV.newName : mappedPVCNameArr[1];
      }
    }

    return {
      cells: [
        pvItem.name,
        sourcePVCName,
        pvItem.pvc.namespace,
        pvItem.selection.storageClass,
        pvItem.capacity,
        targetPVCName,
      ],
      selected: values.selectedPVs.includes(pvItem.name),
      meta: {
        selectedPVs: values.selectedPVs,
        editedPVs: values.editedPVs,
        editableRow: editableRow,
      },
    };
  });

  const onSelect = (event: any, isSelected: boolean, rowIndex: number, rowData: IRowData) => {
    if (allRowsSelected) {
      setAllRowsSelected(false);
    }
    let newSelected;
    if (rowIndex === -1) {
      if (isSelected) {
        newSelected = filteredItems.map((pv) => pv.name); // Select all (filtered)
      } else {
        newSelected = []; // Deselect all
      }
    } else {
      const { props } = rowData;
      if (isSelected) {
        newSelected = [...new Set([...props.meta.selectedPVs, props.cells[0]])];
      } else {
        newSelected = props.meta.selectedPVs.filter(
          (selected: string) => selected !== props.cells[0]
        );
      }
    }
    setFieldValue('selectedPVs', newSelected);
  };

  const onSelectAll = (event: any, isSelected: boolean, rowIndex: number, rowData: IRowData) => {
    setAllRowsSelected(isSelected);

    let newSelected;
    if (isSelected) {
      newSelected = filteredItems.map((pv) => pv.name); // Select all (filtered)
    } else {
      newSelected = []; // Deselect all
    }
    setFieldValue('selectedPVs', newSelected);
  };
  const { setQuery, query } = useDelayValidation(setFieldValue);

  const handleDelayedValidation = (val: string, row: any): any => {
    setQuery({
      name: val,
      row: row,
      fieldName: currentTargetPVCNameKey,
      functionArgs: [currentTargetPVCNameKey, { name: val, srcPVName: row.cells[0] }],
    });
  };
  return (
    <Grid>
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
              widgetId="state-migration-table-pagination-top"
              itemCount={paginationProps.itemCount}
              perPage={paginationProps.perPage}
              page={paginationProps.page}
              onSetPage={paginationProps.onSetPage}
              onPerPageSelect={paginationProps.onPerPageSelect}
            />
          </LevelItem>
        </Level>
        {rows.length > 0 ? (
          <TableComposable key="table-container" aria-label="Selectable Table">
            <Thead key="table-header">
              <Tr key="table-row">
                <Th
                  key="select-row"
                  width={10}
                  select={{
                    onSelect: onSelectAll,
                    isSelected: allRowsSelected,
                  }}
                />
                <Th key="row-1" width={15}>
                  {columns[0].title}
                </Th>
                <Th key="row-2" width={15}>
                  {columns[1].title}
                </Th>
                <Th key="row-3" width={20}>
                  {columns[2].title}
                </Th>
                <Th key="row-4" width={15}>
                  {columns[3].title}
                </Th>
                <Th key="row-5" width={10}>
                  {columns[4].title}
                </Th>
                <Th key="row-6" width={20}>
                  {columns[5].title}
                  <Popover
                    position={PopoverPosition.right}
                    bodyContent={
                      <>
                        <p className={spacing.mtMd}>
                          By default, a target pvc will have the same name as its corresponding
                          source name.
                          <br></br>
                          <br></br>
                          To change the name of the target name, click the edit icon.
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
              </Tr>
            </Thead>
            <Tbody key="table-row-body">
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
                      if (columns[cellIndex].title === 'Target PVC') {
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
                                  fieldId={currentTargetPVCNameKey}
                                  helperTextInvalid={
                                    touched.currentTargetPVCName && errors.currentTargetPVCName
                                  }
                                  validated={validatedState(
                                    touched.currentTargetPVCName,
                                    errors.currentTargetPVCName
                                  )}
                                >
                                  <TextInput
                                    name={currentTargetPVCNameKey}
                                    value={query.name}
                                    type="text"
                                    onChange={(val, e) => handleDelayedValidation(val, row)}
                                    onInput={formikSetFieldTouched(currentTargetPVCNameKey)}
                                    onBlur={handleBlur}
                                    isReadOnly={!isEditable}
                                    validated={validatedState(
                                      touched.currentTargetPVCName,
                                      errors.currentTargetPVCName
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
                            {!errors.currentTargetPVCName && (
                              <span id="save-edit-icon" className="pf-c-icon pf-m-info">
                                <CheckIcon
                                  size="md"
                                  type="button"
                                  className={styles.clickable}
                                  onClick={() => {
                                    setEditableRow(null);
                                    const hasEditedValue = values.editedPVs.find(
                                      (pv) =>
                                        row.cells[1] === pv.oldName && row.cells[2] === pv.namespace
                                    );
                                    let newEditedPVs;
                                    if (hasEditedValue) {
                                      newEditedPVs = [...new Set([...values.editedPVs])];

                                      const index = values.editedPVs.findIndex(
                                        (pv) =>
                                          pv.oldName === row.cells[1] &&
                                          pv.namespace === row.cells[2]
                                      );
                                      //check if no changes made
                                      if (
                                        newEditedPVs[index].oldName ===
                                        values.currentTargetPVCName.name
                                      ) {
                                        if (index > -1) {
                                          newEditedPVs.splice(index, 1);
                                        }
                                        //replace found edit with current edit
                                      } else if (index || index === 0) {
                                        newEditedPVs[index] = {
                                          oldName: row.cells[1],
                                          newName: values.currentTargetPVCName.name,
                                          namespace: row.cells[2],
                                          pvName: row.cells[0],
                                        };
                                      }
                                    } else {
                                      newEditedPVs = [
                                        ...new Set([
                                          ...values.editedPVs,
                                          {
                                            oldName: row.cells[1],
                                            newName: values.currentTargetPVCName.name,
                                            namespace: row.cells[2],
                                            pvName: row.cells[0],
                                          },
                                        ]),
                                      ];
                                    }
                                    setFieldValue('editedPVs', newEditedPVs);
                                    setFieldValue(currentTargetPVCNameKey, null);
                                    setFieldTouched(currentTargetPVCNameKey, false);
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
                                  setFieldValue(currentTargetPVCNameKey, null);
                                  setFieldTouched(currentTargetPVCNameKey, false);
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
                              handleDelayedValidation(row.cells[5], row);
                              setFieldValue(currentTargetPVCNameKey, {
                                name: row.cells[5],
                                srcPVName: row.cells[1],
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
              >{`${values.selectedPVs.length} selected`}</Text>
            </TextContent>
          </LevelItem>
          <LevelItem>
            <Pagination
              widgetId="state-migration-table-pagination-bottom"
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
      <GridItem>
        <Grid hasGutter>
          <GridItem>
            <Button
              className={`${spacing.mrMd}`}
              variant="primary"
              isDisabled={!hasSelectedPVs}
              onClick={() => {
                onHandleClose();
                dispatch(
                  PlanActions.runStateMigrationRequest(plan, values.editedPVs, values.selectedPVs)
                );
              }}
            >
              Migrate
            </Button>
            <Button
              className={`${spacing.mrMd}`}
              key="cancel"
              variant="secondary"
              onClick={() => onHandleClose()}
            >
              Cancel
            </Button>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};
export default StateMigrationTable;
