import React from 'react';
import { Flex, Box } from '@rebass/emotion';
import {
  Button,
  DataListItem,
  DataListCell,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { LinkIcon } from '@patternfly/react-icons';

const StorageItem = ({ storage, storageIndex, isLoading, ...props }) => {
  const associatedPlanCount = props.associatedPlans[storage.metadata.name];
  const planText = associatedPlanCount === 1 ? 'plan' : 'plans';
  let storageStatus;
  if (typeof storage.status === 'undefined' || storage.status === null) {
    storageStatus = null;
  } else {
    storageStatus = storage.status.conditions[0].type;
  }
  return (
    <DataListItem key={storageIndex} aria-labelledby="">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key={name} width={1}>
              <StatusIcon status={storageStatus} />
              <span id="simple-item1">{storage.metadata.name}</span>
            </DataListCell>,
            <DataListCell key="url" width={2}>
              <a target="_blank" href={storage.spec.bucketUrl}>
                {storage.spec.bucketUrl}
              </a>
            </DataListCell>,
            <DataListCell key="count" width={2}>
              <LinkIcon /> {associatedPlanCount} associated migration {planText}
            </DataListCell>,
            <DataListCell key="actions" width={2}>
              <Flex justifyContent="flex-end">
                <Box mx={1}>
                  <Button variant="secondary">Edit</Button>
                </Box>
                <Box mx={1}>
                  <Button variant="danger">Remove</Button>
                </Box>
              </Flex>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};
export default StorageItem;
