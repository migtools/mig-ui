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

const ReplicationSelectForm = props => {
  const [storageOptions, setStorageOptions] = useState([]);

  const {
    storageList,
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
  } = props;
  
  useEffect(() => {
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

  return (
    <Grid gutter="md">
      <GridItem>
        <Form>
          <Grid md={6} gutter="md">
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
    </Grid>
  );
};

export default ReplicationSelectForm;
