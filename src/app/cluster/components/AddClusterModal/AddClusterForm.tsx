/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { withFormik } from 'formik';
import { TextInput, Form, FormGroup } from '@patternfly/react-core';
import KeyDisplayIcon from '../../../common/components/KeyDisplayIcon';
import FormErrorDiv from './../../../common/components/FormErrorDiv';
import { css } from '@emotion/core';
import HideWrapper from './../../../common/components/HideWrapper';
import CheckConnection from './../../../common/components/CheckConnection';
class WrappedAddClusterForm extends React.Component<any, any> {
  state = {
    tokenHidden: true,
  };
  onHandleChange = (val, e) => {
    this.props.handleChange(e);
  };

  handleKeyToggle = e => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      tokenHidden: !this.state.tokenHidden,
    });
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.connectionState !== this.props.connectionState) {
      this.props.setFieldValue('connectionStatus', this.props.connectionState);
    }
  }

  render() {
    const {
      values,
      touched,
      errors,
      handleChange,
      handleBlur,
      handleSubmit,
      connectionState,
      setFieldTouched,
      setFieldValue,
      checkConnection,
      onHandleModalToggle,
      mode
    } = this.props;
    const dynamicTokenSecurity = this.state.tokenHidden ? 'disc' : 'inherit';
    const customCss = css`
      display: inline;
      padding: 1em;
      cursor: pointer;
    `;
    return (
      <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
        <FormGroup label="Cluster Name" isRequired fieldId="name">
          <TextInput
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('name', true, true)}
            onBlur={handleBlur}
            value={values.name}
            name="name"
            type="text"
            id="cluster-name-input"
            isDisabled = { (mode === 'update') ? true : false }
          />
          {errors.name && touched.name && (
            <FormErrorDiv id="feedback-name">{errors.name}</FormErrorDiv>
          )}
        </FormGroup>
        <FormGroup label="Url" isRequired fieldId="url">
          <TextInput
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('url', true, true)}
            onBlur={handleBlur}
            value={values.url}
            name="url"
            type="text"
            // isValid={!errors.url && touched.url}
            id="url-input"
          />
          {errors.url && touched.url && <FormErrorDiv id="feedback-url">{errors.url}</FormErrorDiv>}
        </FormGroup>
        <FormGroup label="Service account token" isRequired fieldId="url">
          <HideWrapper onClick={this.handleKeyToggle}>
            <KeyDisplayIcon id="accessKeyIcon" isHidden={this.state.tokenHidden} />
          </HideWrapper>
          <TextInput
            value={values.token}
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('token', true, true)}
            onBlur={handleBlur}
            name="token"
            id="token-input"
            type={this.state.tokenHidden ? 'password' : 'text'}
          />
          {errors.token && touched.token && (
            <FormErrorDiv id="feedback-token">{errors.token}</FormErrorDiv>
          )}
        </FormGroup>
        <CheckConnection
          errors={errors}
          touched={ (mode === 'update') ? true : touched }
          connectionState={connectionState}
          checkConnection={checkConnection}
          onHandleModalToggle={onHandleModalToggle}
          mode={mode}
        />
      </Form>
    );
  }
}

const AddClusterForm: any = withFormik({
  mapPropsToValues: ({name, url, token}) => ({
    name: name || '',
    url: url || '',
    token: token || '',
    connectionStatus: '',
  }),

  validate: (values: any) => {
    const errors: any = {};

    if (!values.name) {
      errors.name = 'Required';
    }

    if (!values.url) {
      errors.url = 'Required';
    }

    if (!values.token) {
      errors.token = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    formikBag.setSubmitting(false);
    formikBag.props.onHandleModalToggle();
    formikBag.props.onItemSubmit(values);
  },

  displayName: 'Cluster Form',
})(WrappedAddClusterForm);

export default AddClusterForm;
