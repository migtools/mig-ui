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

const DestinationSelectForm = props => {
  const [targetClusterOptions, setTargetClusterOptions] = useState([]);

  const {
    clusterList,
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
  } = props;

  useEffect(() => {
    // ***
    // * Populate src and target cluster dropdowns
    // ***
    if (clusterList.length) {
      const targetOptions = [];
      const clusterLen = clusterList.length;
      for (let i = 0; i < clusterLen; i++) {
        if (
          clusterList[i].MigCluster.metadata.name !== values.sourceCluster &&
          clusterList[i].ClusterStatus.hasReadyCondition
        ) {
          targetOptions.push(clusterList[i].MigCluster.metadata.name);
        }
      }
      setTargetClusterOptions(targetOptions);
    } 
  }, [values]);

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
          </Grid>
        </Form>
      </GridItem>
     </Grid>
  );
};

export default DestinationSelectForm;
