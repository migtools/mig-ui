/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import { withFormik } from 'formik';
import { Button, TextInput, Form, FormGroup } from '@patternfly/react-core';
import KeyDisplayIcon from '../../../common/components/KeyDisplayIcon';
import FormErrorDiv from '../../../common/components/FormErrorDiv';
import HideWrapper from '../../../common/components/HideWrapper';
import utils from '../../../common/duck/utils';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
} from '../../../common/add_edit_state';

const nameKey = 'name';
const urlKey = 'url';
const tokenKey = 'token';

const componentTypeStr = 'cluster';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

const InnerAddEditClusterForm = ({
  values,
  touched,
  errors,
  ...props
}) => {
  // Formik doesn't like addEditStatus destructured in the signature for some reason
  const currentStatus = props.addEditStatus;

  const [ isTokenHidden, setIsTokenHidden ] = useState(true);
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

const AddClusterForm: any = withFormik({
  mapPropsToValues: ({initialClusterValues}) => {
    const v = initialClusterValues;
    return {
      name: v ? v.clusterName : '',
      url: v ? v.clusterUrl : '',
      token: v ? v.clusterSvcToken: '',
    }
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

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAddEditClusterForm);

export default AddClusterForm;
