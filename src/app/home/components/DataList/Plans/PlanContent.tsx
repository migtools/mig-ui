import React, { useState, useEffect } from 'react';
import { flatten } from 'lodash';
import { DataList, DataListContent, DataListItem, Flex, FlexItem} from '@patternfly/react-core';
import PlanActions from './PlanActions';
import PlanStatus from './PlanStatus';
import MigrationsTable from './MigrationsTable';
import {
  Table,
  TableHeader,
  TableBody,
  compoundExpand,
} from '@patternfly/react-table';
import { MigrationIcon, DatabaseIcon, ServiceIcon } from '@patternfly/react-icons';
import PlanEmptyState from './PlanEmptyState';
import { IAddPlanDisabledObjModel } from '../../../AddPlanDisabledObjModel';


const columns = [
  'Name',
  {
    title: 'Migrations',
    cellTransforms: [compoundExpand],
  },
  {
    title: 'Source',
  },
  {
    title: 'Target',
  },
  'Replication repository',
  {
    title: 'PVs',
  },
  'Last state',
  ''
];

interface IPlanContentProps {
  planList: any;
  isExpanded: boolean;
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  toggleWizardOpen: () => void;
}

const PlanContent: React.FunctionComponent<IPlanContentProps> = ({
  planList,
  isExpanded,
  addPlanDisabledObj,
  toggleWizardOpen,
}: IPlanContentProps) => {
  const [currentRows, setCurrentRows] = useState([]);

  const buildNewRows = () => {
    const newRows = planList.map((plan, planIndex) => {
      const MigrationsIcon = () => {
        const migrationCount = plan.Migrations.length || 0;
        if (migrationCount > 0) {
          return <span className="pf-c-icon pf-m-info"><MigrationIcon /> {migrationCount}</span>;
        } else {
          return <span className="pf-c-icon"><MigrationIcon /> {migrationCount}</span>;
        }
      };
      const parentIndex = planIndex * 2;
      const planName = plan.MigPlan.metadata.name;
      const planKey = `${planName}-${planIndex}`;

      //check previous expanded value
      let isOpenPrev = null;
      if (currentRows.length > 0) {
        const matchingIndex = currentRows.filter((_row, i) => i === parentIndex);
        if (matchingIndex[0] && matchingIndex[0].cells.length > 0) {
          isOpenPrev = matchingIndex[0].cells[1].props.isOpen;
        }
      }

      const migStorageName = plan.MigPlan.spec.migStorageRef ?
        plan.MigPlan.spec.migStorageRef.name : 'N/A';

      const pvCount = plan.MigPlan.spec.persistentVolumes ?
        plan.MigPlan.spec.persistentVolumes.length : 0;
      return [
        {
          cells: [
            {
              title: (
                <Flex>
                  <FlexItem>
                    <span>{plan.MigPlan.metadata.name}</span>
                  </FlexItem>
                </Flex>
              ),

              props: { component: 'th' },
            },
            {
              title: (
                <Flex>
                  <FlexItem key={planKey + '-icon'}>
                    <MigrationsIcon />
                  </FlexItem>
                </Flex>
              ),

              props: {
                isOpen: isOpenPrev || false,
                ariaControls: 'migrations-history-expansion-table',
              },
            },
            {
              title: <span>{plan.MigPlan.spec.srcMigClusterRef.name}</span>,
            },
            {
              title: <span>{plan.MigPlan.spec.destMigClusterRef.name}</span>,
            },
            {
              title: <span>{migStorageName}</span>,
            },
            {
              title: (
                <Flex>
                  <FlexItem>
                    <span>{pvCount}</span>
                  </FlexItem>
                </Flex>
              ),
            },
            {
              title: <PlanStatus
                plan={plan}
              />,
            },
            {
              title: <PlanActions
                plan={plan}
              />,

              props: {
                className: 'pf-c-table__action',
              }
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
    });

    return flatten(newRows);
  };

  useEffect(() => {
    const newRows = buildNewRows();

    setCurrentRows(newRows);
  }, [planList]);

  const onExpand = (_event, rowIndex, colIndex, isOpen) => {
    const newRows = buildNewRows();

    if (!isOpen) {
      // close all expanded rows
      newRows.forEach(row => {
        //set all other expanded cells false in this row if we are expanding
        row.cells.forEach(cell => {
          if (cell.props) {
            cell.props.isOpen = false;
          }
        });
        row.isOpen = false;
      });
      newRows[rowIndex].cells[colIndex].props.isOpen = true;
      newRows[rowIndex].isOpen = true;
    } else {
      newRows[rowIndex].cells[colIndex].props.isOpen = false;
      newRows[rowIndex].isOpen = newRows[rowIndex].cells.some(cell => cell.props && cell.props.isOpen);
    }

    setCurrentRows(newRows);
  };

  return (
    <DataListContent
      noPadding
      aria-label="plan-items-content-container"
      isHidden={!isExpanded}
    >
      {planList.length > 0 ? (
        <DataList aria-label="plan-item-list">
          <DataListItem key="id" aria-labelledby="simple-item1">
            <Table
              aria-label="migrations-history-table"
              onExpand={onExpand}
              rows={currentRows}
              cells={columns}
            >
              <TableHeader />
              <TableBody />
            </Table>
          </DataListItem>
        </DataList>
      ) : (
          <PlanEmptyState
            toggleOpen={toggleWizardOpen}
            addPlanDisabledObj={addPlanDisabledObj}
          />
        )}
    </DataListContent>
  );
};

export default PlanContent;
