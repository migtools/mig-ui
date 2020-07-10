import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import VolumesTable from './VolumesTable';
import {
  Grid,
  GridItem,
  Bullseye,
  EmptyState,
  Spinner,
  Title,
  Alert,
} from '@patternfly/react-core';
import StatusIcon, { StatusType } from '../../../../../common/components/StatusIcon';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';

const styles = require('./VolumesTable.module');

type IVolumesFormProps = Pick<
  IOtherProps,
  | 'isPVError'
  | 'currentPlan'
  | 'currentPlanStatus'
  | 'getPVResourcesRequest'
  | 'pvResourceList'
  | 'isFetchingPVResources'
  | 'pvDiscoveryRequest'
  | 'isPollingStatus'
>;

const VolumesForm: React.FunctionComponent<IVolumesFormProps> = ({
  isPVError,
  currentPlan,
  currentPlanStatus,
  getPVResourcesRequest,
  pvResourceList,
  isFetchingPVResources,
  pvDiscoveryRequest,
  isPollingStatus,
}: IVolumesFormProps) => {
  const { setFieldValue, values } = useFormikContext<IFormValues>();

  useEffect(() => {
    //kick off pv discovery once volumes form is reached with current selected namespaces
    pvDiscoveryRequest(values);
  }, []);

  const discoveredPersistentVolumes = (currentPlan && currentPlan.spec.persistentVolumes) || [];
  useEffect(() => {
    if (discoveredPersistentVolumes.length > 0) {
      getPVResourcesRequest(discoveredPersistentVolumes, values.sourceCluster || '');
      let mappedPVs;
      if (values.persistentVolumes) {
        mappedPVs = discoveredPersistentVolumes.map((planVolume) => {
          let pvAction = 'copy'; // Default to copy
          if (values.persistentVolumes.length !== 0) {
            const rowVal = values.persistentVolumes.find((v) => v.name === planVolume.name);
            if (rowVal && planVolume.selection.action) {
              pvAction = planVolume.selection.action;
            }
          }
          // TODO do we really need to generate these meta-objects and keep them in formik?
          // currentPlan.spec.persistentVolumes is in global state, so we could just
          // infer from that everywhere and keep only a mapping of pv id => type selections in formik
          return {
            name: planVolume.name,
            project: planVolume.pvc.namespace,
            storageClass: planVolume.storageClass || 'None',
            size: planVolume.capacity,
            claim: planVolume.pvc.name,
            type: pvAction,
            details: '',
            supportedActions: planVolume.supported.actions,
          };
        });
      } else {
        mappedPVs = discoveredPersistentVolumes.map((planVolume) => {
          const pvAction = 'copy'; // Default to copy
          return {
            name: planVolume.name,
            project: planVolume.pvc.namespace,
            storageClass: planVolume.storageClass || '',
            size: planVolume.capacity,
            claim: planVolume.pvc.name,
            type: pvAction,
            details: '',
            supportedActions: planVolume.supported.actions,
          };
        });
      }
      setFieldValue('persistentVolumes', mappedPVs);
    }
  }, [discoveredPersistentVolumes, currentPlanStatus]); // Only re-run the effect if fetching value changes

  //TODO: added this component level error state to handle the case of no PVs
  // showing up after 3 checks of the interval. When the isPVError flag is checked,
  // the volumes form will show this error. Need to add redux actions & state to encapsulate
  // validation so that this error state enables the user to go to next page( that possibly
  // shows a different set of forms catered to stateless apps)

  if (isPVError) {
    return (
      <Grid gutter="md" className={styles.centerAlign}>
        <GridItem>
          <div className={styles.errorDiv}>
            <StatusIcon status={StatusType.ERROR} />
            PV Discovery Error
          </div>
        </GridItem>
      </Grid>
    );
  }
  if (isPollingStatus || currentPlanStatus.state === 'Pending') {
    return (
      <Bullseye>
        <EmptyState variant="large">
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>
          <Title headingLevel="h2" size="xl">
            Discovering persistent volumes attached to source projects...
          </Title>
        </EmptyState>
      </Bullseye>
    );
  }
  if (currentPlanStatus.state === 'Critical') {
    return (
      <Bullseye>
        <EmptyState variant="large">
          <Alert variant="danger" isInline title={currentPlanStatus.errorMessage} />
        </EmptyState>
      </Bullseye>
    );
  }

  const updatePersistentVolumes = (
    currentPV: IPlanPersistentVolume,
    newValues: { type: string }
  ) => {
    if (currentPlan !== null && values.persistentVolumes) {
      const newPVs = [...values.persistentVolumes];
      const matchingPV = values.persistentVolumes.find((pv) => pv === currentPV);
      const pvIndex = values.persistentVolumes.indexOf(matchingPV);
      newPVs[pvIndex] = { ...matchingPV, ...newValues };
      // TODO this should only store selections, we should inherit the rest from currentPlan.spec.persistentVolumes
      setFieldValue('persistentVolumes', newPVs);
    }
  };

  const onTypeChange = (currentPV: IPlanPersistentVolume, value: string) =>
    updatePersistentVolumes(currentPV, { type: value });

  return (
    <VolumesTable
      pvResourceList={pvResourceList}
      isFetchingPVResources={isFetchingPVResources}
      persistentVolumes={values.persistentVolumes}
      onTypeChange={onTypeChange}
    />
  );
};
export default VolumesForm;
