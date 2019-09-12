import React, { useState, useEffect } from 'react';
import { flatten } from 'lodash';
import { DataList, DataListContent, DataListItem } from '@patternfly/react-core';
import PlanActions from './PlanActions';
import PlanStatus from './PlanStatus';
import MigrationsTable from './MigrationsTable';
import {
  Table,
  TableHeader,
  TableBody,
  compoundExpand,
} from '@patternfly/react-table';
import { ServiceIcon, DatabaseIcon } from '@patternfly/react-icons';
import PlanEmptyState from './PlanEmptyState';

interface IProps {
  planList: any;
  clusterList: any;
  storageList: any;
  isExpanded: boolean;
  plansDisabled: boolean;
  toggleOpen: () => void;
}

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
  'Repository',
  {
    title: 'Persistent Volumes',
  },
  'Last Status',
  ''
];

const buildNewRows = (
  currentRows, planList,
) => {
  const newRows = planList.map((plan, planIndex) => {
    const MigrationsIcon = () => {
      if (plan.Migrations.length > 0) {
        return <span className="pf-c-icon pf-m-info"><ServiceIcon /></span>;
      } else {
        return <span className="pf-c-icon"><ServiceIcon /></span>;
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
              <div className="pf-l-flex">
                <div className="pf-l-flex__item">
                  <span>{plan.MigPlan.metadata.name}</span>
                </div>
              </div>
            ),

            props: { component: 'th' },
          },
          {
            title: (
              <div className="pf-l-flex">
                <div className="pf-l-flex__item" key={planKey + '-icon'}>
                  <MigrationsIcon />
                </div>
                <div className="pf-l-flex__item" key={planKey + '-text'}>
                  <span>{plan.Migrations.length || 0}</span>
                </div>
              </div>
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
              <div className="pf-l-flex">
                <div className="pf-l-flex__item">
                  <DatabaseIcon />
                </div>
                <div className="pf-l-flex__item">
                  <span>{pvCount}</span>
                </div>
              </div>
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

const PlanContent: React.FunctionComponent<IProps> = ({
  planList,
  isExpanded,
  plansDisabled,
  toggleOpen,
}) => {
  const [currentRows, setCurrentRows] = useState([]);

  useEffect(() => {
    const newRows = buildNewRows(
      currentRows, planList
    );

    setCurrentRows(newRows);
  }, [planList]);

  const onExpand = (_event, rowIndex, colIndex, isOpen) => {
    const newRows = buildNewRows(
      currentRows, planList
    );

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
            toggleOpen={toggleOpen}
            plansDisabled={plansDisabled}
          />
        )}
    </DataListContent>
  );
};

export default PlanContent;
