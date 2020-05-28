import React, { useState } from 'react';
import { flatten } from 'lodash';
import classNames from 'classnames';
import { Level, LevelItem, Button, Pagination, Flex, FlexItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IAddPlanDisabledObjModel } from '../types';
import AddPlanDisabledTooltip from './AddPlanDisabledTooltip';
import { compoundExpand, Table, TableHeader, TableBody } from '@patternfly/react-table';
import { MigrationIcon } from '@patternfly/react-icons';
import PlanStatus from './PlanStatus';
import PlanActions from './PlanActions';
import MigrationsTable from './MigrationsTable';

interface IPlansTableProps {
  planList: any[]; // TODO
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  toggleWizardOpen: () => void;
}

interface IExpandedCells {
  [planName: string]: number; // Index of expanded column
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  planList,
  addPlanDisabledObj,
  toggleWizardOpen,
}: IPlansTableProps) => {
  const [expandedCells, setExpandedCells] = useState<IExpandedCells>({});

  const columns = [
    'Name',
    {
      title: 'Migrations',
      cellTransforms: [compoundExpand],
    },
    'Source',
    'Target',
    'Replication repository',
    'PVs',
    'Last state',
    '',
  ];

  const rows = flatten(
    planList.map((plan, planIndex) => {
      const parentIndex = planIndex * 2;
      const planName = plan.MigPlan.metadata.name;
      const migStorageName = plan.MigPlan.spec.migStorageRef
        ? plan.MigPlan.spec.migStorageRef.name
        : 'N/A';
      const pvCount = plan.MigPlan.spec.persistentVolumes
        ? plan.MigPlan.spec.persistentVolumes.length
        : 0;
      const migrationCount = plan.Migrations.length || 0;

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
                  <MigrationIcon /> {migrationCount}
                </span>
              ),
              props: {
                isOpen: expandedCells[planName] === 1,
                ariaControls: 'migrations-history-expansion-table',
              },
            },
            plan.MigPlan.spec.srcMigClusterRef.name,
            plan.MigPlan.spec.destMigClusterRef.name,
            migStorageName,
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
          parent: parentIndex,
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
              onClick={toggleWizardOpen}
              isDisabled={addPlanDisabledObj.isAddPlanDisabled}
              variant="secondary"
            >
              Add migration plan
            </Button>
          </AddPlanDisabledTooltip>
        </LevelItem>
        <LevelItem>
          {/*<Pagination widgetId="clusters-table-pagination-top" {...paginationProps} />*/}
        </LevelItem>
      </Level>
      <Table
        aria-label="Migration plans table"
        cells={columns}
        rows={rows}
        onExpand={onExpand}
        //sortBy={sortBy}
        //onSort={onSort}
        className={`${spacing.mtMd} ${spacing.mbMd}`}
      >
        <TableHeader />
        <TableBody />
      </Table>
      {/*<Pagination
        widgetId="plans-table-pagination-bottom"
        variant="bottom"
        className={spacing.mtMd}
        {...paginationProps}
      />*/}
    </>
  );
};

export default PlansTable;
