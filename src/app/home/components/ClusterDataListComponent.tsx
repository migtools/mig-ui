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
              const clusterUrl =
                listItem.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;
              return (
                <DataListItem
                  key={index}
                  isExpanded={false}
                  aria-labelledby="simple-item1"
                >
                  <DataListCell width={1}>
                    <ClusterStatusIcon isSuccessful />
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
                    <LinkIcon /> 0 associated migration plans
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
              )
            })}
          </DataList>
        ) : (
            <Flex alignItems="center" justifyContent="center">
              <Box>

              <EmptyStateComponent type='cluster' />
              </Box>
            </Flex>
          )}
      </React.Fragment>
    );
  }
  return null;
};

export default DataListComponent;
