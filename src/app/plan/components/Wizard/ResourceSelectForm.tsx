import React, { useState, useEffect } from 'react';
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

const ResourceSelectForm = props => {
  const [srcClusterOptions, setSrcClusterOptions] = useState([]);
  const [targetClusterOptions, setTargetClusterOptions] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);

  const {
    clusterList,
    storageList,
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    isFetchingNamespaceList,
    fetchNamespacesRequest,
    sourceClusterNamespaces,
    isEdit,
  } = props;
  useEffect(() => {
    if (isEdit) {
      fetchNamespacesRequest(values.sourceCluster);
    }
  }, []);

  useEffect(() => {
    // ***
    // * Populate src and target cluster dropdowns
    // ***
    if (clusterList.length) {
      const sourceOptions = [];
      const targetOptions = [];
      const clusterLen = clusterList.length;
      for (let i = 0; i < clusterLen; i++) {
        if (
          clusterList[i].MigCluster.metadata.name !== values.sourceCluster &&
          clusterList[i].ClusterStatus.hasReadyCondition
        ) {
          targetOptions.push(clusterList[i].MigCluster.metadata.name);
        }
        if (
          clusterList[i].MigCluster.metadata.name !== values.targetCluster &&
          clusterList[i].ClusterStatus.hasReadyCondition
        ) {
          sourceOptions.push(clusterList[i].MigCluster.metadata.name);
        }
      }
      setSrcClusterOptions(sourceOptions);
      setTargetClusterOptions(targetOptions);
    } else {
      setSrcClusterOptions(['No valid clusters found']);
    }
    // ***
    // * Populate storage dropdown
    // ***
    const newStorageOptions = [];
    const storageLen = storageList.length;
    for (let i = 0; i < storageLen; i++) {
      if (storageList[i].StorageStatus.hasReadyCondition) {
        newStorageOptions.push(storageList[i].MigStorage.metadata.name);
      }
    }
    setStorageOptions(newStorageOptions);
  }, [values]);

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
          isEdit={isEdit}
        />
      )}
    </Grid>
  );
};

export default ResourceSelectForm;
