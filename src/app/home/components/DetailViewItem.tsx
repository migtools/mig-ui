import React from 'react';
import {
  DataListItem,
  DataListToggle,
  DataListContent,
  Button,
  DataList,
  DataListCell,
} from '@patternfly/react-core';

import { TextInput } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Flex, Box } from '@rebass/emotion';

import DataListComponent from './DataListComponent';

import {} from '@patternfly/react-core';
import theme from '../../../theme';

interface IProps {
  id: string;
  title: string;
  onToggle: (id) => void;
  onAddItem: () => void;
  onRemoveItem?: (type, id) => void;
  dataList: any[];
  isExpanded: boolean;
  plansDisabled?: boolean;
  type?: string;
}

const DetailViewItem: React.FunctionComponent<IProps> = ({
  id,
  title,
  isExpanded,
  onToggle,
  dataList,
  plansDisabled,
  onAddItem,
  onRemoveItem,
  type,
  ...props
}) => {
  return (
    <React.Fragment>
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
            <Button
              isDisabled={plansDisabled}
              variant="link"
              onClick={onAddItem}
            >
              <PlusCircleIcon /> Add {title}
            </Button>
          </Box>
        </Flex>
        <DataListContent
          aria-label="Primary Content Details"
          isHidden={!isExpanded}
        >
          <DataListComponent
            type={type}
            onRemoveItem={onRemoveItem}
            dataList={dataList}
          />
        </DataListContent>
      </DataListItem>
    </React.Fragment>
  );
};

export default DetailViewItem;
