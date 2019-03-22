import React from 'react';
import {
  Button,
  DataList,
  DataListItem,
  DataListCell,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../theme';

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
                  <span id="simple-item1">{listItem.metadata.name}</span>
                </DataListCell>
                <DataListCell width={2}>
                  <a target="_blank" href={listItem.spec.clusterUrl}>
                    {listItem.spec.clusterUrl}
                  </a>
                </DataListCell>
                <DataListCell width={2}>Plans</DataListCell>
                <DataListCell width={2}>
                  <Flex justifyContent="flex-end">
                    <Box mx={1}>
                      <Button variant="secondary">Edit</Button>
                    </Box>
                    <Box mx={1}>
                      <Button
                        onClick={() =>
                          props.onRemoveItem(props.type, dataList[index].id)
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
          <Flex>
            <Box color={theme.colors.navy}>No content</Box>
          </Flex>
        )}
      </React.Fragment>
    );
  } else {
    return null;
  }
};

export default DataListComponent;
