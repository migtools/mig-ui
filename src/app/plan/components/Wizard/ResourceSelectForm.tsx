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
        setSelectedSrcCluster(values.sourceCluster);
      }
      if (values.targetCluster !== null) {
        setSelectedTargetCluster(values.targetCluster);
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
      setSelectedStorage(values.selectedStorage);
    }
  }, [values]);

  const handleStorageChange = value => {
    // value came from storageList[].MigStorage.metadata.name
    setFieldValue('selectedStorage', value);
    setSelectedStorage(value);
    setFieldTouched('selectedStorage');
    // TODO do we even need the state here, or can we just use formik as the source of truth?
  };

  const handleSourceChange = value => {
    // value came from clusterList[].MigCluster.metadata.name
    setFieldValue('sourceCluster', value);
    setSelectedSrcCluster(value);
    setFieldTouched('sourceCluster');
    fetchNamespacesRequest(value);
    // TODO do we even need the state here, or can we just use formik as the source of truth?
  };

  const handleTargetChange = value => {
    // value came from clusterList[].MigCluster.metadata.name
    setFieldValue('targetCluster', value);
    setSelectedTargetCluster(value);
    setFieldTouched('targetCluster');
    // TODO do we even need the state here, or can we just use formik as the source of truth?
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
