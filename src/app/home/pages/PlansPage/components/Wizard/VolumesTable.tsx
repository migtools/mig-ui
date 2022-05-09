import React, { useState, useEffect } from 'react';
import {
  TextContent,
  Text,
  TextVariants,
  Grid,
  GridItem,
  Pagination,
  PaginationVariant,
  Level,
  LevelItem,
  Tooltip,
  Popover,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  PopoverPosition,
  Title,
  Alert,
  AlertActionLink,
  WizardContext,
} from '@patternfly/react-core';
import {
  sortable,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IRowData,
} from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import { useFilterState, useSortState } from '../../../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';
import {
  FilterToolbar,
  FilterCategory,
  FilterType,
} from '../../../../../common/components/FilterToolbar';
import { capitalize } from '../../../../../common/duck/utils';
import TableEmptyState from '../../../../../common/components/TableEmptyState';
import {
  IMigPlanStorageClass,
  IPlanPersistentVolume,
  PvCopyMethod,
} from '../../../../../plan/duck/types';
import { usePaginationState } from '../../../../../common/duck/hooks/usePaginationState';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { DefaultRootState } from '../../../../../../configureStore';
import {
  getSuggestedPvStorageClasses,
  pvcNameToString,
  targetStorageClassToString,
} from '../../helpers';
import { VerifyCopyWarningModal, VerifyWarningState } from './VerifyCopyWarningModal';
import { ExclamationTriangleIcon, QuestionCircleIcon } from '@patternfly/react-icons';
import { PVStorageClassSelect } from './PVStorageClassSelect';
import { VerifyCopyCheckbox } from './VerifyCopyCheckbox';
import ReactJson from 'react-json-view';

const styles = require('./VolumesTable.module').default;

interface IVolumesTableProps extends IOtherProps {
  storageClasses: IMigPlanStorageClass[];
}

