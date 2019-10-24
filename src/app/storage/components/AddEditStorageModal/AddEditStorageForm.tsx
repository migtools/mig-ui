/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Form,
  FormGroup,
  Tooltip,
  TooltipPosition,
  TextArea,
  Checkbox
} from '@patternfly/react-core';
import Select from 'react-select';
import { withFormik, FormikProps } from 'formik';
import utils from '../../../common/duck/utils';
import storageUtils from '../../duck/utils';
import commonUtils from '../../../common/duck/utils';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
  isCheckConnectionButtonDisabled,
} from '../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../common/components/ConnectionStatusLabel';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { Box, Flex, Text } from '@rebass/emotion';
import AWSForm from './ProviderForms/AWSForm';


const componentTypeStr = 'Repository';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

// valuesHaveUpdate - returns true if the formik values hold values that differ
// from a matching existing repository. This is different from props.dirty, which returns
// true when the form values differ from the initial values. It's possible to have
// a storage object exist, but have no initial values (user adds new storage, then updates
// while keeping the modal open). props.dirty is not sufficient for this case.
const valuesHaveUpdate = (values, currentStorage) => {
  if (!currentStorage) { return true; }

  const existingMigStorageName = currentStorage.MigStorage.metadata.name;
  const existingBucketName = currentStorage.MigStorage.spec.backupStorageConfig.awsBucketName;
  const existingBucketRegion = currentStorage.MigStorage.spec.backupStorageConfig.awsRegion || '';
  const existingBucketUrl = currentStorage.MigStorage.spec.backupStorageConfig.awsS3Url || '';
  const existingAccessKeyId = atob(currentStorage.Secret.data['aws-access-key-id']);
  const existingSecretAccessKey = atob(currentStorage.Secret.data['aws-secret-access-key']);

  const valuesUpdatedObject =
    values.name !== existingMigStorageName ||
    values.bucketName !== existingBucketName ||
    values.bucketRegion !== existingBucketRegion ||
    values.s3Url !== existingBucketUrl ||
    values.accessKey !== existingAccessKeyId ||
    values.secret !== existingSecretAccessKey;

  return valuesUpdatedObject;
};

const InnerAddEditStorageForm = (props: IOtherProps & FormikProps<IFormValues>) => {
  const {
    addEditStatus: currentStatus,
    currentStorage,
    checkConnection,
    values,
    touched,
    errors,
    handleChange,
    setFieldTouched,
    setFieldValue,
    onClose,
    handleSubmit,
    handleBlur
  } = props;


  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerOptions, setproviderOptions] = useState([
    { label: 'aws', value: 'aws' },
    { label: 'gcp', value: 'gcp' },
    { label: 'azure', value: 'azure' }
  ]);


  // const handleSharedCredsChange = (checked, event) => {
  //   setFieldValue('isSharedCred', checked);
  //   setIsSharedCred(checked);
  // };

  const handleProviderChange = option => {
    setFieldValue('volumeSnapshotProvider', option.value);
    setSelectedProvider(
      option
    );
    setFieldTouched('volumeSnapshotProvider');
  };

  const DynamicForm = ({ provider }) => {
    console.log('provider', provider)
    if (provider === null) {
      return null;
    } else {
      return (
        <div>
          {(() => {
            switch (provider.value) {
              case 'aws':
                return <AWSForm {...props} />;
              // case 'warning':
              //   return <Warning text={text} />;
              // case 'error':
              //   return <Error text={text} />;
              default:
                return null;
            }
          })()}
        </div>
      );

    }
  }

  return (
    <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <Flex flexDirection="column">
        <Box
          m="0 0 1em 0 "
          flex="auto"
          width={1 / 2}
        >
          <Select
            name="provider"
            onChange={handleProviderChange}
            options={providerOptions}
            value={selectedProvider}
          />
        </Box>
      </Flex>

      <DynamicForm provider={selectedProvider} {...props} />

      <Flex flexDirection="column">
        <Box m="0 0 1em 0 ">
          <Button
            type="submit"
            isDisabled={isAddEditButtonDisabled(
              currentStatus, errors, touched, valuesHaveUpdate(values, currentStorage)
            )}
            style={{ marginRight: '10px' }}
          >
            {addEditButtonTextFn(currentStatus)}
          </Button>
          <Tooltip
            position={TooltipPosition.top}
            content={<div>
              Add or edit your storage details
            </div>}>
            <span className="pf-c-icon">
              <OutlinedQuestionCircleIcon />
            </span>
          </Tooltip>
          <Button
            style={{ marginLeft: '10px', marginRight: '10px' }}
            isDisabled={isCheckConnectionButtonDisabled(
              currentStatus, valuesHaveUpdate(values, currentStorage),
            )}
            onClick={() => checkConnection(values.name)}
          >
            Check Connection
          </Button>
          <Tooltip
            position={TooltipPosition.top}
            content={<div>
              Re-check your storage connection state
            </div>}><OutlinedQuestionCircleIcon />
          </Tooltip>
        </Box>
        <Box m="0 0 1em 0 ">
          <ConnectionStatusLabel
            status={currentStatus}
            statusText={currentStatusFn(currentStatus)}
          />
        </Box>
        <Box m="auto 0 0 0 ">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Flex>
    </Form>
  );
};

