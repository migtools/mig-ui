import React from 'react';
import { withFormik } from 'formik';
import { Flex, Box } from '@rebass/emotion';
import {
  Button,
  TextContent,
  TextList,
  TextListItem,
  TextArea,
  TextInput,
  Form,
  FormGroup,
} from '@patternfly/react-core';
import { IMigStorage } from '../../../../models';
import uuidv4 from 'uuid/v4';
import FormErrorDiv from './../../../common/components/FormErrorDiv';
import KeyDisplayIcon from '../../../common/components/KeyDisplayIcon';
import ConnectionState from '../../../common/connection_state';
import StatusIcon from '../../../common/components/StatusIcon';
import HideWrapper from '../../../common/components/HideWrapper';

class WrappedAddStorageForm extends React.Component<any, any> {
  state = {
    accessKeyHidden: true,
    secretHidden: true,
  };
  onHandleChange = (val, e) => {
    this.props.handleChange(e);
  }

  handleKeyToggle = (keyName, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (keyName === 'accessKey') {

      this.setState({
        accessKeyHidden: !this.state.accessKeyHidden,
      },
      );
    }
    if (keyName === 'secret') {
      this.setState({
        secretHidden: !this.state.secretHidden,
      });
    }
  }

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
    } = this.props;
    return (
      <Form
        onSubmit={handleSubmit}
        style={{ marginTop: '24px' }}
      >
        <FormGroup
          label="Storage Name"
          isRequired
          fieldId="name"
        >
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
        <FormGroup
          label="Bucket URL"
          isRequired
          fieldId="url"
        >
          <TextInput
            onChange={(val, e) => this.onHandleChange(val, e)}
            onInput={() => setFieldTouched('bucketUrl', true, true)}
            onBlur={handleBlur}
            value={values.url}
            name="bucketUrl"
            type="text"
            // isValid={!errors.bucketUrl && touched.bucketUrl}
            id="bucketUrl"
          />
          {errors.bucketUrl && touched.bucketUrl && (
            <FormErrorDiv id="feedback-url">{errors.bucketUrl}</FormErrorDiv>
          )}

        </FormGroup>
        <FormGroup
          label="S3 Provider Access Key"
          isRequired
          fieldId="s3-provider-access-key"
        >
          <HideWrapper
            onClick={(e) => this.handleKeyToggle('accessKey', e)}
          >
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
          <HideWrapper
            onClick={(e) => this.handleKeyToggle('secret', e)}
          >

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
        <FormGroup
          fieldId="check-connection"
          id="check-connection"
        >
          <Flex width="100%" m="20px 10px 10px 0" flexDirection="column">
            <Box>
              <Flex flexDirection="column" >
                <Box alignSelf="flex-start">
                  <Button
                    key="check connection"
                    variant="secondary"
                    onClick={() => this.props.checkConnection()}
                  >
                    Check connection
                  </Button>
                </Box>
                <Box alignSelf="flex-start">
                  {renderConnectionState(connectionState)}
                </Box>
              </Flex>

            </Box>
            <Box mt={30} alignSelf="flex-start">
              <Button
                variant="primary"
                type="submit"
                isDisabled={connectionState !== ConnectionState.Success}
                style={{ marginRight: '10px' }}
              >
                Add
              </Button>
              <Button
                key="cancel"
                variant="secondary"
                onClick={() => this.props.onHandleModalToggle(null)}
              >
                Cancel
              </Button>
            </Box>
          </Flex>
        </FormGroup>
      </Form >

    );

  }

}

function renderConnectionState(connectionState: ConnectionState) {
  let cxStateContents;
  let iconStatus;

  switch (connectionState) {
    case ConnectionState.Checking:
      cxStateContents = 'Checking...';
      iconStatus = 'checking';
      break;
    case ConnectionState.Success:
      cxStateContents = 'Success!';
      iconStatus = 'success';
      break;
    case ConnectionState.Failed:
      cxStateContents = 'Failed!';
      iconStatus = 'failed';
      break;
  }

  return (
    <Flex m="10px 10px 10px 0">
      <Box>
        {cxStateContents}
        {' '}
        <StatusIcon status={iconStatus} />
      </Box>
    </Flex>
  );
}

const AddStorageForm: any = withFormik({
  mapPropsToValues: () => ({
    name: '',
    bucketUrl: '',
    accessKey: '',
    secret: '',
    connectionStatus: '',
    region: 'USA',
    bucketName: 'TestingName'
  }),

  // Custom sync validation
  validate: values => {
    const errors: any = {};

    if (!values.name) {
      errors.name = 'Required';
    }
    if (!values.bucketUrl) {
      errors.bucketUrl = 'Required';
    }
    if (!values.accessKey) {
      errors.accessKey = 'Required';
    }
    if (!values.secret) {
      errors.secret = 'Required';
    }
    if (!values.region) {
      errors.region = 'Required';
    }
    if (!values.bucketName) {
      errors.bucketName = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    formikBag.setSubmitting(false);
    formikBag.props.onHandleModalToggle();
    formikBag.props.onAddItemSubmit(values);
  },

  displayName: 'Add Storage Form',
})(WrappedAddStorageForm);

export default AddStorageForm;
