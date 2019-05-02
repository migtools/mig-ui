import React from 'react';
import {
  Button,
  DataList,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListContent,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import StatusIcon from '../../../common/components/StatusIcon';
import { LinkIcon } from '@patternfly/react-icons';
import DataListEmptyState from './DataListEmptyState';
import { useExpandDataList, useOpenModal } from '../../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';
import AddStorageModal from '../../../storage/components/AddStorageModal';

const StorageDataListItem = ({ dataList, ...props }) => {
  const [isExpanded, toggleExpanded] = useExpandDataList(false);
  const [isOpen, toggleOpen] = useOpenModal(false);
  if (dataList) {
    return (
      <DataListItem aria-labelledby="ex-item1" isExpanded={isExpanded}>
        <Flex width="100%" height="5em" margin=" .5em" >
          <Box flex="0 0 2em" my="auto">
            <DataListToggle
              onClick={() => toggleExpanded()}
              isExpanded={isExpanded}
              id='storage-toggle'
            />
          </Box>
          <Box flex="1" my="auto">
            Storage
          </Box>
          <Box textAlign="left" flex="0 0 10em" my="auto">
            <Button onClick={toggleOpen} variant="link">
              <PlusCircleIcon /> Add Storage
            </Button>
            <AddStorageModal isOpen={isOpen} onHandleClose={toggleOpen} />
          </Box>
        </Flex>
        <DataListContent
          noPadding
          aria-label="Primary Content Details"
          isHidden={!isExpanded}
        >
          {dataList.length > 0 ? (
            <DataList aria-label="Storage Data List">
              {dataList.map((listItem, index) => {
                const associatedPlanCount = props.associatedPlans[listItem.metadata.name];
                const planText = associatedPlanCount === 1 ? 'plan' : 'plans';
                return (
                  <DataListItem
                    key={index}
                    isExpanded={false}
                    aria-labelledby="simple-item1"
                  >
                    <DataListCell width={1}>
                      <StatusIcon status="success" />
                      <span id="simple-item1">{listItem.metadata.name}</span>
                    </DataListCell>
                    <DataListCell width={2}>
                      <a
                        target="_blank"
                        href={listItem.spec.bucketUrl}
                      >
                        {listItem.spec.bucketUrl}
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
                              props.onRemoveItem('storage', dataList[index].id)
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

                  <DataListEmptyState type="storage" />
                </Box>
              </Flex>
            )}
        </DataListContent>
      </DataListItem>
    );
  }
  return null;
};

export default StorageDataListItem;
