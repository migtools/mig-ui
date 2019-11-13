/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import Select from 'react-select';
import { Box, Flex, Text } from '@rebass/emotion';
import AWSForm from './ProviderForms/AWSForm';
import GCPForm from './ProviderForms/GCPForm';
import AzureForm from './ProviderForms/AzureForm';
import { css } from '@emotion/core';

interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  checkConnection: (name) => void;
  currentStorage: any;
}

const AddEditStorageForm = (props: IOtherProps) => {
  const { currentStorage: storage } = props;
  const name = storage.MigStorage.metadata.name;
  const provider = storage.MigStorage.spec.backupStorageProvider;
  const awsBucketName = storage.MigStorage.spec.backupStorageConfig.awsBucketName;
  const awsBucketRegion = storage.MigStorage.spec.backupStorageConfig.awsRegion;
  const s3Url = storage.MigStorage.spec.backupStorageConfig.awsS3Url;
  const gcpBucket = storage.MigStorage.spec.backupStorageConfig.gcpBucket;
  const azureResourceGroup = storage.MigStorage.spec.backupStorageConfig.azureResourceGroup;
  const azureStorageAccount = storage.MigStorage.spec.backupStorageConfig.azureStorageAccount;

  const accessKey =
    typeof storage.Secret === 'undefined'
      ? null
      : storage.Secret.data['aws-access-key-id']
        ? atob(storage.Secret.data['aws-access-key-id'])
        : '';
  const secret =
    typeof storage.Secret === 'undefined'
      ? null
      : storage.Secret.data['aws-secret-access-key']
        ? atob(storage.Secret.data['aws-secret-access-key'])
        : '';

  const gcpBlob =
    typeof storage.Secret === 'undefined'
      ? null
      : storage.Secret.data['gcp-credentials']
        ? atob(storage.Secret.data['gcp-credentials'])
        : '';
  const azureBlob =
    typeof storage.Secret === 'undefined'
      ? null
      : storage.Secret.data['azure-credentials']
        ? atob(storage.Secret.data['azure-credentials'])
        : '';

  const DynamicForm = ({ provider }) => {
    if (provider === null) {
      return (
        <Flex>
          <Box>
            <Text />
          </Box>
        </Flex>
      );
    } else {
      switch (provider.value) {
        case 'aws':
          return <AWSForm provider={provider.value}
            initialStorageValues={
              {
                name,
                awsBucketName,
                awsBucketRegion,
                accessKey,
                secret,
                s3Url
              }
            }
            {...props} />;
        case 'gcp':
          return <GCPForm provider={provider.value}
            initialStorageValues={
              {
                name,
                gcpBucket,
                gcpBlob
              }
            }
            {...props} />;
        case 'azure':
          return <AzureForm provider={provider.value}
            initialStorageValues={
              {
                name,
                azureResourceGroup,
                azureStorageAccount,
                azureBlob
              }
            }
            {...props} />;
        default:
          return null;
      }
    }
  };

  const [selectedProvider, setSelectedProvider] = useState(
    (storage && provider) ? {
      label: provider,
      value: provider
    } : null
  );
  const [providerOptions, setproviderOptions] = useState([
    { label: 'aws', value: 'aws' },
    { label: 'gcp', value: 'gcp' },
    { label: 'azure', value: 'azure' }
  ]);


  const handleProviderChange = option => {
    setSelectedProvider(
      option
    );
  };
  return (
    <Flex flexDirection="column">
      <Box
        m="0 0 1em 0 "
        flex="auto"
        width={1 / 2}
        height={1}
        minHeight={11}
      >
        <Text css={css`
        font-weight: 550;
        font-size: 14px;
        margin-bottom: 5px;
        `}>
          Storage provider type
        </Text>
        <Select
          name="provider"
          onChange={handleProviderChange}
          options={providerOptions}
          value={selectedProvider}
          isDisabled={(storage && provider) !== (null || undefined)}
        />
      </Box>
      <DynamicForm provider={selectedProvider} {...props} />
    </Flex>
  );
};
export default AddEditStorageForm;
