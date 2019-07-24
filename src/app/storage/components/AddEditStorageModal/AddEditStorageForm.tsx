/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { withFormik } from 'formik';
import { Button, TextInput, Form, FormGroup } from '@patternfly/react-core';
import FormErrorDiv from '../../../common/components/FormErrorDiv';
import KeyDisplayIcon from '../../../common/components/KeyDisplayIcon';
import HideWrapper from '../../../common/components/HideWrapper';
import utils from '../../../common/duck/utils';
import storageUtils from '../../duck/utils';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
} from '../../../common/add_edit_state';


const nameKey = 'name';
const bucketNameKey = 'bucketName';
const bucketRegionKey = 'bucketRegion';
const accessKeyKey = 'accessKey';
const secretKey = 'secret';

const componentTypeStr = 'repository';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);


const InnerAddEditStorageForm = ({
  values,
  touched,
  errors,
  ...props
}) => {
  // Formik doesn't like addEditStatus destructured in the signature for some reason
  const currentStatus = props.addEditStatus;

  const [ isAccessKeyHidden, setIsAccessKeyHidden ] = useState(true);
  const handleAccessKeyHiddenToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAccessKeyHidden(!isAccessKeyHidden);
  }
  const [ isSecretHidden, setIsSecretHidden ] = useState(true);
  const handleSecretHiddenToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSecretHidden(!isSecretHidden);
  }

  const formikHandleChange = (_val, e) => props.handleChange(e);
  const formikSetFieldTouched = key => () => props.setFieldTouched(key, true, true);

  const onClose = () => {
    props.onClose();
  }

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
          isDisabled = { currentStatus.state === AddEditMode.Edit }
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
      <FormGroup label="S3 Bucket Region" isRequired fieldId={bucketRegionKey}>
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
      <FormGroup
        label="S3 Provider Secret Access Key"
        isRequired
        fieldId={secretKey}
      >
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
      <Button type="submit"
        isDisabled={isAddEditButtonDisabled(currentStatus, errors, touched)}
      >
        {addEditButtonTextFn(currentStatus)}
      </Button>
      <h3>Status:</h3>
      <div>{currentStatusFn(currentStatus)}</div>
      <Button variant="primary" onClick={onClose}>
        Close
      </Button>
    </Form>
  )
}

const AddEditStorageForm: any = withFormik({
  mapPropsToValues: ({initialStorageValues}) => {
    const v = initialStorageValues;
    return {
      name: v ? v.name : '',
      bucketName: v ? v.bucketName : '',
      bucketRegion: v ? v.bucketRegion: '',
      accessKey: v ? v.accessKey: '',
      secret: v ? v.secret: '',
    };
  },

  validate: (values: any)  => {
    const errors: any = {};

    if (!values.name) {
      errors.name = 'Required';
    } else if (!utils.testDNS1123(values.name)) {
      errors.name = utils.DNS1123Error(values.name);
    }
    if (!values.bucketName) {
      errors.bucketName = 'Required';
    }

    if (!values.bucketRegion) {
      errors.bucketRegion = 'Required';
    }

    const s3Error = storageUtils.testS3Name(values.bucketName);
    if (s3Error !== '') {
      errors.bucketName = s3Error;
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
