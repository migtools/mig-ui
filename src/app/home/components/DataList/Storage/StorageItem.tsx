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
import AddStorageModal from '../../../../storage/components/AddStorageModal';
import { LinkIcon } from '@patternfly/react-icons';
import { useOpenModal } from '../../../duck/hooks';
import ConfirmModal from '../../../../common/components/ConfimModal';

const StorageItem = ({ storage, storageIndex, isLoading, removeStorage, ...props }) => {
  const associatedPlanCount = props.associatedPlans[storage.MigStorage.metadata.name];
  const planText = associatedPlanCount === 1 ? 'plan' : 'plans';
  const [isOpen, toggleOpen] = useOpenModal(false);
  const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);
  const name = storage.MigStorage.metadata.name;
  const bucketName = storage.MigStorage.spec.backupStorageConfig.awsBucketName;
  const bucketRegion = storage.MigStorage.spec.backupStorageConfig.awsRegion;

  const accessKey =
    typeof storage.Secret === 'undefined' ? null : atob(storage.Secret.data['aws-access-key-id']);
  const secret =
    typeof storage.Secret === 'undefined'
      ? null
      : atob(storage.Secret.data['aws-secret-access-key-id']);

  let storageStatus;
  if (typeof storage.MigStorage.status === 'undefined' || storage.MigStorage.status === null) {
    storageStatus = null;
  } else {
    storageStatus = storage.MigStorage.status.conditions[0].type;
  }
  const removeMessage = `Are you sure you want to remove "${name}"`;

  const handleRemoveStorage = isConfirmed => {
    if (isConfirmed) {
      // removeStorage(clusterName);
      toggleConfirmOpen();
    } else {
      toggleConfirmOpen();
    }
  };

  return (
    <DataListItem key={storageIndex} aria-labelledby="">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key={name} width={1}>
              <StatusIcon status={storageStatus} />
              <span id="simple-item1">{name}</span>
            </DataListCell>,
            <DataListCell key="url" width={2}>
              <a target="_blank" href={storage.MigStorage.spec.bucketName}>
                {storage.MigStorage.spec.bucketName}
              </a>
            </DataListCell>,
            <DataListCell key="count" width={2}>
              <LinkIcon /> {associatedPlanCount} associated migration {planText}
            </DataListCell>,
            <DataListCell key="actions" width={2}>
              <Flex justifyContent="flex-end">
                <Box mx={1}>
                  <Button onClick={toggleOpen} variant="secondary">
                    Edit
                  </Button>
                  <AddStorageModal
                    isOpen={isOpen}
                    onHandleClose={toggleOpen}
                    name={name}
                    bucketName={bucketName}
                    bucketRegion={bucketRegion}
                    accessKey={accessKey}
                    secret={secret}
                    mode="update"
                  />
                </Box>
                <Box mx={1}>
                  <Button onClick={toggleConfirmOpen} variant="danger" key="remove-action">
                    Remove
                  </Button>
                  <ConfirmModal
                    message={removeMessage}
                    isOpen={isConfirmOpen}
                    onHandleClose={handleRemoveStorage}
                    id="confirm-storage-removal"
                  />
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
