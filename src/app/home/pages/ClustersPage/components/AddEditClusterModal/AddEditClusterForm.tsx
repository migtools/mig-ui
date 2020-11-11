import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Form,
  FormGroup,
  Checkbox,
  Flex,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';
import { withFormik, FormikProps, FormikErrors } from 'formik';
import KeyDisplayToggle from '../../../../../common/components/KeyDisplayToggle';
import utils from '../../../../../common/duck/utils';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
  isCheckConnectionButtonDisabled,
  IAddEditStatus,
} from '../../../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../../../common/components/ConnectionStatusLabel';
import CertificateUpload from '../../../../../common/components/CertificateUpload';
import { validatedState } from '../../../../../common/helpers';
import QuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { IMigCluster } from '../../../../../../client/resources/conversions';
import { IClusterInfo } from '../../helpers';
import { ICluster } from '../../../../../cluster/duck/types';

const nameKey = 'name';
const urlKey = 'url';
const tokenKey = 'token';
const azureTokenKey = 'azureToken';
const isAzureKey = 'isAzure';
const azureResourceGroupKey = 'azureResourceGroup';
const requireSSLKey = 'requireSSL';
const caBundleKey = 'caBundle';
const exposedRegistryPath = 'exposedRegistryPath';
const componentTypeStr = 'cluster';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

// valuesHaveUpdate - returns true if the formik values hold values that differ
// from a matching existing cluster. This is different from props.dirty, which returns
// true when the form values differ from the initial values. It's possible to have
// a cluster object exist, but have no initial values (user adds new cluster, then updates
// while keeping the modal open). props.dirty is not sufficient for this case.
const valuesHaveUpdate = (values, currentCluster) => {
  if (!currentCluster || currentCluster.MigCluster.spec.isHostCluster) {
    return true;
  }
  const requireSSL = !currentCluster.MigCluster.spec.insecure;
  const rawToken = atob(currentCluster.Secret.data.saToken);
  const existingEndpoint = currentCluster.MigCluster.spec.url;
  const azureResourceGroup = currentCluster.MigCluster.spec.azureResourceGroup
    ? currentCluster.MigCluster.spec.azureResourceGroup
    : '';
  const isAzure = currentCluster.MigCluster.spec.isAzure
    ? currentCluster.MigCluster.spec.isAzure
    : false;
  const caBundle = currentCluster.MigCluster.spec.caBundle
    ? currentCluster.MigCluster.spec.caBundle
    : '';
  const exposedRegistryPath = currentCluster.MigCluster.spec.exposedRegistryPath
    ? currentCluster.MigCluster.spec.exposedRegistryPath
    : '';

  return (
    values.name !== currentCluster.MigCluster.metadata.name ||
    values.url !== existingEndpoint ||
    values.token !== rawToken ||
    values.requireSSL !== requireSSL ||
    values.isAzure !== isAzure ||
    values.azureResourceGroup !== azureResourceGroup ||
    values.caBundle !== caBundle ||
    values.exposedRegistryPath !== exposedRegistryPath
  );
};
const InnerAddEditClusterForm = (props: IOtherProps & FormikProps<IFormValues>) => {
  const {
    addEditStatus: currentStatus,
    currentCluster,
    checkConnection,
    values,
    touched,
    errors,
    handleSubmit,
    handleChange,
    setFieldTouched,
    setFieldValue,
    handleBlur,
    handleClose,
  } = props;

  const [isTokenHidden, setIsTokenHidden] = useState(true);
  const toggleHideToken = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTokenHidden(!isTokenHidden);
  };
  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = (key) => () => setFieldTouched(key, true, true);

  return (
    <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <FormGroup
        label="Cluster name"
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
      <FormGroup label="Is this an azure cluster?" fieldId={tokenKey}>
        <Checkbox
          label="Azure cluster"
          aria-label="Azure cluster"
          id={azureTokenKey}
          name={isAzureKey}
          isChecked={values.isAzure}
          onChange={formikHandleChange}
          onBlur={handleBlur}
        />
      </FormGroup>
      {values.isAzure && (
        <FormGroup
          label="Azure resource group"
          isRequired
          fieldId={azureResourceGroupKey}
          helperTextInvalid={touched.azureResourceGroup && errors.azureResourceGroup}
          validated={validatedState(touched.azureResourceGroup, errors.azureResourceGroup)}
        >
          {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
          <TextInput
            value={values.azureResourceGroup}
            onChange={formikHandleChange}
            onInput={formikSetFieldTouched(azureResourceGroupKey)}
            onBlur={handleBlur}
            name={azureResourceGroupKey}
            id={azureResourceGroupKey}
            type="text"
            validated={validatedState(touched.azureResourceGroup, errors.azureResourceGroup)}
          />
        </FormGroup>
      )}
      <FormGroup
        label="URL"
        isRequired
        fieldId={urlKey}
        helperText="URL of the cluster's API server"
        helperTextInvalid={touched.url && errors.url}
        validated={validatedState(touched.url, errors.url)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(urlKey)}
          onBlur={handleBlur}
          value={values.url}
          name={urlKey}
          type="text"
          id={urlKey}
          validated={validatedState(touched.url, errors.url)}
        />
      </FormGroup>
      <FormGroup
        label="Service account token"
        labelIcon={
          <KeyDisplayToggle
            keyName="service account token"
            isKeyHidden={isTokenHidden}
            onClick={toggleHideToken}
          />
        }
        isRequired
        fieldId={tokenKey}
        helperText="Copy and paste the cluster's service account token."
        helperTextInvalid={touched.token && errors.token}
        validated={validatedState(touched.token, errors.token)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          value={values.token}
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(tokenKey)}
          onBlur={handleBlur}
          name={tokenKey}
          id={tokenKey}
          type={isTokenHidden ? 'password' : 'text'}
          validated={validatedState(touched.token, errors.token)}
        />
      </FormGroup>
      <FormGroup
        label="Exposed route to image registry"
        labelIcon={
          <Popover
            position={PopoverPosition.top}
            bodyContent={
              <>
                Include a route to the cluster's image registry if you want to allow direct image
                migration. Direct image migration is much faster than two-step image migration that
                goes through the replication repository. <br /> <br />
                See the product documentation for more information.
              </>
            }
            aria-label="registry-details"
            closeBtnAriaLabel="close--details"
            maxWidth="30rem"
          >
            <span className="pf-c-icon pf-m-info">
              <QuestionCircleIcon />
            </span>
          </Popover>
        }
        fieldId={exposedRegistryPath}
        helperText="Optional route to the cluster's image registry"
        helperTextInvalid={touched.exposedRegistryPath && errors.exposedRegistryPath}
        validated={validatedState(touched.exposedRegistryPath, errors.exposedRegistryPath)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          value={values.exposedRegistryPath}
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(exposedRegistryPath)}
          name={exposedRegistryPath}
          id={exposedRegistryPath}
          validated={validatedState(touched.exposedRegistryPath, errors.exposedRegistryPath)}
        />
      </FormGroup>
      <FormGroup
        fieldId={requireSSLKey}
        helperText="Select 'Require SSL verification' to verify SSL connections to the cluster. If you are using a self-signed certificate, you may either disable SSL verification, or upload your certificate bundle."
      >
        <Checkbox
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(requireSSLKey)}
          onBlur={handleBlur}
          isChecked={values.requireSSL}
          name={requireSSLKey}
          label="Require SSL verification"
          id={requireSSLKey}
        />
      </FormGroup>

      {values.requireSSL && (
        <FormGroup label="CA bundle file" fieldId={caBundleKey}>
          <CertificateUpload
            fieldName={caBundleKey}
            value={values[caBundleKey]}
            onChange={(value) => {
              const encodedValue = btoa(value);
              setFieldValue(caBundleKey, encodedValue);
              formikSetFieldTouched(caBundleKey);
            }}
            onInput={formikSetFieldTouched(caBundleKey)}
          />
        </FormGroup>
      )}

      <Flex>
        <Button
          variant="primary"
          type="submit"
          isDisabled={isAddEditButtonDisabled(
            currentStatus,
            errors,
            touched,
            valuesHaveUpdate(values, currentCluster)
          )}
        >
          {addEditButtonTextFn(currentStatus)}
        </Button>
        <Button
          variant="secondary"
          isDisabled={isCheckConnectionButtonDisabled(
            currentStatus,
            valuesHaveUpdate(values, currentCluster)
          )}
          onClick={() => checkConnection(values.name)}
        >
          Check connection
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Flex>
      <ConnectionStatusLabel status={currentStatus} statusText={currentStatusFn(currentStatus)} />
    </Form>
  );
};
export interface IFormValues {
  name: string;
  url: string;
  token: string;
  isAzure: boolean;
  azureResourceGroup?: string;
  requireSSL: boolean;
  caBundle: string;
  exposedRegistryPath: string;
}
interface IOtherProps {
  onAddEditSubmit: (values) => void;
  handleClose: () => void;
  addEditStatus: IAddEditStatus;
  currentCluster: ICluster;
  checkConnection: (name) => void;
  initialClusterValues?: IClusterInfo;
}

