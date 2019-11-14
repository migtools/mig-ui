/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Box, Flex, Text } from '@rebass/emotion';
import AWSForm from './ProviderForms/AWSForm';
import GCPForm from './ProviderForms/GCPForm';
import AzureForm from './ProviderForms/AzureForm';
import { css } from '@emotion/core';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import { FormikProps } from 'formik';

interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  checkConnection: (name) => void;
  isLoadingStorage: boolean;
  currentStorage: any;
}

const AddEditStorageForm = (props: IOtherProps) => {
  const { currentStorage: storage, isLoadingStorage, addEditStatus } = props;

  let
    name,
    provider,
    awsBucketName,
    awsBucketRegion,
    s3Url,
    accessKey,
    secret,
    gcpBucket,
    azureResourceGroup,
    azureStorageAccount,
    azureBlob,
    gcpBlob;
  if (storage && addEditStatus.mode === 'edit') {
    name = storage.MigStorage.metadata.name;
    provider = storage.MigStorage.spec.backupStorageProvider;
    awsBucketName = storage.MigStorage.spec.backupStorageConfig.awsBucketName;
    awsBucketRegion = storage.MigStorage.spec.backupStorageConfig.awsRegion;
    s3Url = storage.MigStorage.spec.backupStorageConfig.awsS3Url;
    gcpBucket = storage.MigStorage.spec.backupStorageConfig.gcpBucket;
    azureResourceGroup = storage.MigStorage.spec.backupStorageConfig.azureResourceGroup;
    azureStorageAccount = storage.MigStorage.spec.backupStorageConfig.azureStorageAccount;
    accessKey =
      typeof storage.Secret === 'undefined'
        ? null
        : storage.Secret.data['aws-access-key-id']
          ? atob(storage.Secret.data['aws-access-key-id'])
          : '';
    secret =
      typeof storage.Secret === 'undefined'
        ? null
        : storage.Secret.data['aws-secret-access-key']
          ? atob(storage.Secret.data['aws-secret-access-key'])
          : '';

    gcpBlob =
      typeof storage.Secret === 'undefined'
        ? null
        : storage.Secret.data['gcp-credentials']
          ? atob(storage.Secret.data['gcp-credentials'])
          : '';
    azureBlob =
      typeof storage.Secret === 'undefined'
        ? null
        : storage.Secret.data['azure-credentials']
          ? atob(storage.Secret.data['azure-credentials'])
          : '';

  }


  // useEffect(() => {
  //   if (provider)
  //     handleProviderChange({
  //       label: provider,
  //       value: provider

  //     })
  // }), [provider];

  const [selectedProvider, setSelectedProvider] = useState(
    (storage && provider) ? {
      label: provider,
      value: provider
    } : {}
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

  if (isLoadingStorage) {
    return <Spinner size="md" />
  }

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
      {(selectedProvider && selectedProvider.value === 'aws') &&
        <AWSForm provider={selectedProvider.value}
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
          {...props} />
      }
      {(selectedProvider && selectedProvider.value === 'azure') &&
        <AzureForm
          provider={selectedProvider.value}
          currentStorage={storage}
          initialStorageValues={
            {
              name,
              azureResourceGroup,
              azureStorageAccount,
              azureBlob
            }
          }
          {...props} />
      }
      {(selectedProvider && selectedProvider.value === 'gcp') &&
        <GCPForm provider={selectedProvider.value}
          initialStorageValues={
            {
              name,
              gcpBucket,
              gcpBlob
            }
          }
          {...props} />
      }
    </Flex>
  );
};
export default AddEditStorageForm;
