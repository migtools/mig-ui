import React from 'react';
import {
  DataListItem,
  DataListToggle,
  DataListContent,
  Button,
  DataList,
  DataListCell,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';

import DataListComponent from './DataListComponent';
import AddClusterModal from './AddClusterModal';

import {} from '@patternfly/react-core';
import theme from '../../../theme';

interface IProps {
  id: string;
  title: string;
  onToggle: (id) => void;
  dataList: any[];
  action: React.ReactNode;
  isExpanded: boolean;
  plansDisabled?: boolean;
}

const DetailViewItem: React.FunctionComponent<IProps> = ({
  id,
  title,
  isExpanded,
  onToggle,
  dataList,
  plansDisabled,
  action,
  ...props
}) => {
  return (
    <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
      <Flex width="100%" height="5em">
        <Box flex="0 0 2em" my="auto">
          <DataListToggle
            onClick={() => onToggle(id)}
            isExpanded={isExpanded}
            id={id}
          />
        </Box>
        <Box flex="1" my="auto">
          {title}
        </Box>
        <Box textAlign="left" flex="0 0 15em" my="auto">
          {action}
        </Box>
      </Flex>
      <DataListContent
        aria-label="Primary Content Details"
        isHidden={!isExpanded}
      >
        <DataListComponent dataList={dataList} />
      </DataListContent>
    </DataListItem>
  );
};

export default DetailViewItem;
