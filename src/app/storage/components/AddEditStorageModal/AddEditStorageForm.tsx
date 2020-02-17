/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext } from 'react';
import Select from 'react-select';
import { Box, Flex, Text } from '@rebass/emotion';
import AWSForm from './ProviderForms/AWSForm';
import GCPForm from './ProviderForms/GCPForm';
import AzureForm from './ProviderForms/AzureForm';
import { css } from '@emotion/core';
import { StorageContext } from '../../../home/duck/context';

interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  checkConnection: (name) => void;
  storageList: any;
}

const AddEditStorageForm = (props: IOtherProps) => {
  const { storageList } = props;
  const storageContext = useContext(StorageContext);
  const storage = storageList.find(
    (storageItem) =>
      storageItem.MigStorage.metadata.name === storageContext.currentStorage);

  let name;
  let provider;
  let awsBucketName;
  let awsBucketRegion;
  let s3Url;
  let accessKey;
  let secret;
  let gcpBucket;
  let azureResourceGroup;
  let azureStorageAccount;
  let azureBlob;
  let gcpBlob;
  let requireSSL;
  let caBundle;
  if (storage) {
    name = storage.MigStorage.metadata.name;
    provider = storage.MigStorage.spec.backupStorageProvider;
    awsBucketName = storage.MigStorage.spec.backupStorageConfig.awsBucketName;
    awsBucketRegion = storage.MigStorage.spec.backupStorageConfig.awsRegion;
    s3Url = storage.MigStorage.spec.backupStorageConfig.awsS3Url;
    gcpBucket = storage.MigStorage.spec.backupStorageConfig.gcpBucket;
    azureResourceGroup = storage.MigStorage.spec.backupStorageConfig.azureResourceGroup;
    azureStorageAccount = storage.MigStorage.spec.backupStorageConfig.azureStorageAccount;
    requireSSL = !storage.MigStorage.spec.backupStorageConfig.insecure;
    caBundle = storage.MigStorage.spec.backupStorageConfig.s3CustomCABundle;
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

  const [selectedProvider, setSelectedProvider] = useState(
    (provider) ? {
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
          isDisabled={(provider) !== (null || undefined)}
        />
      </Box>
      {(selectedProvider && selectedProvider.value === 'aws') &&
        <AWSForm provider={selectedProvider.value}
          initialStorageValues={{ name, awsBucketName, awsBucketRegion, s3Url, accessKey, secret, requireSSL, caBundle }}
          {...props} />
      }
      {(selectedProvider && selectedProvider.value === 'azure') &&
        <AzureForm
          provider={selectedProvider.value}
          initialStorageValues={{ name, azureResourceGroup, azureStorageAccount, azureBlob }}
          {...props} />
      }
      {(selectedProvider && selectedProvider.value === 'gcp') &&
        <GCPForm provider={selectedProvider.value}
          initialStorageValues={{ name, gcpBucket, gcpBlob }}
          {...props} />
      }
    </Flex>
  );
};
export default AddEditStorageForm;