interface IFormValues {
  name: string;
  bucketName: string;
  bucketRegion: string;
  accessKey: string;
  secret: string;
  s3Url: string;
  // isSharedSecret?: boolean;
  // vslBlob?: string;
  // volumeSnapshotProvider: string
  bslProvider: string
}
interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  initialStorageValues: any;
  checkConnection: (name) => void;
  currentStorage: any;
}

const AddEditStorageForm: any = withFormik({
  mapPropsToValues: ({ initialStorageValues }) => {
    const values = {
      name: '',
      bucketName: '',
      bucketRegion: '',
      accessKey: '',
      secret: '',
      s3Url: '',
      bslProvider: '',
      // vslBlob: '',
      // volumeSnapshotProvider: '',
      // isSharedCred: true
    };

    if (initialStorageValues) {
      values.name = initialStorageValues.name || '';
      values.bucketName = initialStorageValues.bucketName || '';
      values.bucketRegion = initialStorageValues.bucketRegion || '';
      values.accessKey = initialStorageValues.accessKey || '';
      values.secret = initialStorageValues.secret || '';
      values.s3Url = initialStorageValues.s3Url || '';
      values.bslProvider = initialStorageValues.bslProvider || '';
      // values.vslBlob = initialStorageValues.vslBlob || '';
      // values.volumeSnapshotProvider = initialStorageValues.volumeSnapshotProvider || '';
      // values.isSharedCred = initialStorageValues.isSharedCred || true;
    }

    return values;
  },

  validate: (values: any) => {
    const errors: any = {};

    if (!values.name) {
      errors.name = 'Required';
    } else if (!utils.testDNS1123(values.name)) {
      errors.name = utils.DNS1123Error(values.name);
    }

    if (!values.bucketName) {
      errors.bucketName = 'Required';
    }

    const bucketNameError = storageUtils.testS3Name(values.bucketName);
    if (bucketNameError !== '') {
      errors.bucketName = bucketNameError;
    }

    if (!values.bucketName) {
      errors.bucketName = 'Required';
    }

    if (values.s3Url !== '') {
      const s3UrlError = commonUtils.testURL(values.s3Url) ?
        '' : 'S3 Endpoint must be a valid URL.';
      if (s3UrlError !== '') {
        errors.s3Url = s3UrlError;
      }
    }

    if (!values.accessKey) {
      errors.accessKey = 'Required';
    }

    if (!values.secret) {
      errors.secret = 'Required';
    }

    // if (!values.vslBlob) {
    //   errors.vslBlob = 'Required';
    // }

    // if (!values.volumeSnapshotProvider) {
    //   errors.volumeSnapshotProvider = 'Required';
    // }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    console.log('add vals', values)
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAddEditStorageForm);

export default AddEditStorageForm;
