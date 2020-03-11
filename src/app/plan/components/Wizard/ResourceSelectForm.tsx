import React, { useState, useEffect } from 'react';
import {
  Bullseye,
  EmptyState,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Select,
  SelectOption,
  Title,
} from '@patternfly/react-core';
import NamespaceTable from './NameSpaceTable';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

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
          targetOptions.push({
            label: clusterList[i].MigCluster.metadata.name,
            value: clusterList[i].MigCluster.metadata.name,
          });
        }
        if (
          clusterList[i].MigCluster.metadata.name !== values.targetCluster &&
          clusterList[i].ClusterStatus.hasReadyCondition
        ) {
          sourceOptions.push({
            label: clusterList[i].MigCluster.metadata.name,
            value: clusterList[i].MigCluster.metadata.name,
          });
        }
      }
      setSrcClusterOptions(sourceOptions);
      setTargetClusterOptions(targetOptions);

      if (values.sourceCluster !== null) {
        const existingSrcCluster = clusterList.find(
          c => c.MigCluster.metadata.name === values.sourceCluster
        );
        setSelectedSrcCluster({
          label: existingSrcCluster.MigCluster.metadata.name,
          value: existingSrcCluster.MigCluster.metadata.name,
        });
      }
      if (values.targetCluster !== null) {
        const existingTargetCluster = clusterList.find(
          c => c.MigCluster.metadata.name === values.targetCluster
        );
        setSelectedTargetCluster({
          label: existingTargetCluster.MigCluster.metadata.name,
          value: existingTargetCluster.MigCluster.metadata.name,
        });
      }
    } else {
      const myOptions: any = [];
      myOptions.push({
        label: 'No valid clusters found',
        value: 'N/A',
      });
      setSrcClusterOptions(myOptions);
    }
    // ***
    // * Populate storage dropdown
    // ***
    const newStorageOptions = [];
    const storageLen = storageList.length;
    for (let i = 0; i < storageLen; i++) {
      if (storageList[i].StorageStatus.hasReadyCondition) {
        newStorageOptions.push({
          label: storageList[i].MigStorage.metadata.name,
          value: storageList[i].MigStorage.metadata.name,
        });
      }
    }
    setStorageOptions(newStorageOptions);

    if (values.selectedStorage !== null) {
      const existingStorageSelection = storageList.find(
        c => c.MigStorage.metadata.name === values.selectedStorage
      );
      if (existingStorageSelection) {
        setSelectedStorage({
          label: existingStorageSelection.MigStorage.metadata.name,
          value: existingStorageSelection.MigStorage.metadata.name,
        });
      }
    }
  }, [values]);

  const handleStorageChange = option => {
    setFieldValue('selectedStorage', option.value);
    const matchingStorage = storageList.find(c => c.MigStorage.metadata.name === option.value);

    setSelectedStorage({
      label: matchingStorage.MigStorage.metadata.name,
      value: matchingStorage.MigStorage.metadata.name,
    });

    setFieldTouched('selectedStorage');
  };

  const handleSourceChange = option => {
    setFieldValue('sourceCluster', option.value);
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === option.value);
    setSelectedSrcCluster({
      label: matchingCluster.MigCluster.metadata.name,
      value: matchingCluster.MigCluster.metadata.name,
    });
    setFieldTouched('sourceCluster');
    fetchNamespacesRequest(matchingCluster.MigCluster.metadata.name);
  };

  const handleTargetChange = option => {
    setFieldValue('targetCluster', option.value);
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === option.value);
    setSelectedTargetCluster({
      label: matchingCluster.MigCluster.metadata.name,
      value: matchingCluster.MigCluster.metadata.name,
    });
    setFieldTouched('targetCluster');
  };

  const [sourceClusterExpanded, setSourceClusterExpanded] = useState(false);
  const [targetClusterExpanded, setTargetClusterExpanded] = useState(false);
  const [storageExpanded, setStorageExpanded] = useState(false);

  const extendWithToString = option => ({ ...option, toString: () => option.label });
  const srcClusterOptionsMeta = srcClusterOptions.map(extendWithToString);
  const targetClusterOptionsMeta = targetClusterOptions.map(extendWithToString);
  const storageOptionsMeta = storageOptions.map(extendWithToString);

  return (
    <Grid gutter="md">
      <GridItem>
        <Form>
          <Grid md={6} gutter="md">
            <GridItem>
              <FormGroup label="Source cluster" isRequired fieldId="sourceCluster">
                <Select
                  id="sourceCluster"
                  placeholderText="Select..."
                  isExpanded={sourceClusterExpanded}
                  onToggle={setSourceClusterExpanded}
                  onSelect={(event, selection) => {
                    handleSourceChange(selection);
                    setSourceClusterExpanded(false);
                  }}
                  selections={srcClusterOptionsMeta.find(
                    option => selectedSrcCluster && option.value === selectedSrcCluster.value
                  )}
                >
                  {srcClusterOptionsMeta.map(option => (
                    <SelectOption key={option.value} value={option} />
                  ))}
                </Select>
                {errors.sourceCluster && touched.sourceCluster && (
                  <div id="feedback">{errors.sourceCluster}</div>
                )}
              </FormGroup>
            </GridItem>

            <GridItem>
              <FormGroup label="Target cluster" isRequired fieldId="targetCluster">
                <Select
                  id="targetCluster"
                  placeholderText="Select..."
                  isExpanded={targetClusterExpanded}
                  onToggle={setTargetClusterExpanded}
                  onSelect={(event, selection) => {
                    handleTargetChange(selection);
                    setTargetClusterExpanded(false);
                  }}
                  selections={targetClusterOptionsMeta.find(
                    option => selectedTargetCluster && option.value === selectedTargetCluster.value
                  )}
                >
                  {targetClusterOptionsMeta.map(option => (
                    <SelectOption key={option.value} value={option} />
                  ))}
                </Select>
                {errors.targetCluster && touched.targetCluster && (
                  <div id="feedback">{errors.targetCluster}</div>
                )}
              </FormGroup>
            </GridItem>

            <GridItem>
              <FormGroup label="Replication repository" isRequired fieldId="selectedStorage">
                <Select
                  id="selectedStorage"
                  placeholderText="Select..."
                  isExpanded={storageExpanded}
                  onToggle={setStorageExpanded}
                  onSelect={(event, selection) => {
                    handleStorageChange(selection);
                    setStorageExpanded(false);
                  }}
                  selections={storageOptionsMeta.find(
                    option => selectedStorage && option.value === selectedStorage.value
                  )}
                >
                  {storageOptionsMeta.map(option => (
                    <SelectOption key={option.value} value={option} />
                  ))}
                </Select>
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
