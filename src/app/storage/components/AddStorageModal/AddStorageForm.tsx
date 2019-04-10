import React from 'react';
import { withFormik } from 'formik';
import { Flex, Box, Text } from '@rebass/emotion';
import {
  Button,
  TextInput,
  TextContent,
  TextList,
  TextListItem,
  TextArea,
} from '@patternfly/react-core';
import { IMigStorage, IStorageFormObject } from '../../../../models';
import uuidv4 from 'uuid/v4';

const WrappedAddStorageForm = props => {
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = props;
  return (
    <Flex>
      <form onSubmit={handleSubmit}>
        <Box>
          <TextContent>
            <TextList component="dl">
              <TextListItem component="dt">Storage Name</TextListItem>
              <input
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                name="name"
                type="text"
              />
              {errors.name && touched.name && (
                <div id="feedback">{errors.name}</div>
              )}
              <TextListItem component="dt">S3 Bucket URL</TextListItem>
              <input
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.bucketUrl}
                name="bucketUrl"
                type="text"
              />
              {errors.bucketUrl && touched.bucketUrl && (
                <div id="feedback">{errors.bucketUrl}</div>
              )}
              <TextListItem component="dt">S3 Provider Access Key</TextListItem>
              <textarea
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.accessKey}
                name="accessKey"
              />
              {errors.accessKey && touched.accessKey && (
                <div id="feedback">{errors.accessKey}</div>
              )}
              <TextListItem component="dt">
                S3 Provider Secret Access Key
              </TextListItem>
              <textarea
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.secret}
                name="secret"
              />
              {errors.secret && touched.secret && (
                <div id="feedback">{errors.secret}</div>
              )}
            </TextList>
          </TextContent>
        </Box>
        <Box>
          <Flex>
            <Box m="10px 10px 10px 0">
              <Button
                key="cancel"
                variant="secondary"
                onClick={() => props.onHandleModalToggle(null)}
              >
                Cancel
              </Button>
            </Box>
            <Box m={10}>
              <Button variant="secondary" type="submit">
                Add
              </Button>
            </Box>
          </Flex>
        </Box>
      </form>
    </Flex>
  );
};

const AddStorageForm: any = withFormik({
  mapPropsToValues: () => ({
    name: '',
    bucketUrl: '',
    accessKey: '',
    secret: '',
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

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    const newStorage: IMigStorage = {
      id: uuidv4(),
      apiVersion: 'test',
      kind: 'test',
      metadata: {
        creationTimestamp: '',
        generation: 1,
        labels: {
          'controller-ToolsIcon.k8s.io': 1,
          'migrations.openshift.io/migration-group': 'test',
        },
        name: values.name,
        namespace: '',
        resourceVersion: '',
        selfLink: '',
        uid: '',
      },
      spec: {
        backupStorageLocationRef: {
          name: values.bucketUrl,
        },
        migrationStorageSecretRef: {
          name: values.secret,
          namespace: '',
        },
      },
    };
    formikBag.setSubmitting(false);
    formikBag.props.onHandleModalToggle();
    formikBag.props.onAddItemSubmit(newStorage);
  },

  displayName: 'Add Storage Form',
})(WrappedAddStorageForm);

export default AddStorageForm;
