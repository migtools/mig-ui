import React, { useState, useEffect } from 'react';
import { FormikProps, FormikActions, FormikState } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import {
  Bullseye,
  EmptyState,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';
import NamespaceTable from './NameSpaceTable';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import SimpleSelect from '../../../common/components/SimpleSelect';

interface IResourceSelectFormProps
  extends Pick<
      IOtherProps,
      | 'clusterList'
      | 'fetchNamespacesRequest'
      | 'isEdit'
      | 'isFetchingNamespaceList'
      | 'sourceClusterNamespaces'
      | 'storageList'
    >,
    Pick<FormikProps<IFormValues>, 'setFieldTouched' | 'setFieldValue' | 'touched' | 'values'> {
  errors: any;
}

const ResourceSelectForm: React.FunctionComponent<IResourceSelectFormProps> = ({
  clusterList,
  errors,
  fetchNamespacesRequest,
  isEdit,
  isFetchingNamespaceList,
  setFieldTouched,
  setFieldValue,
  sourceClusterNamespaces,
  storageList,
  touched,
  values,
}: IResourceSelectFormProps) => {
  useEffect(() => {
    if (isEdit) {
      fetchNamespacesRequest(values.sourceCluster);
    }
  }, []);

  let srcClusterOptions: string[] = ['No valid clusters found'];
  let targetClusterOptions: string[] = [];
  let storageOptions: string[] = ['No valid storage found'];

  if (clusterList.length) {
    srcClusterOptions = clusterList
      .filter(
        cluster =>
          cluster.MigCluster.metadata.name !== values.targetCluster &&
          cluster.ClusterStatus.hasReadyCondition
      )
      .map(cluster => cluster.MigCluster.metadata.name);

    targetClusterOptions = clusterList
      .filter(
        cluster =>
          cluster.MigCluster.metadata.name !== values.sourceCluster &&
          cluster.ClusterStatus.hasReadyCondition
      )
      .map(cluster => cluster.MigCluster.metadata.name);
  }

  if (storageList.length) {
    storageOptions = storageList
      .filter(storage => storage.StorageStatus.hasReadyCondition)
      .map(storage => storage.MigStorage.metadata.name);
  }

  const handleStorageChange = value => {
    const matchingStorage = storageList.find(c => c.MigStorage.metadata.name === value);
    if (matchingStorage) {
      setFieldValue('selectedStorage', value);
      setFieldTouched('selectedStorage');
    }
  };

  const handleSourceChange = value => {
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === value);
    if (matchingCluster) {
      setFieldValue('sourceCluster', value);
      setFieldValue('selectedNamespaces', []);
      setFieldTouched('sourceCluster');
      fetchNamespacesRequest(value);
    }
  };

  const handleTargetChange = value => {
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === value);
    if (matchingCluster) {
      setFieldValue('targetCluster', value);
      setFieldTouched('targetCluster');
    }
  };

  return (
    <Grid gutter="md">
      <GridItem>
        <Form>
          <Grid md={6} gutter="md">
            <GridItem>
              <FormGroup
                label="Source cluster"
                isRequired
                fieldId="sourceCluster"
                helperTextInvalid={touched.sourceCluster && errors.sourceCluster}
                isValid={!(touched.sourceCluster && errors.sourceCluster)}
              >
                <SimpleSelect
                  id="sourceCluster"
                  onChange={handleSourceChange}
                  options={srcClusterOptions}
                  value={values.sourceCluster}
                  placeholderText="Select source..."
                />
              </FormGroup>
            </GridItem>

            <GridItem>
              <FormGroup
                label="Target cluster"
                isRequired
                fieldId="targetCluster"
                helperTextInvalid={touched.targetCluster && errors.targetCluster}
                isValid={!(touched.targetCluster && errors.targetCluster)}
              >
                <SimpleSelect
                  id="targetCluster"
                  onChange={handleTargetChange}
                  options={targetClusterOptions}
                  value={values.targetCluster}
                  placeholderText="Select target..."
                />
              </FormGroup>
            </GridItem>

            <GridItem>
              <FormGroup
                label="Replication repository"
                isRequired
                fieldId="selectedStorage"
                helperTextInvalid={touched.selectedStorage && errors.selectedStorage}
                isValid={!(touched.selectedStorage && errors.selectedStorage)}
              >
                <SimpleSelect
                  id="selectedStorage"
                  onChange={handleStorageChange}
                  options={storageOptions}
                  value={values.selectedStorage}
                  placeholderText="Select repository..."
                />
              </FormGroup>
            </GridItem>
          </Grid>
        </Form>
      </GridItem>
      {isFetchingNamespaceList ? (
        <GridItem>
          <Bullseye>
            <EmptyState variant="small">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        </GridItem>
      ) : (
        <NamespaceTable
          setFieldValue={setFieldValue}
          values={values}
          sourceClusterNamespaces={sourceClusterNamespaces}
        />
      )}
    </Grid>
  );
};

export default ResourceSelectForm;
