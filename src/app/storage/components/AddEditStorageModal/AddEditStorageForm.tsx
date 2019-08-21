/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import {
  Button,
  TextInput,
  Form,
  FormGroup,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { withFormik, FormikProps } from 'formik';
import FormErrorDiv from '../../../common/components/FormErrorDiv';
import KeyDisplayIcon from '../../../common/components/KeyDisplayIcon';
import HideWrapper from '../../../common/components/HideWrapper';
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
import { Flex, Box } from '@rebass/emotion';
import ConnectionStatusLabel from '../../../common/components/ConnectionStatusLabel';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

const nameKey = 'name';
const s3UrlKey = 's3Url';
const bucketNameKey = 'bucketName';
const bucketRegionKey = 'bucketRegion';
const accessKeyKey = 'accessKey';
const secretKey = 'secret';

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

const InnerAddEditStorageForm = (props: OtherProps & FormikProps<FormValues>) => {
  const { addEditStatus: currentStatus, currentStorage, checkConnection, values, touched, errors } = props;


  const [isAccessKeyHidden, setIsAccessKeyHidden] = useState(true);
  const handleAccessKeyHiddenToggle = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsAccessKeyHidden(!isAccessKeyHidden);
  };
  const [isSecretHidden, setIsSecretHidden] = useState(true);
  const handleSecretHiddenToggle = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsSecretHidden(!isSecretHidden);
  };

  const formikHandleChange = (_val, e) => props.handleChange(e);
  const formikSetFieldTouched = key => () => props.setFieldTouched(key, true, true);

  const onClose = () => {
    props.onClose();
  };

  return (
    <Form onSubmit={props.handleSubmit} style={{ marginTop: '24px' }}>
      <FormGroup label="Repository Name" isRequired fieldId={nameKey}>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(nameKey)}
          onBlur={props.handleBlur}
          value={values.name}
          name={nameKey}
          type="text"
          id="storage-name-input"
          isDisabled={currentStatus.mode === AddEditMode.Edit}
        />
        {errors.name && touched.name && (
          <FormErrorDiv id="feedback-name">{errors.name}</FormErrorDiv>
        )}
      </FormGroup>
      <FormGroup label="S3 Bucket Name" isRequired fieldId={bucketNameKey}>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(bucketNameKey)}
          onBlur={props.handleBlur}
          value={values.bucketName}
          name={bucketNameKey}
          type="text"
          id="storage-bucket-name-input"
        />
        {errors.bucketName && touched.bucketName && (
          <FormErrorDiv id="feedback-bucket-name">{errors.bucketName}</FormErrorDiv>
        )}
      </FormGroup>
      <FormGroup label="S3 Bucket Region" fieldId={bucketRegionKey}>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(bucketRegionKey)}
          onBlur={props.handleBlur}
          value={values.bucketRegion}
          name={bucketRegionKey}
          type="text"
          id="storage-bucket-region-input"
        />
        {errors.bucketRegion && touched.bucketRegion && (
          <FormErrorDiv id="feedback-bucket-name">{errors.bucketName}</FormErrorDiv>
        )}
      </FormGroup>
      <FormGroup label="S3 Endpoint" fieldId={s3UrlKey}>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(s3UrlKey)}
          onBlur={props.handleBlur}
          value={values.s3Url}
          name={s3UrlKey}
          type="text"
          id="storage-s3-url-input"
        />
        {errors.s3Url && touched.s3Url && (
          <FormErrorDiv id="feedback-s3-url">{errors.s3Url}</FormErrorDiv>
        )}
      </FormGroup>
      <FormGroup label="S3 Provider Access Key" isRequired fieldId={accessKeyKey}>
        <HideWrapper onClick={handleAccessKeyHiddenToggle}>
          <KeyDisplayIcon id="accessKeyIcon" isHidden={isAccessKeyHidden} />
        </HideWrapper>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(accessKeyKey)}
          onBlur={props.handleBlur}
          value={values.accessKey}
          name={accessKeyKey}
          type={isAccessKeyHidden ? 'password' : 'text'}
          id="storage-access-key-input"
        />
        {errors.accessKey && touched.accessKey && (
          <FormErrorDiv id="feedback-access-key">{errors.accessKey}</FormErrorDiv>
        )}
      </FormGroup>
      <FormGroup label="S3 Provider Secret Access Key" isRequired fieldId={secretKey}>
        <HideWrapper onClick={handleSecretHiddenToggle}>
          <KeyDisplayIcon id="accessKeyIcon" isHidden={isSecretHidden} />
        </HideWrapper>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(secretKey)}
          onBlur={props.handleBlur}
          value={values.secret}
          name={secretKey}
          type={isSecretHidden ? 'password' : 'text'}
          id="storage-secret-input"
        />
        {errors.secret && touched.secret && (
          <FormErrorDiv id="feedback-secret-key">{errors.secret}</FormErrorDiv>
        )}
      </FormGroup>
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
            </div>}><OutlinedQuestionCircleIcon />
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

interface FormValues {
  name: string;
  bucketName: string;
  bucketRegion: string;
  accessKey: string;
  secret: string;
  s3Url: string;
}
interface OtherProps {
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
    };

    if (initialStorageValues) {
      values.name = initialStorageValues.name || '';
      values.bucketName = initialStorageValues.bucketName || '';
      values.bucketRegion = initialStorageValues.bucketRegion || '';
      values.accessKey = initialStorageValues.accessKey || '';
      values.secret = initialStorageValues.secret || '';
      values.s3Url = initialStorageValues.s3Url || '';
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

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAddEditStorageForm);

export default AddEditStorageForm;
