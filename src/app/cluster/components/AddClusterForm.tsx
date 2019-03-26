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
import { IMigrationCluster, IClusterFormObject } from '../../../models';
import uuidv4 from 'uuid/v4';

const WrappedAddClusterForm = props => {
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
              <TextListItem component="dt">Cluster URL</TextListItem>
              <input
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.url}
                name="url"
                type="text"
              />
              {errors.url && touched.url && (
                <div id="feedback">{errors.url}</div>
              )}
              <TextListItem component="dt">Service account token</TextListItem>
              <textarea
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.token}
                name="token"
              />
              {errors.token && touched.token && (
                <div id="feedback">{errors.token}</div>
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

const AddClusterForm: any = withFormik({
  mapPropsToValues: () => ({ url: '', token: '' }),

  // Custom sync validation
  validate: values => {
    const errors: any = {};

    if (!values.url) {
      errors.url = 'Required';
    }
    if (!values.token) {
      errors.token = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    const newCluster: IMigrationCluster = {
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
        name: '',
        namespace: '',
        resourceVersion: '',
        selfLink: '',
        uid: '',
      },
      spec: {
        clusterAuthSecretRef: {
          name: values.token,
          namespace: '',
        },
        clusterUrl: values.url,
      },
    };
    formikBag.setSubmitting(false);
    formikBag.props.onHandleModalToggle();
    formikBag.props.onAddClusterSubmit(newCluster);
  },

  displayName: 'Add Cluster Form',
})(WrappedAddClusterForm);

export default AddClusterForm;
