import React from 'react';
import {
  DataListItem,
  DataListToggle,
  DataListContent,
  DataListCell,
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { PlusCircleIcon } from '@patternfly/react-icons';
import { Flex, Box } from '@rebass/emotion';
import { css } from '@emotion/core';

import DataListComponent from './DataListComponent';

import { } from '@patternfly/react-core';
import theme from '../../../theme';
interface IProps {
  id: string;
  title: string;
  addButton?: React.ReactNode;
  onToggle: (id) => void;
  onRemoveItem?: (type, id) => void;
  dataList: any[];
  isExpanded: boolean;
  plansDisabled?: boolean;
  type?: string;
  onClusterSearch?: (val, otherval) => void;
}

const DetailViewItem: React.FunctionComponent<IProps> = ({
  id,
  title,
  isExpanded,
  onToggle,
  dataList,
  plansDisabled,
  addButton,
  onRemoveItem,
  type,
  onClusterSearch,
  ...props
}) => {
  return (
    <Card>
      <CardBody>
        <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
          <Flex width="100%" height="5em" >
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
              {addButton}
            </Box>
          </Flex>
          <DataListContent
            aria-label="Primary Content Details"
            isHidden={!isExpanded}
          >
            <InputGroup
              // @ts-ignore
              css={css`
            width: 20% !important;
            margin: auto 0 2em 0 ;
            `}
            >
              <TextInput
                name="textInput11"
                id="textInput11"
                type="search"
                aria-label="search input example"
                onChange={onClusterSearch}
              />
              <Button variant={ButtonVariant.tertiary} aria-label="search button for search input">
                <SearchIcon />
              </Button>
            </InputGroup>

            <DataListComponent
              type={type}
              onRemoveItem={onRemoveItem}
              dataList={dataList}
            />
          </DataListContent>
        </DataListItem>

      </CardBody>
    </Card>
  );
};

export default DetailViewItem;