const AddEditClusterForm = withFormik<IOtherProps, IFormValues>({
  mapPropsToValues: ({ initialClusterValues }) => {
    const values: IFormValues = {
      name: '',
      url: '',
      token: '',
      isAzure: false,
      azureResourceGroup: '',
      requireSSL: false,
      caBundle: '',
      exposedRegistryPath: '',
    };

    if (initialClusterValues) {
      values.name = initialClusterValues.clusterName || '';
      values.url = initialClusterValues.clusterUrl || '';
      values.token = initialClusterValues.clusterSvcToken || '';
      values.isAzure = initialClusterValues.clusterIsAzure || false;
      values.azureResourceGroup = initialClusterValues.clusterAzureResourceGroup || '';
      values.requireSSL = initialClusterValues.clusterRequireSSL;
      values.caBundle = initialClusterValues.clusterCABundle || '';
      values.exposedRegistryPath = initialClusterValues.exposedRegistryPath || '';
    }

    return values;
  },

  validate: (values: IFormValues) => {
    const errors: FormikErrors<IFormValues> = {};

    if (!values.name) {
      errors.name = 'Required';
    } else if (!utils.testDNS1123(values.name)) {
      errors.name = utils.DNS1123Error(values.name);
    }

    if (!values.url) {
      errors.url = 'Required';
    } else if (!utils.testURL(values.url)) {
      errors.url = 'Not a valid URL';
    }
    if (!values.token) {
      errors.token = 'Required';
    }

    if (values.isAzure && !values.azureResourceGroup) {
      errors.azureResourceGroup = 'Required';
    }

    if (!values.exposedRegistryPath) {
      // not required; no validation.
    } else if (!utils.testURL(values.exposedRegistryPath)) {
      errors.exposedRegistryPath = 'Not a valid URL';
    }

    return errors;
  },

  handleSubmit: (values, formikBag) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAddEditClusterForm);

export default AddEditClusterForm;
