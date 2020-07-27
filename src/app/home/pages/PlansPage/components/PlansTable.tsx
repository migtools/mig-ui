import React, { useState, useEffect } from 'react';
import { flatten } from 'lodash';
import classNames from 'classnames';
import { Level, LevelItem, Button, Pagination } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IAddPlanDisabledObjModel } from '../types';
import AddPlanDisabledTooltip from './AddPlanDisabledTooltip';
import { compoundExpand, Table, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import { MigrationIcon } from '@patternfly/react-icons';
import PlanStatus from './PlanStatus';
import PlanActions from './PlanActions';
import MigrationsTable from './MigrationsTable';
import { useSortState, usePaginationState } from '../../../../common/duck/hooks';
import { getPlanInfo } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';

interface IPlansTableProps {
  planList: IPlan[];
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  toggleAddWizardOpen: () => void;
}

interface IExpandedCells {
  [planName: string]: number; // Index of expanded column
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  planList,
  addPlanDisabledObj,
  toggleAddWizardOpen,
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
    { title: 'Replication repository', transforms: [sortable] },
    { title: 'PVs', transforms: [sortable] },
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
      pvCount,
      statusText,
    } = getPlanInfo(plan);
    return [
      planName,
      migrationCount,
      sourceClusterName,
      targetClusterName,
      storageName,
      pvCount,
      statusText,
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(planList, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy]);

  const rows = flatten(
    currentPageItems.map((plan, planIndex) => {
      const {
        planName,
        migrationCount,
        sourceClusterName,
        targetClusterName,
        storageName,
        pvCount,
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
            pvCount,
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
          parent: planIndex * 2, // Plan 0 => rows 0 and 1, Plan 1 => rows 2 and 3, Plan 2 => rows 4 and 5, etc.
          compoundParent: 1,
          cells: [
            {
              title: (
                <MigrationsTable
                  type="Migrations"
                  migrations={plan.Migrations}
                  isPlanLocked={plan.PlanStatus.isPlanLocked}
                  id="migrations-history-expansion-table"
                />
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
          <Pagination widgetId="clusters-table-pagination-top" {...paginationProps} />
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
        {...paginationProps}
      />
    </>
  );
};

export default PlansTable;
