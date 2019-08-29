import React, { useState, useEffect } from 'react';
import { flatten } from 'lodash';
import { Flex, Box } from '@rebass/emotion';
import { DataList, DataListContent, DataListItem, DataListItemRow } from '@patternfly/react-core';
import PlanActions from './PlanActions';
import {
  Table,
  TableHeader,
  TableBody,
  //@ts-ignore
  compoundExpand,
} from '@patternfly/react-table';
import MigrationsTable from './MigrationsTable';
import PlanStatusIcon from '../../Card/Status/PlanStatusIcon';
import styled from '@emotion/styled';
import { ServiceIcon, DatabaseIcon } from '@patternfly/react-icons';
import theme from '../../../../../theme';
import PlanEmptyState from './PlanEmptyState';

interface IProps {
  planList: any;
  onPlanSubmit: () => void;
  clusterList: any;
  storageList: any;
  isLoading: boolean;
  isExpanded: boolean;
  plansDisabled: boolean;
  toggleOpen: () => void;
}


const PlanContent: React.FunctionComponent<IProps> = ({
  planList,
  isLoading,
  isExpanded,
  plansDisabled,
  toggleOpen,
}) => {
  const [currentRows, setCurrentRows] = useState([]);

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
      cellTransforms: [compoundExpand],
    },
    'Last Status',
  ];

  useEffect(() => {
    const mappedRows = planList.map((plan, planIndex) => {
      const MigrationsIcon = styled(ServiceIcon)`
          color: ${() => (plan.Migrations.length > 0 ? theme.colors.blue : theme.colors.black)};
        `;
      const parentIndex = planIndex * 2;
      const planName = plan.MigPlan.metadata.name;
      const planKey = `${planName}-${planIndex}`;

      //check previous expanded value
      let isOpenPrev = null;
      if (currentRows.length > 0) {
        const matchingIndex = currentRows.filter((row, i) => i === parentIndex);
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
                  <Box m="0 5px 0 0">
                    <PlanStatusIcon plan={plan} />
                  </Box>
                  <Box m="auto 0 auto 0">
                    <span>{plan.MigPlan.metadata.name}</span>
                  </Box>
                </Flex>
              ),

              props: { component: 'th' },
            },
            {
              title: (
                <React.Fragment>
                  <Flex>
                    <Box m="0 5px 0 0" key={planKey + '-icon'}>
                      <MigrationsIcon />
                    </Box>
                    <Box m="auto 0 auto 0" key={planKey + '-text'}>
                      <span>{plan.Migrations.length || 0}</span>
                    </Box>
                  </Flex>
                </React.Fragment>
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
                  <Box m="0 5px 0 0">
                    <DatabaseIcon />
                  </Box>
                  <Box m="auto 0 auto 0">
                    <span>{pvCount}</span>
                  </Box>
                </Flex>
              ),
            },
            {
              title: <PlanActions plan={plan} isLoading={isLoading} />,
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
                  id="migrations-history-expansion-table"
                />
              ),
              props: { colSpan: 9, className: 'pf-m-no-padding' },
            },
          ],
        },
      ];
    });
    setCurrentRows(flatten(mappedRows));
  }, [planList]);

  const onExpand = (rowIndex, colIndex, isOpen) => {
    const rowsCopy = currentRows;
    if (!isOpen) {
      // close all expanded rows
      rowsCopy.forEach(row => {
        //set all other expanded cells false in this row if we are expanding
        row.cells.forEach(cell => {
          if (cell.props) {
            cell.props.isOpen = false;
          }
        });
        row.isOpen = false;
      });
      rowsCopy[rowIndex].cells[colIndex].props.isOpen = true;
      rowsCopy[rowIndex].isOpen = true;
    } else {
      rowsCopy[rowIndex].cells[colIndex].props.isOpen = false;
      rowsCopy[rowIndex].isOpen = rowsCopy[rowIndex].cells.some(cell => cell.props && cell.props.isOpen);
    }
    setCurrentRows(rowsCopy)
  };

   return (
    <DataListContent
      noPadding
      aria-label="plan-items-content-containter"
      isHidden={!isExpanded}
    >
      {planList.length > 0 ? (
        <DataList aria-label="plan-item-list">
          <DataListItem key="id" aria-labelledby="simple-item1">
            <DataListItemRow>
              <Table
                aria-label="migrations-history-table"
                onExpand={onExpand}
                rows={currentRows}
                //@ts-ignore
                cells={columns}
              >
                <TableHeader />
                <TableBody />
              </Table>
            </DataListItemRow>
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
}

export default PlanContent;
