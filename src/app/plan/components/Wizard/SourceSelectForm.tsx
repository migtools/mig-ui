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

const SourceSelectForm = props => {
  const [srcClusterOptions, setSrcClusterOptions] = useState([]);

  const {
    clusterList,
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
      const clusterLen = clusterList.length;
      for (let i = 0; i < clusterLen; i++) {
        if (
          clusterList[i].MigCluster.metadata.name !== values.targetCluster &&
          clusterList[i].ClusterStatus.hasReadyCondition
        ) {
          sourceOptions.push(clusterList[i].MigCluster.metadata.name);
        }
      }
      setSrcClusterOptions(sourceOptions);
    } else {
      setSrcClusterOptions(['No valid clusters found']);
    }
  }, [values]);

  const handleSourceChange = value => {
    const matchingCluster = clusterList.find(c => c.MigCluster.metadata.name === value);
    if (matchingCluster) {
      setFieldValue('sourceCluster', value);
      setFieldTouched('sourceCluster');
      fetchNamespacesRequest(value);
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

export default SourceSelectForm;
