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
  const indirectImageMigrationKey = 'indirectImageMigration';
  const indirectVolumeMigrationKey = 'indirectVolumeMigration';

  const { setFieldValue, values } = useFormikContext<IFormValues>();

  const srcClusterRegistryPath = clusterList.find(
    (cluster) => cluster.MigCluster.metadata.name === values.sourceCluster
  ).MigCluster?.status?.registryPath;
  const destClusterRegistryPath = clusterList.find(
    (cluster) => cluster.MigCluster.metadata.name === values.targetCluster
  ).MigCluster?.status?.registryPath;

  const isDirectImageMigrationAvailable = srcClusterRegistryPath && destClusterRegistryPath;

  const isDirectVolumeMigrationAvailable = !!currentPlan.spec.persistentVolumes.filter((pv) =>
    pv.supported.copyMethods.includes('filesystem')
  ).length;

  useEffect(() => {
    //if available, set direct migration for image/volumes on initial render
    if (isDirectImageMigrationAvailable) {
      setFieldValue('indirectImageMigration', false);
    }

    if (isDirectVolumeMigrationAvailable) {
      setFieldValue('indirectVolumeMigration', false);
    }
  }, []);

  return (
    <Form>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Title size="lg" headingLevel="h2" className={spacing.pbSm}>
            Images
          </Title>
          <Text component="p">
            Direct image migration
            {isDirectImageMigrationAvailable ? (
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
              bodyContent={
                <>
                  Direct image migration bypasses the replication repository and copies images
                  directly from the source cluster to the target cluster. It is much faster than
                  image migration that goes through the replication repository.
                  <br /> <br />
                  For direct image migration to be available, exposed routes to the image registry
                  for both clusters must be specified. See the product documentation for more
                  information.
                  <br /> <br />
                  See the product documentation for more information.
                </>
              }
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
        <FlexItem>
          <FormGroup fieldId={indirectImageMigrationKey} className={spacing.ptSm}>
            <Checkbox
              label="Use direct image migration"
              aria-label="direct image migration checkbox"
              id={indirectImageMigrationKey}
              name={indirectImageMigrationKey}
              isChecked={!values.indirectImageMigration}
              isDisabled={!isDirectImageMigrationAvailable}
              onChange={(checked) => {
                setFieldValue('indirectImageMigration', !checked);
              }}
            />
          </FormGroup>
        </FlexItem>
        <FlexItem>
          <Title size="lg" headingLevel="h2" className={spacing.pbSm}>
            Persistent volumes
          </Title>
          <Text component="p">
            Direct PV migration
            {isDirectVolumeMigrationAvailable ? (
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
              bodyContent={
                <>
                  Direct volume migration allows filesystem copies to be performed without going
                  through the replication repository. It is much faster than two-step volume
                  migration, but it is only available for filesystem copies - not moves or snapshot
                  copies. <br /> <br />
                  For direct volume migration to work, your source cluster must be able to
                  communicate with your target cluster over port 443.
                  <br /> <br />
                  See the product documentation for more information.
                </>
              }
              aria-label="direct-volume-mig-details"
              closeBtnAriaLabel="close--details"
              maxWidth="30rem"
            >
              <span className="pf-c-icon pf-m-info">
                <QuestionCircleIcon />
              </span>
            </Popover>
          </Text>
        </FlexItem>
        <FlexItem>
          <FormGroup fieldId={indirectVolumeMigrationKey} className={spacing.ptSm}>
            <Checkbox
              label="Use direct PV migration for filesystem copies"
              aria-label="direct volume migration checkbox"
              id={indirectVolumeMigrationKey}
              name={indirectVolumeMigrationKey}
              isChecked={!values.indirectVolumeMigration}
              isDisabled={!isDirectVolumeMigrationAvailable}
              onChange={(checked) => {
                setFieldValue('indirectVolumeMigration', !checked);
              }}
            />
          </FormGroup>
        </FlexItem>
      </Flex>
    </Form>
  );
};
export default MigrationOptionsForm;
