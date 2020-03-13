import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Form,
  FormGroup,
  Tooltip,
  TooltipPosition,
  Grid,
  GridItem
} from '@patternfly/react-core';
import KeyDisplayIcon from '../../../../common/components/KeyDisplayIcon';
import HideWrapper from '../../../../common/components/HideWrapper';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
  isCheckConnectionButtonDisabled,
} from '../../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../../common/components/ConnectionStatusLabel';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { withFormik, FormikProps } from 'formik';
import utils from '../../../../common/duck/utils';
import storageUtils from '../../../duck/utils';

const componentTypeStr = 'Repository';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

const valuesHaveUpdate = (values, currentStorage) => {
  if (!currentStorage) { return true; }

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
  currentStorage: any;
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
    handleBlur

  } = props;
  const nameKey = 'name';
  const gcpBucketKey = 'gcpBucket';
  const gcpBlobKey = 'gcpBlob';

  const [isBlobHidden, setIsBlobHidden] = useState(true);

  const handleBlobHiddenToggle = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsBlobHidden(!isBlobHidden);
  };

  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = key => () => setFieldTouched(key, true, true);

  return (
    <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <FormGroup
        label="Repository name"
        isRequired
        fieldId={nameKey}
        helperTextInvalid={touched.name && errors.name}
        isValid={!(touched.name && errors.name)}
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
          id="storage-name-input"
          isDisabled={currentStatus.mode === AddEditMode.Edit}
          isValid={!(touched.name && errors.name)}
        />
      </FormGroup>
      <FormGroup
        label="GCP bucket name"
        isRequired
        fieldId={gcpBucketKey}
        helperTextInvalid={touched.gcpBucket && errors.gcpBucket}
        isValid={!(touched.gcpBucket && errors.gcpBucket)}
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
          id="storage-bucket-name-input"
          isValid={!(touched.gcpBucket && errors.gcpBucket)}
        />
      </FormGroup>
      <FormGroup
        label="GCP credential JSON blob"
        isRequired
        fieldId={gcpBlobKey}
        helperTextInvalid={touched.gcpBlob && errors.gcpBlob}
        isValid={!(touched.gcpBlob && errors.gcpBlob)}
      >
        <HideWrapper onClick={handleBlobHiddenToggle}>
          <KeyDisplayIcon id="gcpBlobIcon" isHidden={isBlobHidden} />
        </HideWrapper>
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(gcpBlobKey)}
          onBlur={handleBlur}
          value={values.gcpBlob}
          name={gcpBlobKey}
          type={isBlobHidden ? 'password' : 'text'}
          id="storage-blob-input"
          isValid={!(touched.gcpBlob && errors.gcpBlob)}
        />
      </FormGroup>
      <Grid gutter="md">
        <GridItem>
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
        </GridItem>
        <GridItem>
          <ConnectionStatusLabel
            status={currentStatus}
            statusText={currentStatusFn(currentStatus)}
          />
        </GridItem>
        <GridItem>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </GridItem>
      </Grid>
    </Form>
  );
};

const GCPForm: any = withFormik({
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
