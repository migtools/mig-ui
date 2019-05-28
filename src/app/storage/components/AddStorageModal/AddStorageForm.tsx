import React from 'react';
import { withFormik } from 'formik';
import { TextInput, Form, FormGroup } from '@patternfly/react-core';
import FormErrorDiv from './../../../common/components/FormErrorDiv';
import KeyDisplayIcon from '../../../common/components/KeyDisplayIcon';
import HideWrapper from '../../../common/components/HideWrapper';
import CheckConnection from './../../../common/components/CheckConnection';

class WrappedAddStorageForm extends React.Component<any, any> {
  state = {
    accessKeyHidden: true,
    secretHidden: true,
  };
  onHandleChange = (val, e) => {
    this.props.handleChange(e);
  };

  handleKeyToggle = (keyName, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (keyName === 'accessKey') {
      this.setState({
        accessKeyHidden: !this.state.accessKeyHidden,
      });
    }
    if (keyName === 'secret') {
      this.setState({
        secretHidden: !this.state.secretHidden,
      });
    }
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
      setFieldTouched,
      connectionState,
      checkConnection,
    } = this.props;
    return (
      <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
        <FormGroup label="Repository Name" isRequired fieldId="name">
          <TextInput
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('name', true, true)}
            onBlur={handleBlur}
            value={values.name}
            name="name"
            type="text"
            id="name"
          />
          {errors.name && touched.name && (
            <FormErrorDiv id="feedback-name">{errors.name}</FormErrorDiv>
          )}
        </FormGroup>
        <FormGroup label="AWS S3 Bucket Name" isRequired fieldId="bucketName">
          <TextInput
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('bucketName', true, true)}
            onBlur={handleBlur}
            value={values.bucketName}
            name="bucketName"
            type="text"
            // isValid={!errors.bucketName && touched.bucketName}
            id="bucketName"
          />
          {errors.bucketName && touched.bucketName && (
            <FormErrorDiv id="feedback-bucket-name">{errors.bucketName}</FormErrorDiv>
          )}
        </FormGroup>

        <FormGroup label="AWS S3 Bucket Region" isRequired fieldId="bucketRegion">
          <TextInput
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('bucketRegion', true, true)}
            onBlur={handleBlur}
            value={values.bucketRegion}
            name="bucketRegion"
            type="text"
            // isValid={!errors.bucketRegion && touched.bucketRegion}
            id="bucketRegion"
          />
          {errors.bucketRegion && touched.bucketRegion && (
            <FormErrorDiv id="feedback-bucket-region">{errors.bucketRegion}</FormErrorDiv>
          )}
        </FormGroup>

        <FormGroup label="S3 Provider Access Key" isRequired fieldId="s3-provider-access-key">
          <HideWrapper onClick={e => this.handleKeyToggle('accessKey', e)}>
            <KeyDisplayIcon id="accessKeyIcon" isHidden={this.state.accessKeyHidden} />
          </HideWrapper>
          <TextInput
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('accessKey', true, true)}
            onBlur={handleBlur}
            value={values.accessKey}
            name="accessKey"
            type={this.state.accessKeyHidden ? 'password' : 'text'}
            id="accessKey"
          />
          {errors.accessKey && touched.accessKey && (
            <FormErrorDiv id="feedback-access-key">{errors.accessKey}</FormErrorDiv>
          )}
        </FormGroup>
        <FormGroup
          label="S3 Provider Secret Access Key"
          isRequired
          fieldId="s3-provider-secret-access-key"
        >
          <HideWrapper onClick={e => this.handleKeyToggle('secret', e)}>
            <KeyDisplayIcon id="accessKeyIcon" isHidden={this.state.secretHidden} />
          </HideWrapper>
          <TextInput
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('secret', true, true)}
            onBlur={handleBlur}
            value={values.secret}
            name="secret"
            type={this.state.secretHidden ? 'password' : 'text'}
            id="secret"
          />
          {errors.secret && touched.secret && (
            <FormErrorDiv id="feedback-secret-key">{errors.secret}</FormErrorDiv>
          )}
        </FormGroup>
        <CheckConnection
          errors={errors}
          touched={touched}
          connectionState={connectionState}
          checkConnection={checkConnection}
          onHandleModalToggle={this.props.onHandleModalToggle}
        />
      </Form>
    );
  }
}

const AddStorageForm: any = withFormik({
  mapPropsToValues: () => ({
    name: '',
    bucketName: '',
    bucketRegion: '',
    accessKey: '',
    secret: '',
    connectionStatus: '',
  }),

  validate: values => {
    const errors: any = {};

    if (!values.name) {
      errors.name = 'Required';
    }
    if (!values.bucketName) {
      errors.bucketName = 'Required';
    }
    if (!values.bucketRegion) {
      errors.bucketRegion = 'Required';
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
    formikBag.setSubmitting(false);
    formikBag.props.onHandleModalToggle();
    formikBag.props.onAddItemSubmit(values);
  },

  displayName: 'Add Respository Form',
})(WrappedAddStorageForm);

export default AddStorageForm;
