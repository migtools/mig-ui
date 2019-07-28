/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { withFormik } from 'formik';
import { Button, TextInput, Form, FormGroup } from '@patternfly/react-core';
import KeyDisplayIcon from '../../../common/components/KeyDisplayIcon';
import FormErrorDiv from '../../../common/components/FormErrorDiv';
import HideWrapper from '../../../common/components/HideWrapper';
import utils from '../../../common/duck/utils';
import { AddEditState, AddEditStatus, AddEditMode } from '../../../common/add_edit_state';

const nameKey = 'name';
const urlKey = 'url';
const tokenKey = 'token';

const currentStatus = (props) => {
  const addEditStatus: AddEditStatus = props.addEditStatus;
  switch(addEditStatus.state) {
    case AddEditState.Pending: {
      return `Ready to create a cluster`;
    }
    case AddEditState.Critical: {
      return `Connection failed: ${addEditStatus.message} | ${addEditStatus.reason}`;
    }
    case AddEditState.Ready: {
      return `Connection successful`;
    }
    case AddEditState.Watching: {
      return `Validating connection...`;
    }
    case AddEditState.TimedOut: {
      return `Validation timed out, double check your inputs and try again?`
    }
    default: {
      return `AddEditStatus fell into an unknown state`;
    }
  }
}

const addEditButtonText = (props) => {
  const { state } = props.addEditStatus;
  switch(state) {
    case AddEditState.TimedOut: {
      return 'Try Again';
    }
    case AddEditState.Pending: {
      return 'Add Cluster';
    }
    default: {
      return 'Update Cluster';
    }
  }
}

const isAddEditButtonDisabled = (props, errors, touched) => {
  const hasNotBeenTouched = Object.keys(touched).length === 0;
  const hasValidationErrors = Object.keys(errors).length > 0;
  const valuesAreNotReady = hasNotBeenTouched || hasValidationErrors;
  const isDisabled = valuesAreNotReady ||
    props.addEditStatus.state === AddEditState.Watching;
  return isDisabled;
}

const InnerAddClusterForm = ({
  values,
  touched,
  errors,
  ...props
}) => {
  // Formik doesn't like addEditStatus destructured in the signature for some reason
  const status = props.addEditStatus;

  const [isTokenHidden, setIsTokenHidden ] = useState(true);
  const toggleHideToken = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsTokenHidden(!isTokenHidden);
  }
  const formikHandleChange = (_val, e) => props.handleChange(e);
  const formikSetFieldTouched = key => () => props.setFieldTouched(key, true, true);

  const onClose = () => {
    props.onClose();
  }

  return (
    <Form onSubmit={props.handleSubmit} style={{ marginTop: '24px' }}>
      <FormGroup label="Cluster Name" isRequired fieldId={nameKey}>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(nameKey)}
          onBlur={props.handleBlur}
          value={values.name}
          name={nameKey}
          type="text"
          id="cluster-name-input"
          isDisabled={status.mode === AddEditMode.Edit}
        />
        {errors.name && touched.name && (
          <FormErrorDiv id="feedback-name">{errors.name}</FormErrorDiv>
        )}
      </FormGroup>
      <FormGroup label="Url" isRequired fieldId={urlKey}>
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(urlKey)}
          onBlur={props.handleBlur}
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
          onBlur={props.handleBlur}
          name={tokenKey}
          id="token-input"
          type={isTokenHidden ? 'password' : 'text'}
        />
        {errors.token && touched.token && (
          <FormErrorDiv id="feedback-token">{errors.token}</FormErrorDiv>
        )}
      </FormGroup>
      <Button type="submit" isDisabled={isAddEditButtonDisabled(props, errors, touched)}>
        {addEditButtonText(props)}
      </Button>
      <h3>Status:</h3>
      <div>{currentStatus(props)}</div>
      <Button variant="primary" onClick={onClose}>
        Close
      </Button>
    </Form>
  )
}

const AddClusterForm: any = withFormik({
  mapPropsToValues: ({initialClusterValues}) => ({
    name: initialClusterValues ? initialClusterValues.clusterName : '',
    url: initialClusterValues ? initialClusterValues.clusterUrl : '',
    token: initialClusterValues ? initialClusterValues.clusterSvcToken: '',
  }),

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

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    // Manually trigger formik submit
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAddClusterForm);

export default AddClusterForm;
