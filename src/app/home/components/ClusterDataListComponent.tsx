import React from 'react';
import {
  Button,
  DataList,
  DataListItem,
  DataListCell,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../theme';
import StatusIcon from '../../c../../common/components/StatusIcon';
import { LinkIcon } from '@patternfly/react-icons';
import EmptyStateComponent from './EmptyStateComponent';

const DataListComponent = ({ dataList, ...props }) => {
  if (dataList) {
    return (
      <React.Fragment>
        {dataList.length > 0 ? (
          <DataList aria-label="Simple data list example">
            {dataList.map((listItem, index) => {
              const clusterName = listItem.MigCluster.metadata.name;
              const clusterStatus = listItem.status;
              const clusterUrl =
                listItem.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;

              const associatedPlanCount = props.associatedPlans[clusterName];
              const planText = associatedPlanCount === 1 ? 'plan' : 'plans';

              return (
                <DataListItem
                  key={index}
                  isExpanded={false}
                  aria-labelledby="simple-item1"
                >
                  <DataListCell width={1}>
                    <StatusIcon status={clusterStatus} />
                    <span id="simple-item1">{clusterName}</span>
                  </DataListCell>
                  <DataListCell width={2}>
                    <a
                      target="_blank"
                      href={clusterUrl}
                    >
                      {clusterUrl}
                    </a>
                  </DataListCell>
                  <DataListCell width={2}>
                    <LinkIcon /> {associatedPlanCount} associated migration {planText}
                  </DataListCell>
                  <DataListCell width={2}>
                    <Flex justifyContent="flex-end">
                      <Box mx={1}>
                        <Button variant="secondary">Edit</Button>
                      </Box>
                      <Box mx={1}>
                        <Button
                          onClick={() =>
                            props.onRemoveItem('cluster', dataList[index].id)
                          }
                          variant="danger"
                        >
                          Remove
                        </Button>
                      </Box>
                    </Flex>
                  </DataListCell>
                </DataListItem>
              );
            })}
          </DataList>
        ) : (
            <Flex alignItems="center" justifyContent="center">
              <Box>

                <EmptyStateComponent type="cluster" />
              </Box>
            </Flex>
          )}
      </React.Fragment>
    );
  }
  return null;
};

export default DataListComponent;
