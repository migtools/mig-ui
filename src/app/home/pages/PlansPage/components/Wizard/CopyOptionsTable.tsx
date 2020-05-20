import React, { useState } from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  Title,
  TitleLevel,
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
  Flex,
  Tooltip,
  TooltipPosition,
  Modal,
  Button,
  BaseSizes,
} from '@patternfly/react-core';
import { Table, TableVariant, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import {
  InfoCircleIcon,
  QuestionCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import flex from '@patternfly/react-styles/css/utilities/Flex/flex';
import { useFilterState, useSortState, usePaginationState } from '../../../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';
import { IPlanPersistentVolume, IClusterStorageClass, PvCopyMethod } from './types';
import { capitalize } from '../../../../../common/duck/utils';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import {
  FilterCategory,
  FilterType,
  FilterToolbar,
} from '../../../../../common/components/FilterToolbar';
import TableEmptyState from '../../../../../common/components/TableEmptyState';

interface ICopyOptionsTableProps
  extends Pick<IOtherProps, 'isFetchingPVList' | 'currentPlan'>,
    Pick<
      IFormValues,
      | 'persistentVolumes'
      | 'pvStorageClassAssignment'
      | 'pvVerifyFlagAssignment'
      | 'pvCopyMethodAssignment'
    > {
  storageClasses: IClusterStorageClass[];
  onStorageClassChange: (currentPV: IPlanPersistentVolume, value: string) => void;
  onVerifyFlagChange: (currentPV: IPlanPersistentVolume, value: boolean) => void;
  onCopyMethodChange: (currentPV: IPlanPersistentVolume, value: string) => void;
}

enum VerifyWarningState {
  Unread = 'Unread',
  Open = 'Open',
  Dismissed = 'Dismissed',
}

const storageClassToString = (storageClass: IClusterStorageClass) =>
  storageClass && `${storageClass.name}:${storageClass.provisioner}`;

const copyMethodToString = (copyMethod: PvCopyMethod) => {
  if (copyMethod === 'filesystem') return 'Filesystem copy';
  if (copyMethod === 'snapshot') return 'Volume snapshot';
  return copyMethod && capitalize(copyMethod);
};

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
  onCopyMethodChange,
}: ICopyOptionsTableProps) => {
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

  const columns = [
    { title: 'PV name', transforms: [sortable] },
    { title: 'Claim', transforms: [sortable] },
    { title: 'Namespace', transforms: [sortable] },
    { title: 'Copy method', transforms: [sortable] },
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
    },
    { title: 'Target storage class', transforms: [sortable] },
  ];
  const getSortValues = (pv) => [
    pv.name,
    pv.claim,
    pv.project,
    copyMethodToString(pvCopyMethodAssignment[pv.name]),
    pvVerifyFlagAssignment[pv.name],
    storageClassToString(pvStorageClassAssignment[pv.name]),
  ];
  const filterCategories: FilterCategory[] = [
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
      key: 'copyMethod',
      title: 'Copy method',
      type: FilterType.select,
      selectOptions: [
        { key: 'filesystem', value: 'Filesystem copy' },
        { key: 'snapshot', value: 'Volume snapshot' },
      ],
      getItemValue: (pv) => copyMethodToString(pvCopyMethodAssignment[pv.name]),
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

  const rows = currentPageItems.map((pv) => {
    const currentPV = currentPlan.spec.persistentVolumes.find((planPV) => planPV.name === pv.name);
    const currentCopyMethod = pvCopyMethodAssignment[pv.name];
    const currentStorageClass = pvStorageClassAssignment[pv.name];

    const copyMethodOptions: OptionWithValue[] = currentPV.supported.copyMethods.map(
      (copyMethod: PvCopyMethod) => ({
        value: copyMethod,
        toString: () => copyMethodToString(copyMethod),
      })
    );

    const noneOption = { value: '', toString: () => 'None' };
    const storageClassOptions: OptionWithValue[] = [
      ...storageClasses.map((storageClass) => ({
        value: storageClass.name,
        toString: () => storageClassToString(storageClass),
      })),
      noneOption,
    ];

    const isVerifyCopyAllowed = pvCopyMethodAssignment[pv.name] === 'filesystem';

    return {
      cells: [
        pv.name,
        pv.claim,
        pv.project,
        {
          title: (
            <SimpleSelect
              aria-label="Select copy method"
              onChange={(option: OptionWithValue) => onCopyMethodChange(currentPV, option.value)}
              options={copyMethodOptions}
              value={copyMethodOptions.find((option) => option.value === currentCopyMethod)}
              placeholderText="Select a copy method..."
            />
          ),
        },
        {
          title: (
            <Flex className={flex.justifyContentCenter}>
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
            </Flex>
          ),
        },
        {
          title: (
            <SimpleSelect
              aria-label="Select storage class"
              onChange={(option: OptionWithValue) => onStorageClassChange(currentPV, option.value)}
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
      ],
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

  return (
    <Grid gutter="md">
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>
            For each persistent volume to be copied, select a copy method and target storage class.
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
            <Pagination widgetId="storage-class-table-pagination-top" {...paginationProps} />
          </LevelItem>
        </Level>
        {rows.length > 0 ? (
          <Table
            aria-label="Storage class selections table"
            variant={TableVariant.compact}
            cells={columns}
            rows={rows}
            sortBy={sortBy}
            onSort={onSort}
          >
            <TableHeader />
            <TableBody />
          </Table>
        ) : (
          tableEmptyState
        )}
        <Pagination
          widgetId="storage-class-table-pagination-bottom"
          variant={PaginationVariant.bottom}
          className={spacing.mtMd}
          {...paginationProps}
        />
        <Modal
          isSmall
          title="Copy performance warning"
          header={
            <Title headingLevel={TitleLevel.h1} size={BaseSizes['2xl']}>
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
          isFooterLeftAligned
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
