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
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { usePausedPollingEffect } from '../../../../../common/context';

const styles = require('./VolumesTable.module').default;

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
  usePausedPollingEffect();

  const { setFieldValue, values } = useFormikContext<IFormValues>();

  useEffect(() => {
    //kick off pv discovery once volumes form is reached with current selected namespaces
    pvDiscoveryRequest(values);
  }, []);

  const discoveredPersistentVolumes = (currentPlan && currentPlan.spec.persistentVolumes) || [];
  useEffect(() => {
    if (discoveredPersistentVolumes.length > 0) {
      getPVResourcesRequest(discoveredPersistentVolumes, values.sourceCluster || '');
      let mappedPVs: IPlanPersistentVolume[];
      if (values.persistentVolumes) {
        mappedPVs = discoveredPersistentVolumes.map((planVolume) => {
          let pvAction = 'copy'; // Default to copy
          if (values.persistentVolumes.length !== 0) {
            const rowVal = values.persistentVolumes.find((v) => v.name === planVolume.name);
            if (rowVal && planVolume.selection.action) {
              pvAction = planVolume.selection.action;
            }
          }
          return {
            ...planVolume,
            storageClass: planVolume.storageClass || 'None',
            selection: {
              ...planVolume.selection,
              action: pvAction,
            },
          };
        });
      } else {
        mappedPVs = discoveredPersistentVolumes.map((planVolume) => {
          const pvAction = 'copy'; // Default to copy
          return {
            ...planVolume,
            selection: {
              ...planVolume.selection,
              action: pvAction,
            },
          };
        });
      }
      setFieldValue('persistentVolumes', mappedPVs);
    }
  }, [discoveredPersistentVolumes, currentPlanStatus]); // Only re-run the effect if fetching value changes

  if (isPVError) {
    return (
      <Grid hasGutter className={styles.centerAlign}>
        <GridItem>
          <div className={styles.errorDiv}>
            <StatusIcon status="Error" label="PV Discovery Error" />
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

  const updatePersistentVolumeAction = (currentPV: IPlanPersistentVolume, newAction: string) => {
    if (currentPlan !== null && values.persistentVolumes) {
      const newPVs = [...values.persistentVolumes];
      const matchingPV = values.persistentVolumes.find((pv) => pv === currentPV);
      const pvIndex = values.persistentVolumes.indexOf(matchingPV);
      newPVs[pvIndex] = {
        ...matchingPV,
        selection: {
          ...matchingPV.selection,
          action: newAction,
        },
      };
      setFieldValue('persistentVolumes', newPVs);
    }
  };

  const onActionTypeChange = (currentPV: IPlanPersistentVolume, actionType: string) =>
    updatePersistentVolumeAction(currentPV, actionType);

  return (
    <VolumesTable
      pvResourceList={pvResourceList}
      isFetchingPVResources={isFetchingPVResources}
      persistentVolumes={values.persistentVolumes}
      onActionTypeChange={onActionTypeChange}
    />
  );
};
export default VolumesForm;
