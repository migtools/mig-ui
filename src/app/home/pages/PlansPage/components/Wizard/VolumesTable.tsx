import React, { useEffect } from 'react';
import {
  TextContent,
  Text,
  TextVariants,
  Popover,
  PopoverPosition,
  Title,
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Grid,
  GridItem,
  Pagination,
  PaginationVariant,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { Table, TableVariant, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import ReactJson from 'react-json-view';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import { useFilterState, useSortState, usePaginationState } from '../../../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';
import {
  FilterToolbar,
  FilterCategory,
  FilterType,
} from '../../../../../common/components/FilterToolbar';
import { capitalize } from '../../../../../common/duck/utils';
import TableEmptyState from '../../../../../common/components/TableEmptyState';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';

const styles = require('./VolumesTable.module');

interface IVolumesTableProps
  extends Pick<IOtherProps, 'isFetchingPVResources' | 'pvResourceList'>,
    Pick<IFormValues, 'persistentVolumes'> {
  onTypeChange: (currentPV: IPlanPersistentVolume, value: string) => void;
}

const VolumesTable: React.FunctionComponent<IVolumesTableProps> = ({
  isFetchingPVResources,
  pvResourceList,
  persistentVolumes,
  onTypeChange,
}: IVolumesTableProps) => {
  const columns = [
    { title: 'PV name', transforms: [sortable] },
    { title: 'Claim', transforms: [sortable] },
    { title: 'Namespace', transforms: [sortable] },
    { title: 'Storage class', transforms: [sortable] },
    { title: 'Size', transforms: [sortable] },
    { title: 'Migration type', transforms: [sortable] },
    { title: 'Details' },
  ];
  const getSortValues = (pv) => [pv.name, pv.claim, pv.project, pv.storageClass, pv.size, pv.type];
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
      key: 'storageClass',
      title: 'Storage class',
      type: FilterType.search,
      placeholderText: 'Filter by storage class...',
    },
    {
      key: 'type',
      title: 'Migration type',
      type: FilterType.select,
      selectOptions: [
        { key: 'copy', value: 'Copy' },
        { key: 'move', value: 'Move' },
      ],
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    persistentVolumes,
    filterCategories
  );
  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [filterValues, sortBy]);

  const rows = currentPageItems.map((pv) => {
    const matchingPVResource = pvResourceList.find((pvResource) => pvResource.name === pv.name);
    const migrationTypeOptions: OptionWithValue[] = pv.supportedActions.map((action: string) => ({
      value: action,
      toString: () => capitalize(action),
    }));
    return {
      cells: [
        pv.name,
        pv.claim,
        pv.project,
        pv.storageClass,
        pv.size,
        {
          title: (
            <SimpleSelect
              aria-label="Select migration type"
              onChange={(option: OptionWithValue) => onTypeChange(pv, option.value)}
              options={migrationTypeOptions}
              value={migrationTypeOptions.find((option) => option.value === pv.type)}
              placeholderText={null}
            />
          ),
        },
        {
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
              <Button isDisabled={isFetchingPVResources} variant="link">
                View JSON
              </Button>
            </Popover>
          ),
        },
      ],
    };
  });

  return (
    <Grid hasGutter>
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>
            Choose to move or copy persistent volumes associated with selected namespaces.
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
          <Table
            aria-label="Persistent volumes table"
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
          <TableEmptyState
            onClearFiltersClick={() => setFilterValues({})}
            isHiddenActions={persistentVolumes.length === 0}
            titleText={persistentVolumes.length === 0 && 'No persistent volumes found'}
            bodyText={
              persistentVolumes.length === 0 &&
              'No persistent volumes are attached to the selected projects. Click Next to continue.'
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
      </GridItem>
    </Grid>
  );
};

export default VolumesTable;
