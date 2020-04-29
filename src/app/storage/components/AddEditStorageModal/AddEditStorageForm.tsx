import React, { useState, useContext } from 'react';
import { Form, FormGroup } from '@patternfly/react-core';
import S3Form from './ProviderForms/S3Form';
import GCPForm from './ProviderForms/GCPForm';
import AzureForm from './ProviderForms/AzureForm';
import { StorageContext } from '../../../home/duck/context';
import { IStorage } from '../../../../models';
import SimpleSelect, { OptionWithValue } from '../../../common/components/SimpleSelect';

interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  checkConnection: (name) => void;
  storageList: IStorage[];
}

interface IProviderOption extends OptionWithValue {
  value: 'aws-s3' | 'generic-s3' | 'gcp' | 'azure';
}

const AddEditStorageForm = (props: IOtherProps) => {
  const { storageList } = props;
  const storageContext = useContext(StorageContext);
  const storage = storageList.find(
    (storageItem) => storageItem.MigStorage.metadata.name === storageContext.currentStorage
  );

  let name;
  let provider: IProviderOption['value'];
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

    if (storage.MigStorage.spec.backupStorageProvider === 'aws') {
      provider = 'generic-s3';
      const annotations = storage.MigStorage.metadata.annotations;
      const awsS3Annotation = annotations && annotations['migration.openshift.io/mig-ui.aws-s3'];
      if (awsS3Annotation === 'true' || (awsS3Annotation !== 'false' && !s3Url)) {
        provider = 'aws-s3';
      }
    }
  }

  const [selectedProvider, setSelectedProvider] = useState(provider);

  const providerOptions: IProviderOption[] = [
    { value: 'aws-s3', toString: () => 'AWS S3' },
    { value: 'generic-s3', toString: () => 'S3' },
    { value: 'gcp', toString: () => 'GCP' },
    { value: 'azure', toString: () => 'Azure' },
  ];

  return (
    <>
      <Form>
        <FormGroup label="Storage provider type" isRequired fieldId="provider-type-select">
          <SimpleSelect
            aria-label="Select storage provider type"
            onChange={(option: IProviderOption) => setSelectedProvider(option.value)}
            options={providerOptions}
            value={providerOptions.find((option) => option.value === selectedProvider)}
            placeholderText="Select a type..."
          />
        </FormGroup>
      </Form>
      {selectedProvider && ['aws-s3', 'generic-s3'].includes(selectedProvider) && (
        <S3Form
          provider={selectedProvider}
          initialStorageValues={{
            name,
            awsBucketName,
            awsBucketRegion,
            s3Url,
            accessKey,
            secret,
            requireSSL,
            caBundle,
          }}
          isAWS={selectedProvider === 'aws-s3'}
          {...props}
        />
      )}
      {selectedProvider && selectedProvider === 'azure' && (
        <AzureForm
          provider={selectedProvider}
          initialStorageValues={{ name, azureResourceGroup, azureStorageAccount, azureBlob }}
          {...props}
        />
      )}
      {selectedProvider && selectedProvider === 'gcp' && (
        <GCPForm
          provider={selectedProvider}
          initialStorageValues={{ name, gcpBucket, gcpBlob }}
          {...props}
        />
      )}
    </>
  );
};
export default AddEditStorageForm;
