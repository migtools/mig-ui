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
            {dataList.map((listItem, index) => (
              <DataListItem
                key={index}
                isExpanded={false}
                aria-labelledby="simple-item1"
              >
                <DataListCell width={1}>
                  <ClusterStatusIcon isSuccessful />
                  <span id="simple-item1">{listItem.metadata.name}</span>
                </DataListCell>
                <DataListCell width={2}>
                  <a
                    target="_blank"
                    href={`http://localhost:9999/${listItem.metadata.name}`}
                  >
                    {`http://localhost:9999/${listItem.metadata.name}`}
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
            ))}
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
