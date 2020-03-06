import React, { useState, useContext } from 'react';
import {
  Grid,
  GridItem
} from '@patternfly/react-core';
import Select from 'react-select';
import AWSForm from './ProviderForms/AWSForm';
import GCPForm from './ProviderForms/GCPForm';
import AzureForm from './ProviderForms/AzureForm';
import { StorageContext } from '../../../home/duck/context';
const styles = require('./AddEditStorageForm.module');

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
    { label: 'S3', value: 'aws' },
    { label: 'GCP', value: 'gcp' },
    { label: 'Azure', value: 'azure' }
  ]);


  const handleProviderChange = option => {
    setSelectedProvider(
      option
    );
  };

  return (
    <Grid gutter="md">
      <GridItem className={styles.selectType}>
        Storage provider type
      </GridItem>
      <GridItem span={8} className={styles.selectType}>
        <Select
          name="provider"
          onChange={handleProviderChange}
          options={providerOptions}
          value={selectedProvider}
          isDisabled={(provider) !== (null || undefined)}
        />
      </GridItem>
      <GridItem span={10}>
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
      </GridItem>
    </Grid >
  );
};
export default AddEditStorageForm;
