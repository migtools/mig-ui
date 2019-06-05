import React from 'react';
import { flatten } from 'lodash';
import { Flex, Box } from '@rebass/emotion';
import { DataList, DataListContent, DataListItem, DataListItemRow } from '@patternfly/react-core';
import { DataListAction } from '@patternfly/react-core';
import PlanTableItem from './PlanTableItem';
import PlanActions from './PlanActions';
import DataListEmptyState from '../DataListEmptyState';
import {
  //@ts-ignore
  compoundExpand,
} from '@patternfly/react-table';
import SortableTable from './SortableTable';
import PlanStatusIcon from '../../Card/Status/PlanStatusIcon';
import styled from '@emotion/styled';
import { ServiceIcon, DatabaseIcon } from '@patternfly/react-icons';
import theme from '../../../../../theme';

interface IPlanContentProps {
  planList: any;
  onPlanSubmit: () => void;
  onStageTriggered: (plan) => void;
  clusterList: any;
  storageList: any;
  isLoading: boolean;
  isExpanded: boolean;
  plansDisabled: boolean;
}

class PlanContent extends React.Component<IPlanContentProps, any> {
  state = {
    rows: [],
  };
  componentDidUpdate(prevProps) {
    if (this.props.planList !== prevProps.planList) {
      const mappedRows = this.props.planList.map((plan, planIndex) => {
        const MigrationsIcon = styled(ServiceIcon)`
          color: ${() =>
            plan.planState.migrations.length > 0 ? theme.colors.blue : theme.colors.black};
        `;
        const PVIcon = styled(DatabaseIcon)`
          color: ${() =>
            plan.planState.persistentVolumes.length > 0 ? theme.colors.blue : theme.colors.black};
        `;
        const parentIndex = planIndex === 0 ? 0 : planIndex + 1;
        return [
          {
            isOpen: false,
            cells: [
              {
                title: (
                  <Flex>
                    <Box m="0 5px 0 0">
                      <PlanStatusIcon status={plan.planState.status.state || 'N/A'} />
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
                  <Flex>
                    <Box m="0 5px 0 0">
                      <MigrationsIcon />
                    </Box>
                    <Box m="auto 0 auto 0">
                      <span>{plan.Migrations.length || 0}</span>
                    </Box>
                  </Flex>
                ),

                props: { isOpen: false },
              },
              {
                title: <span>{plan.MigPlan.spec.srcMigClusterRef.name}</span>,
              },
              {
                title: <span>{plan.MigPlan.spec.destMigClusterRef.name}</span>,
              },
              {
                title: <span>{plan.MigPlan.spec.migStorageRef.name}</span>,
              },
              {
                title: (
                  <Flex>
                    <Box m="0 5px 0 0">
                      <PVIcon />
                    </Box>
                    <Box m="auto 0 auto 0">
                      <span>{plan.planState.persistentVolumes.length}</span>
                    </Box>
                  </Flex>
                ),
              },
              {
                title: (
                  <PlanActions
                    plan={plan}
                    isLoading={this.props.isLoading}
                    onStageTriggered={this.props.onStageTriggered}
                  />
                ),
              },
            ],
          },
          {
            parent: parentIndex,
            compoundParent: 1,
            cells: [
              {
                title: (
                  <SortableTable
                    type="Migrations"
                    migrations={plan.Migrations}
                    id="migrations-table"
                  />
                ),
                props: { colSpan: 6, className: 'pf-m-no-padding' },
              },
            ],
          },
        ];
      });
      this.setState({ rows: flatten(mappedRows) });
    }
  }
  StyledDataListAction = styled(DataListAction)``;

  columns = [
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

  onExpand = (event, rowIndex, colIndex, isOpen, rowData, extraData) => {
    const { rows } = this.state;
    if (!isOpen) {
      //set all other expanded cells false in this row if we are expanding
      this.state.rows[rowIndex].cells.forEach(cell => {
        if (cell.props) {
          cell.props.isOpen = false;
        }
      });
      rows[rowIndex].cells[colIndex].props.isOpen = true;
      rows[rowIndex].isOpen = true;
    } else {
      rows[rowIndex].cells[colIndex].props.isOpen = false;
      rows[rowIndex].isOpen = rows[rowIndex].cells.some(cell => cell.props && cell.props.isOpen);
    }
    this.setState({ rows });
  };
  render() {
    return (
      <DataListContent
        noPadding
        aria-label="plan-items-content-containter"
        isHidden={!this.props.isExpanded}
      >
        {this.props.planList.length > 0 ? (
          <DataList aria-label="plan-item-list">
            <DataListItem key="id" aria-labelledby="simple-item1">
              <DataListItemRow>
                <PlanTableItem
                  rows={this.state.rows}
                  onExpand={this.onExpand}
                  columns={this.columns}
                />
              </DataListItemRow>
            </DataListItem>
          </DataList>
        ) : (
          <Flex alignItems="center" justifyContent="center">
            <Box>
              <DataListEmptyState
                type="plan"
                clusterList={this.props.clusterList}
                storageList={this.props.storageList}
                onPlanSubmit={this.props.onPlanSubmit}
                isLoading={this.props.isLoading}
                {...this.props}
              />
            </Box>
          </Flex>
        )}
      </DataListContent>
    );
  }
}
export default PlanContent;
