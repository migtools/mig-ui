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

  const [selectedSrcCluster, setSelectedSrcCluster] = useState(null);
  const [selectedTargetCluster, setSelectedTargetCluster] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
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

      if (values.sourceCluster !== null) {
        const existingSrcCluster = clusterList.find(
          c => c.MigCluster.metadata.name === values.sourceCluster
        );
        setSelectedSrcCluster(existingSrcCluster.MigCluster.metadata.name);
      }
      if (values.targetCluster !== null) {
        const existingTargetCluster = clusterList.find(
          c => c.MigCluster.metadata.name === values.targetCluster
        );
        setSelectedTargetCluster(existingTargetCluster.MigCluster.metadata.name);
      }
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

    if (values.selectedStorage !== null) {
      const existingStorageSelection = storageList.find(
        c => c.MigStorage.metadata.name === values.selectedStorage
      );
      if (existingStorageSelection) {
        setSelectedStorage(existingStorageSelection.MigStorage.metadata.name);
      }
    }
  }, [values]);

  const handleStorageChange = value => {
    setFieldValue('selectedStorage', value);
    const matchingStorage = storageList.find(c => c.MigStorage.metadata.name === value);
    setSelectedStorage(matchingStorage.MigStorage.metadata.name);
    setFieldTouched('selectedStorage');
  };

  const handleSourceChange = value => {
    setFieldValue('sourceCluster', value);
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === value);
    setSelectedSrcCluster(matchingCluster.MigCluster.metadata.name);
    setFieldTouched('sourceCluster');
    fetchNamespacesRequest(matchingCluster.MigCluster.metadata.name);
  };

  const handleTargetChange = value => {
    setFieldValue('targetCluster', value);
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === value);
    setSelectedTargetCluster(matchingCluster.MigCluster.metadata.name);
    setFieldTouched('targetCluster');
  };

  return (
    <Grid gutter="md">
      <GridItem>
        <Form>
          <Grid md={6} gutter="md">
            <GridItem>
              <FormGroup label="Source cluster" isRequired fieldId="sourceCluster">
                <SimpleSelect
                  id="sourceCluster"
                  onChange={handleSourceChange}
                  options={srcClusterOptions}
                  value={selectedSrcCluster}
                />
                {errors.sourceCluster && touched.sourceCluster && (
                  <div id="feedback">{errors.sourceCluster}</div>
                )}
              </FormGroup>
            </GridItem>

            <GridItem>
              <FormGroup label="Target cluster" isRequired fieldId="targetCluster">
                <SimpleSelect
                  id="targetCluster"
                  onChange={handleTargetChange}
                  options={targetClusterOptions}
                  value={selectedTargetCluster}
                />
                {errors.targetCluster && touched.targetCluster && (
                  <div id="feedback">{errors.targetCluster}</div>
                )}
              </FormGroup>
            </GridItem>

            <GridItem>
              <FormGroup label="Replication repository" isRequired fieldId="selectedStorage">
                <SimpleSelect
                  id="selectedStorage"
                  onChange={handleStorageChange}
                  options={storageOptions}
                  value={selectedStorage}
                />
                {errors.selectedStorage && touched.selectedStorage && (
                  <div id="feedback">{errors.selectedStorage}</div>
                )}
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
