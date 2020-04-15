import React from 'react';
import {
  Bullseye,
  EmptyState,
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
  SelectOptionObject,
} from '@patternfly/react-core';
import { Table, TableVariant, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFilterState, useSortState, usePaginationState } from '../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';
import { IPlanPersistentVolume, IClusterStorageClass } from './types';
import { capitalize } from '../../../common/duck/utils';
import SimpleSelect from '../../../common/components/SimpleSelect';
import {
  FilterCategory,
  FilterType,
  FilterToolbar,
} from '../../../common/components/FilterToolbar';

interface IStorageClassTableProps
  extends Pick<IOtherProps, 'isFetchingPVList' | 'currentPlan'>,
    Pick<IFormValues, 'persistentVolumes' | 'pvStorageClassAssignment' | 'pvCopyMethodAssignment'> {
  storageClasses: IClusterStorageClass[];
  onStorageClassChange: (currentPV: IPlanPersistentVolume, value: string) => void;
  onCopyMethodChange: (currentPV: IPlanPersistentVolume, value: string) => void;
}

interface OptionWithValue extends SelectOptionObject {
  value: string;
}

const storageClassToString = (storageClass: IClusterStorageClass) =>
  storageClass && `${storageClass.name}:${storageClass.provisioner}`;

const copyMethodToString = (copyMethod: string) => {
  if (copyMethod === 'filesystem') return 'Filesystem copy';
  if (copyMethod === 'snapshot') return 'Volume snapshot';
  return copyMethod && capitalize(copyMethod);
};

const StorageClassTable: React.FunctionComponent<IStorageClassTableProps> = ({
  isFetchingPVList,
  currentPlan,
  persistentVolumes,
  pvStorageClassAssignment,
  pvCopyMethodAssignment,
  storageClasses,
  onStorageClassChange,
  onCopyMethodChange,
}: IStorageClassTableProps) => {
  if (isFetchingPVList) {
    return (
      <Bullseye>
        <EmptyState variant="small">
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

  const columns = [
    { title: 'PV name', transforms: [sortable] },
    { title: 'Claim', transforms: [sortable] },
    { title: 'Namespace', transforms: [sortable] },
    { title: 'Migration type', transforms: [sortable] },
    { title: 'Copy method', transforms: [sortable] },
    { title: 'Target storage class', transforms: [sortable] },
  ];
  const getSortValues = pv => [
    pv.name,
    pv.claim,
    pv.project,
    pv.type,
    copyMethodToString(pvCopyMethodAssignment[pv.name]),
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
      type: FilterType.search,
      placeholderText: 'Filter by copy method...',
      getItemValue: pv => copyMethodToString(pvCopyMethodAssignment[pv.name]),
    },
    {
      key: 'targetStorageClass',
      title: 'Target storage class',
      type: FilterType.search,
      placeholderText: 'Filter by target storage class...',
      getItemValue: pv => storageClassToString(pvStorageClassAssignment[pv.name]),
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    persistentVolumes,
    filterCategories
  );
  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, paginationProps } = usePaginationState(sortedItems, 10);

  const rows = currentPageItems.map(pv => {
    const currentPV = currentPlan.spec.persistentVolumes.find(planPV => planPV.name === pv.name);
    const currentCopyMethod = pvCopyMethodAssignment[pv.name];
    const currentStorageClass = pvStorageClassAssignment[pv.name];

    const copyMethodOptions: OptionWithValue[] = currentPV.supported.copyMethods.map(
      (copyMethod: string) => ({
        value: copyMethod,
        toString: () => copyMethodToString(copyMethod),
      })
    );

    const noneOption = { value: '', toString: () => 'None' };
    const storageClassOptions: OptionWithValue[] = [
      ...storageClasses.map(storageClass => ({
        value: storageClass.name,
        toString: () => storageClassToString(storageClass),
      })),
      noneOption,
    ];

    return {
      cells: [
        pv.name,
        pv.claim,
        pv.project,
        {
          title: capitalize(pv.type),
        },
        {
          title: (
            <SimpleSelect
              aria-label="Select copy method"
              onChange={(option: OptionWithValue) => onCopyMethodChange(currentPV, option.value)}
              options={copyMethodOptions}
              value={copyMethodOptions.find(option => option.value === currentCopyMethod)}
              placeholderText="Select a copy method..."
            />
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
                  option => currentStorageClass && option.value === currentStorageClass.name
                ) || noneOption
              }
              placeholderText="Select a storage class..."
            />
          ),
        },
      ],
    };
  });

  // TODO add columns based on Vince's mockups (excluding Verify copy, until next PR)
  if (rows.length > 0) {
    return (
      <Grid gutter="md">
        <GridItem>
          <TextContent>
            <Text component={TextVariants.p}>
              For each persistent volume to be copied, select a copy method and target storage
              class.
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
          <Pagination
            widgetId="storage-class-table-pagination-bottom"
            variant={PaginationVariant.bottom}
            className={spacing.mtMd}
            {...paginationProps}
          />
        </GridItem>
      </Grid>
    );
  } else {
    return <div />;
  }
};

export default StorageClassTable;
