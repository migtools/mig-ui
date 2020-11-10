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
  Label,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { IFormValues, IOtherProps } from '../WizardContainer';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons';

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

  const srcClusterHasRegistryPath = clusterList.find(
    (cluster) => cluster.MigCluster.metadata.name === values.sourceCluster
  ).MigCluster?.status?.registryPath;
  const destClusterHasRegistryPath = clusterList.find(
    (cluster) => cluster.MigCluster.metadata.name === values.targetCluster
  ).MigCluster?.status?.registryPath;
  const isDirectMigrationAvailable = srcClusterHasRegistryPath && destClusterHasRegistryPath;
  if (isDirectMigrationAvailable && values.indirectImageMigration === null) {
    setFieldValue('indirectImageMigration', false);
  }
  return (
    <Form>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Title size="lg" headingLevel="h2" className={spacing.pbSm}>
            Images
          </Title>
          <Text component="p">
            Direct image migration
            {isDirectMigrationAvailable ? (
              <Label variant="outline" color="green" className={spacing.mxSm}>
                Available
              </Label>
            ) : (
              <Label variant="outline" className={spacing.mxSm}>
                Unavailable
              </Label>
            )}
            <Popover
              position={PopoverPosition.top}
              bodyContent="Direct image migration bypasses the replication repository and copies images
              directly from the source cluster to the target cluster. It is much faster than image migration that goes through
              the replication repository. &nbsp;
              For direct image migration to be available, exposed routes to the image registry for both clusters must be specified. &nbsp;
              See the product documentation for more information."
              aria-label="registry-details"
              closeBtnAriaLabel="close--details"
              maxWidth="30rem"
            >
              <span className="pf-c-icon pf-m-info">
                <QuestionCircleIcon />
              </span>
            </Popover>
          </Text>
        </FlexItem>
        <FlexItem></FlexItem>
        <FlexItem>
          <FormGroup
            label="Source cluster exposed route to image registry"
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
          <FormGroup fieldId={indirectImageMigrationKey} className={spacing.ptSm}>
            <Checkbox
              label="Use direct image migration"
              aria-label="direct image migration checkbox"
              id={indirectImageMigrationKey}
              name={indirectImageMigrationKey}
              isChecked={values.indirectImageMigration}
              isDisabled={!isDirectMigrationAvailable}
              // isChecked={isVerifyCopyAllowed && pvVerifyFlagAssignment[pv.name]}
              // isDisabled={!isVerifyCopyAllowed}
              onChange={(checked) => {
                setFieldValue('indirectImageMigration', !checked);
                // onVerifyFlagChange(currentPV, checked);
                // if (checked && verifyWarningState === VerifyWarningState.Unread) {
                //   setVerifyWarningState(VerifyWarningState.Open);
                // }
              }}
              // onChange={handleChange}
            />
          </FormGroup>
        </FlexItem>
      </Flex>
    </Form>
  );
};
export default MigrationOptionsForm;
