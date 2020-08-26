import React, { useState } from 'react';
import { Button, TextInput, Form, FormGroup, Grid, GridItem, Flex } from '@patternfly/react-core';
import KeyDisplayToggle from '../../../../../../common/components/KeyDisplayToggle';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
  isCheckConnectionButtonDisabled,
} from '../../../../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../../../../common/components/ConnectionStatusLabel';
import { withFormik, FormikProps } from 'formik';
import utils from '../../../../../../common/duck/utils';
import storageUtils from '../../../../../../storage/duck/utils';
import { validatedState } from '../../../../../../common/helpers';

const componentTypeStr = 'Repository';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

const valuesHaveUpdate = (values, currentStorage) => {
  if (!currentStorage) {
    return true;
  }

  const existingMigStorageName = currentStorage.MigStorage.metadata.name;
  const existingGCPBucket = currentStorage.MigStorage.spec.backupStorageConfig.gcpBucket;
  let existingGCPBlob;
  if (currentStorage.Secret.data['gcp-credentials']) {
    existingGCPBlob = atob(currentStorage.Secret.data['gcp-credentials']);
  }

  const valuesUpdatedObject =
    values.name !== existingMigStorageName ||
    values.gcpBucket !== existingGCPBucket ||
    values.gcpBlob !== existingGCPBlob;

  return valuesUpdatedObject;
};

interface IFormValues {
  name: string;
  bslProvider: string;
  gcpBucket: string;
  gcpBlob: any;
}
interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  initialStorageValues: any;
  checkConnection: (name) => void;
  currentStorage?: any;
  provider: string;
}

const InnerGCPForm = (props: IOtherProps & FormikProps<IFormValues>) => {
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
    handleBlur,
  } = props;
  const nameKey = 'name';
  const gcpBucketKey = 'gcpBucket';
  const gcpBlobKey = 'gcpBlob';

  const [isBlobHidden, setIsBlobHidden] = useState(true);

  const handleBlobHiddenToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBlobHidden(!isBlobHidden);
  };

  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = (key) => () => setFieldTouched(key, true, true);

  return (
    <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <FormGroup
        label="Repository name"
        isRequired
        fieldId={nameKey}
        helperTextInvalid={touched.name && errors.name}
        validated={validatedState(touched.name, errors.name)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}

        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(nameKey)}
          onBlur={handleBlur}
          value={values.name}
          name={nameKey}
          type="text"
          id={nameKey}
          isDisabled={currentStatus.mode === AddEditMode.Edit}
          validated={validatedState(touched.name, errors.name)}
        />
      </FormGroup>
      <FormGroup
        label="GCP bucket name"
        isRequired
        fieldId={gcpBucketKey}
        helperTextInvalid={touched.gcpBucket && errors.gcpBucket}
        validated={validatedState(touched.gcpBucket, errors.gcpBucket)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}

        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(gcpBucketKey)}
          onBlur={handleBlur}
          value={values.gcpBucket}
          name={gcpBucketKey}
          type="text"
          id={gcpBucketKey}
          validated={validatedState(touched.gcpBucket, errors.gcpBucket)}
        />
      </FormGroup>
      <FormGroup
        label="GCP credential JSON blob"
        labelIcon={
          <KeyDisplayToggle
            keyName="GCP credential JSON blob"
            isKeyHidden={isBlobHidden}
            onClick={handleBlobHiddenToggle}
          />
        }
        isRequired
        fieldId={gcpBlobKey}
        helperTextInvalid={touched.gcpBlob && errors.gcpBlob}
        validated={validatedState(touched.gcpBlob, errors.gcpBlob)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(gcpBlobKey)}
          onBlur={handleBlur}
          value={values.gcpBlob}
          name={gcpBlobKey}
          type={isBlobHidden ? 'password' : 'text'}
          id={gcpBlobKey}
          validated={validatedState(touched.gcpBlob, errors.gcpBlob)}
        />
      </FormGroup>
      <Flex>
        <Button
          aria-label="GCP Storage Submit Form"
          variant="primary"
          type="submit"
          isDisabled={isAddEditButtonDisabled(
            currentStatus,
            errors,
            touched,
            valuesHaveUpdate(values, currentStorage)
          )}
        >
          {addEditButtonTextFn(currentStatus)}
        </Button>
        <Button
          variant="secondary"
          isDisabled={isCheckConnectionButtonDisabled(
            currentStatus,
            valuesHaveUpdate(values, currentStorage)
          )}
          onClick={() => checkConnection(values.name)}
        >
          Check Connection
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Flex>
      <ConnectionStatusLabel status={currentStatus} statusText={currentStatusFn(currentStatus)} />
    </Form>
  );
};

const GCPForm = withFormik<IOtherProps, IFormValues>({
  mapPropsToValues: ({ initialStorageValues, provider }) => {
    const values = {
      name: '',
      gcpBucket: '',
      gcpBlob: '',
      bslProvider: provider,
    };

    if (initialStorageValues) {
      values.name = initialStorageValues.name || '';
      values.gcpBucket = initialStorageValues.gcpBucket || '';
      values.gcpBlob = initialStorageValues.gcpBlob || '';
      values.bslProvider = initialStorageValues.bslProvider || provider;
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

    if (!values.gcpBucket) {
      errors.gcpBucket = 'Required';
    } else {
      const gcpBucketNameError = storageUtils.testS3Name(values.gcpBucket);
      if (gcpBucketNameError !== '') {
        errors.gcpBucket = gcpBucketNameError;
      }
    }

    if (!values.gcpBlob) {
      errors.gcpBlob = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerGCPForm);

export default GCPForm;
