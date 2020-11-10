import React, { useEffect } from 'react';
import {
  Checkbox,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Grid,
  GridItem,
  TextInput,
  Title,
  Text,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { IFormValues, IOtherProps } from '../WizardContainer';
import { IPlanPersistentVolume } from '../../../../../../plan/duck/types';
import { AddEditMode } from '../../../../../../common/add_edit_state';
import { validatedState } from '../../../../../../common/helpers';
import { TokenFieldKey } from '../../../../../../token/duck/types';

type IMigrationOptionsFormProps = Pick<IOtherProps, 'clusterList' | 'currentPlan'>;

const MigrationOptionsForm: React.FunctionComponent<IMigrationOptionsFormProps> = ({
  clusterList,
  currentPlan,
}: IMigrationOptionsFormProps) => {
  const srcExposedRegistryPathKey = 'srcExposedRegistryPath';
  const destExposedRegistryPathKey = 'destExposedRegistryPath';
  const indirectImageMigrationKey = 'indirectImageMigration';
  const indirectVolumeMigrationKey = 'indirectVolumeMigration';

  const {
    handleBlur,
    handleChange,
    setFieldTouched,
    setFieldValue,
    values,
    touched,
    errors,
    validateForm,
  } = useFormikContext<IFormValues>();

  // const handleStorageChange = (value) => {
  //   const matchingStorage = storageList.find((c) => c.MigStorage.metadata.name === value);
  //   if (matchingStorage) {
  //     setFieldValue('selectedStorage', value);
  //     setFieldTouched('selectedStorage', true, true);
  //   }
  // };

  return (
    <Form>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Title headingLevel="h2" size="md">
            Images
          </Title>
        </FlexItem>
        <FlexItem>
          <Text>Direct image migration</Text>
        </FlexItem>
        <FlexItem>
          <FormGroup
            label="Source cluster exposed route to image registry"
            isRequired
            fieldId={srcExposedRegistryPathKey}
          >
            <TextInput
              // value={clusterList.status.registryPath}
              name={srcExposedRegistryPathKey}
              type="text"
              id={srcExposedRegistryPathKey}
              isDisabled={true}
            />
          </FormGroup>
          <FormGroup
            label="Target cluster exposed route to image registry"
            isRequired
            fieldId={destExposedRegistryPathKey}
          >
            <TextInput
              // value={clusterList.status.registryPath}
              name={destExposedRegistryPathKey}
              type="text"
              id={destExposedRegistryPathKey}
              isDisabled={true}
            />
          </FormGroup>
          <FormGroup fieldId={indirectImageMigrationKey}>
            <Checkbox
              label="Use direct image migration"
              aria-label="direct image migration checkbox"
              id={indirectImageMigrationKey}
              name={indirectImageMigrationKey}
              isChecked={values.indirectImageMigration}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </FormGroup>
        </FlexItem>
      </Flex>
    </Form>
  );
};
export default MigrationOptionsForm;