const VolumesTable: React.FunctionComponent<IVolumesTableProps> = ({
  storageClasses,
}: IVolumesTableProps) => {
  const planState = useSelector((state: DefaultRootState) => state.plan);

  const { setFieldValue, values } = useFormikContext<IFormValues>();
  const isSCC = values.migrationType.value === 'scc';

  // Initialize target storage class form selection from currentPlan if we're ready
  React.useEffect(() => {
    const pvScInitialised =
      values.pvStorageClassAssignment && Object.keys(values.pvStorageClassAssignment).length > 0;
    const planHasPVs = planState.currentPlan?.spec.persistentVolumes?.length > 0;
    if (!pvScInitialised && planHasPVs) {
      const suggestedStorageClasses = getSuggestedPvStorageClasses(planState.currentPlan);
      if (suggestedStorageClasses) {
        setFieldValue('pvStorageClassAssignment', suggestedStorageClasses);
      }
    }
  }, [values, planState.currentPlan]);

  const updatePersistentVolumeAction = (currentPV: IPlanPersistentVolume, option: any) => {
    if (planState.currentPlan !== null && values.persistentVolumes) {
      const newPVs = [...values.persistentVolumes];
      const matchingPV = values.persistentVolumes.find((pv) => pv === currentPV);
      const pvIndex = values.persistentVolumes.indexOf(matchingPV);

      newPVs[pvIndex] = {
        ...matchingPV,
        selection: {
          ...matchingPV.selection,
          //if updating the copy method, then assume the action will be set to copy
          ...(option.type === 'copyMethod'
            ? {
                copyMethod: option.value,
                action: 'copy',
              }
            : option.value === 'move' && {
                action: 'move',
              }),
        },
      };
      setFieldValue('persistentVolumes', newPVs);
    }
  };

  const [verifyWarningState, setVerifyWarningState] = useState<VerifyWarningState>('Unread');

  const columns = isSCC
    ? [
        // Columns for storage class conversion
        { title: 'PV name', transforms: [sortable] },
        { title: 'Claim', transforms: [sortable] }, // TODO should this be renamed PVC? if so, just here or everywhere?
        { title: 'Namespace', transforms: [sortable] }, // TODO should namespace come before Claim? here or everywhere?
        { title: 'Source storage class', transforms: [sortable] },
        { title: 'Size', transforms: [sortable] },
        { title: 'Target storage class', transforms: [sortable] },
        {
          title: (
            <React.Fragment>
              Verify copy{' '}
              <Tooltip
                position="top"
                isContentLeftAligned
                content={
                  <div>
                    Checksum verification is available for PVs that will be copied using a
                    filesystem copy method. Each file is verified with a checksum, which
                    significantly reduces performance. See the product documentation for more
                    information.
                  </div>
                }
              >
                <QuestionCircleIcon />
              </Tooltip>
            </React.Fragment>
          ),
          transforms: [sortable],
        },
        { title: 'Details' },
      ]
    : [
        // Columns for all other migration types
        { title: 'PV name', transforms: [sortable] },
        { title: 'Claim', transforms: [sortable] },
        { title: 'Namespace', transforms: [sortable] },
        { title: 'Storage class', transforms: [sortable] },
        { title: 'Size', transforms: [sortable] },
        { title: 'PV migration type', transforms: [sortable] },
        { title: 'Details' },
      ];

  const getSortValues = (pv: IPlanPersistentVolume) =>
    isSCC
      ? [
          pv.name,
          pvcNameToString(pv.pvc),
          pv.pvc.namespace,
          pv.storageClass,
          pv.capacity,
          pv.selection.storageClass,
          pv.selection.verify,
        ]
      : [
          pv.name,
          pvcNameToString(pv.pvc),
          pv.pvc.namespace,
          pv.storageClass,
          pv.capacity,
          pv.selection.copyMethod,
        ];
  const commonFilterCategories: FilterCategory[] = [
    {
      key: 'name',
      title: 'PV name',
      type: FilterType.search,
      placeholderText: 'Filter by PV name...',
    },
    {
      key: 'claim',
      title: 'Claim',
      type: FilterType.search,
      placeholderText: 'Filter by claim...',
    },
    {
      key: 'project',
      title: 'Namespace',
      type: FilterType.search,
      placeholderText: 'Filter by namespace...',
    },
    {
      key: 'storageClass',
      title: isSCC ? 'Source storage class' : 'Storage class',
      type: FilterType.search,
      placeholderText: isSCC ? 'Filter by source storage class...' : 'Filter by storage class...',
    },
  ];
  const filterCategories: FilterCategory[] = isSCC
    ? [
        ...commonFilterCategories,
        {
          key: 'targetStorageClass',
          title: 'Target storage class',
          type: FilterType.search,
          placeholderText: 'Filter by target storage class...',
          getItemValue: (pv) =>
            targetStorageClassToString(values.pvStorageClassAssignment[pv.name]),
        },
      ]
    : [
        ...commonFilterCategories,
        {
          key: 'type',
          title: 'PV migration type',
          type: FilterType.select,
          selectOptions: [
            { key: 'filesystem', value: 'Filesystem copy' },
            { key: 'move', value: 'Move' },
            { key: 'snapshot', value: 'Snapshot copy' },
          ],
        },
      ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    values.persistentVolumes,
    filterCategories
  );

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [filterValues, sortBy]);

  useEffect(() => {
    //select all pvs on load
    setAllRowsSelected(true);
    const newSelected = filteredItems.map((pv) => pv.name);
    setFieldValue('selectedPVs', newSelected);
  }, []);

  const [allRowsSelected, setAllRowsSelected] = React.useState(false);

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

  const rows = currentPageItems.map((pv: IPlanPersistentVolume) => {
    const isRowSelected = values.selectedPVs.includes(pv.name);

    const matchingPVResource = planState.pvResourceList.find(
      (pvResource) => pvResource.name === pv.name
    );

    const copyMethodToString = (copyMethod: PvCopyMethod) => {
      if (copyMethod === 'filesystem') return 'Filesystem copy';
      if (copyMethod === 'snapshot') return 'Volume snapshot';
      return copyMethod && capitalize(copyMethod);
    };

    const copyMethodOptions: OptionWithValue<any>[] = pv?.supported?.copyMethods.map(
      (copyMethod: PvCopyMethod) => ({
        value: copyMethod,
        toString: () => copyMethodToString(copyMethod),
        type: 'copyMethod',
      })
    );

    const migrationTypeOptions: OptionWithValue[] = pv?.supported?.actions.map((action) => ({
      value: action,
      toString: () => capitalize(action),
      type: 'action',
    }));

    const combinedCopyOptions = migrationTypeOptions
      .concat(copyMethodOptions)
      .filter((option) => option.value !== 'copy' && option.value !== 'skip');

    const currentSelectedCopyOption = combinedCopyOptions.find(
      (option) => option.value === pv.selection.action || option.value === pv.selection.copyMethod
    );

    const currentPV = planState.currentPlan?.spec?.persistentVolumes?.find(
      (planPV: any) => planPV.name === pv.name
    );
    const currentStorageClass = values.pvStorageClassAssignment[pv.name];

    const detailsCell = {
      title: (
        <Popover
          className={styles.jsonPopover}
          position={PopoverPosition.bottom}
          bodyContent={
            matchingPVResource ? (
              <ReactJson src={matchingPVResource} enableClipboard={false} />
            ) : (
              <EmptyState variant={EmptyStateVariant.small}>
                <EmptyStateIcon icon={ExclamationTriangleIcon} />
                <Title headingLevel="h5" size="md">
                  No PV data found
                </Title>
                <EmptyStateBody>Unable to retrieve PV data</EmptyStateBody>
              </EmptyState>
            )
          }
          aria-label="pv-details"
          closeBtnAriaLabel="close-pv-details"
          maxWidth="200rem"
        >
          <Button isDisabled={planState.isFetchingPVResources} variant="link">
            View JSON
          </Button>
        </Popover>
      ),
    };
    const cells = isSCC
      ? [
          pv.name,
          pvcNameToString(pv.pvc),
          pv.pvc.namespace,
          // Storage class can be empty here if none exists/ none selected initially
          pv.storageClass || '',
          pv.capacity,
          {
            title: (
              <PVStorageClassSelect {...{ pv, currentPV, storageClasses, currentStorageClass }} />
            ),
          },
          {
            title: (
              <VerifyCopyCheckbox
                {...{
                  verifyWarningState,
                  setVerifyWarningState,
                  pv,
                  currentPV,
                }}
                isDisabled={!isRowSelected}
              />
            ),
          },
          detailsCell,
        ]
      : [
          pv.name,
          pvcNameToString(pv.pvc),
          pv.pvc.namespace,
          // Storage class can be empty here if none exists/ none selected initially
          pv.storageClass || '',
          pv.capacity,
          {
            title: (
              <SimpleSelect
                id="select-migration-type"
                aria-label="Select pv migration type"
                onChange={(option: any) => updatePersistentVolumeAction(pv, option)}
                options={combinedCopyOptions}
                value={currentSelectedCopyOption}
                placeholderText={null}
                isDisabled={!isRowSelected}
              />
            ),
          },
          detailsCell,
        ];

    return {
      cells,
      selected: isRowSelected,
      meta: {
        selectedPVs: values.selectedPVs,
        id: pv.name,
      },
    };
  });

  const { goToStepByName, onClose } = React.useContext(WizardContext);

  return (
    <Grid hasGutter>
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>
            {isSCC
              ? 'Select the persistent volumes you want to convert and for each select the new storage class.'
              : 'Choose to move or copy persistent volumes associated with selected namespaces.'}
          </Text>
        </TextContent>
      </GridItem>
      {isSCC && values.persistentVolumes.length === 0 ? (
        <GridItem>
          <Alert
            variant="danger"
            isInline
            title="Storage class conversion is unavailable"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={() => goToStepByName('General')}>Go back</AlertActionLink>
                <AlertActionLink onClick={() => onClose()}>Cancel</AlertActionLink>
              </React.Fragment>
            }
          >
            At least one PV must be attached to the project for storage class conversion.
          </Alert>
        </GridItem>
      ) : null}
      {isSCC && storageClasses.length < 2 ? (
        <GridItem>
          <Alert
            variant="danger"
            isInline
            title="Storage class conversion is unavailable"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={() => goToStepByName('General')}>Go back</AlertActionLink>
                <AlertActionLink onClick={() => onClose()}>Cancel</AlertActionLink>
              </React.Fragment>
            }
          >
            At least two storage classes must be available in the cluster for storage class
            conversion.
          </Alert>
        </GridItem>
      ) : null}
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
              widgetId="pv-table-pagination-top"
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
                {columns.map((column, columnIndex) => (
                  <Th key={columnIndex} width={columnIndex === 0 ? 20 : 10}>
                    {column.title}
                  </Th>
                ))}
                <Th width={20}></Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row, rowIndex) => {
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
                      console.log('cell', cell);
                      return (
                        <Td
                          key={`${rowIndex}_${shiftedIndex}`}
                          dataLabel={
                            typeof columns[cellIndex].title === 'string'
                              ? (columns[cellIndex].title as string)
                              : ''
                          }
                        >
                          {typeof cell !== 'string' ? cell.title : cell}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </TableComposable>
        ) : (
          <TableEmptyState
            onClearFiltersClick={() => setFilterValues({})}
            isHiddenActions={values.persistentVolumes.length === 0}
            titleText={values.persistentVolumes.length === 0 && 'No persistent volumes found'}
            bodyText={
              values.persistentVolumes.length === 0 &&
              `No persistent volumes are attached to the selected projects.${
                !isSCC ? ' Click Next to continue.' : ''
              }`
            }
          />
        )}
        <Pagination
          widgetId="pv-table-pagination-bottom"
          variant={PaginationVariant.bottom}
          className={spacing.mtMd}
          itemCount={paginationProps.itemCount}
          perPage={paginationProps.perPage}
          page={paginationProps.page}
          onSetPage={paginationProps.onSetPage}
          onPerPageSelect={paginationProps.onPerPageSelect}
        />
        {isSCC ? (
          <VerifyCopyWarningModal {...{ verifyWarningState, setVerifyWarningState, isSCC }} />
        ) : null}
      </GridItem>
    </Grid>
  );
};

export default VolumesTable;
