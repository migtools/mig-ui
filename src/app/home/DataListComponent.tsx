import React from 'react';
import { DataList, DataListItem, DataListCell } from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../theme';

const ClusterListComponent = ({ dataList, ...props }) => {
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
              <DataListCell width={1}>URL</DataListCell>
              <DataListCell width={1}>Plans</DataListCell>
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
};

export default ClusterListComponent;
