/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import {
  Button,
  Checkbox,
  TextInput,
  Form,
  FormGroup,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { withFormik, FormikProps } from 'formik';
import KeyDisplayIcon from '../../../common/components/KeyDisplayIcon';
import FormErrorDiv from '../../../common/components/FormErrorDiv';
import HideWrapper from '../../../common/components/HideWrapper';
import utils from '../../../common/duck/utils';
import { Flex, Box, Text } from '@rebass/emotion';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
  isCheckConnectionButtonDisabled,
} from '../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../common/components/ConnectionStatusLabel';
import Thumb from './Thumb';

const nameKey = 'name';
const urlKey = 'url';
const tokenKey = 'token';
const isAzureKey = 'isAzure';
const azureResourceGroupKey = 'azureResourceGroup';
const insecureKey = 'insecure';
const caBundleKey = 'caBundle';

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

  const insecure = currentCluster.MigCluster.spec.insecure;
  const caBundle = currentCluster.MigCluster.spec.caBundle;
  const rawToken = atob(currentCluster.Secret.data.saToken);
  const existingEndpoint = currentCluster.MigCluster.spec.url;
  return values.name !== currentCluster.MigCluster.metadata.name ||
    values.url !== existingEndpoint ||
    values.token !== rawToken ||
    values.insecure !== insecure ||
    values.caBundle !== caBundle;
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
    onClose,
  } = props;

  const [isTokenHidden, setIsTokenHidden] = useState(true);
  const toggleHideToken = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsTokenHidden(!isTokenHidden);
  };
  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = key => () => setFieldTouched(key, true, true);

  return (
    <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <FormGroup label="Cluster Name" isRequired fieldId={nameKey}>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(nameKey)}
          onBlur={handleBlur}
          value={values.name}
          name={nameKey}
          type="text"
          id="cluster-name-input"
          isDisabled={currentStatus.mode === AddEditMode.Edit}
        />
        {errors.name && touched.name && (
          <FormErrorDiv id="feedback-name">{errors.name}</FormErrorDiv>
        )}
      </FormGroup>
      <FormGroup label="Url" isRequired fieldId={urlKey}>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(urlKey)}
          onBlur={handleBlur}
          value={values.url}
          name={urlKey}
          type="text"
          id="url-input"
        />
        {errors.url && touched.url && <FormErrorDiv id="feedback-url">{errors.url}</FormErrorDiv>}
      </FormGroup>
      <FormGroup label="Service account token" isRequired fieldId={tokenKey}>
        <HideWrapper onClick={toggleHideToken}>
          <KeyDisplayIcon id="accessKeyIcon" isHidden={isTokenHidden} />
        </HideWrapper>
        <TextInput
          value={values.token}
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(tokenKey)}
          onBlur={handleBlur}
          name={tokenKey}
          id="token-input"
          type={isTokenHidden ? 'password' : 'text'}
        />
        {errors.token && touched.token && (
          <FormErrorDiv id="feedback-token">{errors.token}</FormErrorDiv>
        )}
      </FormGroup>
      <FormGroup label="CA Bundle" fieldId={caBundleKey}>
        <div className="form-group">
          <input
            id="file"
            name="file"
            type="file"
            onChange={(event) => {
              setFieldValue(caBundleKey, event.currentTarget.files[0]);
            }}
            className="form-control"
          />
          <Thumb file={values.caBundle} />
        </div>
        {errors.caBundle && touched.caBundle && <FormErrorDiv id="feedback-ca-bundle">{errors.caBundle}</FormErrorDiv>}
        {/* <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(caBundleKey)}
          onBlur={handleBlur}
          value={values.caBundle}
          name={caBundleKey}
          type="text"
          id="ca-bundle-input"
        />
        {errors.caBundle && touched.caBundle && <FormErrorDiv id="feedback-ca-bundle">{errors.caBundle}</FormErrorDiv>} */}
      </FormGroup>
      <FormGroup fieldId={insecureKey}>
        <Checkbox
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(insecureKey)}
          onBlur={handleBlur}
          isChecked={values.insecure}
          name={insecureKey}
          label="Disable SSL verification"
          id="insecure-input"
        />
      </FormGroup>
      <FormGroup label="Is this an azure cluster?" fieldId={tokenKey}>
        <Checkbox
          label="Azure cluster"
          aria-label="Azure cluster"
          id="azure-cluster-checkbox"
          name={isAzureKey}
          isChecked={values.isAzure}
          onChange={formikHandleChange}
          onBlur={handleBlur}
        />
      </FormGroup>
      {values.isAzure &&
        <FormGroup label="Azure resource group" isRequired fieldId={azureResourceGroupKey}>
          <TextInput
            value={values.azureResourceGroup}
            onChange={formikHandleChange}
            onInput={formikSetFieldTouched(azureResourceGroupKey)}
            onBlur={handleBlur}
            name={azureResourceGroupKey}
            id="token-input"
            type="text"
          />
          {errors.azureResourceGroup && touched.azureResourceGroup && (
            <FormErrorDiv id="feedback-token">{errors.azureResourceGroup}</FormErrorDiv>
          )}
        </FormGroup>}

      <Flex flexDirection="column">
        <Box m="0 0 1em 0 ">
          <Button
            type="submit"
            isDisabled={isAddEditButtonDisabled(
              currentStatus, errors, touched, valuesHaveUpdate(values, currentCluster)
            )}
            style={{ marginRight: '10px' }}
          >
            {addEditButtonTextFn(currentStatus)}
          </Button>
          <Tooltip
            position={TooltipPosition.top}
            content={<div>
              Add or edit your cluster details
            </div>}>
            <span className="pf-c-icon">
              <OutlinedQuestionCircleIcon />
            </span>
          </Tooltip>
          <Button
            style={{ marginLeft: '10px', marginRight: '10px' }}
            isDisabled={isCheckConnectionButtonDisabled(
              currentStatus, valuesHaveUpdate(values, currentCluster),
            )}
            onClick={() => checkConnection(values.name)}
          >
            Check connection
          </Button>
          <Tooltip
            position={TooltipPosition.top}
            content={<div>
              Re-check your cluster's connection state
            </div>}>
            <span className="pf-c-icon">
              <OutlinedQuestionCircleIcon />
            </span>
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
    </Form >
  );
};
interface IFormValues {
  name: string;
  url: string;
  token: string;
  isAzure: boolean;
  azureResourceGroup?: string;
  insecure: boolean;
  caBundle: string;
}
interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  currentCluster: any;
  checkConnection: (name) => void;
}

