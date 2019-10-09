/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import {
  Bullseye,
  EmptyState,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Title,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import NamespaceTable from './NameSpaceTable';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

const ResourceSelectForm = props => {
  const [srcClusterOptions, setSrcClusterOptions] = useState([]);
  const [targetClusterOptions, setTargetClusterOptions] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);
  const [selectedSrcCluster, setSelectedSrcCluster] = useState('');
  const [selectedTargetCluster, setSelectedTargetCluster] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');

  const [isSrcOpen, setIsSrcOpen] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [isTargetOpen, setIsTargetOpen] = useState(false);

  const {
    clusterList,
    storageList,
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    isFetchingNamespaceList,
    fetchNamespacesForCluster,
    sourceClusterNamespaces,
    isEdit
  } = props;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);


  useEffect(() => {
    // ***
    // * Populate src and target cluster dropdowns
    // ***
    if (clusterList.length) {
      const sourceOptions = [];
      const targetOptions = [];
      const clusterLen = clusterList.length;
      for (let i = 0; i < clusterLen; i++) {
        if (clusterList[i].MigCluster.metadata.name !== values.sourceCluster) {
          targetOptions.push({
            value: clusterList[i].MigCluster.metadata.name,
          });
        }
        if (
          !clusterList[i].MigCluster.spec.isHostCluster &&
          clusterList[i].MigCluster.metadata.name !== values.targetCluster
        ) {
          sourceOptions.push({
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
        setSelectedSrcCluster(
          existingSrcCluster.MigCluster.metadata.name,
        );
      }
      if (values.targetCluster !== null) {
        const existingTargetCluster = clusterList.find(
          c => c.MigCluster.metadata.name === values.targetCluster
        );
        setSelectedTargetCluster(
          existingTargetCluster.MigCluster.metadata.name,
        );
      }
    } else {
      const myOptions: any = [];
      myOptions.push({
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
      newStorageOptions.push({
        value: storageList[i].MigStorage.metadata.name,
      });
    }
    setStorageOptions(newStorageOptions);

    if (values.selectedStorage !== null) {
      const existingStorageSelection = storageList.find(
        c => c.MigStorage.metadata.name === values.selectedStorage
      );
      if (existingStorageSelection) {
        setSelectedStorage(
          existingStorageSelection.MigStorage.metadata.name,
        );

      }
    }
  }, [values]);
  const clearSelection = () => {
    setIsSrcOpen(false);
    setIsTargetOpen(false);
    setIsStorageOpen(false);
  };


  const handleStorageChange = (option) => {
    setFieldValue('selectedStorage', option);
    const matchingStorage = storageList.find(c => c.MigStorage.metadata.name === option);

    setSelectedStorage(
      matchingStorage.MigStorage.metadata.name,
    );

    setFieldTouched('selectedStorage');
    setIsStorageOpen(false);
  };

  const handleSourceChange = (option) => {
    setFieldValue('sourceCluster', option);
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === option);
    setSelectedSrcCluster(
      matchingCluster.MigCluster.metadata.name,
    );
    setFieldTouched('sourceCluster');
    fetchNamespacesForCluster(matchingCluster.MigCluster.metadata.name);
    setIsSrcOpen(false);
  };

  const handleTargetChange = (option) => {
    setFieldValue('targetCluster', option);
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === option);
    setSelectedTargetCluster(
      matchingCluster.MigCluster.metadata.name,
    );
    setFieldTouched('targetCluster');
    setIsTargetOpen(false);
  };
  return (
    <Grid gutter="md">
      <GridItem>
        <Form>
          <Grid md={6} gutter="md">
            <GridItem>
              <FormGroup
                label="Source Cluster"
                isRequired
                fieldId="sourceCluster"
              >
                <Select
                  placeholderText='Choose...'
                  selections={selectedSrcCluster}
                  isExpanded={isSrcOpen}
                  onToggle={(isOpen) => {
                    setIsSrcOpen(isOpen);
                  }}
                  onSelect={(e, selection, ) => {
                    handleSourceChange(selection);
                  }}
                >
                  {srcClusterOptions.map((action, index) => {
                    return (
                      <SelectOption
                        key={index}
                        value={action.value}
                      />
                    );
                  })}
                </Select>
                {errors.sourceCluster && touched.sourceCluster && (
                  <div id="feedback">{errors.sourceCluster}</div>
                )}
              </FormGroup>
            </GridItem>

            <GridItem>
              <FormGroup
                label="Target Cluster"
                isRequired
                fieldId="targetCluster"
              >
                <Select
                  placeholderText='Choose...'
                  selections={selectedTargetCluster}
                  isExpanded={isTargetOpen}
                  onToggle={(isOpen) => {
                    setIsTargetOpen(isOpen);
                  }}
                  onSelect={(e, selection, ) => {
                    handleTargetChange(selection);
                  }}
                >
                  {targetClusterOptions.map((action, index) => {
                    return (
                      <SelectOption
                        key={index}
                        value={action.value}
                      />
                    );
                  })}
                </Select>
                {errors.targetCluster && touched.targetCluster && (
                  <div id="feedback">{errors.targetCluster}</div>
                )}
              </FormGroup>
            </GridItem>

            <GridItem>
              <FormGroup
                label="Replication Repository"
                isRequired
                fieldId="selectedStorage"
              >
                <Select
                  placeholderText='Choose...'
                  selections={selectedStorage}
                  isExpanded={isStorageOpen}
                  onToggle={(isOpen) => {
                    setIsStorageOpen(isOpen);
                  }}
                  onSelect={(e, selection, ) => {
                    handleStorageChange(selection);
                  }}
                >
                  {storageOptions.map((action, index) => {
                    return (
                      <SelectOption
                        key={index}
                        value={action.value}
                      />
                    );
                  })}
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
          />
        )}
    </Grid>
  );
};

export default ResourceSelectForm;
