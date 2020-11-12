import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { flatten } from 'lodash';
import classNames from 'classnames';
import dayjs from 'dayjs';
import {
  TextContent,
  Text,
  Level,
  LevelItem,
  Button,
  Pagination,
  Flex,
  FlexItem,
  TextVariants,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IAddPlanDisabledObjModel } from '../types';
import AddPlanDisabledTooltip from './AddPlanDisabledTooltip';
import { compoundExpand, Table, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import MigrationIcon from '@patternfly/react-icons/dist/js/icons/migration-icon';

import PlanStatus from './PlanStatus';
import PlanActions from './PlanActions';
import MigrationsTable from './MigrationsTable';
import AnalyticsTable from './AnalyticsTable';
import { useSortState } from '../../../../common/duck/hooks';
import { getPlanInfo } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';
import flex from '@patternfly/react-styles/css/utilities/Flex/flex';
import namespacesIcon from '../../../../common/components/namespaces_icon.svg';
import { usePaginationState } from '../../../../common/duck/hooks/usePaginationState';
const styles = require('./PlansTable.module');

interface IPlansTableProps {
  planList: IPlan[];
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  toggleAddWizardOpen: () => void;
  refreshAnalyticRequest: (analyticName: string) => void;
  isRefreshingAnalytic: boolean;
}

interface IExpandedCells {
  [planName: string]: number; // Index of expanded column
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  planList,
  addPlanDisabledObj,
  toggleAddWizardOpen,
  refreshAnalyticRequest,
  isRefreshingAnalytic,
}: IPlansTableProps) => {
  const [expandedCells, setExpandedCells] = useState<IExpandedCells>({});

  const columns = [
    { title: 'Name', transforms: [sortable] },
    {
      title: 'Migrations',
      transforms: [sortable],
      cellTransforms: [compoundExpand],
    },
    { title: 'Source', transforms: [sortable] },
    { title: 'Target', transforms: [sortable] },
    { title: 'Repository', transforms: [sortable] },
    {
      title: 'Namespaces',
      transforms: [sortable],
    },
    { title: 'Last state', transforms: [sortable] },
    '',
  ];

  const getSortValues = (plan: IPlan) => {
    const {
      planName,
      migrationCount,
      sourceClusterName,
      targetClusterName,
      storageName,
      namespaceCount,
      statusText,
    } = getPlanInfo(plan);
    return [
      planName,
      migrationCount,
      sourceClusterName,
      targetClusterName,
      storageName,
      namespaceCount,
      statusText,
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(planList, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy]);

  const rows = flatten(
    currentPageItems.map((plan: IPlan, planIndex) => {
      const {
        planName,
        migrationCount,
        sourceClusterName,
        targetClusterName,
        storageName,
        namespaceCount,
        isMaxResourcesLimitReached,
      } = getPlanInfo(plan);
      const isLoadingAnalytic: boolean =
        // initial loading state to show when a miganalytic is first started or updated.
        !!(plan?.PlanStatus?.analyticPercentComplete !== 100 && plan.PlanStatus.latestAnalytic) ||
        // Plan is currenlty being Closed/Deleted
        plan.PlanStatus.isPlanLocked ||
        // Analytic is being manually refreshed
        isRefreshingAnalytic;

      const noMigAnlyticFound: boolean = plan?.Analytics?.length === 0;

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
                <span className={classNames('pf-c-icon', { 'pf-m-info': migrationCount > 0 })}>
                  <MigrationIcon key="migration-count-icon" /> {migrationCount}
                </span>
              ),
              props: {
                isOpen: expandedCells[planName] === 1,
                ariaControls: 'migrations-history-expansion-table',
              },
            },
            sourceClusterName,
            targetClusterName,
            storageName,
            {
              title: (
                <>
                  <Link to={`/plans/${plan.MigPlan.metadata.name}`}>
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
              title: <PlanStatus plan={plan} />,
            },
            {
              title: <PlanActions plan={plan} />,
              props: {
                className: 'pf-c-table__action',
              },
            },
          ],
        },
        {
          parent: planIndex * 3, // Plan 0 => rows 0 and 1, Plan 1 => rows 2 and 3, Plan 2 => rows 4 and 5, etc.
          compoundParent: 1,
          cells: [
            {
              title: (
                <>
                  <MigrationsTable
                    type="Migrations"
                    migrations={plan.Migrations}
                    isPlanLocked={plan.PlanStatus.isPlanLocked}
                    id="migrations-history-expansion-table"
                  />
                </>
              ),
              props: { colSpan: 9, className: 'pf-m-no-padding' },
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
      <Level>
        <LevelItem>
          <AddPlanDisabledTooltip addPlanDisabledObj={addPlanDisabledObj}>
            <Button
              id="add-plan-btn"
              onClick={toggleAddWizardOpen}
              isDisabled={addPlanDisabledObj.isAddPlanDisabled}
              variant="secondary"
            >
              Add migration plan
            </Button>
          </AddPlanDisabledTooltip>
        </LevelItem>
        <LevelItem>
          <Pagination
            widgetId="clusters-table-pagination-top"
            itemCount={paginationProps.itemCount}
            perPage={paginationProps.perPage}
            page={paginationProps.page}
            onSetPage={paginationProps.onSetPage}
            onPerPageSelect={paginationProps.onPerPageSelect}
          />
        </LevelItem>
      </Level>
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
    </>
  );
};

export default PlansTable;
