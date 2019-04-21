import React from 'react';
import {
  Button,
  DataList,
  DataListItem,
  DataListCell,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../theme';
import ClusterStatusIcon from './ClusterStatusIcon';
import EmptyStateComponent from './EmptyStateComponent';

const DataListComponent = ({ dataList, ...props }) => {
  if (dataList) {
    return (
      <React.Fragment>
        {dataList.length > 0 ? (
          <DataList aria-label="Simple data list example">
              <DataListItem
                key={0}
                isExpanded={false}
                aria-labelledby="simple-item1"
              >
                <DataListCell width={1}>
                  <span>Name</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>Migrations</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>Source</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>Target</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>Repository</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>Persistent Volumes</span>
                </DataListCell>
                <DataListCell width={3}>
                  <span>Last Status</span>
                </DataListCell>
              </DataListItem>
            {dataList.map((plan, i) => {
              const index = i+1;
              return (
              <DataListItem
                key={index}
                isExpanded={false}
                aria-labelledby="simple-item1"
              >
                <DataListCell width={1}>
                  {/* TODO: <ClusterStatusIcon isSuccessful /> */}
                  <span >{plan.planName}</span>
                </DataListCell>
                <DataListCell width={1}>
                  {/* TODO: mig logo */}
                  <span>{plan.migrations.length}</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>{plan.sourceCluster}</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>{plan.targetCluster}</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>{plan.selectedStorage}</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>{plan.persistentVolumes.length}</span>
                </DataListCell>
                <DataListCell width={1}>
                  <span>{plan.status}</span>
                </DataListCell>
                <DataListCell width={2}>
                  <Flex justifyContent="flex-end">
                    <Box mx={1}>
                      <Button
                        variant="primary"
                        onClick={() => props.onStageTriggered(plan)}
                        >
                        Stage
                      </Button>
                    </Box>
                    <Box mx={1}>
                      <Button
                        onClick={() => props.onMigrateTriggered(plan)}
                        variant="primary"
                      >
                        Migrate
                      </Button>
                    </Box>
                  </Flex>
                </DataListCell>
              </DataListItem>
            )
          })}
          </DataList>
        ) : (
            <Flex alignItems="center" justifyContent="center">
              <Box>

              <EmptyStateComponent type='plan' />
              </Box>
            </Flex>
          )}
      </React.Fragment>
    );
  }
  return null;
};

export default DataListComponent;
