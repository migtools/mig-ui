import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { flatten } from 'lodash';
import classNames from 'classnames';
import { Button, Pagination, Flex, FlexItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  truncate,
  cellWidth,
  fitContent,
} from '@patternfly/react-table';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import MigrationIcon from '@patternfly/react-icons/dist/js/icons/migration-icon';

import PlanStatus from './PlanStatus';
import { useFilterState, useSortState } from '../../../../common/duck/hooks';
import { getPlanInfo, migrationTypeToString } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';
import namespacesIcon from '../../../../common/components/namespaces_icon.svg';
import { usePaginationState } from '../../../../common/duck/hooks/usePaginationState';
import { PlanActionsComponent } from './PlanActions/PlanActionsComponent';
import {
  FilterCategory,
  FilterToolbar,
  FilterType,
} from '../../../../common/components/FilterToolbar/FilterToolbar';
const styles = require('./PlansTable.module').default;

interface IPlansTableProps {
  planList: IPlan[];
  toggleAddWizardOpen: () => void;
}

interface IExpandedCells {
  [planName: string]: number; // Index of expanded column
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  planList,
  toggleAddWizardOpen,
}: IPlansTableProps) => {
  const [expandedCells, setExpandedCells] = useState<IExpandedCells>({});

  const columns = [
    { title: 'Name', transforms: [sortable, cellWidth(15)] },
    {
      title: 'Migrations',
      transforms: [sortable, fitContent],
    },
    { title: 'Type', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Source', transforms: [sortable] },
    { title: 'Target', transforms: [sortable] },
    { title: 'Repository', transforms: [sortable] },
    {
      title: 'Namespaces',
      transforms: [sortable, fitContent],
    },
    { title: 'Last state', transforms: [sortable, cellWidth(20)], cellTransforms: [truncate] },
    '',
  ];

  const filterCategories: FilterCategory[] = [
    {
      key: 'planName',
      title: 'Name',
      type: FilterType.search,
      placeholderText: 'Filter by Name...',
      getItemValue: (plan) => getPlanInfo(plan).planName,
    },
    {
      key: 'migrationCount',
      title: 'Migrations',
      type: FilterType.search,
      placeholderText: 'Filter by Migrations...',
      getItemValue: (plan) => getPlanInfo(plan).migrationCount,
    },
    {
      key: 'migrationType',
      title: 'Type',
      type: FilterType.select,
      placeholderText: 'Filter by Type...',
      selectOptions: [
        { key: 'full', value: 'Full migration' },
        { key: 'state', value: 'State migration' },
        { key: 'scc', value: 'Storage class conversion' },
      ],
      getItemValue: (plan) => getPlanInfo(plan).migrationType,
    },
    {
      key: 'sourceClusterName',
      title: 'Source cluster',
      type: FilterType.search,
      placeholderText: 'Filter by Source cluster...',
      getItemValue: (plan) => getPlanInfo(plan).sourceClusterName,
    },
    {
      key: 'targetClusterName',
      title: 'Target cluster',
      type: FilterType.search,
      placeholderText: 'Filter by Target cluster...',
      getItemValue: (plan) => getPlanInfo(plan).targetClusterName,
    },
    {
      key: 'storageName',
      title: 'Repository',
      type: FilterType.search,
      placeholderText: 'Filter by Repository...',
      getItemValue: (plan) => getPlanInfo(plan).storageName,
    },
    {
      key: 'namespaceCount',
      title: 'Namespaces',
      type: FilterType.search,
      placeholderText: 'Filter by Namespaces...',
      getItemValue: (plan) => getPlanInfo(plan).namespaceCount,
    },
    {
      key: 'statusText',
      title: 'Last state',
      type: FilterType.search,
      placeholderText: 'Filter by Last state...',
      getItemValue: (plan) => getPlanInfo(plan).statusText,
    },
  ];

  const getSortValues = (plan: IPlan) => {
    const {
      planName,
      migrationCount,
      migrationType,
      sourceClusterName,
      targetClusterName,
      storageName,
      namespaceCount,
      statusText,
    } = getPlanInfo(plan);
    return [
      planName,
      migrationCount,
      migrationTypeToString(migrationType),
      sourceClusterName,
      targetClusterName,
      storageName,
      namespaceCount,
      statusText,
      '',
    ];
  };
  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    planList,
    filterCategories
  );

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy]);

  const rows = flatten(
    currentPageItems.map((plan: IPlan, planIndex) => {
      const {
        planName,
        migrationType,
        migrationCount,
        sourceClusterName,
        targetClusterName,
        storageName,
        namespaceCount,
        isMaxResourcesLimitReached,
      } = getPlanInfo(plan);

      return [
        {
          meta: { planName },
          isOpen: Object.keys(expandedCells).includes(planName),
          cells: [
            {
              title: planName,
              props: { component: 'th' },
            },
            {
              title: (
                <>
                  <Link
                    to={
                      migrationCount > 0
                        ? `/plans/${plan.MigPlan.metadata.name}/migrations`
                        : '/plans'
                    }
                  >
                    <span className={classNames('pf-c-icon', { 'pf-m-info': migrationCount > 0 })}>
                      <MigrationIcon key="migration-count-icon" /> {migrationCount}
                    </span>
                  </Link>
                </>
              ),
            },
            migrationTypeToString(migrationType),
            sourceClusterName,
            targetClusterName,
            storageName,
            {
              title: (
                <>
                  <Link to={`/plans/${plan.MigPlan.metadata.name}/namespaces`}>
                    <img
                      key="namespace-icon"
                      src={namespacesIcon}
                      className={styles.namespacesIcon}
                    />
                    <span key="ns-count-container" className={styles.namespaceCount}>
                      {namespaceCount}
                    </span>
                    {isMaxResourcesLimitReached && (
                      <span className="pf-c-icon pf-m-warning" key="icon-container">
                        <ExclamationTriangleIcon key="warning-icon" />
                      </span>
                    )}
                  </Link>
                </>
              ),
            },
            {
              title: <PlanStatus plan={plan} isNestedDebugView={false} />,
            },
            {
              title: <PlanActionsComponent plan={plan} />,
              props: {
                className: 'pf-c-table__action',
              },
            },
          ],
        },
      ];
    })
  );

  const onExpand = (
    _event: React.SyntheticEvent,
    rowIndex: number,
    colIndex: number,
    isOpen: boolean
  ) => {
    const planName = rows[rowIndex].meta.planName;
    if (!isOpen) {
      setExpandedCells({
        [planName]: colIndex,
      });
    } else {
      setExpandedCells({});
    }
  };

  return (
    <>
      <Flex>
        <FlexItem>
          <FilterToolbar
            filterCategories={filterCategories}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          />
        </FlexItem>
        <FlexItem>
          <Button id="add-plan-btn" onClick={toggleAddWizardOpen} variant="secondary">
            Add migration plan
          </Button>
        </FlexItem>
        <FlexItem
          className={`${spacing.mrLg}`}
          alignSelf={{ default: 'alignSelfFlexEnd' }}
          flex={{ default: 'flex_1' }}
        >
          <Pagination
            widgetId="clusters-table-pagination-top"
            itemCount={paginationProps.itemCount}
            perPage={paginationProps.perPage}
            page={paginationProps.page}
            onSetPage={paginationProps.onSetPage}
            onPerPageSelect={paginationProps.onPerPageSelect}
          />
        </FlexItem>
      </Flex>
      <Table
        aria-label="Migration plans table"
        cells={columns}
        rows={rows}
        onExpand={onExpand}
        sortBy={sortBy}
        onSort={onSort}
        className={`${spacing.mtMd} ${spacing.mbMd}`}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Flex>
        <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }} flex={{ default: 'flex_1' }}>
          <Pagination
            widgetId="plans-table-pagination-bottom"
            variant="bottom"
            className={spacing.mtMd}
            itemCount={paginationProps.itemCount}
            perPage={paginationProps.perPage}
            page={paginationProps.page}
            onSetPage={paginationProps.onSetPage}
            onPerPageSelect={paginationProps.onPerPageSelect}
          />
        </FlexItem>
      </Flex>
    </>
  );
};

export default PlansTable;