const AddEditClusterForm: any = withFormik({
  mapPropsToValues: ({ initialClusterValues }) => {
    const values = {
      name: '',
      url: '',
      token: '',
      isAzure: false,
      azureResourceGroup: '',
      insecure: false,
      caBundle: '',
    };

    if (initialClusterValues) {
      values.name = initialClusterValues.clusterName || '';
      values.url = initialClusterValues.clusterUrl || '';
      values.token = initialClusterValues.clusterSvcToken || '';
      values.isAzure = initialClusterValues.isAzure || false;
      values.azureResourceGroup = initialClusterValues.azureResourceGroup || null;
      values.insecure = initialClusterValues.clusterInsecure || false;
      values.caBundle = initialClusterValues.clusterCABundle || '';
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

    if (!values.url) {
      errors.url = 'Required';
    } else if (!utils.testURL(values.url)) {
      errors.url = 'Not a valid URL';
    }

    if (!values.token) {
      errors.token = 'Required';
    }

    if (values.isAzure && !values.azureResourceGroup) {
      errors.azureResourceGroupi = 'Required';
    }
    if (!utils.testB64(values.caBundle)) {
      errors.caBundle = 'CA bundle must be a valid base64-encoded string.';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAddEditClusterForm);

export default AddEditClusterForm;
