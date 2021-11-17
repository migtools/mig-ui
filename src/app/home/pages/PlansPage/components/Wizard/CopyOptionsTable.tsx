import React, { useState } from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  Title,
  Grid,
  GridItem,
  TextContent,
  Text,
  TextVariants,
  Spinner,
  Level,
  LevelItem,
  Pagination,
  PaginationVariant,
  Checkbox,
  Tooltip,
  TooltipPosition,
  Modal,
  Button,
  BaseSizes,
  Flex,
  FlexItem,
  FormGroup,
  Popover,
  PopoverPosition,
  TextInput,
} from '@patternfly/react-core';
import {
  Table,
  TableVariant,
  TableHeader,
  TableBody,
  sortable,
  truncate,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import QuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFilterState, useSortState } from '../../../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';
import { capitalize } from '../../../../../common/duck/utils';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import {
  FilterCategory,
  FilterType,
  FilterToolbar,
} from '../../../../../common/components/FilterToolbar';
import TableEmptyState from '../../../../../common/components/TableEmptyState';
import { IMigPlanStorageClass } from '../../../../../plan/duck/types';
import { PvCopyMethod, IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { usePaginationState } from '../../../../../common/duck/hooks/usePaginationState';
import {
  OutlinedQuestionCircleIcon,
  CheckIcon,
  TimesIcon,
  PencilAltIcon,
} from '@patternfly/react-icons';
import { useDelayValidation, validatedState } from '../../../../../common/helpers';
import { useFormikContext } from 'formik';

interface ICopyOptionsTableProps
  extends Pick<IOtherProps, 'isFetchingPVList' | 'currentPlan'>,
    Pick<
      IFormValues,
      | 'persistentVolumes'
      | 'pvStorageClassAssignment'
      | 'pvVerifyFlagAssignment'
      | 'pvCopyMethodAssignment'
    > {
  storageClasses: IMigPlanStorageClass[];
  onStorageClassChange: (currentPV: IPlanPersistentVolume, value: string) => void;
  onVerifyFlagChange: (currentPV: IPlanPersistentVolume, value: boolean) => void;
  onCopyMethodChange: (currentPV: IPlanPersistentVolume, value: string) => void;
}

enum VerifyWarningState {
  Unread = 'Unread',
  Open = 'Open',
  Dismissed = 'Dismissed',
}

const storageClassToString = (storageClass: IMigPlanStorageClass) =>
  storageClass && `${storageClass.name}:${storageClass.provisioner}`;

const CopyOptionsTable: React.FunctionComponent<ICopyOptionsTableProps> = ({
  isFetchingPVList,
  currentPlan,
  persistentVolumes,
  pvStorageClassAssignment,
  pvVerifyFlagAssignment,
  pvCopyMethodAssignment,
  storageClasses,
  onStorageClassChange,
  onVerifyFlagChange,
}: ICopyOptionsTableProps) => {
  const formikSetFieldTouched = (key: any) => () => setFieldTouched(key, true, true);
  const styles = require('./CopyOptionsTable.module').default;

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

  if (isFetchingPVList) {
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.small}>
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>
          <Title headingLevel="h2" size="xl">
            Discovering storage classes...
          </Title>
        </EmptyState>
      </Bullseye>
    );
  }

  const [verifyWarningState, setVerifyWarningState] = useState(VerifyWarningState.Unread);
  const [editableRow, setEditableRow] = React.useState(null);
  const currentTargetPVCNameKey = 'currentTargetPVCName';

  const columns = [
    { title: 'PV name', transforms: [sortable, truncate] },
    { title: 'Source PVC', transforms: [sortable, truncate] },
    { title: 'Source storage class', transforms: [sortable, truncate] },
    { title: 'Target PVC', transforms: [sortable, truncate] },
    { title: 'Target storage class', transforms: [sortable, truncate] },
    {
      title: (
        <React.Fragment>
          Verify copy{' '}
          <Tooltip
            position={TooltipPosition.top}
            isContentLeftAligned
            content={
              <div>
                Checksum verification is available for PVs that will be copied using a filesystem
                copy method. Each file is verified with a checksum, which significantly reduces
                performance. See the product documentation for more information.
              </div>
            }
          >
            <QuestionCircleIcon />
          </Tooltip>
        </React.Fragment>
      ),
      transforms: [sortable, truncate],
    },
  ];
  const getSortValues = (pv: IPlanPersistentVolume) => [
    pv.name,
    pv.pvc.name,
    pv.storageClass,
    'targetPVCName',
    // targetPVCToString(targetPVCName[pv.name]),
    storageClassToString(pvStorageClassAssignment[pv.name]),
    pvVerifyFlagAssignment[pv.name],
  ];
  const filterCategories: FilterCategory[] = [
    {
      key: 'name',
      title: 'PV name',
      type: FilterType.search,
      placeholderText: 'Filter by PV name...',
    },
    {
      key: 'sourcePVC',
      title: 'Source PVC',
      type: FilterType.search,
      placeholderText: 'Filter by source PVC name...',
    },
    {
      key: 'sourceSC',
      title: 'Source storage class',
      type: FilterType.search,
      placeholderText: 'Filter by source storage class...',
    },
    {
      key: 'targetPVC',
      title: 'Target PVC',
      type: FilterType.search,
      placeholderText: 'Filter by target PVC name...',
    },
    {
      key: 'targetStorageClass',
      title: 'Target storage class',
      type: FilterType.search,
      placeholderText: 'Filter by target storage class...',
      getItemValue: (pv) => storageClassToString(pvStorageClassAssignment[pv.name]),
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    persistentVolumes,
    filterCategories
  );
  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, paginationProps } = usePaginationState(sortedItems, 10);

  const rows = currentPageItems.map((pv: IPlanPersistentVolume) => {
    const currentPV = currentPlan?.spec?.persistentVolumes?.find(
      (planPV) => planPV.name === pv.name
    );
    const currentStorageClass = pvStorageClassAssignment[pv.name];

    const noneOption = { value: '', toString: () => 'None' };
    const storageClassOptions: OptionWithValue[] = [
      ...storageClasses.map((storageClass) => ({
        value: storageClass !== '' && storageClass.name,
        toString: () => storageClassToString(storageClass),
      })),
      noneOption,
    ];

    // const isIntraClusterMigration = values.sourceCluster === values.targetCluster;
    // const initialTargetPVCName = isIntraClusterMigration ? `${pv.name}_new` : pv.name;
    // const editedPVCs = values.editedPVCs.find((editedPVC) => editedPVC.name === pv.pvc.name);

    // const targetPVCName = editedPVC ? editedPVC.newName : initialTargetPVCName;
    const isVerifyCopyAllowed = pvCopyMethodAssignment[pv.name] === 'filesystem';
    // const includesMapping = sourcePVCName.includes(':');
    // if (includesMapping) {
    //   const mappedPVCNameArr = sourcePVCName.split(':');
    //   sourcePVCName = mappedPVCNameArr[0];
    // }
    let targetPVCName = pv.pvc.name;
    let sourcePVCName = pv.pvc.name;
    let editedPV = values.editedPVs.find(
      (editedPV) => editedPV.oldPVCName === pv.pvc.name && editedPV.pvName === pv.name
    );

    const includesMapping = sourcePVCName.includes(':');
    if (includesMapping) {
      const mappedPVCNameArr = sourcePVCName.split(':');
      editedPV = values.editedPVs.find(
        (editedPV) => editedPV.oldPVCName === mappedPVCNameArr[0] && editedPV.pvName === pv.name
      );
      if (mappedPVCNameArr[0] === mappedPVCNameArr[1]) {
        sourcePVCName = mappedPVCNameArr[0];
        targetPVCName = editedPV ? editedPV.newPVCName : mappedPVCNameArr[0];
      } else {
        sourcePVCName = mappedPVCNameArr[0];
        targetPVCName = editedPV ? editedPV.newPVCName : mappedPVCNameArr[1];
      }
    }

    return {
      cells: [
        pv.name,
        sourcePVCName,
        pv.storageClass,
        targetPVCName,
        {
          title: (
            <SimpleSelect
              id="select-storage-class"
              aria-label="Select storage class"
              className={styles.copySelectStyle}
              onChange={(option: any) => onStorageClassChange(currentPV, option.value)}
              options={storageClassOptions}
              value={
                storageClassOptions.find(
                  (option) => currentStorageClass && option.value === currentStorageClass.name
                ) || noneOption
              }
              placeholderText="Select a storage class..."
            />
          ),
        },
        {
          title: (
            <Checkbox
              isChecked={isVerifyCopyAllowed && pvVerifyFlagAssignment[pv.name]}
              isDisabled={!isVerifyCopyAllowed}
              onChange={(checked) => {
                onVerifyFlagChange(currentPV, checked);
                if (checked && verifyWarningState === VerifyWarningState.Unread) {
                  setVerifyWarningState(VerifyWarningState.Open);
                }
              }}
              aria-label={`Verify copy for PV ${pv.name}`}
              id={`verify-pv-${pv.name}`}
              name={`verify-pv-${pv.name}`}
            />
          ),
        },
      ],
      meta: {
        editedPVs: values.editedPVs,
        editableRow: editableRow,
      },
    };
  });

  const tableEmptyState =
    persistentVolumes.length > 0 ? (
      <TableEmptyState onClearFiltersClick={() => setFilterValues({})} />
    ) : (
      <TableEmptyState
        icon={InfoCircleIcon}
        titleText="No PVs selected for Copy"
        bodyText="Select Next to continue."
      />
    );

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
    <Grid hasGutter>
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>
            For each persistent volume to be copied, you can optionally change the target PVC and
            target storage class.
          </Text>
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
              widgetId="storage-class-table-pagination-top"
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
                <Th width={20}>{columns[0].title}</Th>
                <Th width={10}>{columns[1].title}</Th>
                <Th width={10}>{columns[2].title}</Th>
                <Th width={20}>
                  {columns[3].title}
                  <Popover
                    position={PopoverPosition.right}
                    bodyContent={
                      <>
                        <p className={spacing.mtMd}>
                          By default, a target PVC will have the same name as its corresponding
                          source PVC.
                          <br></br>
                          <br></br>
                          To change the name of the target PVC, click the edit icon.
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
                <Th width={10}>{columns[4].title}</Th>
                <Th width={10}>{columns[5].title}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row, rowIndex) => {
                const isEditable = row.meta.editableRow === rowIndex;
                return (
                  <Tr key={rowIndex}>
                    {row.cells.map((cell, cellIndex) => {
                      const shiftedIndex = cellIndex + 1;
                      if (columns[cellIndex].title === 'Target PVC') {
                        return (
                          <>
                            {!isEditable ? (
                              <Td
                                key={`${rowIndex}_${shiftedIndex}`}
                                dataLabel={typeof cell === 'string' ? cell : 'target-pvc'}
                              >
                                {typeof cell !== 'string' ? cell.title : cell}
                              </Td>
                            ) : (
                              <Td
                                key={`${rowIndex}_${shiftedIndex}`}
                                dataLabel={typeof cell === 'string' ? cell : 'editable-target-pvc'}
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
                            dataLabel={typeof cell === 'string' ? cell : 'row-cell-id'}
                          >
                            {typeof cell !== 'string' ? cell.title : cell}
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
                                        row.cells[1] === pv.oldPVCName && row.cells[0] === pv.pvName
                                    );
                                    let newEditedPVs;
                                    if (hasEditedValue) {
                                      newEditedPVs = [...new Set([...values.editedPVs])];

                                      const index = values.editedPVs.findIndex(
                                        (pv) =>
                                          pv.oldPVCName === row.cells[1] &&
                                          pv.pvName === row.cells[0]
                                      );
                                      //check if no changes made
                                      if (
                                        newEditedPVs[index].oldPVCName ===
                                        values.currentTargetPVCName.name
                                      ) {
                                        if (index > -1) {
                                          newEditedPVs.splice(index, 1);
                                        }
                                        //replace found edit with current edit
                                      } else if (index || index === 0) {
                                        newEditedPVs[index] = {
                                          oldPVCName:
                                            typeof row.cells[1] === 'string' ? row.cells[1] : '',
                                          newPVCName: values.currentTargetPVCName.name,
                                          pvName:
                                            typeof row.cells[0] === 'string' ? row.cells[0] : '',
                                        };
                                      }
                                    } else {
                                      newEditedPVs = [
                                        ...new Set([
                                          ...values.editedPVs,
                                          {
                                            oldPVCName: row.cells[1],
                                            newPVCName: values.currentTargetPVCName.name,
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
                              handleDelayedValidation(
                                typeof row.cells[3] === 'string' && row.cells[3],
                                row
                              );
                              setFieldValue(currentTargetPVCNameKey, {
                                name: row.cells[3],
                                srcPVName: row.cells[0],
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
          tableEmptyState
        )}
        <Pagination
          widgetId="storage-class-table-pagination-bottom"
          variant={PaginationVariant.bottom}
          className={spacing.mtMd}
          itemCount={paginationProps.itemCount}
          perPage={paginationProps.perPage}
          page={paginationProps.page}
          onSetPage={paginationProps.onSetPage}
          onPerPageSelect={paginationProps.onPerPageSelect}
        />
        <Modal
          aria-label="copy-options-modal"
          variant="small"
          title="Copy performance warning"
          header={
            <Title headingLevel="h1" size={BaseSizes['2xl']}>
              <ExclamationTriangleIcon
                color="var(--pf-global--warning-color--100)"
                className={spacing.mrMd}
              />
              Copy performance warning
            </Title>
          }
          isOpen={verifyWarningState === VerifyWarningState.Open}
          onClose={() => setVerifyWarningState(VerifyWarningState.Dismissed)}
          actions={[
            <Button
              key="close"
              variant="primary"
              onClick={() => setVerifyWarningState(VerifyWarningState.Dismissed)}
            >
              Close
            </Button>,
          ]}
        >
          Selecting checksum verification for a PV that will be copied using a filesystem copy
          method will severely impact the copy performance. Enabling verification will essentially
          remove any time savings from incremental restore. <br />
          <br />
          See the product documentation for more information.
        </Modal>
      </GridItem>
    </Grid>
  );
};

export default CopyOptionsTable;
