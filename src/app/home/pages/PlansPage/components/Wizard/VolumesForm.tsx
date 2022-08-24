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
import { StatusIcon, StatusType } from '@migtools/lib-ui';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { usePausedPollingEffect } from '../../../../../common/context';
import { OptionLike, OptionWithValue } from '../../../../../common/components/SimpleSelect';
import { useDispatch, useSelector } from 'react-redux';
import { PlanActions } from '../../../../../plan/duck/actions';
import { DefaultRootState } from '../../../../../../configureStore';
import { isEmpty } from 'lodash';

const styles = require('./VolumesTable.module').default;

const VolumesForm: React.FunctionComponent<IOtherProps> = (props) => {
  usePausedPollingEffect();
  const dispatch = useDispatch();
  const planState = useSelector((state: DefaultRootState) => state.plan);

  const { setFieldValue, values } = useFormikContext<IFormValues>();

  useEffect(() => {
    //kick off pv discovery once volumes form is reached with current selected namespaces
    dispatch(PlanActions.pvDiscoveryRequest(values));
  }, []);

  const migPlanPvs = planState.currentPlan?.spec.persistentVolumes || null;
  useEffect(() => {
    if (
      values.migrationType.value === 'scc' &&
      (!values.pvVerifyFlagAssignment || isEmpty(values.pvVerifyFlagAssignment))
    ) {
      let pvVerifyFlagAssignment = {};
      if (migPlanPvs) {
        pvVerifyFlagAssignment = migPlanPvs.reduce(
          (assignedVerifyFlags, pv) => ({
            ...assignedVerifyFlags,
            [pv.name]: !!pv.selection.verify,
          }),
          {}
        );
      }
      setFieldValue('pvVerifyFlagAssignment', pvVerifyFlagAssignment);
    }
  }, []);

  const discoveredPersistentVolumes =
    (planState.currentPlan && planState.currentPlan.spec.persistentVolumes) || [];
  useEffect(() => {
    if (discoveredPersistentVolumes.length > 0) {
      dispatch(
        PlanActions.getPVResourcesRequest(discoveredPersistentVolumes, values.sourceCluster || '')
      );
      let mappedPVs: IPlanPersistentVolume[];
      if (values.persistentVolumes) {
        //set initial pvs inside wizard
        mappedPVs = discoveredPersistentVolumes.map((planVolume) => {
          let pvAction = 'copy'; // Default to copy
          if (values.persistentVolumes.length !== 0) {
            const matchingPV = values.persistentVolumes.find((v) => v.name === planVolume.name);
            if (matchingPV && planVolume.selection.action) {
              //set initial value for pv action
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
      //Set initial PVs from pv discovery
      setFieldValue('persistentVolumes', mappedPVs);
    }
  }, [discoveredPersistentVolumes, planState.currentPlanStatus]); // Only re-run the effect if fetching value changes

  if (planState.isPVError) {
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
  if (
    planState.isFetchingPVResources ||
    planState.isPollingStatus ||
    planState.currentPlanStatus.state === 'Pending'
  ) {
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
  if (planState.currentPlanStatus.state === 'Critical') {
    return (
      <Bullseye>
        <EmptyState variant="large">
          <Alert variant="danger" isInline title={planState.currentPlanStatus.errorMessage} />
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <VolumesTable
      isEdit={props.isEdit}
      isOpen={props.isOpen}
      storageClasses={planState.currentPlan?.status?.destStorageClasses || []}
    />
  );
};
export default VolumesForm;
